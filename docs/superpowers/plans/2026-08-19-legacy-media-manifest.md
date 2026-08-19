# Legacy SNIE Media Manifest Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Crawl the approved Canva legacy site reproducibly, preserve a reviewable remote-media manifest, and render only reviewed media in the static SNIE Portal.

**Architecture:** `scripts/legacy-media-crawler.mjs` owns pure extraction/normalization and bounded network crawling using Node built-ins. The generated `src/content/media-manifest.json` is the repository-readable source of truth; `src/content/media-review.json` contains stable human review overrides that the crawler merges into the generated entries. The homepage consumes a typed publishable-media selector and a small client image wrapper that falls back to localized text when the original remote URL fails.

**Tech Stack:** Node.js 24 built-ins (`fetch`, `node:test`, `node:crypto`), Next.js App Router static export, TypeScript, Tailwind CSS, JSON i18n dictionaries.

**Spec:** GitHub Issue #38, parent Issue #22, `docs/content-inventory.md`, `docs/archive-strategy.md`, and `docs/content-governance.md`.

## Global Constraints

- Crawl only `https://snie.my.canva.site/snie-com` and same-origin pages below `/snie-com`.
- Check and respect the approved source's `robots.txt`, use a bounded page count, and apply a delay between requests.
- Extract `img`/`source` `src` and `srcset` URLs, resolve them against the page URL/base URL, remove fragments, reject unrelated origins, deduplicate, and sort.
- Do not download or commit image binaries, mirror to R2, scrape social media, or add a runtime image optimizer/backend.
- Preserve source URLs, page provenance, source alt/caption/context, dimensions when detectable, capture timestamp, and explicit reuse/consent review state.
- A committed manifest is deterministic for a fixed input and fixed capture timestamp; live crawl timestamps are passed explicitly by the reproducible command.
- All public copy is localized in `ja`, `en`, and `zh-TW`; do not invent organization facts, identities, dates, event names, or photo descriptions.
- The existing `output: "export"` build must continue to pass.

### Task 1: Establish crawler interfaces with failing tests

**Files:**
- Create: `scripts/legacy-media-crawler.test.mjs`
- Modify: `package.json`
- Create: `docs/superpowers/plans/2026-08-19-legacy-media-manifest.md`

**Interfaces:**
- Tests will import `extractImageReferences`, `normalizeUrl`, `deduplicateAssets`, `parseRobotsTxt`, and `serializeManifest` from `scripts/legacy-media-crawler.mjs`.
- The test command will be `pnpm test:media` and must run with Node's built-in test runner.

- [ ] **Step 1: Add focused red tests**

  Cover: relative `src`, `srcset` width descriptors, a `<source>` variant, `<base href>`, fragment removal, unrelated-host rejection, repeated primary/variant merging, robots allow/disallow, and identical serialized output for identical input/capture time.

- [ ] **Step 2: Run the focused test command**

  Run `pnpm test:media`. It must fail because the crawler module and test script do not exist yet.

### Task 2: Implement the bounded crawler and deterministic serializer

**Files:**
- Create: `scripts/legacy-media-crawler.mjs`
- Modify: `package.json`

**Interfaces:**
- `normalizeUrl(rawUrl, baseUrl, { allowedOrigin, allowedPathPrefix, page })` returns an absolute URL or `null`.
- `extractImageReferences(html, pageUrl)` returns normalized references with primary URL, responsive variants, source alt/title, and source context.
- `deduplicateAssets(references, capturedAt)` returns sorted manifest asset entries with stable SHA-256-derived IDs and review defaults.
- `parseRobotsTxt(text, userAgent)` returns a path matcher that answers whether a request may proceed.
- `crawlSite({ startUrl, capturedAt, maxPages, delayMs, fetchImpl })` returns page records, merged assets, request counts, and robots metadata.
- `serializeManifest(manifest)` returns canonical JSON with stable key order and a final newline.
- Direct execution accepts `--captured-at`, `--max-pages`, `--delay-ms`, and `--output`; it writes only the manifest JSON.

- [ ] **Step 1: Implement pure URL and HTML extraction helpers**

  Parse quoted/unquoted HTML attributes without a third-party dependency. Include `src`, `srcset`, and `<source srcset>`, retain only HTTP(S) URLs on the approved origin/path, parse integer `w` descriptors, and keep the longest source context available without manufacturing text.

- [ ] **Step 2: Implement robots parsing, bounded same-origin traversal, and rate limiting**

  Fetch `/robots.txt` first, fail closed when the source explicitly disallows a request, skip non-HTML responses and visited URLs, cap page count, and wait between requests after the first page.

- [ ] **Step 3: Implement deterministic asset grouping and manifest serialization**

  Group by normalized primary URL, merge and sort variants/source pages, derive IDs from the primary URL, preserve nullable metadata, and apply review defaults of inventory-only/unconfirmed/not-publishable.

