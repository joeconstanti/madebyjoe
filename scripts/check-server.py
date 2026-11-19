#!/usr/bin/env python3
"""Check actual Apache headers and private paths, locally or after deployment."""
import argparse
import re
from urllib.error import HTTPError
from urllib.request import build_opener, HTTPRedirectHandler, Request


class NoRedirect(HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None


def check_security(headers, worker=False):
    """Keep analytics' eval exception confined to its isolated worker document."""
    for name, expected in [('X-Frame-Options', 'SAMEORIGIN'),
                           ('X-Content-Type-Options', 'nosniff'),
                           ('Referrer-Policy', 'strict-origin-when-cross-origin')]:
        assert headers.get(name) == expected, f'{name}: expected {expected}'
    policies = headers.get_all('Content-Security-Policy', [])
    assert len(policies) == 1, 'Expected one Content-Security-Policy header'
    directives = {}
    for part in policies[0].split(';'):
        tokens = part.split()
        if not tokens:
            continue
        name, *values = tokens
        assert name not in directives, f'Duplicate CSP directive: {name}'
        directives[name] = set(values)
    scripts = {"'self'", "'unsafe-inline'", 'https://*.googletagmanager.com'}
    connections = {"'self'", 'https://*.google-analytics.com',
                   'https://*.analytics.google.com', 'https://*.googletagmanager.com'}
    if worker:
        scripts.add("'unsafe-eval'")
    else:
        scripts.add('https://*.clarity.ms')
        connections.add('https://*.clarity.ms')
        assert "'unsafe-eval'" not in policies[0], 'Document must not allow unsafe-eval'
    assert directives.get('script-src') == scripts, 'Unexpected CSP script sources'
    assert directives.get('connect-src') == connections, 'Unexpected CSP collection endpoints'
    assert directives.get('worker-src') == {"'self'", 'blob:'}, 'Unexpected CSP worker sources'
    expected_default = {"'self'"} if worker else {"'self'", 'https://fonts.googleapis.com', 'https://fonts.gstatic.com'}
    assert directives.get('default-src') == expected_default, 'Unexpected CSP default sources'


def check(base):
    opener = build_opener(NoRedirect())
    count = 0

    def request(path, status=200, mime=None, revalidate=False, host=None, location=None,
                security=None, body_contains=(), byte_range=None):
        nonlocal count
        headers = {'Host': host} if host else {}
        if byte_range:
            first, last = byte_range
            headers['Range'] = f'bytes={first}-{last}'
        try:
            method = 'GET' if body_contains or byte_range else 'HEAD'
            response = opener.open(Request(base.rstrip('/') + path, headers=headers, method=method), timeout=20)
        except HTTPError as error:
            response = error
        with response:
            assert response.code == status, f'{path}: expected {status}, got {response.code}'
            if mime:
                assert response.headers.get_content_type() == mime, f'{path}: wrong MIME'
            if revalidate:
                cache = response.headers.get('Cache-Control', '')
                assert 'no-cache' in cache and 'immutable' not in cache, f'{path}: stale cache policy {cache}'
            if security:
                check_security(response.headers, worker=security == 'worker')
            if location:
                assert response.headers.get('Location') == location, f'{path}: wrong redirect'
            if byte_range:
                content_range = response.headers.get('Content-Range', '')
                match = re.fullmatch(rf'bytes {first}-{last}/([0-9]+)', content_range)
                assert match and int(match[1]) > last, f'{path}: wrong Content-Range {content_range!r}'
                length = last - first + 1
                assert len(response.read(length + 1)) == length, f'{path}: wrong range body length'
            if body_contains:
                body = response.read()
                for fragment in body_contains:
                    assert fragment in body, f'{path}: missing {fragment!r} in response body'
        count += 1

    request('/', mime='text/html', revalidate=True, security='document')
    request('/js/vendor/partytown-1.0.2/partytown-sandbox-sw.html',
            mime='text/html', revalidate=True, security='worker')
    request('/css/main.css', mime='text/css', revalidate=True)
    request('/js/main.js', mime='application/javascript', revalidate=True)
    request('/media/v2/aut-pipes.webp', mime='image/webp', revalidate=True)
    request('/media/v2/aut-pipes.mp4', mime='video/mp4', revalidate=True)
    request('/media/v2/aut-pipes.mp4', status=206, mime='video/mp4', byte_range=(0, 15))
    request('/robots.txt', revalidate=True)
    request('/sitemap.xml', revalidate=True)
    for path in ['/README.md', '/PLAN.md', '/archive/index_v1.html', '/scripts/subset-fonts.py',
                 '/docs/improvements.md', '/.git/config', '/.github/workflows/deploy.yml',
                 '/.agents/skills/impeccable/SKILL.md']:
        request(path, status=404)
    request('/definitely-missing-mbj-page', status=404, mime='text/html',
            body_contains=(b'<h1>Page not found</h1>', b'<a href="/">Back to madebyjoe</a>'))
    request('/404.html', mime='text/html',
            body_contains=(b'<meta name="robots" content="noindex">',))
    audit = '/clients/audits/sported'
    request(audit, mime='text/html', revalidate=True, security='document',
            body_contains=(b'<title>Sported', f'<link rel="canonical" href="https://madebyjoe.co{audit}">'.encode()))
    for suffix in ('.html', '/'):
        request(f'{audit}{suffix}?test=1', status=301, host='madebyjoe.co',
                location=f'https://madebyjoe.co{audit}?test=1')
    # Host overrides exercise origin rules without relying on DNS or following redirects.
    request('/index.html?test=1', status=301, host='madebyjoe.co', location='https://madebyjoe.co/?test=1')
    for host in ('madebyjoe.co', 'www.madebyjoe.co'):
        request('/OG.jpg?test=1', status=301, host=host,
                location='https://madebyjoe.co/img/OG.jpg?test=1')
    request('/img/OG.jpg', mime='image/jpeg', revalidate=True)
    request('/?test=1', status=301, host='www.madebyjoe.co', location='https://madebyjoe.co/?test=1')
    print(f'Passed {count} server checks at {base}')


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('base_url')
    check(parser.parse_args().base_url)
