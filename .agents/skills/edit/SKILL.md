---
name: edit
description: "Start Impeccable Live Mode to edit the site visually in the shared app preview. Use for /edit or an interactive local design session."
---

# edit

Read `.agents/jstack/rules.md` first and apply it.

**Dependency.** Read the installed `.agents/skills/impeccable/SKILL.md` (or a
provider copy) and its `reference/live.md`. This skill means `/impeccable live`
(`$impeccable live` in Codex). If Impeccable is missing, report it and point to
the project-local install in jstack's README. Do not substitute a redesign.
Source: https://github.com/pbakaus/impeccable.

1. **Find the source app** with the preview skill. The helper port is not the
   app port. Never inject into production or weaken production CSP.
2. **Boot live mode.** Follow Impeccable's context, live boot and target
   selection. Open the returned route in the shared preview pane. With no pane,
   use an available browser and say so.
3. **Serve the event loop.** Keep listening while live mode is active, with the
   harness's supported foreground or background mechanism. A started helper is
   not a working session. Keep variants inside the current identity unless the
   user asks for a redesign. After an interruption, use live-status and
   live-resume before you guess.
4. **Clean up on exit.** Follow upstream cleanup. Confirm that injections,
   variant wrappers and temporary instrumentation are gone. Keep source edits
   apart from runtime records.

Never commit or deploy active instrumentation. Report the route, the edits made
and the cleanup result.
