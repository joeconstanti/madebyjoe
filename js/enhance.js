/* The page works without motion. Load decorative effects on the first interaction. */
(() => {
  const format = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/London', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  const tick = () => document.querySelectorAll('.js-clock').forEach((el) => { el.textContent = format.format(new Date()); });
  tick(); setInterval(tick, 1000);
  document.querySelectorAll('.js-year').forEach((el) => { el.textContent = new Date().getFullYear(); });
  // Keep the branded intro independent of video and the optional animation bundle.
  const loader = document.querySelector('.loader');
  if (loader) {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) loader.remove();
    else {
      const count = loader.querySelector('.js-count');
      const bar = loader.querySelector('.js-bar');
      const names = [...loader.querySelectorAll('.loader__names span')];
      let progress = 0, shown = 0, last = performance.now(), done = false;
      const finish = () => {
        if (done) return;
        done = true;
        loader.classList.add('is-finished');
        setTimeout(() => loader.remove(), 160);
      };
      const step = () => { progress = Math.min(100, progress + 50); };
      document.fonts.ready.then(step);
      const poster = document.querySelector('.hero__poster');
      if (!poster || poster.complete) step();
      else { poster.addEventListener('load', step, { once: true }); poster.addEventListener('error', step, { once: true }); }
      function frame(now) {
        if (done) return;
        shown = Math.min(progress, shown + (now - last) / 2);
        last = now;
        const value = Math.round(shown);
        count.textContent = value;
        bar.style.transform = `scaleX(${value / 100})`;
        names.forEach((name, i) => name.classList.toggle('on', value >= (i + 1) * 20 - 10));
        if (shown >= 100) finish(); else requestAnimationFrame(frame);
      }
      requestAnimationFrame(frame);
      setTimeout(finish, 1200);
      loader.addEventListener('pointerdown', finish, { once: true });
      addEventListener('keydown', finish, { once: true });
    }
  }
  const events = ['pointerdown', 'pointermove', 'keydown', 'touchstart', 'scroll'];
  let started = false;
  async function enhance() {
    if (started) return;
    started = true;
    events.forEach((event) => removeEventListener(event, enhance));
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    for (const src of ['vendor/gsap.min.js', 'vendor/ScrollTrigger.min.js', 'vendor/SplitText.min.js', 'vendor/lenis.min.js', 'hero-gl.js?v=20261023a', 'main.js?v=20261023a']) {
      const loaded = await new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = 'js/' + src;
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.append(script);
      });
      if (!loaded) { console.warn('Optional motion could not load: ' + src); return; }
    }
  }
  events.forEach((event) => addEventListener(event, enhance, { passive: true }));
})();
