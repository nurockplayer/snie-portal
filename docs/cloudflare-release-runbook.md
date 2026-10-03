# Cloudflare Pages release runbook

> Status: active
> Last verified: 2026-10-03

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

1. Squash-merge feature work to `develop` only after its exact head passes applicable checks, independent review, GitHub CI and Cloudflare preview. Record local checks that could not run; require their actual equivalent on exact hosted CI rather than claiming a local pass. UI changes require relevant browser checks.
2. Open a release pull request from `develop` to `main`.
3. Confirm the release head passes `pnpm test:content`, `pnpm test:archive`, `pnpm test:media`, `pnpm test:images`, `pnpm test:ops`, `pnpm lint`, `pnpm build`, and `pnpm check:mvp` and that the generated canonical,
   alternate, Open Graph, sitemap, and robots URLs use the production origin.
4. Merge the release pull request with a normal merge commit to preserve develop ancestry, and record the resulting exact `main` SHA.
5. In Cloudflare deployment history, confirm the successful production
   deployment is sourced from that SHA before accepting public smoke results.

## Public smoke check

Check `/`, `/ja/`, `/en/`, `/zh-TW/`, `/ko/`, changed inner/detail routes per locale,
`/sitemap.xml`, `/robots.txt`, and a missing route. Confirm:

- HTTPS responses and expected redirect/404 behavior;
- navigation and locale switching preserve valid routes and activity-record slugs;
- titles, descriptions, canonical URLs, `hreflang`, Open Graph URLs, sitemap
  entries, and the robots sitemap use `https://snie-portal.pages.dev`;
- no draft or placeholder marker is exposed;
- local source photographs and responsive delivery variants load with visible attribution.

Run the automated subset with `EXPECTED_DEPLOY_COMMIT=<exact-main-sha> pnpm smoke:production`. It derives the current 60-route set from validated records and covers route statuses, source-backed detail copy/links, locale metadata and navigation, social-image bytes/type/dimensions, permanent root redirect, localized 404s, immutable hashed assets, placeholders, sitemap and robots. The remaining image, fallback, and
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
- After Next static export, `scripts/prepare-cloudflare-output.mjs` derives `out/ja/404.html`, `out/en/404.html`, `out/zh-TW/404.html`, and `out/ko/404.html` from the built, styled default error document. Locale copy and the primary home action come from the dictionaries. Scripts/script preloads are removed because an unknown request has no application route to hydrate; CSS and native navigation remain.
- Cloudflare Pages resolves the nearest `404.html` up the requested directory tree. Supported-locale missing URLs therefore return their matching static document with HTTP 404 and noindex. Unsupported prefixes use the top-level Japanese fallback. No Worker, Function, dynamic content runtime or SPA rewrite is added.
- `public/_headers` applies `Cache-Control: public, max-age=31536000, immutable` only to `/_next/static/*`. Those JS, CSS and font paths are build-fingerprinted. HTML, `build-info.json`, source photos and source-hash-derived responsive image paths retain Pages' revalidation defaults.
- No manual purge is required for a normal new build: changed Next assets receive changed paths. Never broaden this rule to HTML or semantic/non-content-hashed file paths.
- `pnpm smoke:production` checks the root without following redirects; localized and unsupported-locale 404 status/lang/copy/noindex/home action; canonical trailing slashes; hashed JS/CSS/font cache headers; and revalidatable HTML. The earlier 200 meta-refresh/302/default-language-only behavior now fails.

Primary platform references: [Serving Pages](https://developers.cloudflare.com/pages/configuration/serving-pages/) and [Headers](https://developers.cloudflare.com/pages/configuration/headers/).


## Current coverage and test limits

The initial 21-route MVP and later 24-route editorial baseline are historical. The current set is eight top-level pages plus seven activity detail pages per locale, for 60 total. All release gates must follow the derived set rather than retain an old fixed route count.

The most recent record-page browser checks covered desktop interaction and native Chromium zoom/reflow at 393×252 CSS pixels in all three locales and 295×189 in Japanese. They are not physical-phone/mobile-user-agent tests or Lighthouse measurements. Older open quality tickets retain their remaining acceptance evidence; do not infer those passes from a successful release smoke.

## Korean locale extension (2026-10-03)

The owner requested Korean as the fourth public locale. Japanese remains the root/default language. Each locale has eight top-level pages and seven report detail pages. Korean uses the same approved design, source images, historical source documents and shared factual fields, with complete Korean interface, editorial copy, metadata, accessible image text and record summaries. Original source titles and archived bodies retain their declared source language. Korean system-font fallbacks and word-boundary wrapping add no webfont payload.

`pnpm test:ops` includes dictionary shape/nonempty-value/ID/URL parity, Korean copy checks, and all 240 source-to-target route-switch combinations. Existing content, static-output and production-smoke checks cover all four locales, including Korean 404s and metadata alternates. Review the fourth language link and Korean navigation at narrow widths before release.
