#!/usr/bin/env python3
"""Exercise validation failure paths in disposable copies, never the real page."""
from pathlib import Path
import shutil
import subprocess
import tempfile
import unittest
from urllib.robotparser import RobotFileParser

ROOT = Path(__file__).resolve().parent.parent


class ValidationTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name) / 'checkout'
        self.root.mkdir()
        for name in ('index.html', 'archive.html', 'makersclub.html', '404.html', '.htaccess', 'robots.txt', 'sitemap.xml'):
            shutil.copy2(ROOT / name, self.root / name)
        for name in ('css', 'fonts', 'img', 'js', 'media', 'resources', 'scripts'):
            shutil.copytree(ROOT / name, self.root / name,
                            ignore=shutil.ignore_patterns('node_modules', '__pycache__'))
        shutil.copytree(ROOT / 'clients/audits', self.root / 'clients/audits')
        self.page = self.root / 'index.html'

    def run_script(self, *args):
        return subprocess.run(args, cwd=self.root, capture_output=True, text=True)

    def test_current_sources_pass(self):
        for args in [('node', 'scripts/sync-styles.mjs', '--check'),
                     ('python3', 'scripts/validate-site.py')]:
            result = self.run_script(*args)
            self.assertEqual(result.returncode, 0, result.stdout + result.stderr)

    def test_validator_reads_staged_files_instead_of_checkout(self):
        destination = Path(self.temp.name) / 'public'
        result = self.run_script('python3', 'scripts/stage-public.py', str(destination))
        self.assertEqual(result.returncode, 0, result.stderr)

        validate = ('python3', 'scripts/validate-site.py', '--root', str(destination))
        result = self.run_script(*validate)
        self.assertEqual(result.returncode, 0, result.stderr)

        asset = destination / 'img/OG.jpg'
        asset.unlink()
        result = self.run_script(*validate)
        self.assertNotEqual(result.returncode, 0)
        self.assertIn('Missing public og:image asset:', result.stderr)

        asset.symlink_to(self.root / 'img/OG.jpg')
        result = self.run_script(*validate)
        self.assertNotEqual(result.returncode, 0)
        self.assertIn('resolves outside site root', result.stderr)

    def test_rendering_resources_are_crawlable(self):
        robots = RobotFileParser()
        robots.parse((self.root / 'robots.txt').read_text().splitlines())
        for path in ('/', '/js/main.js', '/js/vendor/gsap.min.js',
                     '/js/vendor/ScrollTrigger.min.js', '/js/vendor/SplitText.min.js',
                     '/js/vendor/lenis.min.js'):
            with self.subTest(path=path):
                self.assertTrue(robots.can_fetch('Googlebot', path))
        for path in ('/~partytown/partytown-sw.js',
                     '/js/vendor/partytown-1.0.2/partytown.js'):
            with self.subTest(path=path):
                self.assertFalse(robots.can_fetch('Googlebot', path))

    def test_stale_inline_check_does_not_write(self):
        source = self.root / 'css/main.css'
        source.write_text(source.read_text() + '\n/* changed source */\n')
        before = self.page.read_bytes()
        result = self.run_script('node', 'scripts/sync-styles.mjs', '--check')
        self.assertNotEqual(result.returncode, 0)
        self.assertIn('stale', result.stderr)
        self.assertEqual(self.page.read_bytes(), before)

    def test_missing_marker_fails(self):
        self.page.write_text(self.page.read_text().replace('<!-- inline-hero:end -->', ''))
        result = self.run_script('node', 'scripts/sync-styles.mjs', '--check')
        self.assertNotEqual(result.returncode, 0)
        self.assertIn('Expected exactly one', result.stderr)

    def test_homepage_canonical_matches_sitemap(self):
        original = self.page.read_text()
        tag = '<link rel="canonical" href="https://madebyjoe.co/">'
        for canonical in ('', tag + tag,
                          '<link rel="CANONICAL" href="https://www.madebyjoe.co/">',
                          '<link rel="canonical" href="/">'):
            with self.subTest(canonical=canonical):
                self.page.write_text(original.replace(tag, canonical))
                result = self.run_script('python3', 'scripts/validate-site.py')
                self.assertNotEqual(result.returncode, 0)
                self.assertIn('Expected exactly one homepage canonical matching the sitemap URL',
                              result.stderr)
        self.page.write_text(original.replace(tag, tag.replace('canonical', 'CANONICAL')))
        result = self.run_script('python3', 'scripts/validate-site.py')
        self.assertEqual(result.returncode, 0, result.stderr)
        self.page.write_text(original.replace(tag, '').replace('</body>', tag + '</body>'))
        result = self.run_script('python3', 'scripts/validate-site.py')
        self.assertNotEqual(result.returncode, 0)
        self.assertIn('Expected exactly one homepage canonical matching the sitemap URL',
                      result.stderr)

    def test_share_preview_uses_homepage_and_public_image(self):
        original = self.page.read_text()
        canonical = '<meta property="og:url" content="https://madebyjoe.co/">'
        image = '<meta property="og:image" content="https://madebyjoe.co/img/OG.jpg">'
        for tag, replacement, message in (
            (canonical, '', 'Expected one og:url'),
            (canonical, canonical + canonical, 'Expected one og:url'),
            (canonical, canonical.replace('.co/', '.co/old'), 'Expected one og:url'),
            (image, '', 'Expected one absolute og:image'),
            (image, image + image, 'Expected one absolute og:image'),
            (image, image.replace('madebyjoe.co', 'example.com'), 'Expected one absolute og:image'),
            (image, image.replace('OG.jpg', 'missing.jpg'), 'Missing public og:image asset'),
            (image, image.replace('img/OG.jpg', 'scripts/validate-site.py'), 'Missing public og:image asset'),
        ):
            with self.subTest(replacement=replacement):
                self.page.write_text(original.replace(tag, replacement))
                result = self.run_script('python3', 'scripts/validate-site.py')
                self.assertNotEqual(result.returncode, 0)
                self.assertIn(message, result.stderr)
        self.page.write_text(original.replace(image, '').replace('</body>', image + '</body>'))
        result = self.run_script('python3', 'scripts/validate-site.py')
        self.assertNotEqual(result.returncode, 0)
        self.assertIn('Expected one absolute og:image', result.stderr)

    def test_missing_asset_fails(self):
        self.page.write_text(self.page.read_text() + '<img src="missing-test.webp">')
        result = self.run_script('python3', 'scripts/validate-site.py')
        self.assertNotEqual(result.returncode, 0)
        self.assertIn('Missing local asset: missing-test.webp', result.stderr)

    def test_missing_fragment_fails(self):
        self.page.write_text(self.page.read_text() + '<a href="#missing-test">test</a>')
        result = self.run_script('python3', 'scripts/validate-site.py')
        self.assertNotEqual(result.returncode, 0)
        self.assertIn('Missing fragment', result.stderr)

    def test_runtime_media_and_explicit_home_fragments(self):
        original = self.page.read_text()
        for markup, message in [
            ('<video data-poster="missing-poster.webp"></video>', 'Missing local asset'),
            ('<img src="media/">', 'Missing local asset'),
            ('<a href="index.html#missing">bad</a>', 'Missing fragment'),
            ('<a href="/?q=1#missing">bad</a>', 'Missing fragment'),
        ]:
            with self.subTest(markup=markup):
                self.page.write_text(original + markup)
                result = self.run_script('python3', 'scripts/validate-site.py')
                self.assertNotEqual(result.returncode, 0)
                self.assertIn(message, result.stderr)
        self.page.write_text(original + '<a href="/index.html?q=1#top">ok</a>' +
                             '<video data-poster="/media/v2/aut-pipes.webp"></video>')
        result = self.run_script('python3', 'scripts/validate-site.py')
        self.assertEqual(result.returncode, 0, result.stderr)

    def test_css_root_urls_and_containment(self):
        css = self.root / 'css/main.css'
        original = css.read_text()
        css.write_text(original + '\n.test { background: url(/media/v2/aut-pipes.webp); filter: url(#filter); }')
        result = self.run_script('python3', 'scripts/validate-site.py')
        self.assertEqual(result.returncode, 0, result.stderr)
        outside = Path(self.temp.name) / 'outside.webp'
        outside.write_bytes(b'not public')
        css.write_text(original + '\n.test { background: url(../../outside.webp); }')
        result = self.run_script('python3', 'scripts/validate-site.py')
        self.assertNotEqual(result.returncode, 0)
        self.assertIn('Missing CSS asset', result.stderr)

    def test_staging_rejects_symlinks_before_creating_destination(self):
        private = Path(self.temp.name) / 'private.txt'
        private.write_text('must not publish')
        for name, target in [('external.txt', private),
                             ('internal.txt', self.root / 'index.html'),
                             ('dangling.txt', self.root / 'missing'),
                             ('directory', self.root / 'scripts')]:
            with self.subTest(name=name):
                link = self.root / 'media' / name
                link.symlink_to(target)
                destination = Path(self.temp.name) / ('rejected-' + name)
                result = self.run_script('python3', 'scripts/stage-public.py', str(destination))
                self.assertNotEqual(result.returncode, 0)
                self.assertIn('Symbolic links are not public assets', result.stderr)
                self.assertFalse(destination.exists())
                link.unlink()
        top = self.root / 'robots.txt'
        top.unlink()
        top.symlink_to(private)
        destination = Path(self.temp.name) / 'rejected-top'
        result = self.run_script('python3', 'scripts/stage-public.py', str(destination))
        self.assertNotEqual(result.returncode, 0)
        self.assertFalse(destination.exists())

    def test_staging_excludes_private_files_and_rejects_checkout(self):
        (self.root / 'PRIVATE.md').write_text('Do not publish')
        (self.root / 'resources/hydrogen-3d/private.html').write_text('Do not publish')
        audits = self.root / 'clients/audits'
        (audits / 'private.html').write_text('Do not publish')
        (audits / 'sported-assets/local/raw.json').write_text('Do not publish')
        result = self.run_script('python3', 'scripts/stage-public.py', str(self.root / 'release'))
        self.assertNotEqual(result.returncode, 0)
        destination = Path(self.temp.name) / 'public'
        result = self.run_script('python3', 'scripts/stage-public.py', str(destination))
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual({p.name for p in destination.iterdir()},
                         {'.htaccess', 'index.html', 'archive.html', 'makersclub.html', '404.html', 'robots.txt', 'sitemap.xml',
                          'css', 'fonts', 'img', 'js', 'media', 'clients', 'resources'})
        self.assertTrue((destination / 'resources/hydrogen-3d/sol/index.html').is_file())
        self.assertFalse((destination / 'resources/hydrogen-3d/private.html').exists())
        expected = {'audits/sported.html', 'audits/sported-assets/sported-live-homepage-hero.png',
                    'audits/sported-assets/sported-logo.png'}
        expected.update(f'audits/sported-assets/{environment}/{page}-{device}.json'
                        for environment in ('live', 'local')
                        for page in ('home', 'programmes', 'support')
                        for device in ('desktop', 'mobile'))
        clients = destination / 'clients'
        self.assertEqual({p.relative_to(clients).as_posix() for p in clients.rglob('*') if p.is_file()},
                         expected)


if __name__ == '__main__':
    unittest.main()
