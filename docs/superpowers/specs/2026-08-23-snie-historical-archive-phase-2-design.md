# SNIE Historical Archive Phase 2 — Design

**Starting point:** `main` at `a7f234553fb3b590fb8cb123ebb66f8e80173a5d`

## Goal

Preserve newly discovered public SNIE history as evidence without treating discovery, public access, or archival capture as permission to publish it on the portal.

## Locked decisions

- Crawl only exact URLs declared in a versioned source registry. Do not recursively mirror sites.
- Save raw HTML and first-party PDF attachments outside the application tree. Record all bytes with SHA-256 provenance.
- For photos and social platforms, save metadata only: source URL, referring page, status, content type, byte size, and digest when safely retrievable. Do not commit photo binaries or social timelines.
- Exclude staff-only/contact endpoints, submitted comments, authenticated content, tracker fetches, and form interaction. Raw allowlisted HTML may retain inactive form or share-link markup exactly as served.
- Reject scope-escaping redirects, robots exclusions, unexpected content types, invalid registry state, and response-size overruns.
- Stage raw responses and promote the complete timestamp directory atomically; never overwrite an existing timestamp.
- Keep five independent states: discovery, archival capture, structuring, source verification, and publication review. Publication is fail-closed and requires an explicit review decision.
- Treat Wayback captures as separate external preservation evidence, never as proof that a source was official or reusable.

## Artifacts

- `archive/source-registry.json`: reviewed crawl boundaries, discovered sources, evidence, exclusions, and publication state.
- `archive/archive-manifest.json`: deterministic crawl output and coverage totals.
- `archive/raw/`: byte-for-byte captures of allowlisted HTML and first-party PDFs; never imported or served by Next.js.
- `scripts/historical-archive.mjs`: bounded crawler and manifest validator.
- `docs/historical-archive.md`: operating procedure, state model, coverage, and risks.

## Verification

Unit tests cover URL boundaries, redirect and robots failures, content-type and size bounds, duplicate digests, deterministic serialization, and fail-closed publication. CI runs these tests before build.
