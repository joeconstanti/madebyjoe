"""Run after copy edits, then run node scripts/sync-styles.mjs.
Requires fonttools and brotli (pip install fonttools brotli).
"""
from html.parser import HTMLParser
from pathlib import Path
from fontTools import subset

ROOT = Path(__file__).resolve().parent.parent

class PageText(HTMLParser):
    def __init__(self):
        super().__init__()
        self.parts = []
        self.skip = 0

    def handle_starttag(self, tag, attrs):
        if tag in ('script', 'style'):
            self.skip += 1

    def handle_endtag(self, tag):
        if tag in ('script', 'style'):
            self.skip -= 1

    def handle_data(self, data):
        if not self.skip:
            self.parts.append(data)

page = PageText()
page.feed((ROOT / 'index.html').read_text())
text = ''.join(page.parts) + '0123456789%:ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz→↑©®’–—'
for name in ('InterTight-normal-300_800', 'GeistMono-normal-400', 'InstrumentSerif-italic-400'):
    options = subset.Options()
    options.flavor = 'woff2'
    options.layout_features = ['*']
    options.hinting = False
    font = subset.load_font(ROOT / f'fonts/{name}.woff2', options)
    subsetter = subset.Subsetter(options=options)
    subsetter.populate(text=text)
    subsetter.subset(font)
    subset.save_font(font, ROOT / f'fonts/{name}-site.woff2', options)
