# Archive Strategy — SNIE Public Sources

> **Status**: Phase 2 foundation active
>
> **Last updated**: 2026-08-23
>
> **Purpose**: Define how to preserve SNIE public-facing content for reference and future website use.

## Principles

- Archive only reviewed, allowlisted public sources. Public accessibility does **not** grant permission to reuse or republish; copyright, identity, consent, and licensing must be assessed separately before any curated use.
- Respect website terms of service, `robots.txt`, and reasonable rate limits.
- Avoid collecting private or sensitive data.
- Keep raw archives separate from curated website content.
- Record provenance for every archived item.

## Capture methods

### 1. Save original HTML

- Download the full HTML response of each allowlisted page, including inline styles and scripts.
- Preserve the original DOM structure and content as served.
- Store in `archive/raw/<capture-timestamp>/<source-id>/` with stable page IDs.
- Do not submit forms or recursively crawl contact, comment, staff, authenticated, or user-generated endpoints.

### 2. Save public images and attachments

- Download allowlisted first-party PDFs when their provenance is clear and capture risk is reviewed.
- For photos with unknown identity, consent, authorship, or reuse rights, record URL-level metadata and SHA-256 only; do not commit binaries.
- Skip embedded third-party trackers, analytics pixels, and other non-content resources.

### 3. Optional page screenshots (not used in Phase 2)

- Consider full-page screenshots only after a separate rights, privacy, storage, and viewport review.
- If approved later, record the viewport, rendering environment, source URL, capture time, and digest.

## Metadata

Every archived item must record the fields below. `archive/source-registry.json` is the reviewed input and `archive/archive-manifest.json` is the generated evidence record.

- **Source URL** — the original URL at time of capture.
- **Capture date** — ISO 8601 timestamp.
- **Capture method** — HTML, screenshot, media download, or combination.
- **Attribution** — content owner and copyright status, as known.
- **Permission status** — whether reuse is permitted (explicit approval or unknown).
- **Independent states** — discovery, archive, structure, verification, and publication; none implies another.

## Data governance

- **Do not archive** private messages, non-public account data, user comments containing personal information, or analytics.
- If private or unintended personal data is captured, stop publication review and remove or redact the affected artifact with a documented replacement capture.
- Review archived content before it enters the curated website content pipeline.
- Raw archives live in `archive/raw/`; curated content lives separately in the website codebase.

## Future formats

The following may be adopted as the archive matures:

| Format | Use case |
|---|---|
| **WARC** | Standard web archive format for long-term preservation and replay. |
| **Static mirror** | Reviewed offline replay when exact allowlists are insufficient. |
| **Structured content export** | Extracted text and metadata in JSON or Markdown for search and reuse. |

## Current implementation

See `docs/historical-archive.md` for the state model, exact Phase 2 coverage, capture command, source findings, and remaining risks. WARC and screenshots remain deferred until a reviewed preservation need justifies their additional rights, privacy, and storage surface.
