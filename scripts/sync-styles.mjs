// Inline first-view resources so the branded intro does not wait for extra requests.
import { readFileSync, writeFileSync } from 'node:fs';
const root = new URL('../', import.meta.url);
let css = readFileSync(new URL('css/main.css', root), 'utf8');
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
if (process.argv.includes('--check')) {
  if (html !== original) {
    console.error('Generated index.html is stale. Run node scripts/sync-styles.mjs');
    process.exitCode = 1;
  } else console.log('Generated HTML is in sync');
} else writeFileSync(file, html);
