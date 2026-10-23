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
let html = readFileSync(file, 'utf8');
if (!html.includes('  <style>')) throw new Error('Inline stylesheet not found');
html = html.replace(/  <style>[\s\S]*?<\/style>/, `  <style>\n${css}\n  </style>`);
html = html.replace(/<!-- partytown:start -->[\s\S]*?<!-- partytown:end -->/, `<!-- partytown:start -->
  <script>window.partytown = { lib: '/js/vendor/partytown-1.0.2/', forward: ['dataLayer.push'] };
${snippet}
  </script>
  <!-- partytown:end -->`);
const hero = readFileSync(new URL('js/hero-gl.js', root), 'utf8');
html = html.replace(/  <!-- inline-hero:start -->[\s\S]*?<!-- inline-hero:end -->/, `  <!-- inline-hero:start -->\n  <script>\n${hero}\n  </script>\n  <!-- inline-hero:end -->`);
const poster = readFileSync(new URL('media/v2/hero-dither.webp', root)).toString('base64');
html = html.replace(/(<img class="hero__poster" src=")[^"]+"/, `$1data:image/webp;base64,${poster}"`);
const enhance = readFileSync(new URL('js/enhance.js', root), 'utf8');
html = html.replace(/  <!-- inline-enhance:start -->[\s\S]*?<!-- inline-enhance:end -->/, `  <!-- inline-enhance:start -->\n  <script>\n${enhance}\n  </script>\n  <!-- inline-enhance:end -->`);
writeFileSync(file, html);
