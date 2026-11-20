# Portfolio Improvement Plan

Updated: 20 November 2026

## Product scope

Made by Joe is a static, single-page portfolio at `madebyjoe.co`. Keep its current
visual design, copy, project links, analytics IDs, and motion behavior. Do not add
new project pages until Joe supplies distinct source material and Search Console
shows enough demand to guide the work. Keep deployment public-only and verify the
live result after a release.

The plan selects five small repository improvements from the project improvement
backlog. It does not reopen work that has already merged, including source and
Apache validation, public-only FTP staging, canonical checks, metadata and social
preview fixes, renderer access, media autoplay, and the verified `/OG.jpg`
redirect.

## Tasks

| ID | Owner | Task and acceptance criteria | Depends on | Risk or open question |
| --- | --- | --- | --- | --- |
| P1 | Agent 1 | Verify the existing Dependabot configuration checks GitHub Actions from the repository root (`directory: /`) once per week with a bounded open-PR limit. Confirm every current workflow Action remains pinned to a reviewed commit SHA. No configuration change is needed. **Complete:** config and all five Action refs were checked; `actionlint` and focused YAML validation passed. | None | Dependabot can propose routine updates. A maintainer must review and merge them. GitHub-side execution remains unverified. |
| P2 | Agent 2 | Add `docs/vendor-maintenance.md`. Inventory the locally used GSAP modules, Lenis, and Partytown. Record versions and license evidence only when the checked-in files support it. Explain how to review upstream updates and preserve required notices. **Complete:** version and notice claims cite checked-in evidence; unknown license terms are identified. | None | Some vendor files do not expose a version or license. These remain marked unknown; vendor code was not changed. |
| P3 | Agent 3 | Add `scripts/test-progressive-enhancement.py` using Python's standard library. It must check that the unexecuted HTML contains the page title, primary navigation links, five project links, five chapter video posters, and a working `mailto:` link. It must fail with a clear message when one required element is removed. **Complete:** the homepage passes and a temporary missing-poster fixture fails with a clear error. | None | This is a source-level check. It does not prove visual or browser behavior without JavaScript. |
| P4 | Agent 4 | Run the P3 check in `.github/workflows/validate.yml` on pull requests and pushes to `main`. Keep it in the existing validation job and preserve the Apache checks. Confirm the workflow fails when P3's required markup is missing. **Complete:** one command was added to the existing validation step; a temporary missing-title fixture failed as expected. | P3 | No network browser package or new frontend dependency was added. Hosted Actions remains to be confirmed. |
| P5 | Agent 5 | Add `docs/analytics-acceptance.md` and link it from `README.md`. Describe how to check GA4 request transport, the page-view event, and dashboard attribution as separate observations. Preserve existing tracking IDs and avoid recording account secrets. **Complete:** source and guide are linked; the procedure separates transport, GA4 event visibility, staff filtering, and attribution. | None | Live GA4 requests and property reports were not checked. Analytics dashboards can delay or filter events. |

## Deferred work

- **Production 404 recovery:** `/404.html` is present and works in hosted Apache validation, but production requests still returned a bare 404 in the reviewed T3 thread. A repository-only review found no supported fix. Continue only after read-only access to the effective HTTPS virtual host, applicable overrides, and matching access/error logs. Do not add a blanket redirect or soft 404.
- **Old share-image cache:** T3 verified the exact `/OG.jpg` redirect at the origin and on both hosts with a query string. A cached public request without a query string still returned an old 404 at that time. Recheck after cache expiry before closing this follow-up.
- **More search landing pages:** the reviewed Search Console sample was eight impressions, zero clicks, and one indexed page. It does not support query-driven copy changes. Revisit only with distinct project material and a stronger demand signal.
- **Browser and Lighthouse automation:** the site has documented browser acceptance steps and a previously measured mobile Lighthouse score of 95. Scores vary by run. Keep a browser or Lighthouse CI setup out of this change until a stable, low-noise approach is selected.

## Evidence reviewed

- T3 Code thread [“madebyjoe: research 25 improvements, ship top 10 PRs”](t3-thread://v2/7be29275-49a0-47f8-b6cd-0ddb476aa5c7/mcp:launch:9012909971ef741bc670fc53beb1c21d55df07c120e13594d15f1a8c297f8ce2) records the completed deployment, cache, generation, validation, and documentation work.
- T3 Code thread [“Evolve traffic: madebyjoe — 5 PRs”](t3-thread://v2/7be29275-49a0-47f8-b6cd-0ddb476aa5c7/mcp:launch:1752174c75b3eb68fed061210d9fa3284517abddbee8c78a8962bb3587a68539) records the completed rendering-library access, profile schema, social preview, canonical validation, and recovery-page work. It also records the production 404 limitation and the `/OG.jpg` redirect follow-up.
- T3 Code thread [“Grow Website Traffic”](t3-thread://v2/7be29275-49a0-47f8-b6cd-0ddb476aa5c7/cd3c10a9-61d6-402b-b7e0-bb252507121c) records the Search Console sample, crawler exclusions, profile links, and the need for distinct project content before adding pages.
- T3 Code thread [“Improve Desktop and Mobile PageSpeed”](t3-thread://v2/7be29275-49a0-47f8-b6cd-0ddb476aa5c7/3919774c-dbe7-4882-a6ad-7665dde8c49f) records the autoplay, poster, marquee, and immediate hero-renderer fixes.
- `docs/improvements.md` records the ranked follow-up candidates used for P1–P5.

## Completion evidence

- [x] P1–P5 are complete locally and their focused acceptance checks pass.
- [x] Run the source generation check, site validator, Python regression scripts, and JavaScript syntax checks from `README.md`.
- [ ] Confirm the pull request validation job passes. Do not deploy from this branch.
- [x] Report deferred items and their required evidence in the pull request.
