---
name: start
description: "Inspect a project, interview the user about what they want to build or rebuild, scaffold a suitable starter when needed, and write PLAN.md for the initial build. Use for /start or project kickoff."
---

# start

Read `.agents/jstack/rules.md` first and apply it.

1. **Inspect the target folder before asking questions.** Read project guidance,
   Git state, manifests, lockfiles, entry points, tests and existing plans.
   Identify what already runs, what can be reused and which decisions are open.
   Outside a repository, establish the intended folder before writing.
2. **Interview the user.** Briefly share what you found, then ask about gaps that
   affect the build. Ask what they want to build or rebuild, who it is for and
   what the first usable version must do, wherever those answers are missing.
   Consider websites, web apps, desktop or mobile apps, server scripts and
   other project types. For a rebuild, establish what must carry over. Ask up
   to three related questions per round about relevant constraints, such as
   target platforms, data, integrations, design or hosting. Wait for answers
   to consequential questions unless the user delegates those decisions.
3. **Choose and scaffold the starter in the target folder.** Use
   `references/recipes.md` to recommend a fitting stack or template. Reuse
   the existing setup when it fits. Verify official scaffold instructions
   before running a generator. If it requires an empty folder, generate in a
   temporary sibling, inspect the output and copy only nonconflicting files.
   Use the project's package manager and runtime. Record the template source,
   versions, configuration names and any publishing prerequisites. Run the
   available starter checks and record their results and any setup blockers.
4. **Write or update root `PLAN.md`.** Make it the tracker for the initial
   prototype or build. Record the agreed goal, first usable flow, scope,
   stack, constraints and open decisions. Use `- [ ]` tasks with stable IDs,
   concrete deliverables, file or module ownership, dependencies and
   checkable acceptance criteria. Group tasks into parallel workstreams with
   nonoverlapping edits. Put shared interfaces or prerequisites first and
   make integration and end-to-end verification explicit dependent tasks.
   Include the relevant run and check commands.
5. **Hand over the scaffold and plan.** Make each task self-contained enough
   for a subagent to pick up and tick off after verification. Have agents
   report completion to the coordinator when concurrent edits to `PLAN.md`
   would conflict. Preserve existing plan items and progress on reruns.
   Mark only verified work complete. Leave prototype implementation to the
   plan unless the user also asks to execute it.
