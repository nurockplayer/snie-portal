# SNIE social preview

All 24 localized pages use one neutral 1200 × 630 PNG at `/images/social/snie-social-card.png`. The image contains only the SNIE acronym and the same organization name already published in all three dictionaries. Japanese, English, and Traditional Chinese image descriptions live in their respective `socialPreview.alt` dictionary entries. There are no photographs, translated slogans, new organization claims, or remote image dependencies.

Implementation decision (2026-10-02): the project owner delegated routine website design and engineering decisions for this optimization work. Under that delegation, this change selects a neutral SNIE-only sharing graphic using the already implemented site colors. It does not record a separate organizational approval of a new logo, identity, slogan, or brand system.

The SVG is the editable source. It adapts the neutral social-card candidate from design PR #62 at `c41573aedc5459483f8ac50db56a6f851911397c`; only this asset is carried into this implementation, and that separate design PR remains unmerged. The existing site palette and typography are retained. This is a website sharing graphic, not a claim that a new official organization brand has been adopted.

To update it, edit `public/images/social/snie-social-card.svg`, run `node scripts/generate-social-preview.mjs`, and visually inspect the resulting PNG. The generator uses the installed Next dependency's Sharp and available SVG fonts, so regeneration can differ across font installations; commit the reviewed PNG and its generated integrity record together. CI verifies the committed source/image hashes, dimensions, and size instead of regenerating the image. Normal builds never fetch a graphic or run a design renderer.

The shared metadata helper adds the absolute production image URL, PNG type, dimensions, and localized alt text to Open Graph, and sets a matching Twitter large-image card. Existing page titles, descriptions, canonical URLs, and language alternates are unchanged. The image uses Cloudflare Pages revalidation defaults and is not covered by the immutable Next-assets rule.

Verification:

- `pnpm test:ops` includes positive and negative PNG, content-type, dimensions, integrity, metadata, and binary-fetch checks
- `pnpm check:mvp` checks every localized static page and the exported PNG
- `pnpm smoke:production` checks metadata on all 24 routes and downloads the actual PNG to reject missing images, HTML fallbacks, bad MIME types, non-PNG content, and wrong dimensions

References: [Next.js metadata](https://nextjs.org/docs/app/api-reference/functions/generate-metadata), [Open Graph image properties](https://ogp.me/).
