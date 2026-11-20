const TIMEOUT = 10_000;
const CHAPTER_IDS = ['e-ftr', 'e-syn', 'e-cer', 'e-aut', 'e-jg'];
const DESKTOP = { width: 1440, height: 900 };

async function waitForPlayback(page, selector, label, activeClass) {
  const initial = await page.locator(selector).evaluateAll((videos) =>
    videos.map((video) => {
      const { totalVideoFrames, droppedVideoFrames } = video.getVideoPlaybackQuality();
      return { time: video.currentTime, frames: totalVideoFrames - droppedVideoFrames };
    }),
  );
  try {
    await page.waitForFunction(({ selector, initial, activeClass }) =>
      [...document.querySelectorAll(selector)].some((video, index) => {
        if (video.paused || !video.currentSrc || video.readyState < 2) return false;
        if (activeClass && !video.classList.contains(activeClass)) return false;
        const before = initial[index] ?? { time: 0, frames: 0 };
        const { totalVideoFrames, droppedVideoFrames } = video.getVideoPlaybackQuality();
        const rect = video.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0 &&
          rect.bottom > 0 && rect.top < innerHeight &&
          rect.right > 0 && rect.left < innerWidth &&
          totalVideoFrames - droppedVideoFrames > before.frames &&
          Math.abs(video.currentTime - before.time) >= 0.1;
      }), { selector, initial, activeClass });
  } catch (cause) {
    const state = await page.locator(selector).evaluateAll((videos) => videos.map((video) => ({
      src: video.currentSrc,
      paused: video.paused,
      readyState: video.readyState,
      time: video.currentTime,
      error: video.error?.message || video.dataset.playbackError,
    }))).catch(() => []);
    throw new Error(`${label} did not advance video frames in the viewport (${JSON.stringify(state)})`, { cause });
  }
}

async function scrollToChapter(page, id) {
  await page.locator(`#${id}`).evaluate((chapter) => {
    if (getComputedStyle(chapter).position === 'sticky') {
      // Sticky panels can share a viewport position. Scroll to their positions in the flow.
      const stack = chapter.closest('.chapters');
      let top = stack.getBoundingClientRect().top + window.scrollY;
      for (let panel = stack.firstElementChild; panel !== chapter; panel = panel.nextElementSibling) {
        top += panel.offsetHeight;
      }
      window.scrollTo({ top, behavior: 'instant' });
    } else {
      chapter.querySelector('.ch__media').scrollIntoView({ block: 'center', behavior: 'instant' });
    }
  });
}

async function checkReducedMarquee(page) {
  await page.locator('html.reduce:not(.lenis)').waitFor({ state: 'attached' });
  const track = page.locator('.js-marquee');
  await track.evaluate((element) => element.scrollIntoView({ block: 'center', behavior: 'instant' }));
  try {
    const started = await page.waitForFunction(() => {
      const transform = getComputedStyle(document.querySelector('.js-marquee')).transform;
      return transform !== 'none' && transform;
    });
    const initialTransform = await started.jsonValue();
    await page.waitForFunction((initial) => {
      const transform = getComputedStyle(document.querySelector('.js-marquee')).transform;
      return transform !== 'none' && transform !== initial;
    }, initialTransform);
  } catch (cause) {
    throw new Error('Marquee did not keep moving with reduced motion', { cause });
  }
}

export async function checkMedia(browser, baseURL) {
  const scenarios = [
    ['desktop', { viewport: DESKTOP }],
    ['mobile', { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true }],
    ['reduced motion', { viewport: DESKTOP, reducedMotion: 'reduce' }],
  ];
  for (const [name, options] of scenarios) {
    const context = await browser.newContext(options);
    context.setDefaultTimeout(TIMEOUT);
    try {
      const page = await context.newPage();
      await page.goto(new URL('/', baseURL).href, { waitUntil: 'domcontentloaded' });

      // Both checks run before any scroll or input in this new context.
      await waitForPlayback(page, '.hero__pill video', 'Hero', 'on');
      await page.locator('.hero__gl.is-ready').waitFor({ state: 'visible' }).catch((cause) => {
        throw new Error('Hero WebGL canvas did not become ready before interaction', { cause });
      });

      if (options.reducedMotion) await checkReducedMarquee(page);
      // The final shade is added when the desktop stack installs its playback triggers.
      if (name === 'desktop') await page.locator('#e-jg .ch__shade').waitFor({ state: 'attached' });
      for (const id of CHAPTER_IDS) {
        await scrollToChapter(page, id);
        await waitForPlayback(page, `#${id} .ch__media video`, `Chapter #${id}`);
      }
    } catch (cause) {
      throw new Error(`Media check failed on ${name}. ${cause.message}`, { cause });
    } finally {
      await context.close();
    }
  }
}
