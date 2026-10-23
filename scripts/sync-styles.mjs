// Keep CSS editable separately while serving it inline without a blocking request.
import { readFileSync, writeFileSync } from 'node:fs';
const root = new URL('../', import.meta.url);
const css = readFileSync(new URL('css/main.css', root), 'utf8').replaceAll('url(../fonts/', 'url(fonts/');
const file = new URL('index.html', root);
const html = readFileSync(file, 'utf8');
if (!html.includes('  <style>')) throw new Error('Inline stylesheet not found');
writeFileSync(file, html.replace(/  <style>[\s\S]*?<\/style>/, `  <style>\n${css}\n  </style>`));
