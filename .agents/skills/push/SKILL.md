---
name: push
description: "Commit scoped work and push it straight to main, which can deploy the site. Typed only, never picked automatically."
disable-model-invocation: true
---

# push

Read `.agents/jstack/rules.md` first and apply it.

Typing /push authorizes publishing the scoped changes to main, unless a more
specific user or project rule forbids it. An ordinary edit request does not.

1. **Inspect** status, branch, staged and unstaged diffs, remotes, main and the
   deployment workflows. Say what a push to main triggers (CI, FTP or host
   deploy) before you push. If the user said not to deploy, stop.
2. **Prove.** Run the check skill and read the exact diff.
3. **Commit.** Stage only request-owned paths or hunks; leave out secrets, live
   instrumentation and unrelated staged work. Commit if needed.
4. **Integrate.** Fetch main and read the full outgoing commit range. Every
   commit in it must belong to this request.
   - On main: push only a fast-forward. Resolve divergence without force, and
     only when the intent is clear.
   - On a topic branch: push `HEAD:main` only if HEAD descends from the fetched
     main. Otherwise keep the branch and explain what needs integration.
5. **Push** without force to the explicit remote and main ref. If branch
   protection rejects it, offer the pr skill. Never bypass protection.
6. **Read back** the remote main SHA and confirm that it is the intended commit.

Report the remote, branch, SHA and checks. Carry a requested deployment
through the project's workflow and live verification; otherwise report the CI
or deployment state that the push triggered.
