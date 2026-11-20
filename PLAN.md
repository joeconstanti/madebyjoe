# Portfolio improvement and release verification plan

Updated: 20 November 2026

## Scope

Made by Joe is a static, single-page portfolio at `madebyjoe.co`. Keep the
current design, copy, project links, routes, analytics IDs, motion behavior, and
FTP deployment model. Do not add new project pages until Joe supplies distinct
source material and Search Console provides enough evidence to guide the work.
Keep deployment public-only. A green upload does not prove the live site.

## Conversation evidence

| Conversation | Evidence | Decision |
| --- | --- | --- |
| Evolve madebyjoe, CI/CD | PRs [#28](https://github.com/joeconstanti/madebyjoe/pull/28)–[#30](https://github.com/joeconstanti/madebyjoe/pull/30) cover canceled runs, social metadata, and partial video delivery. Later release work identified staged references, recovery assets, and browser smoke checks as gaps. | Add validation and browser coverage without repeating merged work. |
| Evolve madebyjoe, five PRs | `docs/evolve-2026-11-17.md` ranks browser automation, keyboard focus, and media lifecycle. | Test existing browser behavior. Keep product changes out of these checks. |
| Evolve traffic and site outage | [PR #27](https://github.com/joeconstanti/madebyjoe/pull/27) restores the old share image. The T3 thread separates direct-origin, CDN cache, and browser evidence. | Preserve the redirect and report each proof level separately. |
| About portrait and PageSpeed | The portrait layout and hero-only dither were deliberate choices. | Check the current page without changing layout or motion. |
| Figma brand kit and social work | The threads produced brand assets and prototypes. | Keep Figma work and new routes out of this release. |
| Grow Website Traffic | Search Console showed a small sample with one indexed page. Existing links were checked across the project sites. | Do not rewrite copy or add pages without distinct content and stronger demand evidence. |
| Improve Desktop and Mobile PageSpeed | The autoplay, poster, marquee, and immediate hero-renderer issues were fixed and verified. | Do not reopen those fixes in this release. |
| madebyjoe: research 25 improvements | The ten repository hardening PRs completed staging, cache, generation, validation, and deployment work. | Reuse existing source and Apache checks. |

## Completed release verification work from PR #38

PR #38 merged a staged-artifact validator, recovery-page checks, Chromium smoke
checks, and a release runbook. This work remains part of the release baseline.

| Owner | Delivered task | Acceptance evidence |
| --- | --- | --- |
| Agent 1 | Added staged artifact input to `scripts/validate-site.py`. | Default validation still checks the checkout. `--root DIR` checks the staged tree and rejects missing or out-of-root local references. |
| Agent 2 | Added `scripts/validate-recovery.py` and `scripts/test-recovery.py`. | The recovery page checks required links and assets. Tests cover missing assets and incorrect links. Apache checks verify the actual HTTP 404 status. |
| Agent 3 | Added browser keyboard and contact assertions in `scripts/browser/interactions.mjs`. | Chromium checks index navigation, keyboard access, and the email-link fallback when clipboard access fails. |
| Agent 4 | Added browser media assertions in `scripts/browser/media.mjs`. | Chromium checks desktop/mobile hero playback, canvas readiness, five chapter videos, and reduced-motion behavior. |
| Agent 5 | Added `docs/release-verification.md`. | The runbook explains validation, FTP, origin/CDN checks, safe retries, missing-page status, range requests, and failure reporting. |

## Current maintenance work from PR #39

| ID | Owner | Task and acceptance criteria | Depends on | Status and risk |
| --- | --- | --- | --- | --- |
| P1 | Agent 1 | Verify the existing Dependabot configuration checks GitHub Actions from the repository root (`directory: /`) once per week with a bounded open-PR limit. Confirm workflow Actions use full commit SHAs. | None | Complete. Existing config meets the criteria. A maintainer must review and merge proposed updates. |
| P2 | Agent 2 | Add `docs/vendor-maintenance.md` with checked-in version and notice evidence for GSAP, Lenis, and Partytown. Mark unsupported facts as unknown. | None | Complete. Lenis terms and the exact GSAP terms remain unverified; no vendor code changed. |
| P3 | Agent 3 | Add `scripts/test-progressive-enhancement.py` using Python's standard library. Check the page title, primary navigation, five index and project links, chapter posters, and a recipient-bearing `mailto:` link. Include a failing fixture. | None | Complete. The real page passes; a missing chapter poster fails clearly. This source check does not prove rendered behavior. |
| P4 | Agent 4 | Run the P3 check and `scripts/test-recovery.py` in `.github/workflows/validate.yml`. Preserve staged-root validation, Apache checks, and pinned Actions. | P3 and PR #38 validation baseline | Complete. Both test commands pass locally and remain in the same validation step. Hosted Apache validation is pending. |
| P5 | Agent 5 | Add `docs/analytics-acceptance.md` and link it from `README.md`. Separate collector transport, GA4 event visibility, staff filtering, and dashboard attribution. Preserve tracking IDs and account privacy. | None | Complete. Live GA4 requests and dashboard attribution were not checked. |

## Release checks

- Run generated HTML sync, site validation, all Python regression scripts, and
  JavaScript syntax checks.
- Stage a fresh public artifact. Run site and recovery validators against that
  exact directory. Use temporary fixtures to confirm invalid references fail.
- Run the Chromium smoke suite against the local development server. It blocks
  external DNS to prevent local analytics traffic. Real-device autoplay still
  needs physical device evidence.
- Run `actionlint` and `git diff --check`.
- PR CI runs source and failure-path checks, staged-artifact checks, and the
  Apache integration check. After merge, inspect both validation and FTP deploy
  Actions, then check the affected public paths and behavior.

## Deferred work and risks

- **Production 404 recovery:** `/404.html` and the repository's Apache test work,
  but a T3 investigation found production returned a bare 404. A repository-only
  investigation found no supported fix. Further work needs read-only access to
  the effective HTTPS virtual host, applicable overrides, and matching logs.
  Do not add a blanket redirect or soft 404.
- **Old share-image cache:** T3 verified the exact `/OG.jpg` redirect at origin
  and both hosts with a query string. A cached public request without a query
  string still returned an old 404 at that time. Recheck after cache expiry.
- **Search landing pages:** the reviewed Search Console sample was eight
  impressions, zero clicks, and one indexed page. It does not support copy
  changes. Revisit pages only with distinct project material and stronger demand.
- **Lighthouse CI:** browser smoke coverage now exists, but performance scores
  vary by run. Add automated Lighthouse thresholds only after a stable,
  low-noise approach is selected.
- **Browser limits:** codecs, autoplay policy, and WebGL can vary by browser.
  The local Chromium smoke suite does not prove iOS or Android autoplay.

## Completion record

- [x] PR #38 release checks and runbook are retained in this plan.
- [x] P1–P5 documentation, source check, and workflow change are implemented.
- [x] Initial local source suite and focused negative fixtures passed.
- [x] Rerun the complete combined suite after merging current `main`: 34 Python tests, staged-root checks, JavaScript syntax, `actionlint`, diff checks, and Chromium keyboard/contact/media smoke tests passed.
- [ ] Confirm the updated PR validation passes, then merge.
- [ ] Verify post-merge validation and FTP deployment Actions and public behavior.
