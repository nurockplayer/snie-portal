# SNIE Historical Archive

> **Status:** Phase 2 foundation active
>
> **Capture:** 2026-08-23T13:43:35.000Z
>
> **Starting `main`:** `a7f234553fb3b590fb8cb123ebb66f8e80173a5d`

This archive preserves evidence from bounded public sources. It is not portal content, an ownership determination, a consent record, or permission to republish.

## State model

Every source records five independent states. A source may be discovered and archived while remaining unstructured, unverified, and unpublished.

| Dimension | Meaning | Current Phase 2 result |
|---|---|---:|
| `discovery` | An exact public URL and discovery evidence were recorded. | 13 sources |
| `archive` | Raw bytes, metadata only, an external snapshot only, partial evidence, or unavailability. | 4 sources with raw captures |
| `structure` | Whether historical claims were normalized into reviewed content. | 0 content-structured sources |
| `verification` | Strength and kind of evidence that a channel represented SNIE. | 0 explicitly owner-verified sources |
| `publication` | A separate content-owner decision with a review trail. | 0 publishable sources |

`publishable` is derived, not inferred. It becomes true only when `publication.status` is `approved` and `reviewedBy`, `reviewedAt`, and `decisionRef` are all present. Public accessibility, a successful capture, cross-source agreement, or an “official” self-description cannot approve publication.

## Artifacts

| Path | Purpose |
|---|---|
| `archive/source-registry.json` | Human-reviewed source boundaries, evidence, exclusions, rights status, Wayback references, and independent states. |
| `archive/archive-manifest.json` | Generated page/resource provenance, HTTP observations, byte counts, SHA-256 digests, duplicate groups, and coverage. |
| `archive/raw/2026-08-23T13-43-35-000Z/` | Exact allowlisted HTML and first-party PDF responses. This directory is outside `public/` and `src/` and is never served by Next.js. |
| `scripts/historical-archive.mjs` | Dependency-free bounded crawler and validator. |
| `scripts/historical-archive*.test.mjs` | Offline behavior and committed-artifact integrity tests. |

Raw HTML may contain inactive form markup, social-share links, or provider challenge markup exactly as served. The crawler never submits forms, follows comments, fetches trackers, or recursively traverses those URLs.

## Reproducible capture

Edit the registry first. Every page must be an exact allowlisted URL with allowed origins, expected content types, size limits, capture mode, and a stable ID.

```bash
pnpm crawl:archive -- --captured-at 2026-08-23T13:43:35.000Z
pnpm test:archive
```

Use a truthful normalized UTC timestamp for a new capture. Equivalent registry and HTTP inputs serialize deterministically, while live pages may legitimately change. The full timestamp is part of each raw path, and the crawler refuses an existing timestamp instead of overwriting it.

The crawler is fail-closed:

- exact page allowlists; no recursive page discovery;
- HTTP(S)-only URLs with no embedded credentials;
- final origins checked after redirects;
- `robots.txt` checked per crawled origin;
- explicit content-type, resource-count, link-count, response-size, timeout, and rate limits;
- a 100 MB aggregate raw-capture ceiling;
- scope-escaping seeds and declared pages rejected;
- raw bytes hashed with SHA-256;
- all raw responses staged and promoted as one timestamp directory only after the crawl succeeds;
- media failures recorded as unavailable rather than silently dropped;
- duplicate groups formed only from identical bytes, never filenames or visual guesses.

