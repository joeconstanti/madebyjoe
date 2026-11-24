(() => {
  const clock = document.querySelector('.js-clock');
  const londonTime = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/London', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23',
  });
  function tick() { clock.textContent = londonTime.format(new Date()); }
  tick();
  setInterval(tick, 1000);

  const timeline = document.querySelector('.timeline');
  const byId = (id) => document.getElementById(id);
  const query = byId('query');
  const sort = byId('sort');
  const view = byId('view');
  const filters = byId('filters');
  const filterToggle = byId('filter-toggle');
  const chips = byId('filter-chips');
  const ranked = timeline.querySelector('.ranked-results');
  const rail = timeline.querySelector('.years');
  const detail = byId('work-detail');
  const content = detail.querySelector('.detail-content');
  const previous = byId('previous-project');
  const next = byId('next-project');
  const feature = document.querySelector('.feature');
  const picks = document.querySelector('.picks');
  const entries = new Map();
  const facets = new Map([
    ['discipline', { label: 'Discipline', options: new Map() }],
    ['type', { label: 'Work type', options: new Map() }],
    ['format', { label: 'Format', options: new Map() }],
    ['source', { label: 'Source', options: new Map(Object.entries({
      jg: 'joe.graphics', ftr: 'From the Root Studio', syn: 'Synthetic Labs',
      auto: 'Automate Digital', mbj: 'Made by Joe',
    })) }],
    ['year', { label: 'Year', options: new Map() }],
  ]);
  const searchAliases = [
    [/\b(?:dooh|ooh|(?:digital )?out[\s-]+of[\s-]+home|outdoor)\b/g, 'outdoor'],
    [/\b(?:cgi|3d|3-d|computer.generated imagery)\b/g, '3d'],
    [/\b(?:ai|artificial intelligence)\b/g, 'ai'],
    [/\b(?:hpto|homepage takeover)\b/g, 'hpto'],
    [/\b(?:xr|extended reality)\b/g, 'xr'],
  ];
  let visible = [];
  let previousFocus;
  let scrollFrame;

  function normalize(value) {
    let text = value.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '');
    for (const [pattern, word] of searchAliases) text = text.replace(pattern, word);
    return text.replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
  }

  const groups = Array.from(timeline.querySelectorAll('.year'), (section) => {
    const year = section.dataset.year;
    const grid = section.querySelector('.entries');
    const link = rail.querySelector(`[data-year="${year}"]`);
    const group = { section, grid, link, count: section.querySelector('.year-count') };
    group.records = Array.from(grid.querySelectorAll('.entry'), (entry) => {
      const { kind, alternateKind, sources, disciplines, format, subject = '', aliases = '', redirects = '' } = entry.dataset;
      const title = entry.querySelector('strong').textContent;
      const record = {
        entry, title, year, group, match: entry.querySelector('.entry-match'),
        values: { source: sources.split(' '), type: [kind, alternateKind].filter(Boolean), discipline: disciplines.split('|').filter(Boolean),
          format: [format], year: [year] },
        searchFields: [
          ['Title', normalize(title)],
          ['Client', normalize(subject)],
          ['Alternate title', normalize(aliases)],
          ['Discipline', normalize(disciplines)],
          ['Format', normalize(format)],
          ['Project details', normalize(
            entry.querySelector('template').content.textContent + ' ' +
            sources.split(' ').map((source) => facets.get('source').options.get(source)).join(' '),
          )],
        ],
      };
      for (const id of [entry.id, ...redirects.split(' ').filter(Boolean)]) entries.set(id, record);
      return record;
    });
    return group;
  });
  const records = groups.flatMap((group) => group.records);

  for (const [key, facet] of facets) {
    const fieldset = document.createElement('fieldset');
    const legend = document.createElement('legend');
    legend.textContent = facet.label;
    fieldset.append(legend);
    facet.inputs = new Map();
    let values = Array.from(new Set(records.flatMap((record) => record.values[key])));
    if (key !== 'year') values = values.sort((a, b) =>
      (facet.options.get(a) || a).localeCompare(facet.options.get(b) || b));
    for (const value of values) {
      const name = facet.options.get(value) || (value === 'undated' ? 'Undated' : value);
      const label = document.createElement('label');
      const input = document.createElement('input');
      const count = document.createElement('span');
      input.type = 'checkbox';
      input.value = value;
      count.className = 'facet-count';
      label.append(input, document.createTextNode(name), count);
      fieldset.append(label);
      facet.inputs.set(value, { input, label, count, name });
    }
    filters.querySelector('.facet-groups').append(fieldset);
  }

  const rangeFrom = byId('year-from');
  const rangeTo = byId('year-to');
  const years = Array.from(facets.get('year').inputs.keys()).filter((year) => year !== 'undated').sort();
  for (const year of years) {
    rangeFrom.add(new Option(year));
    rangeTo.add(new Option(year));
  }
  rangeTo.value = years.at(-1);

  // Keep a single silent player. Cards retain their still images until it is playing.
  const hoverMotion = matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)');
  const previewVideo = document.createElement('video');
  previewVideo.className = 'thumbnail-preview';
  previewVideo.muted = previewVideo.loop = previewVideo.playsInline = true;
  previewVideo.preload = 'none';
  previewVideo.setAttribute('aria-hidden', 'true');
  let activePreview;
  let hoverTimer;
  const previewVisibility = new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting && activePreview?.art === entry.target) stopPreview();
  });

  function stopPreview() {
    clearTimeout(hoverTimer);
    if (!activePreview) return;
    const { art, button, title } = activePreview;
    activePreview = undefined;
    previewVisibility.unobserve(art);
    art.classList.remove('is-previewing');
    button.textContent = 'Preview';
    button.setAttribute('aria-label', `Play motion preview for ${title()}`);
    previewVideo.pause();
    previewVideo.removeAttribute('src');
    previewVideo.load();
    previewVideo.remove();
  }

  function playPreview(preview, manual) {
    stopPreview();
    if (detail.open || document.hidden || !preview.art.getClientRects().length) return;
    const src = preview.source();
    if (!src) return;
    const playback = { ...preview, manual };
    activePreview = playback;
    preview.art.append(previewVideo);
    previewVisibility.observe(preview.art);
    previewVideo.src = src;
    preview.button.textContent = 'Stop preview';
    preview.button.setAttribute('aria-label', `Stop motion preview for ${preview.title()}`);
    previewVideo.play().then(() => {
      if (activePreview === playback) preview.art.classList.add('is-previewing');
    }).catch(() => {
      if (activePreview === playback) stopPreview();
    });
  }

  function addPreview(host, art, source, title) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'preview-button';
    button.textContent = 'Preview';
    button.setAttribute('aria-label', `Play motion preview for ${title()}`);
    host.append(button);
    const preview = { art, button, source, title };
    art.addEventListener('pointerenter', (event) => {
      if (event.pointerType !== 'mouse' || !hoverMotion.matches) return;
      clearTimeout(hoverTimer);
      hoverTimer = setTimeout(() => {
        if (!activePreview?.manual) playPreview(preview, false);
      }, 180);
    });
    host.addEventListener('pointerleave', () => {
      clearTimeout(hoverTimer);
      if (activePreview?.art === art && !activePreview.manual) stopPreview();
    });
    button.addEventListener('click', () => {
      if (activePreview?.art === art) stopPreview();
      else playPreview(preview, true);
    });
    return button;
  }

  for (const { entry, title } of records) {
    if (entry.dataset.motionSrc) addPreview(entry, entry.querySelector('.entry-art'), () => entry.dataset.motionSrc, () => title);
  }
  const featuredRecord = () => entries.get(feature.dataset.featureLink);
  const featuredPreview = addPreview(
    feature.closest('.spotlight'), feature,
    () => featuredRecord().entry.dataset.motionSrc,
    () => featuredRecord().title,
  );
  featuredPreview.hidden = !featuredRecord().entry.dataset.motionSrc;
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopPreview();
  });
  hoverMotion.addEventListener('change', () => {
    if (activePreview && !activePreview.manual) stopPreview();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') stopPreview();
  });

  function currentYear() {
    if (rail.hidden) return;
    const available = groups.filter(({ section }) => !section.hidden);
    const offset = matchMedia('(max-width: 650px)').matches ? rail.offsetHeight + 68 : 100;
    const current = available.findLast(({ section }) => section.getBoundingClientRect().top <= offset) || available[0];
    const last = rail.querySelector('[aria-current]');
    if (last === current?.link) return;
    last?.removeAttribute('aria-current');
    if (!current) return;
    current.link.setAttribute('aria-current', 'true');
    if (rail.scrollWidth > rail.clientWidth) {
      const bounds = rail.getBoundingClientRect();
      const link = current.link.getBoundingClientRect();
      if (link.left < bounds.left || link.right > bounds.right) {
        rail.scrollLeft += link.left - bounds.left;
      }
    }
  }

  function selectedFilters() {
    return new Map(Array.from(facets, ([key, { inputs }]) => [
      key, [...inputs].filter(([, { input }]) => input.checked).map(([value]) => value),
    ]));
  }

  function searchRecord(record, terms) {
    const reasons = new Set();
    let score = 0;
    for (const term of terms) {
      const index = record.searchFields.findIndex(([, field]) => field.includes(term));
      if (index === -1) return null;
      reasons.add(record.searchFields[index][0]);
      score += [12, 11, 7, 5, 4, 1][index];
    }
    if (terms.length && record.searchFields[0][1].includes(terms.join(' '))) score += 15;
    return { reasons: [...reasons], score };
  }

  function updateChips(selected) {
    chips.replaceChildren();
    for (const [key, values] of selected) {
      for (const value of values) {
        const { input, name } = facets.get(key).inputs.get(value);
        const chip = document.createElement('button');
        chip.type = 'button';
        chip.textContent = name;
        chip.setAttribute('aria-label', `Remove ${name} filter`);
        chip.addEventListener('click', () => {
          const index = [...chips.children].indexOf(chip);
          input.checked = false;
          updateFilters();
          (chips.children[index] || chips.lastElementChild || filterToggle).focus();
        });
        chips.append(chip);
      }
    }
    const count = chips.childElementCount;
    filterToggle.textContent = count ? `Filters (${count})` : 'Filters';
    timeline.querySelector('.active-filters').hidden = count === 0 && !query.value.trim();
  }

  function applyFilters() {
    stopPreview();
    const terms = normalize(query.value).split(' ').filter(Boolean);
    const bestMatch = terms.length > 0 && sort.value === 'relevance';
    const selected = selectedFilters();
    const matches = [];
    const tallies = new Map(Array.from(facets, ([key]) => [key, new Map()]));
    const yearCounts = new Map();
    for (const record of records) {
      const search = searchRecord(record, terms);
      const failed = [...selected].filter(([key, values]) =>
        values.length && !values.some((value) => record.values[key].includes(value))).map(([key]) => key);
      const shown = Boolean(search) && failed.length === 0;
      record.entry.hidden = !shown;
      record.match.hidden = !shown || !terms.length;
      if (shown) {
        matches.push({ record, score: search.score });
        yearCounts.set(record.year, (yearCounts.get(record.year) || 0) + 1);
        if (terms.length) record.match.textContent = `Matches ${search.reasons.join(', ').toLowerCase()}`;
      }
      if (!search) continue;
      for (const [key, tally] of tallies) {
        if (failed.some((filter) => filter !== key)) continue;
        for (const value of record.values[key]) tally.set(value, (tally.get(value) || 0) + 1);
      }
    }
    if (bestMatch) matches.sort((a, b) => b.score - a.score);
    visible = matches.map(({ record }) => record);
    if (bestMatch) ranked.replaceChildren(...visible.map(({ entry }) => entry));
    for (const group of groups) {
      const count = yearCounts.get(group.section.dataset.year) || 0;
      group.section.hidden = bestMatch || count === 0;
      group.link.hidden = count === 0;
      group.link.querySelector('.rail-count').textContent = count;
      const bar = group.link.querySelector('progress');
      bar.max = Math.max(1, ...yearCounts.values());
      bar.value = count;
      group.count.textContent = `${count} ${count === 1 ? 'project' : 'projects'}`;
      if (!bestMatch && group.records.some(({ entry }) => entry.parentElement !== group.grid)) {
        group.grid.append(...group.records.map(({ entry }) => entry));
      }
    }
    for (const [key, { inputs }] of facets) {
      for (const [value, option] of inputs) {
        const count = tallies.get(key).get(value) || 0;
        option.count.textContent = count;
        option.input.disabled = !option.input.checked && count === 0;
      }
    }
    const total = visible.length;
    timeline.querySelector('.empty').hidden = total > 0;
    rail.hidden = bestMatch || total === 0;
    ranked.hidden = !bestMatch;
    byId('sort-control').hidden = terms.length === 0;
    byId('results').textContent = `${total} ${total === 1 ? 'project' : 'projects'}`;
    updateChips(selected);
    currentYear();
  }

  function setView(compact) {
    stopPreview();
    timeline.classList.toggle('compact', compact);
    view.setAttribute('aria-pressed', String(compact));
  }

  function storeFilters() {
    const url = new URL(location.href);
    for (const [key, value] of [['q', query.value.trim()], ['sort', sort.value === 'timeline' ? 'timeline' : ''],
      ['view', timeline.classList.contains('compact') ? 'compact' : '']]) {
      if (value) url.searchParams.set(key, value);
      else url.searchParams.delete(key);
    }
    for (const [key, values] of selectedFilters()) {
      url.searchParams.delete(key);
      for (const value of values) url.searchParams.append(key, value);
    }
    history.replaceState(history.state, '', url);
  }

  function readFilters() {
    const params = new URLSearchParams(location.search);
    query.value = params.get('q') || '';
    sort.value = params.get('sort') === 'timeline' ? 'timeline' : 'relevance';
    for (const [key, { inputs }] of facets) {
      const values = params.getAll(key);
      for (const [value, { input }] of inputs) input.checked = values.includes(value);
    }
    setView(params.get('view') === 'compact');
    applyFilters();
  }

  function updateFilters() {
    applyFilters();
    storeFilters();
  }

  function renderDetail(record) {
    const title = document.createElement('h2');
    title.id = 'detail-title';
    title.tabIndex = -1;
    title.textContent = record.title;
    const body = record.entry.querySelector('template').content.cloneNode(true);
    const image = record.entry.querySelector('img')?.cloneNode();
    if (image) {
      image.loading = 'eager';
      body.querySelector('.detail-date').after(image);
    }
    content.replaceChildren(title, body);
    const index = visible.indexOf(record);
    previous.disabled = index <= 0;
    next.disabled = index < 0 || index === visible.length - 1;
    byId('detail-position').textContent = index < 0 ? 'Outside current results' : `${index + 1} of ${visible.length}`;
    detail.scrollTop = 0;
  }

  function syncDetail() {
    const record = entries.get(location.hash.slice(1));
    if (!record) {
      if (detail.open) detail.close();
      return;
    }
    stopPreview();
    renderDetail(record);
    if (!detail.open) detail.showModal();
  }

  function openEntry(event) {
    const link = event.target.closest('.entry-link, .feature');
    if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey
      || event.altKey || event.shiftKey || typeof detail.showModal !== 'function') return;
    const id = link.dataset.featureLink || link.closest('.entry').id;
    event.preventDefault();
    previousFocus = link;
    history.pushState({ archiveDetail: true }, '', `#${id}`);
    syncDetail();
  }

  function stepDetail(offset) {
    const index = visible.indexOf(entries.get(location.hash.slice(1)));
    const record = index >= 0 && visible[index + offset];
    if (!record) return;
    history.replaceState(history.state, '', `#${record.entry.id}`);
    renderDetail(record);
    byId('detail-title').focus({ preventScroll: true });
  }

  picks.addEventListener('click', (event) => {
    const button = event.target.closest('[data-feature]');
    if (!button || button.getAttribute('aria-pressed') === 'true') return;
    stopPreview();
    const record = entries.get(button.dataset.feature);
    feature.querySelector('img').src = record.entry.querySelector('img').src;
    feature.href = record.entry.querySelector('.entry-link').href;
    feature.dataset.featureLink = record.entry.id;
    featuredPreview.hidden = !record.entry.dataset.motionSrc;
    featuredPreview.setAttribute('aria-label', `Play motion preview for ${record.title}`);
    feature.querySelector('strong').textContent = record.title;
    const year = record.year === 'undated' ? 'Undated' : record.year;
    feature.querySelector('.feature-meta').textContent = `${record.entry.querySelector('.entry-meta').textContent} · ${year}`;
    picks.querySelector('[aria-pressed="true"]').setAttribute('aria-pressed', 'false');
    button.setAttribute('aria-pressed', 'true');
  });

  detail.addEventListener('close', () => {
    content.querySelectorAll('video').forEach((video) => video.pause());
    if (entries.has(location.hash.slice(1))) {
      if (previousFocus && history.state?.archiveDetail) history.back();
      else history.replaceState(null, '', location.pathname + location.search);
    }
    previousFocus?.focus({ preventScroll: true });
    previousFocus = null;
  });
  previous.addEventListener('click', () => stepDetail(-1));
  next.addEventListener('click', () => stepDetail(1));

  function clearFilters() {
    query.value = '';
    for (const { inputs } of facets.values()) {
      for (const { input } of inputs.values()) input.checked = false;
    }
    updateFilters();
    query.focus();
  }

  filterToggle.addEventListener('click', () => {
    filters.hidden = !filters.hidden;
    filterToggle.setAttribute('aria-expanded', String(!filters.hidden));
  });
  byId('apply-range').addEventListener('click', () => {
    const [from, to] = [rangeFrom.value, rangeTo.value].sort();
    rangeFrom.value = from;
    rangeTo.value = to;
    for (const year of years) facets.get('year').inputs.get(year).input.checked = year >= from && year <= to;
    updateFilters();
  });
  filters.addEventListener('change', (event) => {
    if (event.target.matches('input[type=checkbox]')) updateFilters();
  });
  query.addEventListener('input', updateFilters);
  sort.addEventListener('change', updateFilters);
  view.addEventListener('click', () => {
    setView(!timeline.classList.contains('compact'));
    storeFilters();
    currentYear();
  });
  byId('reset').addEventListener('click', clearFilters);
  byId('clear-empty').addEventListener('click', clearFilters);
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
