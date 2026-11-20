---
name: pull
description: "Bring the latest main branch into the current checkout without losing local work. Use for /pull or to update a working branch from main."
---

# pull

Read `.agents/jstack/rules.md` first and apply it.

1. **Inspect** status, current branch, upstream and remotes. Get the main branch
   from project.json or the remote default, and the remote from project.json or
   `origin`. Fetch it.
2. **Protect local work.** Do not reset, clean, auto-stash or switch branches.
   If the incoming changes touch uncommitted files, stop and name those files.
3. **Integrate.**
   - On main: `git merge --ff-only <remote>/<main>`. If main diverged, report
     the divergence instead of inventing a resolution.
   - On a topic branch: merge the fetched main into it and keep published
     history. Rebase only when the project convention says so and the branch is
     not shared, then compare the old and new commits with `git range-diff`.
4. **Conflicts.** Keep both sides' intent. Resolve a conflict only when the
   intent is clear. Otherwise list the files that need a decision.
5. **Check.** After a merge or rebase, run the check skill. A clean merge is
   not a working build.

Never push. Report the branch, the resulting SHA and whether it was a
fast-forward, a merge or blocked.
