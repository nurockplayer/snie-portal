# Legacy media crawler

Issue #38 uses the documented public legacy source at `https://snie.my.canva.site/snie-com`.
The crawler only follows same-origin HTML pages under `/snie-com`, checks the
source `robots.txt`, applies a bounded page count and request delay, and records
remote URLs without downloading image binaries.

## Reproducible crawl

Pass the capture timestamp explicitly so the same source response produces the
same manifest bytes:

```sh
pnpm crawl:legacy-media -- \
  --captured-at 2026-08-19T00:00:00.000Z \
  --max-pages 20 \
  --delay-ms 250 \
  --output src/content/media-manifest.json
```

The default output is `src/content/media-manifest.json`. The committed manifest
contains the source page list, raw image-reference count, unique URL count,
stable asset IDs, original URLs, responsive variants, source metadata, detected
source-set widths, and review/consent fields.

## Review workflow

`src/content/media-review.json` is a small stable override map keyed by the
manifest asset ID. The crawler merges an override into the generated entry;
entries absent from the map remain `inventory-only` and `publishable: false`.
Only an explicit `selected-for-publication` review decision may make an entry
publishable. Consent and ownership details remain factual metadata: the
`unknown-public-source` state records that they have not been verified. Under
the current Issue #38 policy, that unknown state is not a separate approval
queue when the asset is already on the documented public legacy source and no
explicit restriction is recorded. Do not add downloaded image files or R2
mirrors in this phase.

For the recorded crawl, three event-section candidates are selected for the
homepage. They retain the source-page URL, use their original public image URLs,
and have localized descriptions limited to visible content. Their review records
do not claim verified consent, ownership, identities, dates, or event details.

The source response was verified experimentally as static HTML: the initial
request returned the page title, `<img>` elements, and responsive `srcset`
references directly, so a JavaScript/browser renderer is not required for this
bounded crawl.

The recorded Issue #38 crawl used capture timestamp
`2026-08-19T10:33:37.000Z` and found one HTML page, 71 raw image/variant
references, 67 unique remote image URLs, and 35 grouped manifest assets. The
source host returned `404` for `/robots.txt`; this is recorded in the manifest
as an absent robots file rather than silently omitted.
