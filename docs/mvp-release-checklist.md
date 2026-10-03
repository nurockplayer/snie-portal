# Production release record and checklist

> Reconciled 2026-10-03. Original launch issues [#21](https://github.com/nurockplayer/snie-portal/issues/21) and [#26](https://github.com/nurockplayer/snie-portal/issues/26) are historical milestones; the site is already public.

## Current production contract

- URL: <https://snie-portal.pages.dev>; Cloudflare Pages project `snie-portal`
- Production branch `main`; build `pnpm build`; static output `out`
- Node 24 and pnpm 10.33.0; production canonical origin `https://snie-portal.pages.dev`
- Feature branches squash into `develop`; release PRs merge `develop` into `main` normally
- The current validated set contains 45 localized routes, including 21 detail pages for seven past-activity reports
- `/` returns HTTP 301 to `/ja/`; this is distinct from the accessible local static fallback
- Sitemap/robots and valid pages return 200; unknown locale-prefixed paths return matching scriptless static 404s, and unsupported prefixes use Japanese

## Gates for every release

1. Confirm the exact candidate and reviewed tree; run applicable content, ops, archive, media, image, lint, build and route/content checks.
2. Confirm exact-head hosted CI and successful Cloudflare preview. Identify any skipped local checks honestly; hosted success is actual evidence, not an inferred local pass.
3. Check titles/descriptions, canonical URLs, language alternates, social image/alt/type/dimensions and complete sitemap parity. Preserve stable published detail URLs and source-publication dates.
4. Check source-backed content, source attribution, locale navigation, original/variant assets and visible historical/past-state treatment. No fictional/draft record or invented current contact/registration fact may leak.
5. For UI changes, inspect direct entry, repeated/interrupted navigation, language switching, Back/Forward, keyboard behavior and relevant narrow layouts. Record the device/zoom limits rather than generalizing them.
6. Merge only after gates pass; verify Cloudflare's successful production source SHA and matching `/build-info.json`.
7. Run production smoke with `EXPECTED_DEPLOY_COMMIT` set to that exact main SHA. Include changed behavior and preserve the existing routing/error/cache checks.

News/Activities are populated and selected photos are locally hosted with
provenance; the original empty-state/three-remote-image launch no longer describes
production. Current contacts and the missing private removal path remain explicit
limitations in [content readiness](mvp-content-readiness.md).

The dated release record is in the relevant PR and deployment, not a permanently
pinned SHA in this checklist. For operational commands and rollback use the
[Cloudflare runbook](cloudflare-release-runbook.md#public-smoke-check).
