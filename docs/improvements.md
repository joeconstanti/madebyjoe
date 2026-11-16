# Repository improvement research — 16 November 2026

Compared with [HTML5 Boilerplate's Apache configuration](https://github.com/h5bp/server-configs-apache), [Hitesh's no-build portfolio](https://github.com/hiteshwired/PortfolioWebsite), and [Halide](https://github.com/danurbanowicz/halide). These are architectural references, not evidence that their implementation should be copied wholesale. Ranking favors demonstrated repository risks and preserves the current presentation and analytics.

| Rank | Improvement | Repository evidence / reason |
| --- | --- | --- |
| 1 | Block repository internals at Apache and FTP | Docs, tooling and archived pages were publicly reachable during the prior investigation. |
| 2 | Stage only public files for deployment, including cPanel | Legacy cPanel copies the entire checkout, including agent configuration. |
| 3 | Revalidate mutable asset URLs | All CSS, JS and images currently receive year-long immutable caching without content hashes. |
| 4 | Correct MIME mappings | WOFF mappings are duplicated with conflicting types; MP4 and WebP lack explicit mappings. |
| 5 | Check generated HTML without writing | Inline sources can drift; generator silently skips missing markers. |
| 6 | Validate local references and structured data | No repeatable check for missing assets, fragments or invalid JSON-LD. |
| 7 | Exercise Apache behavior automatically | Python preview cannot test redirects, headers or private-path denial. |
| 8 | Run validation on pull requests | Existing workflow only deploys main. |
| 9 | Serialize and validate production releases | FTP deployments can overlap and currently upload without checks. |
| 10 | Replace obsolete contributor documentation | README describes a previous typewriter design and claims a license without a license file. |
| 11 | Add browser acceptance automation | Documented autoplay, contact and motion requirements need repeatable browser coverage. |
| 12 | Capture Lighthouse baselines in CI | Existing performance claims are historical; avoid treating them as current results. |
| 13 | Use content-hashed media URLs | Enables safe immutable caching after the revalidation correction. |
| 14 | Measure responsive image opportunities | Halide demonstrates generated responsive images; assess actual viewport savings before adding a build. |
| 15 | Audit vendor versions and notices | Vendored animation libraries need a recorded update and license process. |
| 16 | Pin third-party Actions to reviewed commit SHAs | Reduces tag mutation risk; add an update process at the same time. |
| 17 | Add Dependabot for Actions | Keep workflow dependencies maintained without adding frontend dependencies. |
| 18 | Verify HTTPS enforcement at the origin | Existing rules canonicalize www but do not explicitly enforce HTTPS for the bare host. Check proxy behavior first. |
| 19 | Simplify duplicate slash rewrite rules | Same non-directory redirect appears twice. Cover behavior before cleanup. |
| 20 | Audit security headers against actual browser behavior | Review obsolete X-XSS-Protection and CSP without breaking analytics workers. |
| 21 | Provide a deliberate error page | Missing URLs currently have no branded recovery path. Needs copy/design review. |
| 22 | Document analytics acceptance | Transport success and dashboard attribution require separate evidence. |
| 23 | Test keyboard and no-JavaScript operation | Comparable static portfolios emphasize semantic HTML and progressive enhancement. |
| 24 | Measure background motion power use | Verify offscreen/hidden-tab lifecycle before changing rendering behavior. |
| 25 | Add deployment rollback instructions | Record known-good commit redeployment and FTP state considerations. |

Top ten are implementation priorities for this request. Remaining items are follow-ups, not claims of confirmed defects or authorization to redesign the site.
