#!/usr/bin/env python3
"""Check generation integrity using disposable source trees."""
from pathlib import Path
import shutil
import subprocess
import tempfile
import unittest

ROOT = Path(__file__).resolve().parent.parent


class GenerationTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        for name in ('index.html', 'archive.html', 'makersclub.html', '404.html'):
            shutil.copy2(ROOT / name, self.root / name)
        for name in ('css', 'fonts', 'js', 'media', 'resources', 'projects', 'scripts'):
            shutil.copytree(ROOT / name, self.root / name)
        self.page = self.root / 'index.html'

    def generate(self, *args):
        return subprocess.run(['node', 'scripts/sync-styles.mjs', *args],
                              cwd=self.root, capture_output=True, text=True)

    def test_source_dollar_tokens_are_literal_and_generation_is_idempotent(self):
        tokens = "$& $$ $` $' $1"
        for name in ('css/main.css', 'js/hero-gl.js', 'js/enhance.js'):
            path = self.root / name
            path.write_text(path.read_text() + '\n/* ' + tokens + ' */\n')
        result = self.generate()
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual(self.page.read_text().count('/* ' + tokens + ' */'), 3)
        result = self.generate('--check')
        self.assertEqual(result.returncode, 0, result.stderr)

    def test_current_generation_is_byte_identical(self):
        before = self.page.read_bytes()
        result = self.generate()
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual(self.page.read_bytes(), before)

    def test_invalid_targets_fail_without_writes(self):
        original = self.page.read_text()
        mutations = {
            'missing poster': original.replace('class="hero__poster"', 'class="renamed-poster"'),
            'duplicate poster': original + '<img class="hero__poster" src="test">',
            'duplicate style': original + '  <style>extra</style>',
            'unmatched indentation': original.replace('  <!-- inline-hero:start -->', '<!-- inline-hero:start -->'),
            'overlapping blocks': original.replace('<!-- inline-enhance:start -->', '').replace(
                '<!-- inline-hero:end -->', '<!-- inline-enhance:start --><!-- inline-hero:end -->'),
        }
        for label, text in mutations.items():
            with self.subTest(label=label):
                self.page.write_text(text)
                before = self.page.read_bytes()
                result = self.generate()
                self.assertNotEqual(result.returncode, 0, result.stderr)
                self.assertEqual(self.page.read_bytes(), before)


if __name__ == '__main__':
    unittest.main()
