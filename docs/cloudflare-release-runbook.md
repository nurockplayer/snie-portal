# Cloudflare Pages release runbook

> Status: active
> Last verified: 2026-08-20

## Production baseline

| Setting | Value |
|---|---|
| Public URL | `https://snie-portal.pages.dev` |
| Cloudflare project | `snie-portal` |
| Production branch | `main` |
| Build command | `pnpm build` |
| Output directory | `out` |
| Node.js | 24, declared by `package.json` |
| pnpm | 10.33.0, declared by `package.json` |

Cloudflare Pages is connected directly to `nurockplayer/snie-portal` and creates
preview deployments for non-production branches. Only `main` is production.
The project has the non-secret `NEXT_PUBLIC_SITE_URL` value
`https://snie-portal.pages.dev` in both preview and production build settings.
The repository uses the same Pages URL as a safe default, so metadata does not
degrade to relative URLs if the environment value is absent or invalid. A
future verified HTTPS custom domain can override the default through the same
variable.

## Release

1. Merge feature work to `develop` only after its exact head passes local
   checks, independent review, GitHub CI, and Cloudflare preview.
2. Open a release pull request from `develop` to `main`.
3. Confirm the release head passes `pnpm test:media`, `pnpm lint`,
   `pnpm build`, and `pnpm check:mvp` and that the generated canonical,
   alternate, Open Graph, sitemap, and robots URLs use the production origin.
4. Merge the release pull request and record the resulting exact `main` SHA.
5. In Cloudflare deployment history, confirm the successful production
   deployment is sourced from that SHA before accepting public smoke results.

## Public smoke check

Check `/`, `/ja/`, `/en/`, `/zh-TW/`, one inner route per locale,
`/sitemap.xml`, `/robots.txt`, and a missing route. Confirm:

- HTTPS responses and expected redirect/404 behavior;
- navigation and locale switching preserve valid routes;
- titles, descriptions, canonical URLs, `hreflang`, Open Graph URLs, sitemap
  entries, and the robots sitemap use `https://snie-portal.pages.dev`;
- no draft or placeholder marker is exposed;
- remote legacy images have visible source links and a localized fallback.

## Rollback

Git history and Cloudflare deployment history are the recovery sources.
Prefer a normal revert pull request to `develop`, release the revert to
`main`, and verify the new exact deployment SHA. If the current release is
unusable and an immediate recovery is necessary, use Cloudflare Pages deployment
history to restore a known-good production deployment, then reconcile `main`
through a pull request so Git and production agree.