- [ ] **Step 4: Run the focused tests**

  Run `pnpm test:media`; all extraction, normalization, deduplication, robots, and determinism tests must pass.

### Task 3: Generate and inspect the real Canva inventory

**Files:**
- Create: `src/content/media-review.json`
- Create: `src/content/media-manifest.json`
- Create: `docs/legacy-media-crawler.md`

**Interfaces:**
- `media-review.json` maps stable asset IDs to explicit review/reuse/consent decisions and notes; absent entries remain not publishable.
- `media-manifest.json` contains the crawl timestamp, approved source, robots check, crawled page URLs, and sorted assets with original remote URLs.

- [ ] **Step 1: Add reproducible command documentation**

  Document `pnpm crawl:legacy-media -- --captured-at <ISO-8601> --output src/content/media-manifest.json`, the bounds, review workflow, and the no-binaries/no-R2 rule.

- [ ] **Step 2: Run the crawler against the approved URL**

  Use the current UTC capture timestamp explicitly, inspect the generated page/asset counts, confirm the HTML response contains image references without browser rendering, and confirm only the Canva origin appears.

- [ ] **Step 3: Inspect and review candidates conservatively**

  Keep source-provided alt/context unchanged. Only add publishable review overrides for assets whose intended use, consent/reuse state, and non-invented accessible text are explicit; otherwise leave the entry gated and record the risk in the documentation.

- [ ] **Step 4: Re-run with the same capture timestamp and compare bytes**

  Confirm the manifest is byte-for-byte identical for the same source snapshot/timestamp and that no image file appears in `git status`.

### Task 4: Add the publishable-media content boundary and graceful UI

**Files:**
- Create: `src/content/legacy-media.ts`
- Create: `src/components/RemoteMediaImage.tsx`
- Create: `src/components/LegacyMediaSection.tsx`
- Modify: `src/app/(site)/[locale]/page.tsx`
- Modify: `src/i18n/dictionaries/en.json`
- Modify: `src/i18n/dictionaries/ja.json`
- Modify: `src/i18n/dictionaries/zh-TW.json`

**Interfaces:**
- `getPublishableLegacyMedia()` returns only manifest assets with an approved reuse state and confirmed/explicitly non-applicable consent state.
- `RemoteMediaImage` renders an original URL and replaces it with a localized fallback panel on load failure; it does not call Next image optimization.
- `LegacyMediaSection` renders nothing when the selector is empty and otherwise renders a responsive, non-destructive media grid with source-aware captions.

- [ ] **Step 1: Write content-selector and fallback tests**

  Assert that gated entries never reach the publishable selector, approved entries retain their original URL, and the fallback copy exists in all locales.

- [ ] **Step 2: Implement the typed selector and client fallback wrapper**

  Import the JSON manifest on the server, keep the wrapper's client state limited to the failed-image state, and use plain `<img>` attributes (`loading`, `decoding`, `alt`) so static export remains independent of a remote optimizer.

- [ ] **Step 3: Implement and place the localized homepage section**

  Pass dictionary copy from the page, use semantic `section`/`figure`/`figcaption` markup, avoid face-focused or destructive crops, and preserve the source URL in a visible provenance link where a photo is published.

- [ ] **Step 4: Run focused tests and build**

  Run `pnpm test:media`, `pnpm lint`, and `pnpm build`; inspect `out/` for the localized homepage output and confirm no `/api` or image optimizer route is introduced.

### Task 5: Final verification, independent review, and PR publication

**Files:**
- Modify only files already listed above if review finds a blocker.

- [ ] **Step 1: Run the full required validation**

  Run `pnpm test:media`, `pnpm lint`, and `pnpm build` from the final commit candidate. Inspect `git diff --check`, `git status`, generated manifest counts, and `out/` directly.

- [ ] **Step 2: Independently review the final diff against `origin/develop`**

  Check both repository standards and Issue #38/#22 requirements. Fix any blocking or major finding, then rerun the affected checks.

- [ ] **Step 3: Commit only scoped files**

  Use a focused commit message such as `feat: add legacy media manifest and integration`, with no binaries or unrelated documentation edits.

- [ ] **Step 4: Push and open the focused PR**

  Push `codex/issue-38-media-manifest` and create a PR targeting `develop` whose body references `#38` and `#22`, summarizes the crawl/manifest/UI behavior, and reports validation and remaining consent risks. Do not merge.

## Self-review checklist

- The issue's crawler, responsive extraction, normalization, deduplication, provenance, metadata, timestamp, bounds, and robots requirements map to Tasks 1–3.
- The issue's reviewed-photo, original-URL, graceful-fallback, static-export, no-binary, and no-optimizer requirements map to Task 4.
- The issue's lint/build/PR/no-merge requirements map to Task 5.
- No step depends on an unspecified package or a runtime server.
- Determinism is defined relative to a fixed capture timestamp and source response; a live crawl may legitimately produce a new manifest when the source changes.
