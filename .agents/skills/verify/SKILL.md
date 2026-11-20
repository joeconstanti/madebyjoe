---
name: verify
description: "Verify web behavior or final documents and presentations against acceptance criteria using the actual rendered artifact. Use for /verify or browser acceptance checks."
---

# verify

Read `.agents/jstack/rules.md` first and apply it. The goal is rung 4 (observed), or a clear reason why it was not reached.

Extract criteria from the request/brief, not incidental source details.
For multi-part work, map those requested outcomes to scenario, evidence and
passed/failed/not run/unavailable result. Reuse existing acceptance criteria.
Without a render, mark visual criteria unavailable, including inferred readability
or clipping risks; never mark them failed from a description alone. Keep this
mapping inside the requested format and word limit; omit routine recap.
Under a tight word limit, use short bullets instead of a table; omit preamble
and next steps unless requested. Describe source-only risks once.

For documents and presentations, identify the final file/version and acceptance
criteria. Use an available format-specific tool to render or export it; inspect
pages/slides for clipped text, table layout, image crops, readable labels and
broken links. Check the decision or reading path and compare revised facts
against their sources. Report the exact artifact, pages inspected and gaps.
Do not start a web server for a document. Plain text/Markdown needs a source and
structure check; say when visual rendering was not applicable or unavailable.

For web work:

1. **Target.** Use the preview skill to find this checkout's app. List the
   routes that the change touches, plus shared navigation, header and footer.
   Use the project's browser QA scripts when they exist.
2. **Baseline.** For a bug fix, reproduce the failure on the same route and
   viewport first, then watch the same path pass after the fix. For a visual
   change, capture main, the live site or a supplied reference. When the user
   asks for a match, compare by image diff and keep the reference unchanged.
3. **Drive the real user path** at desktop and narrow mobile widths. Let fonts,
   images and animations settle. Check the main action, keyboard focus,
   relevant loading, empty and error states, internal links, and console and
   network failures. Capture the action and the resulting state, not only the
   final screen. Check side effects that matter: form payload, tracking event,
   redirect.
4. **Stay safe.** Do not submit real leads, send messages, buy or change account
   data. Use a test path that the project provides.
5. **Record** the URL, viewport, scenario and result of each check. Save
   evidence under `.agents/jstack/reports/verify/` or where the user asks. Stop
   only processes you started, and keep the evidence.

Report passes, failures and gaps. A tracking request is not account
attribution. Fix only when implementation is authorized.
