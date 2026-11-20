---
name: check
description: "Run the project's build, lint and tests and report real results. Use for /check or to find out whether scoped changes are ready."
---

# check

Read `.agents/jstack/rules.md` first and apply it.

1. **Discover.** Read `check_commands` in project.json, package scripts,
   Makefile targets and CI workflows. Read each command before you run it: a
   script named `check` or `build` can deploy, write files or format code.
2. **Choose.** Pick the checks that cover the change: syntax and types, lint,
   tests, build, route and asset validation. Use the project's package manager
   and lockfile. Do not add a toolchain to a static site to get a green result.
3. **Run.** Run independent commands in parallel, dependent ones in order. Do
   not deploy, run fix mode, format everything or upgrade dependencies.
4. **Classify failures.** Before you blame the change, find out if the check
   also fails without it (CI on main, or a clean worktree). Report a
   pre-existing failure as pre-existing. Rerun a suspected flake once; the
   same failure twice is real.
5. **Fix** failures that this task owns, when implementation is authorized, and
   run that check again. Report tracked files that a build regenerated.

Report each command, its exit result and what it covers. Use the verify skill
for rendered behavior.
