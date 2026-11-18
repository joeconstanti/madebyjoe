#!/usr/bin/env python3
"""Validate homepage references, fragments, IDs and JSON-LD without dependencies."""
from html.parser import HTMLParser
import json
from pathlib import Path
import re
from urllib.parse import unquote, urlsplit
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parent.parent
CANONICAL = 'https://madebyjoe.co/'


class Page(HTMLParser):
    def __init__(self):
        super().__init__()
        self.ids = set()
        self.references = []
        self.canonicals = []
        self.share_metadata = {'og:url': [], 'og:image': []}
        self.in_head = False
        self.errors = []
        self.json_parts = None

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == 'head':
            self.in_head = True
        if tag == 'link' and 'canonical' in (attrs.get('rel') or '').lower().split():
            self.canonicals.append(attrs.get('href') if self.in_head else None)
        if tag == 'meta' and attrs.get('property') in self.share_metadata:
            self.share_metadata[attrs['property']].append(attrs.get('content') if self.in_head else None)
        if 'id' in attrs:
            if attrs['id'] in self.ids:
                self.errors.append(f"Duplicate id: {attrs['id']}")
            self.ids.add(attrs['id'])
        for name in ('src', 'href', 'poster', 'data-src', 'data-poster'):
            if attrs.get(name):
                self.references.append((attrs[name], name != 'href'))
        if tag == 'script' and attrs.get('type') == 'application/ld+json':
            self.json_parts = []

    def handle_data(self, data):
        if self.json_parts is not None:
            self.json_parts.append(data)

    def handle_endtag(self, tag):
        if tag == 'head':
            self.in_head = False
        if tag == 'script' and self.json_parts is not None:
            try:
                json.loads(''.join(self.json_parts))
            except json.JSONDecodeError as error:
                self.errors.append(f'Invalid JSON-LD: {error}')
            self.json_parts = None


def validate_share_metadata(page):
    if page.share_metadata['og:url'] != [CANONICAL]:
        page.errors.append('Expected one og:url in the head matching the homepage canonical')
    images = page.share_metadata['og:image']
    if len(images) != 1 or not images[0] or not images[0].startswith(CANONICAL):
        page.errors.append('Expected one absolute og:image in the head on the canonical HTTPS origin')
        return
    url = urlsplit(images[0])
    public_images = ROOT / 'img'
    path = (ROOT / unquote(url.path).lstrip('/')).resolve()
    if not path.is_relative_to(public_images) or not path.is_file():
        page.errors.append(f'Missing public og:image asset: {images[0]}')


def validate():
    page = Page()
    page.feed((ROOT / 'index.html').read_text())
    for reference, resource in page.references:
        url = urlsplit(reference)
        if url.scheme or url.netloc:
            continue
        path = (ROOT / unquote(url.path).lstrip('/')).resolve() if url.path else ROOT / 'index.html'
        is_home = path == ROOT or path == ROOT / 'index.html'
        if url.fragment and is_home and unquote(url.fragment) not in page.ids:
            page.errors.append(f'Missing fragment: {reference}')
        if not path.is_relative_to(ROOT) or not path.exists() or (resource and not path.is_file()):
            page.errors.append(f'Missing local asset: {reference}')
    css = ROOT / 'css/main.css'
    for reference in re.findall(r'url\([\'"]?([^\)\'"\s]+)', css.read_text()):
        url = urlsplit(reference)
        if url.scheme or url.netloc or not url.path:
            continue
        decoded = unquote(url.path)
        path = (ROOT / decoded.lstrip('/') if decoded.startswith('/') else css.parent / decoded).resolve()
        if not path.is_relative_to(ROOT) or not path.is_file():
            page.errors.append(f'Missing CSS asset: {reference}')
    tree = ET.parse(ROOT / 'sitemap.xml')
    locations = [node.text for node in tree.iter('{http://www.sitemaps.org/schemas/sitemap/0.9}loc')]
    if locations != [CANONICAL]:
        page.errors.append('Unexpected canonical sitemap URLs')
    if len(page.canonicals) != 1 or page.canonicals != locations:
        page.errors.append('Expected exactly one homepage canonical matching the sitemap URL in the head')
    validate_share_metadata(page)
    if 'Sitemap: https://madebyjoe.co/sitemap.xml' not in (ROOT / 'robots.txt').read_text():
        page.errors.append('Missing sitemap discovery')
    if page.errors:
        raise SystemExit('\n'.join(page.errors))
    print(f'Validated {len(page.references)} HTML references, {len(page.ids)} IDs, CSS assets, JSON-LD and sitemap')


if __name__ == '__main__':
    validate()
