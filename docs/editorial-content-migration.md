# SNIE editorial content migration

## Content delivered

- Japanese is the root destination; Japanese, English and Traditional Chinese each have eight pages
- The public brand is SNIE
- Home introduces the three major events, five other activities, four university clubs and three recent source-backed records
- Activities preserves 80 display entries, organized into six recovered Grupo photo albums and two Canva source groups
- About includes the four clubs shown in the Canva snapshot, language-school exchange examples and the anonymous chair interview
- News separates seven verified 2025 activity records from historical source material
- History preserves readable text from all 22 recoverable baseline HTML sources and both 2009/2010 newsletter PDFs
- Join has three distinct participation paths; contact links to the source that actually lists SNIE's contact information

## Provenance and limits

The media archive has 137 unique files, not 137 distinct activity photos. The
photo display groups responsive variants and leaves decorative artwork out of
the activity gallery. `gallery.json` maps display entries to source pages,
original media URLs and hashes. `archive-provenance.json` preserves file-level
source associations. All displayed image bytes are local, with visible source
links and a full-size image link.

The user authorized republication of the former public SNIE content and photos
in this repository for the Cloudflare website. This is not a claim that individual
consent, ownership or a particular license has independently been established.

The recovered baseline comprises 22 HTML sources and two PDFs captured on
2026-08-23. Nineteen later page-version bodies were not available to this
implementation; this is not an exhaustive reconstruction of all revisions.
The two Grupo album entries without recovered photos remain in the historical
source collection rather than being illustrated with unrelated images.

Dates are source-specific. An archive capture date is not an event date. The
anonymous chair is not identified as a current officer. The Canva contact
handles include 2024 in their names, but their current operation is unverified.
Historical affiliations and participation instructions stay within historical
source context. No 2026 event or current officer has been invented.

## Verification

`pnpm check:mvp` covers 24 localized routes, metadata, local links and anchors,
the rendered 80-photo collection, source attribution, image SHA-256 hashes,
all 24 historical source entries and the exact newsletter PDF hashes.

`pnpm test:ops` also checks that the production root can be either the followed
Cloudflare redirect to Japanese or the accessible static fallback.

Cloudflare's immutable source revision is exposed through `/build-info.json`.
Run the public smoke with `EXPECTED_DEPLOY_COMMIT=<exact-main-sha>` to verify
that the live site comes from the expected release, in addition to route,
metadata, sitemap and robots checks. A local build leaves the commit null when
neither Cloudflare nor GitHub supplies a revision.

## Independent review corrections

- Removed adjacent-post navigation dates from the two 2013 article bodies;
  explicit publication dates and a contamination check protect those records
- Added focus-leave and browser-history restoration dismissal for the mobile
  menu, covered by five behavior tests in the operations suite
- Corrected featured-photo captions to use each image's actual album position
- Removed Japanese-only wording from Traditional Chinese interface copy and
  added dictionary parity/wording checks; tagged original Japanese names and
  multilingual historical bodies appropriately
- Updated Next.js and its ESLint configuration to 16.3.8 after the official
  [September 2026 security release](https://nextjs.org/blog/september-2026-security-release).
  Production is static-only, but the supported development server also needs
  the patch. Node 24, pnpm 10.33.0 and Tailwind 4 remain in place
- The existing production-smoke workflow now checks the deployment against
  the exact checked-out main revision, including manual runs
- Pinned every resolved PostCSS instance to 8.5.23 through a pnpm override
  for [GHSA-fxqj-rqcc-2cmp](https://github.com/advisories/GHSA-fxqj-rqcc-2cmp)
