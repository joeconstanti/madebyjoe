import assert from 'node:assert/strict';

const TIMEOUT = 5_000;
const MAX_TABS = 40;
const EMAIL = 'hello@madebyjoe.co';

async function tabTo(page, link, label) {
  const focused = link.and(page.locator(':focus'));
  for (let step = 0; step < MAX_TABS; step++) {
    await page.keyboard.press('Tab');
    if (await focused.count()) return;
  }
  assert.fail(`Tab did not reach ${label} after ${MAX_TABS} presses`);
}

async function openSection(page, link, target) {
  await tabTo(page, link, target);
  await page.keyboard.press('Enter');
  await page.waitForFunction((selector) => {
    const section = document.querySelector(selector);
    return section && Math.abs(section.getBoundingClientRect().top) <= 4;
  }, target, { timeout: TIMEOUT }).catch((error) => {
    throw new Error(`Enter did not scroll to ${target}`, { cause: error });
  });
}

export async function checkInteractions(browser, baseURL) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  try {
    await context.addInitScript(() => {
      if (window !== window.top) return;

      const result = { clipboardText: null, mailto: null };
      window.contactInteraction = result;
      Object.defineProperty(navigator, 'clipboard', {
        value: {
          async writeText(text) {
            result.clipboardText = text;
            throw new DOMException('Clipboard permission denied', 'NotAllowedError');
          },
        },
      });

      // Record the external navigation before it can open a mail app.
      window.navigation?.addEventListener('navigate', (event) => {
        if (!event.destination.url.startsWith('mailto:')) return;
        event.preventDefault();
        result.mailto = event.destination.url;
      });
    });

    const page = await context.newPage();
    const response = await page.goto(new URL('/', baseURL).href, {
      waitUntil: 'domcontentloaded',
      timeout: 10_000,
    });
    assert(response?.ok(), 'The homepage must load for the interaction checks');
    await page.locator('.loader').waitFor({ state: 'detached', timeout: TIMEOUT });

    const nav = page.getByRole('navigation', { name: 'Main', exact: true });
    await openSection(page, nav.getByRole('link', { name: 'Index', exact: true }), '#index');
    await openSection(page, nav.getByRole('link', { name: 'Contact', exact: true }), '#contact');

    assert(await page.evaluate(() => Boolean(window.navigation)),
      'Observing the mailto fallback requires browser support for the Navigation API');
    const email = page.locator('#contact').getByRole('link', { name: EMAIL, exact: true });
    await tabTo(page, email, 'the contact email link');
    await page.keyboard.press('Enter');
    await page.waitForFunction(() => window.contactInteraction?.mailto, undefined, {
      timeout: TIMEOUT,
    }).catch((error) => {
      throw new Error('The contact email link did not request mailto after clipboard denial', { cause: error });
    });
    const { clipboardText, mailto } = await page.evaluate(() => window.contactInteraction);
    assert.equal(clipboardText, EMAIL, 'The clipboard write must use the contact address');
    assert.equal(mailto, `mailto:${EMAIL}`, 'The fallback must open the contact address');
  } finally {
    await context.close();
  }
}
