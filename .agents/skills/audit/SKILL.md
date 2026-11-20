---
name: audit
description: "Audit website SEO with the project-local AgriciDaniel Claude SEO skills and rank the findings. Use for /audit or an SEO review; produces a report, not site edits."
---

# audit

Read `.agents/jstack/rules.md` first and apply it.

**Dependency.** Read the installed SEO entrypoint:
`.agents/skills/seo/SKILL.md` or `.agents/skills/claude-seo/skills/seo/SKILL.md`.
Then read `seo-audit` for a full site, `seo-page` for one page or
`seo-technical` for a technical-only request. If it is missing, report it and
point to `setup-seo.py` in jstack's README. Never install global tools.
Source: https://github.com/AgriciDaniel/claude-seo.

1. **Target.** Use the URL in the request, then `site_url`, then verified
   repository metadata. Keep local source, local render, deployed HTTP and
   authenticated account evidence apart.
2. **Runtime.** When bundled scripts are needed, start with the runtime's
   `doctor --json`. Map upstream `${CLAUDE_PLUGIN_ROOT}` paths to the local
   install (repository layout: `.agents/skills/claude-seo`; flattened layout:
   launch `.agents/skills/seo/scripts/claude-seo`). Keep runtime data in the
   project: when a launcher would fall back to a user-level folder, set
   `CLAUDE_SEO_DATA_DIR=.agents/jstack/runtime/seo`. A missing dependency or
   account is a limitation, not a score of zero.
3. **Audit.** Follow upstream crawl limits and robots rules. Delegate specialist
   passes only when the harness and user allow it; otherwise do them in
   context.
4. **Report.** For each finding: evidence, affected URLs, severity, confidence
   and a concrete fix. Do not invent ranking promises, field Core Web Vitals,
   traffic, schema claims or account attribution. Save the report under
   `.agents/jstack/reports/audit/` unless the user picks another place.

Report coverage and skipped checks with the priorities. Do not fix or publish
the site unless asked.
