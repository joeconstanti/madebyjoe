# Vendor maintenance

The site serves browser libraries from `js/vendor/`. This inventory records the
evidence in the checked-in files. The exact upstream download and its checksum
are unverified for each bundle.

| Library | Version evidence | License and notice evidence |
| --- | --- | --- |
| GSAP core, ScrollTrigger and SplitText | The headers in [gsap.min.js](../js/vendor/gsap.min.js), [ScrollTrigger.min.js](../js/vendor/ScrollTrigger.min.js) and [SplitText.min.js](../js/vendor/SplitText.min.js) each say `3.13.0`. | All three headers say `Copyright 2025, GreenSock. All rights reserved.` and point to `https://gsap.com/standard-license`. The files carry the notices and a link to the terms. A copy of the full terms for this release is unverified. |
| Lenis | [lenis.min.js](../js/vendor/lenis.min.js) sets `window.lenisVersion="1.3.4"`. | Unknown. The bundle has no license banner and the checkout has no Lenis license file. |
| Partytown | The four JavaScript files and the inline script in the sandbox HTML under [partytown-1.0.2](../js/vendor/partytown-1.0.2/) say `Partytown 1.0.2 - MIT QwikDev`. | The included [LICENSE](../js/vendor/partytown-1.0.2/LICENSE) contains the MIT text and `Copyright (c) 2021 Builder.io`. Keep both the embedded headers and the included license. |

## Update a library

1. Use a separate change for each library. Get the browser distribution and its
   license files from the official upstream release. Record the release tag,
   source URL and SHA-256 of each replacement file. Verify upstream checksums or
   signatures when available. Review the changes between releases and keep the
   supplied banners intact.
2. Compare the release's terms and notices with those for the checked-in
   version. Check the copyright text and any files upstream says to include
   when redistributing. Confirm Lenis's terms against the exact distribution
   before assigning it a license in this inventory. Resolve any missing or
   unclear redistribution terms before publishing the update.
3. Keep GSAP core and both plugins on the same release. Preserve the local
   script paths and load order in [enhance.js](../js/enhance.js). Check plugin
   registration and the Lenis scroll and ticker integration in
   [main.js](../js/main.js). For Partytown, replace the snippet and worker files
   as one release set. Update the versioned paths in
   [sync-styles.mjs](../scripts/sync-styles.mjs) and the related validation
   scripts. Regenerate `index.html` with `node scripts/sync-styles.mjs`.
4. Check the upload contents with
   [stage-public.py](../scripts/stage-public.py). It copies `js/`, including
   vendor notices, and leaves `docs/` out of the upload. Confirm that the
   staged files include each required notice. Check the generated Partytown
   snippet in `index.html` as well as the separate files.
5. Run the checks in the [README](../README.md). For an animation update, check
   scroll and text effects, reduced-motion behavior and the contact fallback
   with the animation scripts blocked. For a Partytown update, check worker
   loading and GA4 page-view transport in the browser. Run
   [check-server.py](../scripts/check-server.py) against Apache to verify the
   [sandbox CSP exception](../.htaccess) and the main document policy. Preserve
   the existing tracking ID and keep the exception scoped to the sandbox.
6. Update this inventory with the verified version, source and notice evidence.
   If a deployed update fails, use the rollback procedure in the README so the
   previous vendor files, generated HTML and notices are restored together.
