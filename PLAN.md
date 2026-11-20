# Portfolio release verification

## Scope and evidence

Keep madebyjoe.co a static portfolio for Joe and his five projects. Preserve the
current design, copy, routes, tracking, and FTP deployment model. Start from
GitHub main at `92c8da8425f0324ff3961c2ad885357fd8d1c5d9`. Keep the root
checkout's unpublished tooling and About edits outside this branch.

| Conversation reviewed | Evidence used | Decision |
| --- | --- | --- |
| Evolve madebyjoe, CI/CD | [PR #28](https://github.com/joeconstanti/madebyjoe/pull/28), [PR #29](https://github.com/joeconstanti/madebyjoe/pull/29), and [PR #30](https://github.com/joeconstanti/madebyjoe/pull/30) already cover canceled runs, social metadata, and partial video delivery. The handback identifies staged references, recovery assets, and browser smoke tests as gaps. | Cover those gaps without repeating merged work. |
| Evolve madebyjoe, five PRs | [Repository backlog](docs/evolve-2026-11-17.md) ranks browser automation, focus behavior, and media lifecycle. | Test current browser behavior. Escalate failures that need product decisions. |
| Evolve traffic and site outage | [PR #27](https://github.com/joeconstanti/madebyjoe/pull/27) restores the former share image. The thread distinguishes direct origin, CDN cache, and browser evidence. | Preserve the redirect and document how to distinguish these failure modes. |
| About portrait and PageSpeed | The portrait layout and hero-only dither were deliberate product choices. | Test the current site without revising the layout or motion. |
| Figma brand kit and social work | These threads produced Figma design assets and prototypes. | Keep Figma work and new journal routes out of this release. |

## Work packets

Each owner is a separate GPT-6.2-Sol agent with high reasoning effort. Each
packet can be implemented from the same base. Integration owns shared files.

| Owner | Task and exclusive write scope | Dependencies | Acceptance criteria |
| --- | --- | --- | --- |
| Agent 1 | Add staged artifact input to the existing validator. Own `scripts/validate-site.py` only. | Existing stager layout. | Default command still validates the checkout. `--root DIR` validates the staged tree, rejects missing local sources and references that resolve outside it, and returns a nonzero status with a useful path. |
| Agent 2 | Add recovery-page reference validation in `scripts/validate-recovery.py` and focused fixtures in `scripts/test-recovery.py`. | Staged artifact root passed as `--root DIR`. The Apache checker retains status verification. | Current recovery page passes. Missing assets, references that only work relative to the error document at the root, and a missing home link fail. Preserve the page itself. |
| Agent 3 | Add browser navigation and contact assertions in `scripts/browser/interactions.mjs` (export `checkInteractions(browser, baseURL)`). | Parent smoke runner supplies Playwright browser and URL. | Verify keyboard access to the index and contact, with navigation reaching the intended target, plus email link behavior when clipboard access fails. Match existing behavior and surface regressions. |
| Agent 4 | Add browser media assertions in `scripts/browser/media.mjs` (export `checkMedia(browser, baseURL)`). | Same runner interface as Agent 3. | Check desktop and mobile hero playback and canvas readiness before interaction, plus all five chapter media on scroll and a reduced motion run. Use bounded waits and report failures with the mode and element. |
| Agent 5 | Write `docs/release-verification.md`, a release and recovery runbook. | Existing README and check scripts. Parent links the final commands from README. | Explain validation, FTP, direct Apache and CDN checks, safe retry criteria, missing page status, range requests, and when to call a failure unresolved. Use no account data. |
| Integration owner | Own this plan, `README.md`, browser runner and package metadata, staged-root regression fixture, and both workflow files. | Agents 1–5. | Review each patch and repeat focused checks on the combined branch. Validate the exact staged directory before Apache tests and FTP upload. Document and run browser checks locally. Open one PR with evidence and gaps. |

## Integration checks

- Run inline source sync, static validation, regression scripts, and JS
  syntax checks. Run workflow lint and diff whitespace checks.
- Stage a fresh artifact and run its validators. Remove a referenced asset
  from a temporary copy and confirm rejection.
- Run the Apache checker against the staged artifact if Apache is available
  locally. PR CI repeats it with the repo's Apache configuration.
- Run the browser smoke checks with Chromium. Capture useful failure evidence.
  Real iOS and Android autoplay remain outside the emulator proof.
- Confirm the PR base, head and check state. A branch push or PR check does not
  establish a production deployment.

## Risks and open questions

- Browser playback depends on codecs, autoplay policy and WebGL. Use a known
  browser build and report the environment. Keep the smoke suite local unless
  there is evidence it is stable enough for hosted CI.
- A recovery document can render at a nested missing URL. Use root-relative
  assets and verify the real HTTP status separately. Hosting behavior can vary
  between Apache and the CDN.
- The October rebuild checklist described an earlier launch. Git history
  retains it. This plan tracks the present release checks.
- Defer new routes, search campaigns, visible motion changes, arbitrary
  private-file filtering policy, and production changes to separate decisions.
