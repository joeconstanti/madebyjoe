#!/usr/bin/env python3
"""Failure-path fixtures for HTTP header checks; CI also tests real Apache."""
from contextlib import redirect_stdout
from email.message import Message
import importlib.util
import io
from pathlib import Path
import unittest
from unittest.mock import patch
from urllib.parse import urlsplit

spec = importlib.util.spec_from_file_location('server_checks', Path(__file__).with_name('check-server.py'))
server = importlib.util.module_from_spec(spec)
spec.loader.exec_module(server)

DOCUMENT = "default-src 'self' https://fonts.googleapis.com https://fonts.gstatic.com; script-src 'self' 'unsafe-inline' https://*.googletagmanager.com https://*.clarity.ms; worker-src 'self' blob:; connect-src 'self' https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com https://*.clarity.ms;"
WORKER = "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.googletagmanager.com; worker-src 'self' blob:; connect-src 'self' https://*.googletagmanager.com https://*.google-analytics.com https://*.analytics.google.com;"


class Response:
    body = b''

    def read(self, size=-1):
        return self.body if size < 0 else self.body[:size]

    def __enter__(self):
        return self

    def __exit__(self, *args):
        pass


class HeaderTests(unittest.TestCase):
    def run_check(self, mutation=lambda headers, worker: None, custom_404=True, range_mutation=None):
        class Opener:
            def open(self, request, **kwargs):
                path = urlsplit(request.full_url).path
                worker = path.endswith('partytown-sandbox-sw.html')
                response = Response()
                response.code = 200
                headers = response.headers = Message()
                headers['Cache-Control'] = 'public, no-cache, must-revalidate'
                types = {'.css': 'text/css', '.js': 'application/javascript', '.webp': 'image/webp',
                         '.mp4': 'video/mp4', '.jpg': 'image/jpeg'}
                headers['Content-Type'] = types.get(Path(path).suffix, 'text/html')
                headers['X-Frame-Options'] = 'SAMEORIGIN'
                headers['X-Content-Type-Options'] = 'nosniff'
                headers['Referrer-Policy'] = 'strict-origin-when-cross-origin'
                headers['Content-Security-Policy'] = WORKER if worker else DOCUMENT
                if path == '/OG.jpg':
                    response.code = 301
                    headers['Location'] = 'https://madebyjoe.co/img/OG.jpg?test=1'
                elif path in ('/clients/audits/sported.html', '/clients/audits/sported/'):
                    response.code = 301
                    headers['Location'] = 'https://madebyjoe.co/clients/audits/sported?test=1'
                elif path == '/index.html' or request.get_header('Host') == 'www.madebyjoe.co':
                    response.code = 301
                    headers['Location'] = 'https://madebyjoe.co/?test=1'
                elif path not in ('/', '/css/main.css', '/js/main.js', '/media/v2/aut-pipes.webp',
                                  '/media/v2/aut-pipes.mp4', '/robots.txt', '/sitemap.xml',
                                  '/404.html', '/img/OG.jpg', '/clients/audits/sported') and not worker:
                    response.code = 404
                if path == '/definitely-missing-mbj-page' and custom_404:
                    response.body = b'<h1>Page not found</h1><a href="/">Back to madebyjoe</a>'
                elif path == '/404.html':
                    response.body = b'<meta name="robots" content="noindex">'
                elif path == '/clients/audits/sported':
                    response.body = (b'<title>Sported</title>'
                                     b'<link rel="canonical" href="https://madebyjoe.co/clients/audits/sported">')
                if (path == '/media/v2/aut-pipes.mp4' and request.get_method() == 'GET'
                        and request.get_header('Range') == 'bytes=0-15'):
                    response.code = 206
                    headers['Content-Range'] = 'bytes 0-15/925504'
                    response.body = bytes(16)
                    if range_mutation:
                        range_mutation(response)
                mutation(headers, worker)
                return response
        with patch.object(server, 'build_opener', return_value=Opener()), redirect_stdout(io.StringIO()):
            server.check('http://fixture.invalid')

    def test_expected_headers_pass(self):
        self.run_check()

    def test_bare_404_fails(self):
        with self.assertRaisesRegex(AssertionError, '/definitely-missing-mbj-page: missing'):
            self.run_check(custom_404=False)

    def test_invalid_media_range_fails(self):
        def ignore_range(response):
            response.code = 200

        def shift_range(response):
            response.headers.replace_header('Content-Range', 'bytes 1-16/925504')

        def truncate_range(response):
            response.body = bytes(15)

        for mutation, message in ((ignore_range, 'expected 206'),
                                  (shift_range, 'wrong Content-Range'),
                                  (truncate_range, 'wrong range body length')):
            with self.subTest(mutation=mutation.__name__), self.assertRaisesRegex(AssertionError, message):
                self.run_check(range_mutation=mutation)

    def test_missing_security_headers_fail(self):
        for name in ('X-Frame-Options', 'X-Content-Type-Options', 'Referrer-Policy', 'Content-Security-Policy'):
            with self.subTest(header=name), self.assertRaises(AssertionError):
                self.run_check(lambda headers, worker: headers.__delitem__(name))

    def test_document_eval_and_worker_policy_regressions_fail(self):
        def change_document(headers, worker):
            if not worker:
                headers.replace_header('Content-Security-Policy', DOCUMENT.replace("script-src 'self'", "script-src 'self' 'unsafe-eval'"))
        def change_worker(headers, worker):
            if worker:
                headers.replace_header('Content-Security-Policy', WORKER.replace(" 'unsafe-eval'", ''))
        for mutation in (change_document, change_worker):
            with self.subTest(mutation=mutation.__name__), self.assertRaises(AssertionError):
                self.run_check(mutation)

    def test_analytics_endpoint_loss_and_duplicate_policies_fail(self):
        def remove_analytics(headers, worker):
            headers.replace_header('Content-Security-Policy', headers['Content-Security-Policy'].replace('https://*.google-analytics.com', ''))
        def duplicate(headers, worker):
            headers['Content-Security-Policy'] = "default-src 'none'"
        for mutation in (remove_analytics, duplicate):
            with self.subTest(mutation=mutation.__name__), self.assertRaises(AssertionError):
                self.run_check(mutation)


if __name__ == '__main__':
    unittest.main()
