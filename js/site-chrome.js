(() => {
  const format = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/London', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' });
  const tick = () => document.querySelectorAll('.js-clock').forEach((el) => { el.textContent = format.format(new Date()); });
  tick(); setInterval(tick, 1000);
  document.querySelectorAll('.js-year').forEach((el) => { el.textContent = new Date().getFullYear(); });

  /* ---------- Fit text to its container width ---------- */
  const range = document.createRange();
  function fit(el) {
    el.style.fontSize = '';
    const cs = getComputedStyle(el);
    const avail = el.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    for (let i = 0; i < 2; i++) {
      range.selectNodeContents(el);
      const w = range.getBoundingClientRect().width;
      const fs = parseFloat(getComputedStyle(el).fontSize);
      if (w > 0) el.style.fontSize = (fs * avail / w) + 'px';
    }
  }
  const fitAll = () => document.querySelectorAll('.js-fit').forEach(fit);

  document.fonts.ready.then(fitAll);
  let resizeTimer;
  addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(fitAll, 150);
  });
})();
