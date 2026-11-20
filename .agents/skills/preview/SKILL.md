---
name: preview
description: "Open this checkout's local website or app in the coding agent's shared preview pane. Use for /preview; works for static and framework projects."
---

# preview

Read `.agents/jstack/rules.md` first and apply it.

1. **Find the app.** Get the route, source root, start command and URL from
   project.json, docs, package scripts and framework config. Prefer the source
   dev server. Label a production-build preview as one. A static site with no
   documented server can use `python3 -m http.server --bind 127.0.0.1`; it
   does not run Apache redirects, headers or production CSP.
2. **Reuse with care.** Check existing preview tabs and listeners. Reuse a
   server only after you confirm that it serves this checkout. Do not stop
   another project's server or assume that a busy default port is this app.
3. **Start if needed.** Use a free port and a harness-managed terminal or
   session. Record the command, working directory, session and actual URL. If
   dependencies are missing, report what setup is needed instead of installing
   them blindly.
4. **Open.** Use the harness's shared preview tool (in T3: `preview_status`,
   then `preview_open`). Open the requested route and look at the rendered
   page and console errors. A ready HTTP port is not a rendered preview. With no
   preview pane, use an available browser or give the URL, and say so.

Report the URL, source or build mode, and whether the pane opened. Keep a
requested preview running for the user.
