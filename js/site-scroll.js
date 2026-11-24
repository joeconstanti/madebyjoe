/* Shared wheel smoothing and anchor motion. */
(() => {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches || !window.Lenis) return;

  const lenis = new Lenis({
    lerp: 0.1,
    wheelMultiplier: 1,
    autoRaf: true,
    allowNestedScroll: true,
  });
  function scrollTo(top) {
    lenis.scrollTo(top, { duration: 1.6, easing: (progress) => 1 - (1 - progress) ** 4 });
  }
  window.siteScroll = { lenis, scrollTo };

  document.addEventListener('click', (event) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey ||
        event.shiftKey || event.altKey) return;
    const link = event.target.closest('a[href^="#"]');
    if (!link || link.matches('.skip, [target], [download]')) return;
    const hash = link.getAttribute('href');
    const target = document.getElementById(hash.slice(1));
    if (!target || target.closest('[hidden]')) return;

    event.preventDefault();
    if (location.hash !== hash) history.pushState(history.state, '', hash);
    const margin = parseFloat(getComputedStyle(target).scrollMarginTop) || 0;
    if (hash !== '#top') {
      if (!target.hasAttribute('tabindex')) target.tabIndex = -1;
      target.focus({ preventScroll: true });
    }
    scrollTo(hash === '#top' ? 0 : target.getBoundingClientRect().top + scrollY - margin);
  });
})();
