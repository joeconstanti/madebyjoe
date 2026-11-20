---
name: update-skills
description: "Review and apply a newer jstack release to this project, keeping local settings. Typed only, never picked automatically."
disable-model-invocation: true
---

# update-skills

Read `.agents/jstack/rules.md` first and apply it.

1. **Current state.** Read `.agents/jstack/manifest.json` for the installed
   version and managed paths.
2. **Pick a release.** Source: https://github.com/joeconstanti/jstack. Prefer
   the newest stable tag, pin its commit and show the old and new versions with
   the release changes. Never pipe a download straight into a shell.
3. **Dry run.** Clone into a temporary folder outside the project. Read its
   README and `install.py`, then run
   `python3 install.py install --project <absolute-project-root> --dry-run`.
   Review the file list and collisions.
4. **Apply.** If the dry run is clean, run it without `--dry-run`. Then run
   `install.py check` and the doctor skill, and read the target diff.
5. **Conflicts.** A modified managed file or an unmanaged collision needs a
   scoped resolution that keeps the user's edits. There is no force flag.

The installer keeps project.json and unrelated skills and settings. Do not edit
AGENTS.md, CLAUDE.md, hooks, MCP settings or other dependencies as a side
effect. SEO and Impeccable have their own lifecycles: report their versions and
update them only on request. Do not commit, push or deploy unless asked. Agents
may need a reload to discover updated skills.
