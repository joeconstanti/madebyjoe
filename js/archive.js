(() => {
  const timeline = document.querySelector('.timeline');
  const entries = new Map(Array.from(timeline.querySelectorAll('.entry'), (entry) => [entry.id, entry]));
  const groups = Array.from(timeline.querySelectorAll('.year'), (section) => ({
    section,
    link: timeline.querySelector(`.years [data-year="${section.dataset.year}"]`),
    count: section.querySelector('.year-count'),
    entries: Array.from(section.querySelectorAll('.entry'), (entry) => ({
      entry,
      searchable: [
        entry.querySelector('.entry-link').textContent,
        entry.querySelector('template').content.textContent,
      ].join(' ').toLowerCase(),
    })),
  }));
  const query = document.querySelector('#query');
  const source = document.querySelector('#source');
  const kind = document.querySelector('#kind');
  const view = document.querySelector('#view');
  const reset = document.querySelector('#reset');
  const resultCount = document.querySelector('#results');
  const empty = timeline.querySelector('.empty');
  const feature = document.querySelector('.feature');
  const picks = document.querySelector('.picks');
  const detail = document.querySelector('#work-detail');
  const content = detail.querySelector('.detail-content');
  let previousFocus;
  let detailFromClick = false;
  let scrollFrame;

  function currentYear() {
    const visible = groups.filter(({ section }) => !section.hidden);
    const current = visible.findLast(({ section }) => section.getBoundingClientRect().top <= 100) || visible[0];
    for (const group of groups) {
      if (group === current) group.link.setAttribute('aria-current', 'true');
      else group.link.removeAttribute('aria-current');
    }
  }

  function applyFilters() {
    const terms = query.value.trim().toLowerCase().split(/\s+/).filter(Boolean);
    let total = 0;
    for (const group of groups) {
      let count = 0;
      for (const { entry, searchable } of group.entries) {
        const matches = (!source.value || entry.dataset.sources.split(' ').includes(source.value))
          && (!kind.value || kind.value === entry.dataset.kind)
          && terms.every((term) => searchable.includes(term));
        entry.hidden = !matches;
        if (matches) count++;
      }
      group.section.hidden = group.link.hidden = count === 0;
      group.count.textContent = `${count} ${count === 1 ? 'entry' : 'entries'}`;
      total += count;
    }
    empty.hidden = total > 0;
    reset.hidden = !query.value && !source.value && !kind.value;
    resultCount.textContent = `${total} ${total === 1 ? 'entry' : 'entries'}`;
    currentYear();
  }

  function setView(compact) {
    timeline.classList.toggle('compact', compact);
    view.setAttribute('aria-pressed', String(compact));
  }

  function storeFilters() {
    const url = new URL(location.href);
    for (const [key, value] of [['q', query.value.trim()], ['source', source.value], ['type', kind.value],
      ['view', timeline.classList.contains('compact') ? 'compact' : '']]) {
      if (value) url.searchParams.set(key, value);
      else url.searchParams.delete(key);
    }
    history.replaceState(history.state, '', url);
  }

  function readFilters() {
    const params = new URLSearchParams(location.search);
    query.value = params.get('q') || '';
    source.value = params.get('source') || '';
    kind.value = params.get('type') || '';
    setView(params.get('view') === 'compact');
    applyFilters();
  }

  function updateFilters() {
    applyFilters();
    storeFilters();
  }

  function renderDetail(entry) {
    const title = document.createElement('h2');
    title.id = 'detail-title';
    title.textContent = entry.querySelector('strong').textContent;
    const body = entry.querySelector('template').content.cloneNode(true);
    const image = entry.querySelector('img')?.cloneNode();
    if (image) {
      image.loading = 'eager';
      body.querySelector('.detail-date').after(image);
    }
    content.replaceChildren(title, body);
  }

  function syncDetail() {
    const entry = entries.get(location.hash.slice(1));
    if (!entry) {
      if (detail.open) detail.close();
      return;
    }
    renderDetail(entry);
    if (!detail.open) detail.showModal();
  }

  function openEntry(event) {
    const link = event.target.closest('.entry-link, .feature');
    if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey
      || event.altKey || event.shiftKey || typeof detail.showModal !== 'function') return;
    const id = link.dataset.featureLink || link.closest('.entry').id;
    event.preventDefault();
    previousFocus = link;
    detailFromClick = true;
    history.pushState({ archiveDetail: true }, '', `#${id}`);
    syncDetail();
  }

  picks.addEventListener('click', (event) => {
    const button = event.target.closest('[data-feature]');
    if (!button || button.getAttribute('aria-pressed') === 'true') return;
    const entry = entries.get(button.dataset.feature);
    const image = feature.querySelector('img');
    image.removeAttribute('fetchpriority');
    image.src = entry.querySelector('img').src;
    feature.href = entry.querySelector('.entry-link').href;
    feature.dataset.featureLink = entry.id;
    feature.querySelector('strong').textContent = entry.querySelector('strong').textContent;
    const year = entry.closest('.year').querySelector('h2').textContent;
    feature.querySelector('.feature-meta').textContent = `${entry.querySelector('.entry-meta').textContent} · ${year}`;
    picks.querySelector('[aria-pressed="true"]').setAttribute('aria-pressed', 'false');
    button.setAttribute('aria-pressed', 'true');
  });

  detail.addEventListener('close', () => {
    if (entries.has(location.hash.slice(1))) {
      if (detailFromClick && history.state?.archiveDetail) history.back();
      else history.replaceState(null, '', location.pathname + location.search);
    }
    detailFromClick = false;
    previousFocus?.focus({ preventScroll: true });
    previousFocus = null;
  });

  query.addEventListener('input', updateFilters);
  source.addEventListener('change', updateFilters);
  kind.addEventListener('change', updateFilters);
  view.addEventListener('click', () => {
    setView(!timeline.classList.contains('compact'));
    storeFilters();
    currentYear();
  });
  reset.addEventListener('click', () => {
    query.value = source.value = kind.value = '';
    updateFilters();
    query.focus();
  });
  feature.addEventListener('click', openEntry);
  timeline.addEventListener('click', openEntry);
  window.addEventListener('hashchange', syncDetail);
  window.addEventListener('popstate', () => {
    readFilters();
    syncDetail();
  });
  window.addEventListener('scroll', () => {
    if (scrollFrame) return;
    scrollFrame = requestAnimationFrame(() => {
      scrollFrame = undefined;
      currentYear();
    });
  }, { passive: true });
  picks.hidden = false;
  timeline.querySelector('.controls').hidden = false;
  readFilters();
  if (typeof detail.showModal === 'function') syncDetail();
})();