Under [RFC 9309](https://www.rfc-editor.org/rfc/rfc9309.html#section-2.3.1.3), a `robots.txt` response in the 400-499 range is recorded as unavailable and its body is not trusted or parsed. This includes FC2's branded cross-origin 404 and the Grupo media host's 403. HTTP 429, server/network errors, and explicit applicable `Disallow` rules still fail closed.

## Phase 2 coverage

Phase 1 covered one live Canva page and 67 unique image URLs in a media-review manifest. It saved no raw page or attachment bytes and had no cross-source state model.

| Measure | Phase 1 | Phase 2 | Increase |
|---|---:|---:|---:|
| Registered archive sources | 1 | 13 | +12 |
| Exact first-party pages/attachments represented | 1 | 24 | +23 |
| Raw archived pages/attachments | 0 | 24 | +24 |
| URL-level media resources | 67 | 155 | +88 |
| Available media resources with SHA-256 | not checked | 152 | +152 |
| Current broken media with external preservation evidence | not checked | 3 | +3 |

The raw archive contains 22 HTML files and two PDFs: 1,631,581 bytes total. The 152 available media URLs resolve to 137 unique content digests and 15 exact duplicate groups. Photo binaries are not stored.

## Newly located primary-source history

### Legacy Canva root

[`https://snie.my.canva.site/`](https://snie.my.canva.site/) is a separate live SNIE-branded page that Phase 1 did not crawl. The capture adds one HTML page and 45 available media resources. Its source-level rights notice is recorded without inferring who the named person is or what rights SNIE holds.

### Canva `/snie-com` history

The current [`/snie-com`](https://snie.my.canva.site/snie-com) page has 67 available media resources. A [2024-05-22 Wayback capture](https://web.archive.org/web/20240522173115/https://snie.my.canva.site/snie-com) preserves an older, smaller version with different source-authored organization-name text and three images that now return 404. All three broken URLs remain in the manifest with verified Wayback preservation evidence; no historical text is promoted as a current fact.

### Historical Grupo site

[`https://snie.grupo.jp/`](https://snie.grupo.jp/) self-identifies as an official club homepage. Phase 2 captures 17 allowlisted HTML pages: the home/about/calendar/album/blog/link/sitemap pages, two 2013 posts, and eight album pages whose source labels span 2012-2013. The album pages reference 40 available, content-distinct photos.

The 40 photo binaries are not committed because identities, consent, authorship, and reuse rights are unknown. The contact page, comment submissions, visitor data, and social timeline are excluded. Bounded Wayback checks located homepage snapshots but not inner-page snapshots, so the still-live inner pages are a preservation risk.

### Historical 2010 FC2 site

[`http://snie2010.web.fc2.com/home2.html`](http://snie2010.web.fc2.com/home2.html) is a live Shift_JIS historical site corroborated by its linked newsletters and source context. HTTPS currently downgrades to HTTP; the manifest records that limitation.

Phase 2 saves three HTML pages and two first-party newsletters:

- `SNIE.pdf`: 343,146 bytes, SHA-256 `1f593084cbb3d4450d6c22717d72ca6ba685d976dadcd97b7870a99c14edbcbc`;
- `SNIE2010.pdf`: 371,521 bytes, SHA-256 `3305c847b8daf37539e8755bceed614d1fe28068676944266fca6ecc771ffc47`.

The staff-labelled page, bulletin board, public uploader, and mail workflow are excluded. A predecessor URL printed in the 2009 newsletter, `http://www.ac.auone-net.jp/~yosshi/`, no longer resolves and yielded no located Wayback capture.

## Social and corroborating sources

- [`SNIE_2024` on X](https://x.com/SNIE_2024) self-identifies as SNIE and is cross-referenced by the two Canva pages. Profile metadata is recorded, but the timeline and media are not archived.
- The Grupo link page points to historical [`SNIE_13`](https://twitter.com/SNIE_13), which is now unavailable and had no located exact Wayback capture. No rename or account-continuity claim is made.
- Instagram handles `snie.2024` and `snie.2025` are recorded as candidates from Canva, X, and a [third-party 2024 interview](https://note.com/mahalkitaq/n/nb211437282a0). Anonymous profile access failed, so neither is treated as verified or archived.
- Four public [JET Japanese Language School](https://jet.ac.jp/newsletter/) newsletters, a [2014 MEXT/JASSO evaluation](https://www.mext.go.jp/b_menu/shingi/chousa/seisaku/001/012/shiryo/__icsFiles/afieldfile/2015/11/10/1363294_03.pdf), and a [2004 JASSO evaluation](https://www.jasso.go.jp/about/disclosure/gyoumu/__icsFiles/afieldfile/2021/02/24/16format.pdf) corroborate SNIE activity across years. They are third-party evidence only and are not mirrored or used as publication approval.

## Remaining gaps and risks

- No content owner has explicitly verified channel ownership, account continuity, identities, dates, rights, or consent in this archive review.
- Instagram could not be inspected anonymously. X was readable only at profile level. An owner-provided platform export is the safest next preservation step.
- Wayback coverage is incomplete: no located FC2 capture, no located auone capture, only Grupo homepage captures, and one preserved Canva image still lacks a recorded exact capture timestamp due CDX rate limiting.
- Historical calendar detail URLs and several FC2-linked services are dead or ambiguous. HTTP 200 alone is not accepted as continuity evidence because domains can change hands.
- Grupo and Canva include restrictive or unknown rights notices. Raw evidence and media digests do not grant reuse rights.
- No screenshots or WARC files are created. They add storage, privacy, replay, and rights complexity without a current reviewed need.
- Live-source recrawls can change dynamic markup, counters, provider challenge tokens, and HTTP headers. Keep each dated manifest/capture together and review diffs before replacing anything.

To publish any historical item, create a separate reviewed content change with exact source provenance, factual verification, rights/consent review, all-locale copy, and an explicit owner decision. Do not edit the archive manifest to simulate approval.
