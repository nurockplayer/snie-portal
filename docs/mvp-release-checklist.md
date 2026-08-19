# SNIE Portal production release record

> Operational record for [Issue #21](https://github.com/nurockplayer/snie-portal/issues/21) and [Issue #26](https://github.com/nurockplayer/snie-portal/issues/26). Last reconciled: 2026-08-20.

## Current production

- Public URL: <https://snie-portal.pages.dev>
- Cloudflare Pages project: `snie-portal`
- Production branch: `main`
- Build command: `pnpm build`
- Output directory: `out`
- Canonical-site environment value: `NEXT_PUBLIC_SITE_URL=https://snie-portal.pages.dev`
- Release path: feature PR to `develop`, then release PR from `develop` to `main`

## Verified release gates

- All 21 localized routes build statically and return HTTP 200 in production.
- The root route, `robots.txt`, and `sitemap.xml` return HTTP 200; an unknown route returns the localized 404.
- Internal navigation and locale links preserve valid destinations.
- Titles, descriptions, canonical URLs, Open Graph URLs, and locale alternates are absolute and locale-aware.
- Activities and News render factual empty states; no placeholder or draft marker is public.
- Published legacy media is review-gated, has localized alternative text and captions, and retains source links.
- `pnpm lint`, `pnpm build`, `pnpm check:mvp`, media tests, operations tests, and the production smoke pass before release.
- GitHub Actions runs CI on pull requests and a daily/manual production smoke.

For deployment verification, routine monitoring, and rollback, use the [Cloudflare release runbook](./cloudflare-release-runbook.md#public-smoke-check).
