#!/usr/bin/env python3
"""Validate homepage references, fragments, IDs and JSON-LD without dependencies."""
import argparse
from html.parser import HTMLParser
import json
from pathlib import Path
import re
from urllib.parse import unquote, urlsplit
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parent.parent
CANONICAL = 'https://madebyjoe.co/'
MAKERSCLUB_CANONICAL = CANONICAL + 'makersclub'


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


def check_local_path(root, path, errors, missing, *, require_file=True):
    try:
        path = path.resolve()
        if not path.is_relative_to(root):
            errors.append(f'{missing} (resolves outside site root {root})')
            return None
        exists = path.is_file() if require_file else path.exists()
    except (OSError, RuntimeError, ValueError) as error:
        errors.append(f'{missing} ({error})')
        return None
    if not exists:
        errors.append(missing)
        return None
    return path


def validate_share_metadata(page, root):
    if page.share_metadata['og:url'] != [CANONICAL]:
        page.errors.append('Expected one og:url in the head matching the homepage canonical')
    images = page.share_metadata['og:image']
    if len(images) != 1 or not images[0] or not images[0].startswith(CANONICAL):
        page.errors.append('Expected one absolute og:image in the head on the canonical HTTPS origin')
        return
    url = urlsplit(images[0])
    missing = f'Missing public og:image asset: {images[0]}'
    path = check_local_path(root, root / unquote(url.path).lstrip('/'), page.errors, missing)
    if path is not None and not path.is_relative_to(root / 'img'):
        page.errors.append(missing)


def validate(root=ROOT):
    root = root.resolve()
    if not root.is_dir():
        raise SystemExit(f'Site root is not a directory: {root}')
    page = Page()
    sources = {}
    for name in ('index.html', 'makersclub.html', 'css/main.css', 'sitemap.xml', 'robots.txt'):
        sources[name] = check_local_path(
            root, root / name, page.errors, f'Missing site source: {name} in {root}'
        )
    if page.errors:
        raise SystemExit('\n'.join(page.errors))

    homepage = sources['index.html']
    page.feed(homepage.read_text(encoding='utf-8'))
    for reference, resource in page.references:
        url = urlsplit(reference)
        if url.scheme or url.netloc:
            continue
        target = root / unquote(url.path).lstrip('/') if url.path else homepage
        path = check_local_path(
            root, target, page.errors, f'Missing local asset: {reference}', require_file=resource
        )
        is_home = path == root or path == homepage
        if url.fragment and is_home and unquote(url.fragment) not in page.ids:
            page.errors.append(f'Missing fragment: {reference}')
    css = sources['css/main.css']
    for reference in re.findall(r'url\([\'"]?([^\)\'"\s]+)', css.read_text(encoding='utf-8')):
        url = urlsplit(reference)
        if url.scheme or url.netloc or not url.path:
            continue
        decoded = unquote(url.path)
        target = root / decoded.lstrip('/') if decoded.startswith('/') else root / 'css' / decoded
        check_local_path(root, target, page.errors, f'Missing CSS asset: {reference}')
    tree = ET.parse(sources['sitemap.xml'])
    locations = [node.text for node in tree.iter('{http://www.sitemaps.org/schemas/sitemap/0.9}loc')]
    if locations != [CANONICAL, MAKERSCLUB_CANONICAL]:
        page.errors.append('Unexpected canonical sitemap URLs')
    if page.canonicals != [CANONICAL]:
        page.errors.append('Expected exactly one homepage canonical matching the sitemap URL in the head')
    makersclub = Page()
    makersclub.feed(sources['makersclub.html'].read_text(encoding='utf-8'))
    if makersclub.canonicals != [MAKERSCLUB_CANONICAL]:
        makersclub.errors.append('Expected exactly one Makersclub canonical matching the sitemap URL in the head')
    page.errors.extend(makersclub.errors)
    validate_share_metadata(page, root)
    if 'Sitemap: https://madebyjoe.co/sitemap.xml' not in sources['robots.txt'].read_text(encoding='utf-8'):
        page.errors.append('Missing sitemap discovery')
    if page.errors:
        raise SystemExit('\n'.join(page.errors))
    print(f'Validated {len(page.references)} HTML references, {len(page.ids)} IDs, CSS assets, JSON-LD and sitemap')


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--root', type=Path, default=ROOT, metavar='DIR',
                        help='site directory to validate (default: this checkout)')
    validate(parser.parse_args().root)
