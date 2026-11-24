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
      const { kind, alternateKind, sources, disciplines, format, subject = '', aliases = '' } = entry.dataset;
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
      entries.set(entry.id, record);
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

  // Short, silent previews loop while visible.
  const allowMotion = matchMedia('(prefers-reduced-motion: no-preference)');
  const previewSources = new Map([[feature, () => entries.get(feature.dataset.featureLink).entry.dataset.motionSrc]]);
  for (const { entry } of records) {
    if (entry.dataset.motionSrc) {
      previewSources.set(entry.querySelector('.entry-art'), () => entry.dataset.motionSrc);
    }
  }
  const visiblePreviews = new Set();
  const previews = new Map();

  function stopPreview(art) {
    const video = previews.get(art);
    if (!video) return;
    art.classList.remove('is-previewing');
    video.pause();
    video.removeAttribute('src');
    video.load();
    video.remove();
    previews.delete(art);
  }

  function syncPreviews() {
    const enabled = allowMotion.matches && !document.hidden;
    for (const [art, source] of previewSources) {
      if (!enabled || !visiblePreviews.has(art) || !art.getClientRects().length) {
        stopPreview(art);
        continue;
      }
      const src = source();
      if (!src || previews.has(art)) continue;
      const video = document.createElement('video');
      video.className = 'thumbnail-preview';
      video.defaultMuted = video.muted = video.playsInline = true;
      video.loop = true;
      video.setAttribute('aria-hidden', 'true');
      video.src = src;
      previews.set(art, video);
      art.append(video);
      video.play().then(() => {
        if (previews.get(art) === video) art.classList.add('is-previewing');
      }).catch(() => {});
    }
  }

  const previewObserver = new IntersectionObserver((changes) => {
    for (const { target, intersectionRatio } of changes) {
      if (intersectionRatio >= .35) visiblePreviews.add(target);
      else visiblePreviews.delete(target);
    }
    syncPreviews();
  }, { threshold: .35 });
  for (const art of previewSources.keys()) previewObserver.observe(art);
  allowMotion.addEventListener('change', syncPreviews);
  document.addEventListener('visibilitychange', syncPreviews);

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
    if (bestMatch) ranked.replaceChildren(...matches.map(({ record }) => record.entry));
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
    const total = matches.length;
    timeline.querySelector('.empty').hidden = total > 0;
    rail.hidden = bestMatch || total === 0;
    ranked.hidden = !bestMatch;
    byId('sort-control').hidden = terms.length === 0;
    byId('results').textContent = `${total} ${total === 1 ? 'project' : 'projects'}`;
    updateChips(selected);
    currentYear();
    syncPreviews();
  }

  function setView(compact) {
    timeline.classList.toggle('compact', compact);
    view.setAttribute('aria-pressed', String(compact));
    syncPreviews();
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

  picks.addEventListener('click', (event) => {
    const button = event.target.closest('[data-feature]');
    if (!button || button.getAttribute('aria-pressed') === 'true') return;
    stopPreview(feature);
    const record = entries.get(button.dataset.feature);
    feature.querySelector('img').src = record.entry.querySelector('img').src;
    feature.href = record.entry.querySelector('.entry-link').href;
    feature.dataset.featureLink = record.entry.id;
    syncPreviews();
    feature.querySelector('strong').textContent = record.title;
    const year = record.year === 'undated' ? 'Undated' : record.year;
    feature.querySelector('.feature-meta').textContent = `${record.entry.querySelector('.entry-meta').textContent} · ${year}`;
    picks.querySelector('[aria-pressed="true"]').setAttribute('aria-pressed', 'false');
    button.setAttribute('aria-pressed', 'true');
  });

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
  window.addEventListener('popstate', readFilters);
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

  if ('IntersectionObserver' in window && matchMedia('(prefers-reduced-motion: no-preference)').matches) {
    const segmenter = typeof Intl.Segmenter === 'function' ? new Intl.Segmenter() : null;
    function prepareTitle(title) {
      const text = title.textContent;
      const accessible = document.createElement('span');
      accessible.className = 'sr-only';
      accessible.textContent = text;
      const visual = document.createElement('span');
      visual.className = 'typing-title';
      visual.setAttribute('aria-hidden', 'true');
      const characters = segmenter
        ? Array.from(segmenter.segment(text), ({ segment }) => segment)
        : Array.from(text);
      const interval = Math.min(48, 850 / characters.length);
      characters.forEach((character, index) => {
        const letter = document.createElement('span');
        letter.textContent = character;
        letter.style.setProperty('--letter-delay', `${index * interval}ms`);
        visual.append(letter);
      });
      title.replaceChildren(accessible, visual);
      return () => { title.textContent = text; };
    }

    const reveal = new IntersectionObserver((entries, observer) => {
      const entering = entries.filter((entry) => entry.isIntersecting);
      if (!entering.length) return;

      const restoreTitles = [];
      entering.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top
        || a.boundingClientRect.left - b.boundingClientRect.left);
      entering.forEach(({ target }, index) => {
        observer.unobserve(target);
        const title = target.querySelector('.entry-info strong');
        if (title) restoreTitles.push(prepareTitle(title));
        target.style.setProperty('--reveal-delay', `${Math.min(index, 4) * 95}ms`);
        target.classList.add('is-entering');
      });
      window.setTimeout(() => {
        for (const restore of restoreTitles) restore();
        for (const { target } of entering) {
          target.classList.remove('is-entering');
          target.style.removeProperty('--reveal-delay');
        }
      }, 1450);
    }, { rootMargin: '0px 0px -16px' });

    for (const target of timeline.querySelectorAll('.timeline-heading, .year-heading, .entry, .years a')) {
      reveal.observe(target);
    }
  }
})();
