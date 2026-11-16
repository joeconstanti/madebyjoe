#!/usr/bin/env python3
"""Validate homepage references, fragments, IDs and JSON-LD without dependencies."""
from html.parser import HTMLParser
import json
from pathlib import Path
import re
from urllib.parse import unquote, urlsplit
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parent.parent


class Page(HTMLParser):
    def __init__(self):
        super().__init__()
        self.ids = set()
        self.references = []
        self.errors = []
        self.json_parts = None

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if 'id' in attrs:
            if attrs['id'] in self.ids:
                self.errors.append(f"Duplicate id: {attrs['id']}")
            self.ids.add(attrs['id'])
        for name in ('src', 'href', 'poster', 'data-src'):
            if attrs.get(name):
                self.references.append(attrs[name])
        if tag == 'script' and attrs.get('type') == 'application/ld+json':
            self.json_parts = []

    def handle_data(self, data):
        if self.json_parts is not None:
            self.json_parts.append(data)

    def handle_endtag(self, tag):
        if tag == 'script' and self.json_parts is not None:
            try:
                json.loads(''.join(self.json_parts))
            except json.JSONDecodeError as error:
                self.errors.append(f'Invalid JSON-LD: {error}')
            self.json_parts = None


def validate():
    page = Page()
    page.feed((ROOT / 'index.html').read_text())
    for reference in page.references:
        url = urlsplit(reference)
        if url.scheme or url.netloc:
            continue
        if not url.path:
            if url.fragment and unquote(url.fragment) not in page.ids:
                page.errors.append(f'Missing fragment: {reference}')
            continue
        path = (ROOT / unquote(url.path).lstrip('/')).resolve()
        if not path.is_relative_to(ROOT) or not path.exists():
            page.errors.append(f'Missing local asset: {reference}')
    css = ROOT / 'css/main.css'
    for reference in re.findall(r'url\([\'"]?([^\)\'"\s]+)', css.read_text()):
        url = urlsplit(reference)
        if not url.scheme and not url.netloc and not (css.parent / unquote(url.path)).is_file():
            page.errors.append(f'Missing CSS asset: {reference}')
    tree = ET.parse(ROOT / 'sitemap.xml')
    locations = [node.text for node in tree.iter('{http://www.sitemaps.org/schemas/sitemap/0.9}loc')]
    if locations != ['https://madebyjoe.co/']:
        page.errors.append('Unexpected canonical sitemap URLs')
    if 'Sitemap: https://madebyjoe.co/sitemap.xml' not in (ROOT / 'robots.txt').read_text():
        page.errors.append('Missing sitemap discovery')
    if page.errors:
        raise SystemExit('\n'.join(page.errors))
    print(f'Validated {len(page.references)} HTML references, {len(page.ids)} IDs, CSS assets, JSON-LD and sitemap')


if __name__ == '__main__':
    validate()
