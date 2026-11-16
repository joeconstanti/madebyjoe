#!/usr/bin/env python3
"""Check actual Apache headers and private paths, locally or after deployment."""
import argparse
from urllib.error import HTTPError
from urllib.request import build_opener, HTTPRedirectHandler, Request


class NoRedirect(HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None


def check(base):
    opener = build_opener(NoRedirect())
    count = 0

    def request(path, status=200, mime=None, revalidate=False, host=None, location=None):
        nonlocal count
        headers = {'Host': host} if host else {}
        try:
            response = opener.open(Request(base.rstrip('/') + path, headers=headers, method='HEAD'), timeout=20)
        except HTTPError as error:
            response = error
        with response:
            assert response.code == status, f'{path}: expected {status}, got {response.code}'
            if mime:
                assert response.headers.get_content_type() == mime, f'{path}: wrong MIME'
            if revalidate:
                cache = response.headers.get('Cache-Control', '')
                assert 'no-cache' in cache and 'immutable' not in cache, f'{path}: stale cache policy {cache}'
            if location:
                assert response.headers.get('Location') == location, f'{path}: wrong redirect'
        count += 1

    request('/', mime='text/html', revalidate=True)
    request('/css/main.css', mime='text/css', revalidate=True)
    request('/js/main.js', mime='application/javascript', revalidate=True)
    request('/media/v2/aut-pipes.webp', mime='image/webp', revalidate=True)
    request('/media/v2/aut-pipes.mp4', mime='video/mp4', revalidate=True)
    request('/robots.txt', revalidate=True)
    request('/sitemap.xml', revalidate=True)
    for path in ['/README.md', '/PLAN.md', '/archive/index_v1.html', '/scripts/subset-fonts.py',
                 '/docs/improvements.md', '/.git/config', '/.github/workflows/deploy.yml',
                 '/.agents/skills/impeccable/SKILL.md', '/definitely-missing-mbj-page']:
        request(path, status=404)
    # Host overrides exercise origin rules without relying on DNS or following redirects.
    request('/index.html?test=1', status=301, host='madebyjoe.co', location='https://madebyjoe.co/?test=1')
    request('/?test=1', status=301, host='www.madebyjoe.co', location='https://madebyjoe.co/?test=1')
    print(f'Passed {count} server checks at {base}')


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('base_url')
    check(parser.parse_args().base_url)
