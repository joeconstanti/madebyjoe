---
name: doctor
description: "Diagnose the project setup, local dependencies and the jstack installation without changing them. Use for /doctor or when a jstack skill, tool or dependency seems missing."
---

# doctor

Read `.agents/jstack/rules.md` first and apply it.

1. **Run** `python3 .agents/skills/doctor/scripts/doctor.py --project .` from
   the repository root. It checks jstack file integrity, discovery links,
   configured commands, tools and the SEO and Impeccable entrypoints. Missing
   optional specialists limit those workflows, not installation integrity.
2. **Compare** its report with README, project.json, lockfiles and the tool
   versions that project docs require.
3. **Dependencies.** For the SEO runtime, run the installed claude-seo launcher
   with `doctor --json`. Do not run Impeccable's doctor as a read-only check:
   it can repair state. Inspect its config and launcher instead.
4. **Repair only on request.** Name the smallest repair and its scope. Do not
   install global tools, change credentials, activate hooks, upgrade
   dependencies or start services to make the report green. After an
   authorized project-local repair, run the affected check again.

Report ready, missing, modified and unverified items apart. The script cannot
prove client reload, hook activation, runtime readiness, account access or app
health.
