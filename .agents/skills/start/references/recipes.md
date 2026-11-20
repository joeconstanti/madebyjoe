# Coherent starting recipes

These are decision defaults, not vendored templates or frozen CLI commands.
User preferences and an existing stack take priority. Check official docs for
current framework/runtime versions, template flags and deployment adapters.
Choose the smallest recipe that supports the first real user flow.

| Need | Starting recipe | Publishing fit |
|------|-----------------|----------------|
| Small brochure or landing page with little interaction | Plain HTML/CSS with native controls; no component dependency unless needed | Existing static/FTP hosting, or a static host |
| Content, marketing or documentation with reusable layouts | Astro + TypeScript; CSS tokens, optional Tailwind; React/shadcn only for interactive islands that justify it | Static build on a static host; server features require a supported adapter |
| Interactive dashboard or client app with an existing API | React + Vite + TypeScript + Tailwind + shadcn/ui; choose routing only if needed | Static host with route fallback; API/auth must live in a compatible backend |
| App requiring server rendering, server endpoints or integrated authenticated flows | Next.js App Router + TypeScript + Tailwind + shadcn/ui | Vercel, or a documented Node/container host; static export only if all required features support it |

For mobile, desktop, ecommerce or a mandated ecosystem, choose an official
starter that fits the target platforms, distribution and runtime constraints.
For a server script or scheduled job, start with the existing runtime's script
or CLI conventions. Identify how it will run, how it receives configuration
and what should happen when it fails.

## Component and design consistency

- For shadcn/ui, use its official [create/installation flow](https://ui.shadcn.com/docs/installation)
  and choose one compatible preset. Record primitive library, style, base colour,
  font, icons, CSS variables and aliases in the setup record/config. Add only
  components needed for the first flow. Do not combine competing primitive kits.
- A component kit supplies controls, not a visual identity. Derive typography,
  spacing, colour and layout from the audience and references. For a substantial
  visual direction, use the design skill; retain its tokens in the chosen setup.
- Honour an existing component library or a preferred Vue/Svelte ecosystem.
  Verify its official compatibility rather than transplanting React components.
- Use the existing package manager/lockfile. For an empty project with no team
  preference, npm is a simple default; do not install another manager by habit.

## Services and publishing

Add auth, database, CMS, payments and email only when the first flow needs them.
Prefer an existing backend/account. If none exists, recommend a service with its
cost, region and operational tradeoff, and keep local mocks clearly labelled
until real provisioning is authorized. Never claim login/payment persistence
works from a static UI or stub.

Record the host, build command, output directory or server entry, runtime,
environment names, preview/production distinction and domain prerequisites.
Verify static versus server compatibility from the framework and host docs.
FTP-only hosting needs static output unless server support is established.
Include ignored local env files and a safe example file when applicable.
Do not invent a CI pipeline, buy a domain or provision hosting by default.

Official starting points: [Astro](https://docs.astro.build/en/install-and-setup/),
[Vite](https://vite.dev/guide/), [Next.js](https://nextjs.org/docs/app/getting-started/installation),
[shadcn/ui](https://ui.shadcn.com/docs/installation).
