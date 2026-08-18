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

### Executable configuration paths after selection

The following are the two bounded implementation paths. The owner must select one before any provider configuration is changed.

| Approved model | Required repository/provider work | Required validation and evidence |
|---|---|---|
| Pages static export | Add `output: "export"` to the Next configuration, replace the current dynamic localized 404 route handler with an export-compatible localized not-found implementation, and update `scripts/validate-mvp.mjs` in the same branch so it no longer requires that handler. Set the Pages build command to `pnpm build` and the output directory to `out`. | In the export-compatible branch, run `pnpm lint`, `pnpm build`, and the updated `pnpm check:mvp`; the validator must inspect the actual `out` tree, require all 21 locale/page HTML routes, and require the concrete static not-found artifact produced by the replacement. If static export cannot provide the approved locale-correct not-found behavior, reject Pages and select Workers/OpenNext. Capture the Pages preview URL and commit SHA. |
| Workers/OpenNext | Add the current supported `@opennextjs/cloudflare` adapter/configuration at execution time, add the provider’s `wrangler.jsonc` (or current generated equivalent), and use the adapter’s build/deploy scripts, normally `opennextjs-cloudflare build` and `opennextjs-cloudflare deploy`. Run `wrangler deploy --dry-run` before any production deploy. | The adapter branch passes the repository checks and its provider build; capture the dry-run result, preview URL, production branch, commit SHA, and deployed version. The current repository is not claiming this configuration is already present. |

Do not add either model’s dependencies or configuration speculatively in this preparation branch. The selected path must be implemented and reviewed in a branch that can be tested against the owner’s account and the current supported Cloudflare tooling.

## Required settings after the owner decision

Record the exact values in the deployment provider, not in source control when they are secrets:

| Setting | Required value |
|---|---|
| Repository | `nurockplayer/snie-portal` |
| Production branch | `main` |
| Preview source | `develop` and pull requests; if PR previews are unavailable, record that fact and use the provider’s `develop` preview as the required pre-release environment |
| Node.js | `24` (the repository engine range is `>=24 <25`) |
| Package manager | pnpm `10.33.0` |
| Install | `pnpm install --frozen-lockfile` |
| Validation build | `pnpm build && pnpm check:mvp` |
| `NEXT_PUBLIC_SITE_URL` | The approved final HTTPS production URL, supplied by the owner before the production build |
| Secrets | None are required by the current static content; never commit provider credentials |

Preview and production behavior must be explicit: `main` is the only production branch; `develop` and pull-request builds are preview-only; fork pull requests must not receive production secrets; and only owner-approved branches may deploy. For each preview, record the provider URL, source branch or PR, exact commit SHA, build status, and whether `NEXT_PUBLIC_SITE_URL` was intentionally present or absent. A missing PR-preview feature is acceptable only when the provider’s `develop` preview is captured and reviewed. A preview URL is not the production URL.

The `NEXT_PUBLIC_SITE_URL` value controls absolute canonical, Open Graph, sitemap, and robots metadata. Without it, the repository intentionally falls back to relative metadata and omits the sitemap URL from `robots.txt`; that state is not production-ready.

## Human actions and resume points

| ID | Required human action | Resume point |
|---|---|---|
| CF1 | Confirm the SNIE-owned Cloudflare account, project owner, project name, and whether Pages or Workers/OpenNext is approved. | Add the selected provider configuration and record the project identity here. |
| CF2 | If retaining the current route handler, configure the supported Workers/OpenNext deployment path. If Pages static export is selected, make the app and validator export-compatible together, verify the actual `out` directory and static not-found artifact, and only then connect Git. | Run the repository build and model-specific MVP validator; do not run the current handler-dependent validator unchanged against a Pages branch, and do not proceed on a configuration assumption. |
| CF3 | Connect `nurockplayer/snie-portal`, set production to `main`, enable previews where supported, configure Node/pnpm/build settings, and set the approved `NEXT_PUBLIC_SITE_URL`. | Capture the first preview/prod deployment URL and provider settings. |
| CF4 | Review the preview or first deployment at the provider URL: all 21 known routes, supported-locale 404s, navigation, language switching, metadata endpoints, mobile layout, and content/destination approval gates. | Record observed URLs, timestamps, smoke results, and any repair PR. |
| CF5 | Confirm human content approvals from `docs/mvp-content-readiness.md` (H1–H7), complete the release checklist, and mark the prepared `develop` → `main` draft release PR ready for approval. | Mark the draft release PR ready only after the checklist and exact-head CI evidence are current. |
| CF6 | Merge the release PR after required checks, verify the public HTTPS deployment directly, record the final URL in Issue #21, and execute the rollback verification below. | Run the final independent release review and close only after direct public smoke and rollback evidence are captured. |

### Rollback procedure to complete after CF1

Before the first production release, record the previous known-good deployment (or the current production commit if this is the first deployment) and its provider URL in the release record. After a production deployment, retain the deployed commit/version identifier and the smoke result.

- For Pages, use the selected project’s deployment history to select the previous known-good deployment and use the provider’s rollback or redeploy-previous-deployment action. Capture the resulting deployment URL and commit, then repeat the representative route and metadata smoke checks before restoring or promoting the intended release.
- For Workers/OpenNext, identify the target with `wrangler versions list`, inspect it with `wrangler versions view <VERSION_ID>`, and use `wrangler rollback <VERSION_ID>` only after the owner confirms the version and service. Repeat the same representative route, metadata, and HTTP-status smoke checks, recording the result before any forward redeploy.

The procedure is a release requirement, not evidence that a rollback has been run in this workspace. Do not execute it against an unconfirmed account or service.

## Safe maximum reached in this workspace

The authenticated Wrangler session was used only for read-only identity/project discovery. No Cloudflare project was created, no account was selected on SNIE’s behalf, no deployment was attempted, and no public URL was claimed. Engineering Issue #20 is merged and its implementation checks are green, and draft release PR #33 is open as a handoff artifact. The release checklist’s human-content and deployment items remain intentionally open. PR #33 has not been marked ready or merged because the H1–H7 content gates and CF1 Cloudflare ownership/model/URL gate are absent. The release lane is therefore `BLOCKED_HUMAN_ACTION` at H1–H7 and CF1, with CF2–CF6 as the exact resume sequence.

## Reference documentation

- Cloudflare’s [Next.js framework guide](https://developers.cloudflare.com/pages/framework-guides/nextjs/) distinguishes full Next.js deployment from static Pages export.
- Cloudflare’s [static Next.js Pages guide](https://developers.cloudflare.com/pages/framework-guides/nextjs/deploy-a-static-nextjs-site/) documents the static-export preset and its output expectations.
- Cloudflare’s [Next.js Workers guide](https://developers.cloudflare.com/workers/framework-guides/web-apps/nextjs/) documents the supported full Next.js Workers path.
