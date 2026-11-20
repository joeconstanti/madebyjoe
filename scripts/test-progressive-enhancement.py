#!/usr/bin/env python3
"""Check that the homepage supplies its basic content and links in HTML."""
from html.parser import HTMLParser
from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parent.parent
NAV_LINKS = ('#index', '#about', '#contact')
PROJECTS = {
    'e-ftr': 'https://fromtheroot.studio',
    'e-syn': 'https://syntheticlabs.xyz',
    'e-cer': 'https://cerebral.studio',
    'e-aut': 'https://automatedigital.ai',
    'e-jg': 'https://joe.graphics',
}


class Homepage(HTMLParser):
    def __init__(self):
        super().__init__()
        self.in_head = False
        self.in_title = False
        self.in_main_nav = False
        self.in_index = False
        self.chapter = None
        self.has_title = False
        self.has_mailto = False
        self.nav_links = set()
        self.index_links = set()
        self.project_links = {chapter: set() for chapter in PROJECTS}
        self.chapter_posters = set()

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == 'head':
            self.in_head = True
        elif tag == 'title' and self.in_head:
            self.in_title = True
        elif tag == 'nav':
            self.in_main_nav = attrs.get('aria-label') == 'Main'
        elif tag == 'section':
            self.in_index = attrs.get('id') == 'index'
        elif tag == 'article':
            self.chapter = attrs.get('id')
        elif tag == 'a':
            href = (attrs.get('href') or '').strip()
            if self.in_main_nav:
                self.nav_links.add(href)
            if self.in_index:
                self.index_links.add(href)
            if self.chapter in PROJECTS:
                self.project_links[self.chapter].add(href)
            if href.lower().startswith('mailto:') and href[7:].split('?')[0].strip():
                self.has_mailto = True
        elif tag == 'video' and self.chapter in PROJECTS and (attrs.get('poster') or '').strip():
            self.chapter_posters.add(self.chapter)

    def handle_data(self, data):
        if self.in_title and data.strip():
            self.has_title = True

    def handle_endtag(self, tag):
        if tag == 'head':
            self.in_head = False
        elif tag == 'title':
            self.in_title = False
        elif tag == 'nav':
            self.in_main_nav = False
        elif tag == 'section':
            self.in_index = False
        elif tag == 'article':
            self.chapter = None


def missing_content(source):
    page = Homepage()
    page.feed(source)
    page.close()
    errors = []
    if not page.has_title:
        errors.append('Missing non-empty <title> in <head>')
    for href in NAV_LINKS:
        if href not in page.nav_links:
            errors.append(f'Missing primary navigation link to {href}')
    for chapter, url in PROJECTS.items():
        if f'#{chapter}' not in page.index_links:
            errors.append(f'Missing index link to #{chapter}')
        if url not in page.project_links[chapter]:
            errors.append(f'Missing project link to {url} in #{chapter}')
        if chapter not in page.chapter_posters:
            errors.append(f'Missing video poster in #{chapter}')
    if not page.has_mailto:
        errors.append('Missing mailto link with a recipient')
    return errors


class ProgressiveEnhancementTests(unittest.TestCase):
    def test_homepage_has_static_fallbacks(self):
        source = (ROOT / 'index.html').read_text(encoding='utf-8')
        errors = missing_content(source)
        self.assertFalse(errors, '\nindex.html\n' + '\n'.join(errors))

    def test_poster_outside_chapter_cannot_replace_chapter_poster(self):
        source = '''
        <video poster="hero.webp"></video>
        <article id="e-ftr"><video data-poster="chapter.webp"></video></article>
        '''
        self.assertIn('Missing video poster in #e-ftr', missing_content(source))


if __name__ == '__main__':
    unittest.main()
