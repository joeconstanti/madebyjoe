---
name: pr
description: "Open a pull request: topic branch, scoped commit, push and a problem-first description. Use for /pr, \"open a PR\" or \"file a PR\"; babysits it when asked and never merges."
---
# pr

Read `.agents/jstack/rules.md` first and apply it.

1. **Scope.** Inspect status, staged and unstaged diffs, branch and remotes.
   Name the paths that belong to this request. Leave out unrelated work,
   secrets, downloaded runtimes and live-edit instrumentation. If a PR for this
   branch exists, update it instead of opening a second one. If the harness
   has a PR tool, use it for create and edit.
2. **Branch.** On main, create a topic branch in the repo's convention, for
   example `fix/canonical-urls`. Never use a `codex/` prefix. Never rewrite a
   published branch.
3. **Prove.** Fetch the base and review the scoped diff against it. Run the
   check skill, and the verify skill for UI changes. Fix in-scope failures
   first. Do not call unproven work ready.
4. **Commit and push.** Stage explicit paths or hunks; leave unrelated staged
   work out. Read the staged diff, commit and push with upstream tracking.
5. **Describe.** Follow the PR template if there is one. The title follows the
   repo convention and says why the change matters. The body has:
   - **Problem**, in one or two plain sentences from the user's request, then
     the fix and what it leaves out. No file inventory.
   - **Evidence**: before and after (screenshot, output, a check that failed
     and now passes), with the proof rung.
   - **Risk**: one-way or two-way door, and the blast radius (routes, layout,
     tracking, SEO, deployment).
   - The attribution line that the harness requires. Otherwise
     `Created with <model> in <harness>`, without a guessed model.

   Check the title and body for private details. Pass the body with
   `--body-file`. Open a real PR, not a draft, so review bots run. If the
   `gh` GraphQL limit is used up, create it with REST
   (`gh api repos/<owner>/<repo>/pulls`).
6. **Confirm.** Read back the PR URL, base, head SHA and check state. Link the
   PR at once if the harness requires it.

## Babysit, only when asked

A status question ("is it green?") gets one read and a report. To babysit,
use one watcher: the harness PR watcher (T3: `watch_pull_request`), otherwise
`gh pr checks <number> --watch`. Only the thread that owns the PR watches it.
When an event needs no action, end the turn without a message.

Act only on checks and comments newer than the last push. Check each bot
finding against the source. Fix real bugs and prove each fix before you push.
Classify CI failures as the check skill does; a failure in code the diff does
not touch suggests a stale base (`git merge-base --is-ancestor`). Decline nits,
rare edge cases and extra scope with a written reason, and list them as
follow-ups. Keep the PR at the size the request needs. Start each comment you
post for the user with
`> [!NOTE]` and `> 🤖 **<model> responding on behalf of <user>**`, then the
reply below it. Call the PR ready only when it is not BEHIND or DIRTY on the
latest head. Stop the watcher before you hand back.

Do not merge, enable auto-merge or claim deployment unless the user asked. If
GitHub is unavailable, keep the local commit and report the exact next step.
