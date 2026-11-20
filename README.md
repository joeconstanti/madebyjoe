# Made by Joe

Static portfolio at [madebyjoe.co](https://madebyjoe.co/), built with semantic HTML,
CSS and vanilla JavaScript. Five project chapters, hero video and a WebGL dither
renderer are enhanced with locally vendored GSAP and Lenis. Contact links work
independently of the optional animation bundle.

## Develop

Requires Python 3.9+ and Node.js 22. No package install or frontend framework is
needed for normal editing.

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

Open `http://localhost:8000/`. Python does not apply Apache `.htaccess`, so it does
not prove production headers, redirects or access restrictions.

Edit `css/main.css`, `js/hero-gl.js` and `js/enhance.js` as source files, then run:

```sh
node scripts/sync-styles.mjs
```

This embeds first-view CSS, font subsets, the hero renderer, analytics bootstrap
and enhancement script in `index.html`. Edit other page markup directly. After
copy changes, run `python3 scripts/subset-fonts.py` (requires fonttools and brotli),
then sync again. Keep original fonts as subset sources.

## Validate

```sh
node scripts/sync-styles.mjs --check
python3 scripts/validate-site.py
python3 scripts/test-validation.py
python3 scripts/test-generation.py
python3 scripts/test-server.py
for file in js/*.js scripts/*.mjs; do node --check "$file"; done
```

The generation check is read-only. The static validator covers local HTML/CSS
assets, local fragments, duplicate IDs, JSON-LD syntax, sitemap discovery and
the homepage share URL and image. It does not check external links, visual
layout or analytics attribution.

GitHub Actions schedules complete validation for every PR head and main push.
A new run for the same PR cancels superseded validation still queued or running.
Other PRs, main pushes and events without a PR number keep independent runs.

Against a real Apache origin configured to serve this checkout with AllowOverride:

```sh
python3 scripts/check-server.py http://127.0.0.1:8088
```

This tests MIME/cache and security headers, partial MP4 delivery, the isolated
analytics-worker CSP exception, internal path denial and canonical redirects. Host overrides
are intended for direct-origin testing; a CDN may route them differently.
The Apache check also fetches the recovery page as a real GET to assert the
404 status and homepage link. Run `python3 scripts/test-server.py` locally
when changing HTTP checks or their fixtures.

Browser acceptance after runtime or media changes:

- Test desktop and mobile with no prior click, touch or scroll. Hero video should
  advance automatically and the WebGL canvas should become ready.
- Scroll all five chapter media blocks into view. Verify advancing video frames,
  decoded posters and no reveal masks.
- Repeat with reduced motion: videos and marquee still autoplay as deliberately
  configured, while scroll effects remain disabled. Browser policy may require a
  trusted gesture before playback.
- Test keyboard navigation and contact copy, including email-link fallback when
  clipboard access is unavailable.
- Check console errors and GA4 page-view transport. A successful request does not
  establish dashboard attribution. Preserve tracking IDs and worker CSP behavior.
  See [GA4 acceptance checks](docs/analytics-acceptance.md).

Use Lighthouse against local and deployed URLs when measuring performance; record
conditions and dates. Historical local scores do not establish current live scores.

## Deploy and recover

Merging to `main` triggers `.github/workflows/deploy.yml`. It validates sources,
stages an explicit public-only directory and uploads that directory with FTP.
Production uploads are serialized and are not canceled mid-transfer. The workflow
uses repository FTP secrets; never place credentials in source or logs.

Public files are `.htaccess`, `index.html`, `404.html`, `robots.txt`, `sitemap.xml`, and the
`css`, `fonts`, `img`, `js`, and `media` directories. The FTP workflow also includes
`clients/audits/sported.html` and its explicitly listed PNG and Lighthouse metric
extracts. Agent folders, docs, scripts,
archives and Git data must not be uploaded. `.cpanel.yml` uses the same public
paths but is a legacy manual deployment route. Neither route guarantees removal
of files uploaded by older tooling; Apache blocks the known internal paths.

To inspect an upload artifact without deploying:

```sh
python3 scripts/stage-public.py /tmp/madebyjoe-public-review
```

Choose a new path outside the checkout. Public inputs must be regular files and
directories; staging rejects symbolic links before creating the upload directory. For rollback, revert the faulty change on
`main` through a reviewed PR and let the same deployment workflow publish it.
Check the Action conclusion, public homepage, headers and affected interactions.
A green upload alone does not prove the live page. Asset URLs revalidate; older
immutable responses cached before this policy may require expiration or clearing.

## Agent editing

Read `AGENTS.md`. Impeccable live mode is local-only; stop it and remove its
injection before committing. Do not commit downloaded engine binaries or unrelated
agent setup. Preserve the existing design, copy, URLs and analytics unless the
request explicitly changes them.

## Research backlog

[25 ranked repository improvements](docs/improvements.md) records comparison
sources, repository evidence and follow-up opportunities. Third-party vendored
code retains its own license notices. This repository does not currently contain
a root license file; do not infer an MIT grant from historical README badges.

## Workflow dependencies

Actions are pinned to full upstream commit SHAs, with the reviewed version in a
comment. Dependabot proposes weekly updates for review; it does not merge them.
For each update, verify the upstream repository and release commit, review its
changes and run PR validation before merging. FTP Action updates also require
checking the merge-triggered deployment result. Preserve least-privilege workflow
permissions and keep FTP secrets restricted to deployment.
