# Cloudflare Pages release runbook

> Internal execution record for Issue #21 under Issue #26. Snapshot: 2026-08-19. This document records the selected Pages path and its remaining human/provider gates; it is not evidence that a Cloudflare project or public deployment exists.

## Current repository state

- SNIE Portal is a Next.js 16 App Router application with Node.js `>=24 <25` and pnpm `10.33.0`.
- The application uses Next.js Static HTML Export. `pnpm build` writes the deployable artifact to `out/`.
- The 21 known locale/page routes are emitted as static `index.html` files. `out/404.html` is the static custom not-found artifact.
- The server-runtime localized catch-all route has been removed. The static 404 uses the default Japanese fallback and links to all three localized home pages; a static host cannot inspect an arbitrary missing URL and server-render a different locale without runtime infrastructure.
- `robots.txt` and `sitemap.xml` are emitted into `out/` and are checked from that artifact by `pnpm check:mvp`.
- No `NEXT_PUBLIC_SITE_URL` value is committed or supplied in this repository. The production HTTPS URL remains a human-owned deployment value.
- No Cloudflare project, production deployment, public URL, account ownership, or rollback result has been observed in this workspace.

## Locked deployment model

The owner selected **Cloudflare Pages + Next.js Static HTML Export** for this MVP.

Workers/OpenNext is out of scope. Do not add an adapter, Worker, Pages Function, API route, runtime rewrite, or server-only fallback to preserve behavior that static hosting cannot provide.

| Setting | Required value |
|---|---|
| Repository | `nurockplayer/snie-portal` |
| Cloudflare product | Pages |
| Framework/output model | Next.js Static HTML Export |
| Production branch | `main` |
| Preview source | `develop` and pull requests where supported |
| Install command | `pnpm install --frozen-lockfile` |
| Build command | `pnpm build` |
| Build output directory | `out` |
| Node.js | `24` |
| pnpm | `10.33.0` |
| `NEXT_PUBLIC_SITE_URL` | Leave unset until an approved production HTTPS URL exists; then set that exact URL for the production build |
| Secrets | None are required by the current static content; never commit provider credentials |

`main` is the only production branch. `develop` and pull-request builds are preview-only. Fork pull requests must not receive production secrets. Record the provider URL, source branch or PR, exact commit SHA, build status, and whether `NEXT_PUBLIC_SITE_URL` was intentionally absent or present for every preview.

When `NEXT_PUBLIC_SITE_URL` is absent, canonical, Open Graph, sitemap, and robots metadata intentionally remain relative and `robots.txt` omits a sitemap URL. That is acceptable for repository/preview validation but is not production metadata evidence.

## Repository validation contract

The focused engineering change keeps the Pages path intentionally small:

- `next.config.ts` sets `output: "export"` and keeps trailing-slash output.
- `robots.ts` and `sitemap.ts` declare static generation so the metadata endpoints are emitted into `out/`.
- The root page is a static, accessible link/meta-refresh fallback to `/ja/`; it does not use a server redirect.
- The server-only localized catch-all route is absent.
- `scripts/validate-mvp.mjs` reads the generated `out/` tree directly. It requires all 21 localized route files, the static 404 artifact, metadata endpoints, locale/title/description/canonical/alternate metadata, internal links, dictionaries, and placeholder/content-safety checks.
- `pnpm check:mvp` does not launch a Next server and does not treat `.next/server` as the deployable artifact.

Before connecting Git to Pages, run:

```text
pnpm lint
pnpm build
pnpm check:mvp
```

Inspect `out/` directly and record the exact commit SHA. The static not-found evidence must include `out/404.html`, its default-locale metadata/content, and the three localized home-page fallback links. Provider smoke testing must separately verify that Pages returns that artifact with HTTP 404 for representative unknown paths.

## Human actions and resume points

| ID | Required human action | Resume point |
|---|---|---|
| CF1 | Confirm the SNIE-owned Cloudflare account, project owner, and project name. | Record the verified Pages project identity here; do not infer ownership from a local Wrangler login. |
| CF2 | Merge the focused Pages static-export engineering PR into `develop` after exact-head CI is green. | Update draft PR #33 with the new `develop` SHA and repository evidence. |
| CF3 | Connect `nurockplayer/snie-portal`, set production to `main`, enable previews where supported, configure the table above, and set `NEXT_PUBLIC_SITE_URL` only after the approved production HTTPS URL exists. | Capture the first preview URL, source SHA, provider settings, and build result. |
| CF4 | Review the preview at the provider URL: all 21 routes, locale switching, navigation, root fallback, Pages HTTP 404 behavior, metadata endpoints, mobile layout, accessibility, and content gates. | Record URLs, timestamps, exact SHA, smoke results, and any repair PR. |
| CF5 | Complete and approve H1–H7 in `docs/mvp-content-readiness.md`, including organization copy, audience/destination content, Join/Contact destinations, Activities/News state, privacy/photo notice, and translation/reviewer dates. | Complete the release checklist and mark PR #33 ready only after exact-head CI and deployment evidence are current. |
| CF6 | Merge the release PR from `develop` to `main`, verify the public HTTPS deployment directly, record the final URL in Issue #21, and complete the Pages rollback verification below. | Run the final independent release review and close only after direct public smoke and rollback evidence are captured. |

## Pages rollback procedure

Before the first production release, record the previous known-good deployment (or the current production commit if this is the first deployment) and its provider URL in the release record. After a production deployment, retain the deployed commit/version identifier and smoke result.

Use the selected Pages project’s deployment history to select the previous known-good deployment and use the provider’s rollback or redeploy-previous-deployment action. Capture the resulting deployment URL and commit, then repeat representative locale-route, metadata, root, and HTTP-404 smoke checks before restoring or promoting the intended release.

This procedure is a release requirement, not evidence that a rollback has been run in this workspace. Do not execute it against an unconfirmed account or project.

## Safe maximum in this workspace

No Cloudflare project was created, no account was selected on SNIE’s behalf, no deployment was attempted, and no public URL was claimed. The Pages architecture is now an owner decision and the repository conversion is covered by the focused engineering PR. H1–H7, Cloudflare ownership/project identity, provider setup, public smoke tests, `NEXT_PUBLIC_SITE_URL`, production release, and rollback evidence remain intentionally open. PR #33 must remain draft and must not be merged while those gates are unresolved.

## Reference documentation

- Cloudflare’s [Next.js framework guide](https://developers.cloudflare.com/pages/framework-guides/nextjs/) provides the Pages integration context.
- Cloudflare’s [static Next.js Pages guide](https://developers.cloudflare.com/pages/framework-guides/nextjs/deploy-a-static-nextjs-site/) documents the static-export deployment path.
