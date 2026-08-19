# Legacy media crawler

Issue #38 uses the approved Canva source at `https://snie.my.canva.site/snie-com`.
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
Only an explicit reviewed reuse decision and confirmed or explicitly
non-applicable consent state may make an entry publishable. Public availability
alone is not treated as reuse permission. Do not add downloaded image files or
R2 mirrors in this phase.

The source response was verified experimentally as static HTML: the initial
request returned the page title, `<img>` elements, and responsive `srcset`
references directly, so a JavaScript/browser renderer is not required for this
bounded crawl.

The recorded Issue #38 crawl used capture timestamp
`2026-08-19T10:33:37.000Z` and found one HTML page, 71 raw image/variant
references, 67 unique remote image URLs, and 35 grouped manifest assets. The
source host returned `404` for `/robots.txt`; this is recorded in the manifest
as an absent robots file rather than silently omitted.
