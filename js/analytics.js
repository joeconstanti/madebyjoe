(() => {
  if (location.hostname !== 'madebyjoe.co') return;

  const measurementId = 'G-MEYN9YX3MM';
  const url = new URL(location.href);
  const choice = url.searchParams.get('mbj_staff');
  let staff = choice === '1';
  try {
    if (choice === '1') localStorage.setItem('mbj_staff', '1');
    if (choice === '0') localStorage.removeItem('mbj_staff');
    staff = localStorage.getItem('mbj_staff') === '1';
  } catch (_) {
    // Keep the explicit choice for this view if storage is unavailable.
  }
  if (choice === '1' || choice === '0') {
    url.searchParams.delete('mbj_staff');
    history.replaceState(history.state, '', url.pathname + url.search + url.hash);
  }

  const tag = document.createElement('script');
  tag.src = 'https://www.googletagmanager.com/gtag/js?id=' + measurementId;
  const config = staff ? { traffic_type: 'internal' } : {};
  if (document.currentScript.hasAttribute('data-partytown')) {
    tag.type = 'text/partytown';
    const init = document.createElement('script');
    init.type = tag.type;
    init.textContent = `window.dataLayer = window.dataLayer || [];
      window.gtag = function () { window.dataLayer.push(arguments); };
      gtag('js', new Date());
      gtag('config', '${measurementId}', ${JSON.stringify(config)});`;
    document.head.append(tag, init);
    return;
  }

  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { window.dataLayer.push(arguments); };
  window.gtag('js', new Date());
  window.gtag('config', measurementId, config);
  tag.async = true;
  document.head.append(tag);

  document.addEventListener('click', (event) => {
    const link = event.target.closest('a[href]');
    if (!link || !/^https?:$/.test(link.protocol)) return;
    const project = link.closest('article.entry[id], [data-project]');
    const details = { link_domain: link.hostname, link_url: link.href };
    const projectId = link.dataset.featureLink || (project && (project.id || project.dataset.project));
    if (projectId && (link.matches('.entry-link, [data-feature-link], [data-project-link]') || link.closest('.detail-links'))) {
      window.gtag('event', 'project_click', { ...details, section_id: projectId });
    } else if (link.hasAttribute('download') && link.closest('.resource-content')) {
      window.gtag('event', 'resource_download', details);
    } else if (link.hasAttribute('data-workshop-material')) {
      window.gtag('event', 'workshop_material_click', details);
    }
  });
})();
