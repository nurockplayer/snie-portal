# Archive Strategy — SNIE Public Sources

> **Status**: Draft  
> **Last updated**: 2026-07-14  
> **Purpose**: Define how to preserve SNIE public-facing content for reference and future website use.

## Principles

- Archive only publicly accessible content.
- Respect website terms of service, `robots.txt`, and reasonable rate limits.
- Avoid collecting private or sensitive data.
- Keep raw archives separate from curated website content.
- Record provenance for every archived item.

## Capture methods

### 1. Save original HTML

- Download the full HTML of each page, including inline styles and scripts.
- Preserve the original DOM structure and content as served.
- Store in `archive/raw/html/` with a filename reflecting the source and capture date.

### 2. Save public images and attachments

- Download publicly linked images, PDFs, and other media files.
- Store alongside the HTML capture, preserving relative paths where practical.
- Skip embedded third-party trackers, analytics pixels, and other non-content resources.

### 3. Save page screenshots

- Capture full-page screenshots at a standardized viewport width (e.g., 1280×900).
- Store as PNG in `archive/raw/screenshots/`.
- Useful for visual reference when the original page is no longer reachable.

## Metadata

Every archived item must record:

- **Source URL** — the original URL at time of capture.
- **Capture date** — ISO 8601 timestamp.
- **Capture method** — HTML, screenshot, media download, or combination.
- **Attribution** — content owner and copyright status, as known.
- **Permission status** — whether reuse is permitted (explicit license, implied public access, or unknown).
- **Verification status** — whether the source was confirmed as an official SNIE channel.

## Data governance

- **Do not archive** private messages, non-public account data, user comments containing personal information, or analytics.
- If personal data is inadvertently captured, redact or remove the item.
- Review archived content before it enters the curated website content pipeline.
- Raw archives live in `archive/raw/`; curated content lives separately in the website codebase.

## Future formats

The following may be adopted as the archive matures:

| Format | Use case |
|---|---|
| **WARC** | Standard web archive format for long-term preservation and replay. |
| **Static mirror** | Full offline mirror (e.g., `wget --mirror`) for simple browsing. |
| **Structured content export** | Extracted text and metadata in JSON or Markdown for search and reuse. |

## Actionable next steps

1. Confirm official social media accounts and current website URL with the SNIE team.
2. Verify `robots.txt` and terms of service for each source domain.
3. Decide on WARC vs. simpler storage for the initial archive.
4. Set up the `archive/` directory structure with the metadata template.
