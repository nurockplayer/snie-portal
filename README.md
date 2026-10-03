# SNIE Portal

Public website for **SNIE — Students Network for International Exchange**.

## Current site

- Japanese default, with complete English and Traditional Chinese routes
- Eight top-level pages per locale, plus seven source-backed activity records per locale: **45 localized routes**
- Photo-led Canva presentation, 80 gallery entries, source attribution, readable historical records and two newsletter PDFs
- Historical contact handles remain explicitly unverified as current channels; there is no verified private contact or photo-removal endpoint
- Static export on [Cloudflare Pages](https://snie-portal.pages.dev), published only from `main`

See [content readiness and limits](docs/mvp-content-readiness.md), the
[current roadmap](docs/mvp-roadmap.md) and [editorial migration record](docs/editorial-content-migration.md).

## Toolchain and setup

Next.js 16.3.8 (App Router), React 19, TypeScript and Tailwind CSS 4.
Use **Node.js 24** and **pnpm 10.33.0**, as declared in `package.json`.

```sh
pnpm install --frozen-lockfile
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). Build with `pnpm build`;
the static artifact is written to `out/`.

## Verification

```sh
pnpm lint
pnpm test:content
pnpm test:ops
pnpm test:archive
pnpm test:media
pnpm test:images
pnpm build
pnpm check:mvp
```

`test:content` checks the existing activity-report model. `test:ops` covers
routing, metadata, social preview, menu dismissal and contact-copy behavior.
`test:archive` uses offline CDX fixtures and reviewed evidence only; it does
not request the Internet Archive. Media/image checks validate provenance and
delivery integrity. `check:mvp` retains its original command name while
validating the current 45-route site, not only the initial MVP.

After deployment, set `EXPECTED_DEPLOY_COMMIT` to the exact main SHA and run
`pnpm smoke:production`. See the [release runbook](docs/cloudflare-release-runbook.md)
for preview, browser checks, deployment identity, caching and rollback.

## Content and publication

Interface copy lives in `src/i18n/dictionaries/{ja,en,zh-TW}.json`; shared facts
and curated content live in `src/content/`. Keep critical dates, source URLs
and publication state shared across locales. The seven dated reports use
`recent-records.json`; see [activity-record authoring](docs/activity-records.md).

Use source-backed facts only. Keep drafts on branches and draft pull requests.
An archive index hit or public photo URL does not by itself grant publication
approval. Current organization/contact verification remains separate from
historical source context. See [content governance](docs/content-governance.md)
and the [Direct Git decision](docs/content-management-decision.md).

## Branching and release

1. Create feature branches from `develop`; open draft PRs targeting `develop`.
2. Require the exact reviewed tree, applicable tests, hosted build and Cloudflare preview before merge. UI changes also require relevant browser checks.
3. Squash-merge feature PRs into `develop`.
4. Release `develop` to `main` with a normal merge commit, preserving ancestry.
5. Verify the final Cloudflare source SHA and public smoke before calling the release complete.

Never commit directly to `main` or `develop`. If a local build is unavailable,
record that fact and require the same build/route gate on the exact hosted CI
candidate; do not present a skipped local check as a pass.

## Project structure

```text
src/app/(site)/[locale]/          Localized pages and news/[slug] records
src/app/(redirect)/              Default-locale redirect fallback
src/app/global-not-found.tsx     Global static error template
src/app/globals.css              Implemented editorial styles
src/components/                 Shared page and navigation components
src/content/                    Curated records, photos and provenance
src/i18n/                       Dictionaries, routes and metadata helpers
public/                         Approved hosted assets and Pages rules
scripts/                        Validation, smoke and bounded archive tools
archive/                        Source registry and reviewed CDX index evidence
```

The [bounded archive reconciliation](docs/historical-archive.md) documents the
67 exact URL queries and deterministic offline replay. Raw historical captures
and private preservation packages are not added by that tool. This is a public
repository: a file outside `public/` is still potentially public through GitHub.
