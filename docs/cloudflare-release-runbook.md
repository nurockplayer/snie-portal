# Cloudflare Pages release runbook

> Status: active
> Last verified: 2026-10-02

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
3. Confirm the release head passes `pnpm test:media`, `pnpm test:ops`,
   `pnpm lint`, `pnpm build`, and `pnpm check:mvp` and that the generated canonical,
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
- local source photographs and responsive delivery variants load with visible attribution.

Run the automated subset with `pnpm smoke:production`. It covers the 24 route
statuses, locale metadata and links on locale homepages, permanent root redirect, localized 404s, immutable hashed assets,
placeholder markers, sitemap, and robots. The remaining image, fallback, and
interaction checks above stay in the release smoke. The `Production smoke`
GitHub Actions workflow runs the automated subset daily and can also be started
with `workflow_dispatch`; its unit checks run in pull-request CI through
`pnpm test:ops`. These checks use public GET requests only, with no analytics or
visitor tracking.

## Rollback

Git history and Cloudflare deployment history are the recovery sources.
Prefer a normal revert pull request to `develop`, release the revert to
`main`, and verify the new exact deployment SHA. If the current release is
unusable and an immediate recovery is necessary, use Cloudflare Pages deployment
history to restore a known-good production deployment, then reconcile `main`
through a pull request so Git and production agree.


## Static routing and cache contract (#56 / #57)

- `public/_redirects` permanently redirects `/` to `/ja/` with HTTP 301. The static root HTML remains a useful local fallback, but it is not accepted as the production redirect.
- After Next static export, `scripts/prepare-cloudflare-output.mjs` derives `out/ja/404.html`, `out/en/404.html`, and `out/zh-TW/404.html` from the built, styled default error document. Locale copy and the primary home action come from the dictionaries. Scripts/script preloads are removed because an unknown request has no application route to hydrate; CSS and native navigation remain.
- Cloudflare Pages resolves the nearest `404.html` up the requested directory tree. Supported-locale missing URLs therefore return their matching static document with HTTP 404 and noindex. Unsupported prefixes use the top-level Japanese fallback. No Worker, Function, dynamic content runtime or SPA rewrite is added.
- `public/_headers` applies `Cache-Control: public, max-age=31536000, immutable` only to `/_next/static/*`. Those JS, CSS and font paths are build-fingerprinted. HTML, `build-info.json`, source photos and source-hash-derived responsive image paths retain Pages' revalidation defaults.
- No manual purge is required for a normal new build: changed Next assets receive changed paths. Never broaden this rule to HTML or semantic/non-content-hashed file paths.
- `pnpm smoke:production` checks the root without following redirects; localized and unsupported-locale 404 status/lang/copy/noindex/home action; canonical trailing slashes; hashed JS/CSS/font cache headers; and revalidatable HTML. The earlier 200 meta-refresh/302/default-language-only behavior now fails.

Primary platform references: [Serving Pages](https://developers.cloudflare.com/pages/configuration/serving-pages/) and [Headers](https://developers.cloudflare.com/pages/configuration/headers/).
