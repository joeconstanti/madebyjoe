// Inline first-view resources so the branded intro does not wait for extra requests.
import { readFileSync, writeFileSync } from 'node:fs';
const root = new URL('../', import.meta.url);
let css = readFileSync(new URL('css/main.css', root), 'utf8');
const chromeCss = readFileSync(new URL('css/site-chrome.css', root), 'utf8');
css = css.replace('@import "./site-chrome.css";', () => chromeCss.trimEnd());
css = css.replace(/url\(\.\.\/fonts\/([^)]*\.woff2)\)/g, (_, name) => {
  const subset = name.replace('.woff2', '-site.woff2');
  return `url(data:font/woff2;base64,${readFileSync(new URL('fonts/' + subset, root)).toString('base64')})`;
});
const snippet = readFileSync(new URL('js/vendor/partytown-1.0.2/partytown.js', root), 'utf8');
const file = new URL('index.html', root);
const original = readFileSync(file, 'utf8');
let html = original;
// Locate every edit in the original document before changing any bytes. Slicing
// preserves source dollar tokens literally and avoids replacement-string syntax.
const edits = [];
function inline(pattern, replacement) {
  const matches = [...original.matchAll(new RegExp(pattern.source, 'g'))];
  if (matches.length !== 1) throw new Error(`Expected exactly one inline target: ${pattern}`);
  const match = matches[0];
  edits.push({ start: match.index, end: match.index + match[0].length,
    text: typeof replacement === 'function' ? replacement(match) : replacement });
}
for (const marker of ['partytown', 'inline-hero', 'inline-enhance']) {
  for (const edge of ['start', 'end']) {
    const token = `<!-- ${marker}:${edge} -->`;
    if (html.split(token).length !== 2) throw new Error(`Expected exactly one ${token}`);
  }
  if (html.indexOf(`<!-- ${marker}:start -->`) > html.indexOf(`<!-- ${marker}:end -->`)) {
    throw new Error(`Reversed markers: ${marker}`);
  }
}
inline(/  <style>[\s\S]*?<\/style>/, `  <style>\n${css}\n  </style>`);
inline(/<!-- partytown:start -->[\s\S]*?<!-- partytown:end -->/, `<!-- partytown:start -->
  <script>window.partytown = { lib: '/js/vendor/partytown-1.0.2/', forward: ['dataLayer.push', 'gtag'] };
${snippet}
  </script>
  <!-- partytown:end -->`);
const hero = readFileSync(new URL('js/hero-gl.js', root), 'utf8');
inline(/  <!-- inline-hero:start -->[\s\S]*?<!-- inline-hero:end -->/, `  <!-- inline-hero:start -->\n  <script>\n${hero}\n  </script>\n  <!-- inline-hero:end -->`);
const poster = readFileSync(new URL('media/v2/hero-dither.webp', root)).toString('base64');
inline(/(<img class="hero__poster" src=")[^"]+"/, (match) => `${match[1]}data:image/webp;base64,${poster}"`);
const enhance = readFileSync(new URL('js/enhance.js', root), 'utf8');
inline(/  <!-- inline-enhance:start -->[\s\S]*?<!-- inline-enhance:end -->/, `  <!-- inline-enhance:start -->\n  <script>\n${enhance}\n  </script>\n  <!-- inline-enhance:end -->`);
edits.sort((a, b) => a.start - b.start);
for (let i = 1; i < edits.length; i++) {
  if (edits[i].start < edits[i - 1].end) throw new Error('Overlapping inline targets');
}
for (const edit of edits.reverse()) {
  html = html.slice(0, edit.start) + edit.text + html.slice(edit.end);
}
// Keep the homepage as the source for the public site's header and footer.
const headerPattern = /<header class="hdr">[\s\S]*?<\/header>/;
const footerPattern = /<footer class="ftr">[\s\S]*?<\/footer>/;
const header = html.match(headerPattern)?.[0];
const footer = html.match(footerPattern)?.[0];
if (!header || !footer) throw new Error('Missing shared header or footer in index.html');
const secondaryHeader = header
  .replace('href="#top" aria-label="madebyjoe, back to top"', 'href="/" aria-label="madebyjoe, home"')
  .replaceAll('href="#', 'href="/#');
const pages = [['index.html', file, original, html]];
for (const name of ['archive.html', 'makersclub.html', '404.html']) {
  const path = new URL(name, root);
  const current = readFileSync(path, 'utf8');
  if (!headerPattern.test(current) || !footerPattern.test(current)) {
    throw new Error(`Missing shared header or footer in ${name}`);
  }
  const pageHeader = name === 'archive.html'
    ? secondaryHeader.replace('href="/archive"', 'href="/archive" aria-current="page"')
    : secondaryHeader;
  const generated = current
    .replace(headerPattern, () => pageHeader)
    .replace(footerPattern, () => footer);
  pages.push([name, path, current, generated]);
}

for (const [name, path, current, generated] of pages) {
  if (current === generated) continue;
  if (process.argv.includes('--check')) {
    console.error(`Generated ${name} is stale. Run node scripts/sync-styles.mjs`);
    process.exitCode = 1;
  } else writeFileSync(path, generated);
}
