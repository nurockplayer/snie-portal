# Cloudflare release runbook

> Internal execution record for Issue #21 under Issue #26. Snapshot: 2026-08-19. This document records preparation and blockers; it is not evidence that a Cloudflare project or public deployment exists.

## Current observed state

- The repository is a Next.js 16 App Router application with Node.js `>=24 <25` and pnpm `10.33.0`.
- `pnpm lint`, `pnpm build`, and `pnpm check:mvp` are the local and CI quality commands.
- The 21 known locale/page routes are statically generated. A narrow catch-all route handler serves server-rendered localized 404 responses for unknown paths under a supported locale.
- No `NEXT_PUBLIC_SITE_URL` value is committed. The production HTTPS URL is a human-owned deployment value.
- The available local Wrangler session was authenticated, but no `snie-portal` Cloudflare Pages project was present in the observed project list. This does not establish which Cloudflare account or project SNIE owns.

## Deployment-model decision

The owner must choose and record the Cloudflare product before a project is created:

1. **Workers/OpenNext for the current application.** This preserves the current Next.js route behavior, including the localized catch-all 404 handler, and requires the supported Cloudflare Next.js adapter/configuration to be added and validated before deployment.
2. **Pages static HTML export.** This requires making the repository export-compatible, setting the supported static-export configuration, and validating the output directory. The current repository does not claim to be ready for this mode because it currently includes a server route handler and does not set `output: "export"`.

Do not create a project, select an account, or silently change deployment architecture without the SNIE owner’s decision. Do not use CMS, authentication, Supabase, a custom backend, or archive migration for this release.

## Required settings after the owner decision

Record the exact values in the deployment provider, not in source control when they are secrets:

| Setting | Required value |
|---|---|
| Repository | `nurockplayer/snie-portal` |
| Production branch | `main` |
| Preview source | `develop` and pull requests where supported |
| Node.js | `24` (the repository engine range is `>=24 <25`) |
| Package manager | pnpm `10.33.0` |
| Install | `pnpm install --frozen-lockfile` |
| Validation build | `pnpm build && pnpm check:mvp` |
| `NEXT_PUBLIC_SITE_URL` | The approved final HTTPS production URL, supplied by the owner before the production build |
| Secrets | None are required by the current static content; never commit provider credentials |

The `NEXT_PUBLIC_SITE_URL` value controls absolute canonical, Open Graph, sitemap, and robots metadata. Without it, the repository intentionally falls back to relative metadata and omits the sitemap URL from `robots.txt`; that state is not production-ready.

## Human actions and resume points

| ID | Required human action | Resume point |
|---|---|---|
| CF1 | Confirm the SNIE-owned Cloudflare account, project owner, project name, and whether Pages or Workers/OpenNext is approved. | Add the selected provider configuration and record the project identity here. |
| CF2 | If retaining the current route handler, configure the supported Workers/OpenNext deployment path. If Pages static export is selected, make the app export-compatible and verify the output directory before connecting Git. | Run the repository build and MVP validator in the selected provider model; do not proceed on a configuration assumption. |
| CF3 | Connect `nurockplayer/snie-portal`, set production to `main`, enable previews where supported, configure Node/pnpm/build settings, and set the approved `NEXT_PUBLIC_SITE_URL`. | Capture the first preview/prod deployment URL and provider settings. |
| CF4 | Review the preview or first deployment at the provider URL: all 21 known routes, supported-locale 404s, navigation, language switching, metadata endpoints, mobile layout, and content/destination approval gates. | Record observed URLs, timestamps, smoke results, and any repair PR. |
| CF5 | Confirm human content approvals from `docs/mvp-content-readiness.md` (H1–H7), complete the release checklist, and approve a `develop` → `main` release PR. | Open the release PR only after the checklist and exact-head CI evidence are current. |
| CF6 | Merge the release PR after required checks, verify the public HTTPS deployment directly, record the final URL in Issue #21, and document rollback to the known-good deployment/commit. | Run the final independent release review and close only after direct public smoke evidence is captured. |

## Safe maximum reached in this workspace

The authenticated Wrangler session was used only for read-only identity/project discovery. No Cloudflare project was created, no account was selected on SNIE’s behalf, no deployment was attempted, and no public URL was claimed. The release lane is therefore `BLOCKED_HUMAN_ACTION` at CF1, with CF2–CF6 as the exact resume sequence.

## Reference documentation

- Cloudflare’s [Next.js framework guide](https://developers.cloudflare.com/pages/framework-guides/nextjs/) distinguishes full Next.js deployment from static Pages export.
- Cloudflare’s [static Next.js Pages guide](https://developers.cloudflare.com/pages/framework-guides/nextjs/deploy-a-static-nextjs-site/) documents the static-export preset and its output expectations.
- Cloudflare’s [Next.js Workers guide](https://developers.cloudflare.com/workers/framework-guides/web-apps/nextjs/) documents the supported full Next.js Workers path.
