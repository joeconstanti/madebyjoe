import { chromium } from 'playwright';
import { checkInteractions } from './interactions.mjs';
import { checkMedia } from './media.mjs';

const baseURL = new URL(process.argv[2] ?? 'http://127.0.0.1:8000');
if (baseURL.protocol !== 'http:' || !['127.0.0.1', 'localhost'].includes(baseURL.hostname)) {
  throw new Error('Pass the HTTP origin of a local site server.');
}

const browser = await chromium.launch({
  args: [
    '--enable-unsafe-swiftshader',
    '--host-resolver-rules=MAP * ~NOTFOUND, EXCLUDE localhost, EXCLUDE 127.0.0.1',
  ],
});

try {
  console.log(`Chromium ${browser.version()} at ${baseURL.origin}`);
  for (const [name, check] of [
    ['Keyboard navigation and contact', checkInteractions],
    ['Portfolio media', checkMedia],
  ]) {
    try {
      await check(browser, baseURL.origin);
      console.log(`Passed: ${name}`);
    } catch (error) {
      process.exitCode = 1;
      console.error(`Failed: ${name}\n${error.stack ?? error}`);
    }
  }
} finally {
  await browser.close();
}
