#!/usr/bin/env python3
"""Validate links and assets in the custom 404 page for any request depth."""
import argparse
from html.parser import HTMLParser
from pathlib import Path
import re
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parent.parent
PAGE = '404.html'
URL_ATTRIBUTES = ('src', 'href', 'poster', 'data-src', 'data-poster', 'xlink:href')
CSS_STRING = r'"(?:\\.|[^"\\])*"' r"|'(?:\\.|[^'\\])*'"
CSS_COMMENT = r'/\*.*?\*/'
CSS_REFERENCES = re.compile(
    rf'{CSS_COMMENT}|(?<![\w-])url\(\s*(?P<url>{CSS_STRING}|[^()\s\'"]+)\s*\)'
    rf'|@import(?:\s|{CSS_COMMENT})*(?P<imported>{CSS_STRING})|{CSS_STRING}',
    re.IGNORECASE | re.DOTALL,
)


def css_urls(css):
    for match in CSS_REFERENCES.finditer(css):
        value = match['url'] or match['imported']
        if value is not None:
            yield value[1:-1] if value[0] in '"\'' else value


def srcset_urls(candidates):
    # Commas can occur inside URLs, including data URLs. Read the URL up to
    # whitespace, then skip its optional descriptors up to the next comma.
    while candidates := candidates.lstrip(' \t\n\f\r,'):
        url = re.match(r'[^ \t\n\f\r]+', candidates)[0]
        yield url.rstrip(',')
        candidates = candidates[len(url):]
        if not url.endswith(','):
            candidates = candidates.partition(',')[2]


class RecoveryPage(HTMLParser):
    def __init__(self):
        super().__init__()
        self.home_link = False
        self.in_style = False
        self.references = []
        self.errors = []

    def add_reference(self, reference, context, anchor=False, allow_fragment=False):
        line, _ = self.getpos()
        self.references.append((reference, f'{PAGE}:{line} {context}', anchor, allow_fragment))

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == 'base' and 'href' in attrs:
            if (attrs['href'] or '').strip() != '/':
                self.errors.append(f'{PAGE}:{self.getpos()[0]} A base href can change URL resolution')
            return
        for name in URL_ATTRIBUTES:
            if name in attrs:
                value = (attrs[name] or '').strip()
                anchor = tag in ('a', 'area') and name == 'href'
                if tag == 'a' and anchor and value == '/':
                    self.home_link = True
                self.add_reference(value, f'{tag}[{name}]', anchor, name in ('href', 'xlink:href'))
        if tag == 'object' and 'data' in attrs:
            self.add_reference((attrs['data'] or '').strip(), 'object[data]')
        for name in ('srcset', 'imagesrcset'):
            for value in srcset_urls(attrs.get(name) or ''):
                self.add_reference(value, f'{tag}[{name}]')
        for value in css_urls(attrs.get('style') or ''):
            self.add_reference(value, f'{tag}[style]', allow_fragment=True)
        if tag == 'style':
            self.in_style = True

    def handle_endtag(self, tag):
        if tag == 'style':
            self.in_style = False

    def handle_data(self, data):
        if self.in_style:
            for value in css_urls(data):
                self.add_reference(value, 'style', allow_fragment=True)


def check_file(root, relative_path):
    path = root / relative_path
    try:
        target = path.resolve()
        if not target.is_relative_to(root):
            raise ValueError('Path escapes the site root')
        if not target.is_file():
            raise ValueError('Missing local file')
    except (OSError, RuntimeError) as error:
        raise ValueError(f'Cannot resolve local file ({error})') from error
    return target


def validate_reference(root, reference, anchor, allow_fragment):
    url = urlsplit(reference)
    if url.scheme or url.netloc:
        return
    if allow_fragment and reference.startswith('#'):
        return
    if not url.path.startswith('/') or reference.startswith('//'):
        raise ValueError('Expected a root-relative URL that works at nested request paths')
    decoded = unquote(url.path, errors='strict')
    if '\\' in decoded or '\0' in decoded:
        raise ValueError('Invalid local path')
    public_routes = {
        '/': 'index.html',
        '/archive': 'archive.html',
        '/resources/': 'resources/index.html',
    }
    if anchor and decoded in public_routes:
        check_file(root, public_routes[decoded])
        return
    if decoded.endswith('/'):
        raise ValueError('Expected a URL to a local file')
    target = decoded.lstrip('/')
    check_file(root, target)


def validate(root):
    root = root.resolve()
    page = RecoveryPage()
    try:
        page.feed(check_file(root, PAGE).read_text(encoding='utf-8'))
        page.close()
    except (OSError, ValueError) as error:
        raise SystemExit(f'{PAGE}: {error}') from error

    if not page.home_link:
        page.errors.append(f'{PAGE}: Missing a homepage link with href="/"')
    for reference, context, anchor, allow_fragment in page.references:
        try:
            validate_reference(root, reference, anchor, allow_fragment)
        except ValueError as error:
            page.errors.append(f'{context}: {error}: {reference!r}')
    if page.errors:
        raise SystemExit('\n'.join(page.errors))
    print(f'Validated {PAGE} homepage link and asset references in {root}')


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--root', type=Path, default=ROOT, help='Site directory (default: checkout root)')
    validate(parser.parse_args().root)
