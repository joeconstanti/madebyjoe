#!/usr/bin/env python3
"""Exercise recovery-page validation against disposable staged roots."""
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest

VALIDATOR = Path(__file__).with_name('validate-recovery.py').resolve()
HOME_LINK = '<a href="/">Back to madebyjoe</a>'
FONT = 'fonts/site font.woff2'


class RecoveryTests(unittest.TestCase):
    def setUp(self):
        temp = tempfile.TemporaryDirectory()
        self.addCleanup(temp.cleanup)
        self.workspace = Path(temp.name)
        self.root = self.workspace / 'public'
        self.root.mkdir()
        self.write_file('index.html')
        self.write_file(FONT)
        self.write_page()

    def write_file(self, name, text='fixture'):
        path = self.root / name
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(text, encoding='utf-8')

    def write_page(self, markup=HOME_LINK):
        self.write_file('404.html', f'<!doctype html>\n<h1>Page not found</h1>\n{markup}')

    def run_validator(self):
        return subprocess.run(
            [sys.executable, str(VALIDATOR), '--root', 'public'],
            cwd=self.workspace, capture_output=True, text=True,
        )

    def assert_rejected(self, *diagnostics):
        result = self.run_validator()
        self.assertEqual(result.returncode, 1, result.stdout + result.stderr)
        for text in diagnostics:
            self.assertIn(text, result.stderr)

    def test_staged_page_and_assets_pass(self):
        for file in ('css/recovery.css', 'img/recovery,large.webp', 'img/small.webp'):
            self.write_file(file)
        self.write_page(HOME_LINK + '''
            <link rel="stylesheet" href="/css/recovery.css">
            <style>
                /* url(/absent-commented.png) */
                @import "/css/recovery.css";
                @font-face { src: url( "/fonts/site%20font.woff2?v=1#font" ); }
                .sample::before { content: 'url(/absent-text.png)'; }
            </style>
            <a href="#details">Details</a>
            <p id="details" style="background: URL( /img/small.webp )">Details</p>
            <img src="/img/small.webp"
                 srcset="data:image/svg+xml,%3Csvg%3E 1x, /img/recovery,large.webp 2x">
            <img src="https://example.com/unverified.png">
            <img src="//example.com/unverified.png">
        ''')
        result = self.run_validator()
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)

    def test_absent_recovery_page_fails(self):
        (self.root / '404.html').unlink()
        self.assert_rejected('404.html', 'Missing local file')

    def test_absent_homepage_link_fails(self):
        self.write_page('<!-- <a href="/">Commented out</a> --><a href="/index.html">Home</a>')
        self.assert_rejected('Missing a homepage link')

    def test_absent_homepage_target_fails(self):
        (self.root / 'index.html').unlink()
        self.assert_rejected('a[href]', 'Missing local file', "'/'")

    def test_missing_html_assets_fail(self):
        self.write_page(HOME_LINK + '''
            <link rel="stylesheet" href="/css/404.css">
            <video poster="/img/poster.webp"></video>
            <img srcset="/img/missing.webp 2x">
        ''')
        self.assert_rejected('Missing local file', '/css/404.css', '/img/poster.webp', '/img/missing.webp')

    def test_missing_inline_css_assets_fail(self):
        self.write_page(HOME_LINK + '''
            <style>@font-face { src: url("/fonts/missing.woff2"); }</style>
            <p style="background-image: url('/img/missing.png')">Details</p>
        ''')
        self.assert_rejected('Missing local file', '/fonts/missing.woff2', '/img/missing.png')

    def test_relative_references_fail_even_when_targets_exist(self):
        self.write_file('img/icon.png')
        self.write_page(HOME_LINK + '''
            <img src="img/icon.png">
            <style>@font-face { src: url('./fonts/site%20font.woff2'); }</style>
        ''')
        self.assert_rejected('Expected a root-relative URL', 'img/icon.png', './fonts/site%20font.woff2')

    def test_url_base_cannot_redirect_home_link(self):
        self.write_page('<base href="https://example.com/">' + HOME_LINK)
        self.assert_rejected('A base href can change URL resolution')

    def test_encoded_traversal_cannot_reach_files_outside_the_root(self):
        (self.workspace / 'outside.svg').write_text('outside', encoding='utf-8')
        self.write_page(HOME_LINK + '<img src="/%2e%2e/outside.svg">')
        self.assert_rejected('Path escapes the site root', '/%2e%2e/outside.svg')

    def test_asset_symlink_cannot_reach_files_outside_the_root(self):
        outside = self.workspace / 'outside.svg'
        outside.write_text('outside', encoding='utf-8')
        (self.root / 'linked.svg').symlink_to(outside)
        self.write_page(HOME_LINK + '<img src="/linked.svg">')
        self.assert_rejected('Path escapes the site root', '/linked.svg')


if __name__ == '__main__':
    unittest.main()
