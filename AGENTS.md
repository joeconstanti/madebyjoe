# Project agent guidance

This is the static HTML portfolio at madebyjoe.co. Read README.md for development instructions.

## Impeccable

Impeccable 4.8.0 is installed locally for Codex, Claude Code, Cursor, GitHub Copilot,
Gemini CLI, OpenCode, and Pi. Other agents can read the shared skill at
`.agents/skills/impeccable/SKILL.md` and its referenced playbooks.
Read that skill before using Impeccable. Follow the active harness permissions.

- Codex: `$impeccable live`. Other supported agents: `/impeccable live`.
- Serve this checkout with `python3 -m http.server 8000 --bind 127.0.0.1`.
  Use `http://localhost:8000/` as the app URL; the live helper uses a separate port.
- The injection target is `index.html`, configured in `.impeccable/live/config.json`.
  Python does not serve Apache `.htaccess`, so the production CSP does not apply locally.
- Keep the current design, copy, tracking, and URLs unless the user requests changes.
- Keep live instrumentation local. Stop live mode and remove its injection before committing.
- Do not deploy agent folders or `.impeccable` runtime files. The GitHub FTP workflow
  excludes them. The legacy `.cpanel.yml` copies the whole checkout; do not use that
  deployment path with agent tooling present without adding equivalent exclusions.
- Do not commit downloaded `scripts/bin` engines; launchers restore the correct platform.

Reload the coding tool after installation. Codex users must approve the project hook
in `/hooks` if their client supports it. Hook support depends on the agent client.

To update the installed skills, run `npx impeccable@4.8.0 update` from this folder
(or choose a newer CLI version explicitly), then review the changed files.
