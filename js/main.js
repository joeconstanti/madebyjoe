/* madebyjoe 2.0: motion and interaction */
(() => {
  const html = document.documentElement;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (reduce) html.classList.add('reduce');
  gsap.registerPlugin(ScrollTrigger, SplitText);
  const ENTITIES = ['From the Root', 'Synthetic Labs', 'Cerebral', 'Automate', 'joe.graphics'];

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
  const fitAll = () => $$('.js-fit').forEach(fit);

  /* ---------- Smooth scroll ---------- */
  let lenis = null;
  if (!reduce) {
    lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  // Chapters are sticky, so their live rect is wrong once stuck. Use their place in the flow.
  const chapters = $$('.ch');
  const chapWrap = $('.chapters');
  const isStack = () => matchMedia('(min-width: 1000px) and (min-height: 640px)').matches;
  const chapTop = (i) => chapWrap.offsetTop + chapters.slice(0, i).reduce((s, c) => s + c.offsetHeight, 0);
  function targetY(el) {
    const i = chapters.indexOf(el);
    if (i > -1) return chapTop(i);
    return el.getBoundingClientRect().top + window.scrollY;
  }
  function scrollToEl(el) {
    const y = el ? targetY(el) : 0;
    if (lenis) lenis.scrollTo(y, { duration: 1.6, easing: (t) => 1 - Math.pow(1 - t, 4) });
    else window.scrollTo({ top: y });
  }
  $$('a[href^="#"]').forEach((a) => a.addEventListener('click', (e) => {
    const id = a.getAttribute('href');
    const el = id === '#top' ? null : $(id);
    if (id !== '#top' && !el) return;
    e.preventDefault();
    scrollToEl(el);
  }));

  /* ---------- Lazy video ---------- */
  function load(v) { if (v.dataset.poster && !v.poster) v.poster = v.dataset.poster; if (!v.src && v.dataset.src) { v.src = v.dataset.src; v.load(); } }
  function play(v) {
    if (document.hidden) return Promise.resolve(false);
    load(v);
    v.muted = true; v.defaultMuted = true; v.playsInline = true;
    v.autoplay = true;
    return v.play().then(() => true, (error) => {
      v.dataset.playbackError = error.name;
      return false;
    });
  }
  function pause(v) { if (!v.paused) v.pause(); }

  // In-flow videos (not hero pill, not hover preview, not chapters): play while visible.
  const flowVideos = $$('video[data-src]').filter((v) => !v.closest('.hero__pill, .preview, .ch'));
  const vio = new IntersectionObserver((entries) => entries.forEach((e) => (e.isIntersecting ? play(e.target) : pause(e.target))), { rootMargin: '200px 0px' });
  flowVideos.forEach((v) => vio.observe(v));

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) $$('video').forEach(pause);
    else {
      activeChapterVideos.forEach(play);
      if (heroVisible) startPill();
    }
  });

  /* ---------- Cursor ---------- */
  const cursor = $('.cursor');
  const label = $('.cursor__label');
  const mouse = { x: innerWidth / 2, y: innerHeight / 2 };
  const cur = { x: mouse.x, y: mouse.y };
  if (fine) {
    addEventListener('pointermove', (e) => { mouse.x = e.clientX; mouse.y = e.clientY; }, { passive: true });
    document.addEventListener('pointerover', (e) => {
      const t = e.target.closest('[data-cursor]');
      if (t) { label.textContent = t.dataset.cursor; cursor.classList.add('is-label'); }
      else cursor.classList.remove('is-label');
    });
    document.addEventListener('mouseleave', () => cursor.classList.add('is-hidden'));
    document.addEventListener('mouseenter', () => cursor.classList.remove('is-hidden'));
    gsap.ticker.add(() => {
      cur.x += (mouse.x - cur.x) * 0.22; cur.y += (mouse.y - cur.y) * 0.22;
      cursor.style.transform = `translate3d(${cur.x}px, ${cur.y}px, 0)`;
    });

    // Magnetic buttons
    $$('.btn').forEach((b) => {
      const xTo = gsap.quickTo(b, 'x', { duration: 0.6, ease: 'power3' });
      const yTo = gsap.quickTo(b, 'y', { duration: 0.6, ease: 'power3' });
      b.addEventListener('pointermove', (e) => {
        const r = b.getBoundingClientRect();
        xTo((e.clientX - r.left - r.width / 2) * 0.25);
        yTo((e.clientY - r.top - r.height / 2) * 0.35);
      });
      b.addEventListener('pointerleave', () => { xTo(0); yTo(0); });
    });
  }

  /* ---------- Index hover preview ---------- */
  const preview = $('.preview');
  const pvids = $$('video', preview);
  const list = $('.index__list');
  if (fine && preview) {
    const pv = { x: mouse.x, y: mouse.y, r: 0 };
    let active = -1;
    gsap.ticker.add(() => {
      const dx = mouse.x - pv.x;
      pv.x += dx * 0.12; pv.y += (mouse.y - pv.y) * 0.12;
      pv.r += (gsap.utils.clamp(-10, 10, dx * 0.06) - pv.r) * 0.1;
      preview.style.transform = `translate3d(${pv.x}px, ${pv.y}px, 0) rotate(${pv.r}deg)`;
    });
    $$('.row', list).forEach((row) => row.addEventListener('pointerenter', () => {
      const i = +row.dataset.preview;
      if (i === active) return;
      pvids.forEach((v, j) => { v.classList.toggle('on', j === i); j === i ? play(v) : pause(v); });
      active = i;
      preview.classList.add('is-on');
    }));
    list.addEventListener('pointerleave', () => {
      preview.classList.remove('is-on');
      setTimeout(() => { if (!preview.classList.contains('is-on')) { pvids.forEach(pause); active = -1; } }, 500);
    });
    // Hide it if the list scrolls away under a still mouse.
    new IntersectionObserver((es) => { if (!es[0].isIntersecting) preview.classList.remove('is-on'); }).observe(list);
    // Warm up the videos when the list is near.
    new IntersectionObserver((es, o) => { if (es[0].isIntersecting) { pvids.forEach((v) => { v.preload = 'metadata'; load(v); }); o.disconnect(); } }, { rootMargin: '400px 0px' }).observe(list);
  }

  /* ---------- Hero pill: cycle the five entities ---------- */
  const pill = $('.js-pill');
  const pillVids = $$('video', pill);
  const pillLabel = $('.js-pill-label');
  let pillI = 0, pillTimer = null, heroVisible = true, pillChanging = false;
  async function showPill(i) {
    if (pillChanging) return;
    pillChanging = true;
    const video = pillVids[i];
    const playing = await play(video);
    if (playing) {
      // Keep the previous clip visible until the new one is actually playing.
      pillI = i;
      pillVids.forEach((v, j) => {
        v.classList.toggle('on', j === i);
        if (j !== i) setTimeout(() => j !== pillI && pause(v), 700);
      });
      pillLabel.textContent = ENTITIES[i];
    }
    pillChanging = false;
    clearTimeout(pillTimer);
    if (playing) pillTimer = setTimeout(() => {
      if (heroVisible) showPill((pillI + 1) % pillVids.length);
    }, 2400);
  }
  function startPill() {
    clearTimeout(pillTimer);
    showPill(pillI);
  }
  new IntersectionObserver((es) => {
    heroVisible = es[0].isIntersecting;
    const v = pillVids[pillI];
    if (heroVisible) startPill();
    else { clearTimeout(pillTimer); pause(v); }
  }).observe($('.hero'));

  // Retry muted playback in a trusted gesture if a mobile browser initially blocks it.
  function resumeVisibleVideos() {
    if (heroVisible) play(pillVids[pillI]);
    activeChapterVideos.forEach(play);
  }
  document.addEventListener('pointerdown', resumeVisibleVideos, { passive: true });
  document.addEventListener('keydown', resumeVisibleVideos);

  /* ---------- Marquee ---------- */
  const track = $('.js-marquee');
  if (track) {
    const loop = gsap.to(track, { xPercent: -50, repeat: -1, duration: 28, ease: 'none' });
    if (lenis) {
      let boost = 1;
      lenis.on('scroll', ({ velocity }) => { boost = 1 + Math.min(Math.abs(velocity) * 0.25, 5); });
      gsap.ticker.add(() => { boost += (1 - boost) * 0.05; loop.timeScale(boost); });
    }
  }

  /* ---------- Copy email ---------- */
  const toast = $('.toast');
  let toastT;
  function say(msg) { toast.textContent = msg; toast.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(() => toast.classList.remove('on'), 2200); }
  $$('.js-copy').forEach((a) => a.addEventListener('click', (e) => {
    if (!navigator.clipboard) return;
    e.preventDefault();
    navigator.clipboard.writeText(a.textContent.trim()).then(() => say('Copied ' + a.textContent.trim()), () => (location.href = a.href));
  }));

  /* ---------- Scroll animations ---------- */
  let activeChapterVideos = [];
  function setActiveChapter(ch) {
    const vids = ch ? $$('video', ch) : [];
    activeChapterVideos.forEach((v) => !vids.includes(v) && pause(v));
    vids.forEach(play);
    activeChapterVideos = vids;
  }

  function leaveChapter(ch) {
    const vids = $$('video', ch);
    vids.forEach(pause);
    activeChapterVideos = activeChapterVideos.filter((v) => !vids.includes(v));
  }

  // Playback follows actual media visibility, independently of scroll effects.
  const chapterVideoObserver = new IntersectionObserver((entries) => {
    if (isStack() && !reduce) return;
    entries.forEach(({ target, isIntersecting }) => {
      const videos = $$('video', target);
      if (isIntersecting) {
        videos.forEach(play);
        activeChapterVideos = [...new Set([...activeChapterVideos, ...videos])];
      } else leaveChapter(target);
    });
  }, { rootMargin: '150px 0px' });
  chapters.forEach((chapter) => chapterVideoObserver.observe(chapter));

  /* ---------- Reveal helpers ---------- */
  // Text types in: characters appear one by one and fade up from a soft blur.
  function typeIn(el, { delay = 0, total = 0.9 } = {}) {
    const split = SplitText.create(el, { type: 'words,chars', wordsClass: 'tw', charsClass: 'tc', aria: el.tagName === 'P' ? 'none' : 'auto' });
    if (el.tagName === 'P') {
      const text = document.createElement('span'); text.className = 'sr-only'; text.textContent = el.textContent;
      [...el.children].forEach((child) => child.setAttribute('aria-hidden', 'true'));
      el.append(text);
    }
    const n = split.chars.length || 1;
    return gsap.from(split.chars, {
      opacity: 0, filter: 'blur(6px)', duration: 0.45, ease: 'power2.out', delay,
      stagger: Math.min(0.035, total / n), clearProps: 'filter',
    });
  }
  // Elements come into focus: a small blur, a small lift, a fade.
  const focusIn = (targets, vars = {}) => gsap.from(targets, {
    opacity: 0, filter: 'blur(10px)', y: 10, duration: 1.3, stagger: 0.06, ease: 'power3.out', clearProps: 'filter', ...vars,
  });

  function scrollAnimations() {
    if (reduce) return;
    // Headings and lead text type in.
    $$('[data-split]').forEach((el) => {
      if (el.classList.contains('hero__statement')) return;
      const tw = typeIn(el); tw.pause();
      ScrollTrigger.create({ trigger: el, start: 'top 88%', once: true, onEnter: () => tw.play() });
    });
    const mail = $('.contact__mail');
    if (mail) { const tw = typeIn(mail, { total: 0.8 }); tw.pause(); ScrollTrigger.create({ trigger: mail, start: 'top 90%', once: true, onEnter: () => tw.play() }); }

    // Everything else comes into focus.
    const onEnter = (trigger) => ({ scrollTrigger: { trigger, start: 'top 88%', once: true } });
    $$('.sec-head').forEach((h) => focusIn($$('.lbl, .sec-head__note', h), onEnter(h)));
    focusIn('.row', { stagger: 0.07, ...onEnter('.index__list') });
    focusIn('.marquee', onEnter('.marquee'));
    focusIn('.brands__list li', { stagger: 0.04, ...onEnter('.brands__list') });
    focusIn('.about__body, .about__caps > div', { stagger: 0.08, ...onEnter('.about__body') });
    focusIn('.contact__social li', onEnter('.contact__social'));
    focusIn('.ftr__grid > p', onEnter('.ftr'));

    // Hero drifts up and fades as you leave it.
    gsap.to('.hero__mark', { yPercent: -35, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
    if (window.heroGL) ScrollTrigger.create({ trigger: '.hero', start: 'top top', end: 'bottom top', onUpdate: (st) => (window.heroGL.scroll = st.progress) });
    gsap.to('.hero__statement, .hero__meta', { opacity: 0, y: -60, ease: 'none', scrollTrigger: { trigger: '.hero', start: '20% top', end: '80% top', scrub: true } });

    // Footer mark rises.
    gsap.from('.ftr__mark', { yPercent: 40, ease: 'none', scrollTrigger: { trigger: '.ftr', start: 'top bottom', end: 'bottom bottom', scrub: true } });

    // Chapters
    const mm = gsap.matchMedia();
    const chapterParts = (ch) => ({
      name: $('.ch__name', ch),
      quote: $('.ch__quote', ch),
      bits: $$('.ch__stats, .ch__tags, .btn, .ch__top', ch),
      nums: $$('.js-num', ch),
    });
    function introTl(ch) {
      const p = chapterParts(ch);
      const tl = gsap.timeline({ paused: true })
        .add(typeIn(p.name, { total: 0.6 }), 0)
        .add(typeIn(p.quote, { total: 0.9 }), 0.35)
        .add(focusIn(p.bits), 0.2);
      p.nums.forEach((n) => {
        const o = { v: 0 };
        tl.to(o, { v: +n.dataset.to, duration: 1.6, ease: 'expo.out', onUpdate: () => (n.textContent = Math.round(o.v)) }, 0.3);
      });
      return tl;
    }

    // Large screens: sticky stack. Each panel sinks back as the next one slides over it.
    mm.add('(min-width: 1000px) and (min-height: 640px)', () => {
      chapters.forEach((ch, i) => {
        const inner = $('.ch__inner', ch);
        let shade = $('.ch__shade', ch);
        if (!shade) { shade = document.createElement('div'); shade.className = 'ch__shade'; ch.append(shade); }
        const H = () => ch.offsetHeight;
        const tl = introTl(ch);
        ScrollTrigger.create({ start: () => chapTop(i) - H() * 0.35, onEnter: () => tl.play(), invalidateOnRefresh: true });

        // Sticky desktop panels need their flow positions to determine ownership.
        ScrollTrigger.create({
          start: () => chapTop(i) - H() * 0.9, end: () => chapTop(i) + H() * 0.9, invalidateOnRefresh: true,
          onToggle: (s) => (s.isActive ? setActiveChapter(ch) : leaveChapter(ch)),
        });

        if (i < chapters.length - 1) {
          gsap.timeline({ scrollTrigger: { start: () => chapTop(i), end: () => chapTop(i) + H(), scrub: true, invalidateOnRefresh: true } })
            .to(inner, { scale: 0.9, yPercent: -4, ease: 'none' }, 0)
            .to(shade, { opacity: 0.65, ease: 'none' }, 0);
        }
      });
      return () => chapters.forEach((ch) => gsap.set($('.ch__inner', ch), { clearProps: 'all' }));
    });

    // Small screens: normal flow.
    mm.add('(max-width: 999px), (max-height: 639px)', () => {
      chapters.forEach((ch) => {
        const tl = introTl(ch);
        ScrollTrigger.create({ trigger: $('.ch__text', ch), start: 'top 85%', once: true, onEnter: () => tl.play() });
      });
    });
  }

  // Content is visible immediately; decoration never gates first paint.
  document.fonts.ready.then(() => {
    fitAll();
    scrollAnimations();
    ScrollTrigger.refresh();
  });
  if (window.heroGL) window.heroGL.fade = 1;
  startPill();

  /* ---------- Resize ---------- */
  let rz;
  addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(() => { fitAll(); ScrollTrigger.refresh(); }, 150); });
})();
