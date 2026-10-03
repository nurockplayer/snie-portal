# Bounded Wayback index reconciliation

This is a source-only implementation of issue #60. It adopts the minimum public URL registry needed from PR #61 at `a2da0ad22ff36da8eec8a52707ad5c91203544f2`; it does not merge that historical crawler, its raw HTML/PDF package, or later private preservation files. PR #61's separate crawler repairs remain outside this implementation. Existing website content and publication decisions are unchanged.

## Scope and safety boundary

`archive/source-registry.json` declares 67 exact public URLs across five sources:

- Three historical-only Canva image URLs, with the unresolved third timestamp queried first
- Seventeen Grupo page URLs and 40 exact Grupo media URLs
- Five FC2 page/attachment URLs
- The exact auone predecessor and historical Twitter profile URLs already recorded in the baseline

No wildcard, host, domain, discovery or recursive query is supported. The registry retains a pointer to the exact baseline commit rather than copying its raw archive, outbound links, form fields or contact details. Every source and output record has `publicationAllowed: false`. This means that newly found archive evidence cannot authorize website publication; it does not revoke or override separately approved existing website content.

Only `https://web.archive.org/cdx/search/cdx` is requested. Original sites and replay URLs are never fetched. Redirects are manual and never followed, including redirects to other paths on archive.org. A 403 or other access restriction is `query-blocked`; HTTP 429 is `rate-limited`; server, timeout, encoding, size and network failures are `query-failed`. Any such response stops further network requests. There are no retries, alternate origins, authentication, CAPTCHA handling or attempts to bypass restrictions.

## Commands

Offline is the default and CI uses only synthetic fixtures:

```sh
pnpm test:archive
pnpm reconcile:wayback -- --cache-dir archive/wayback-cache/approved-run
```

An explicit live run requires `--online` and a new, purpose-named cache directory:

```sh
pnpm reconcile:wayback -- --online --cache-dir archive/wayback-cache/2026-10-02-first --max-queries 67
```

The default report is `archive/wayback-reconciliation.json`. Use `--output` to select another local report. Cache directories and the default report are Git-ignored. Existing cache files are replayed without network and never overwritten. Choose a new directory only for a separately intended new check; do not use a fresh directory to evade a stop/access restriction. Cache corruption aborts instead of silently refetching. Reports return exit code 2 for incomplete coverage and exit code 1 for invalid configuration/cache; these are not successful complete scans.

The specifically reviewed public evidence bundle can be reproduced without network:

```sh
pnpm reconcile:wayback -- --cache-bundle archive/evidence/2026-10-02-wayback-cdx.json --max-queries 67 --output /tmp/snie-wayback-replayed.json
cmp /tmp/snie-wayback-replayed.json archive/evidence/2026-10-02-reconciliation.json
```

`--cache-bundle` is offline-only, verifies its exact registry digest and all response hashes, and cannot be combined with `--online`. The committed bundle contains only successful CDX JSON with the five requested public index fields. Every original URL was checked against its declared source; no extra query strings, credentials, error pages, snapshot bodies or private archive bytes enter that bundle. The offline test suite also verifies byte-for-byte replay of this reviewed evidence.

The hard limits are 80 declared queries, 100 rows per query, 2,000 total rows, 256 KiB per response, 8 MiB total retained response bytes, a 15-second request timeout, and 1.5 seconds between requests. The run can reduce query or result/byte bounds; it cannot expand them. A result exactly at the per-query bound is marked truncated, without assuming there are no more captures. Work skipped after a stop, missing offline cache, or budget exhaustion is explicitly `query-blocked`, never `no-capture-returned`.

## Cache and deterministic output

Each cache file is keyed by the SHA-256 of the exact CDX request URL. It stores query identity, request URL, original query time, HTTP status, whether the response body is complete, and the exact UTF-8 response text, byte count and SHA-256 only after validating HTTP 200 and every CDX row against the declared scope. Non-200 bodies are cancelled without reading; HTML challenges, malformed or out-of-scope CDX, and other failed bodies are discarded before writing any cache directory. Failure records preserve the HTTP status when known and a generic category rather than platform messages, error pages or credentials. A response that cannot be safely retained is marked incomplete and cannot produce capture evidence.

Every report includes the registry digest, all bounds, canonicalization version, per-query response digest and query time, and the complete declared query plan. Replaying the same registry, limits and cache files produces byte-identical output; the time of replay is deliberately excluded.

CDX timestamp, original URL, status, MIME type, digest and replay URL are preserved. HTTP/HTTPS and trailing-slash variants share a canonical source key; `utm_*`, `gclid`, and `fbclid` are removed from that key while remaining in the original URL. Other query parameters are sorted and retained. Hostnames, account names and path case remain distinct. Captures group only when a nonempty, non-dash archive digest and the canonical source key match within the same declared source. Every original provenance row remains in the group and query result. Unknown digests do not prove identical bytes.

## Coverage and publication limits

### Observed 2026-10-02 UTC

The bounded run completed all 67 exact queries from 23:52:34 to 23:57 UTC. Four URLs returned five capture rows; 63 returned valid empty CDX results. There were no blocked, rate-limited, failed or truncated results. The actual CDX response bodies totaled 1,091 bytes. This is complete only for this declared bounded query plan, not all SNIE history or all possible archive URL variants.

The previously unresolved third Canva image (`2d310df4b3526c44bd48dc5068f3b890.jpg`) now has an exact index timestamp: **2024-05-22 17:39:43 UTC**, status 200, MIME `image/jpeg`, digest `6EYAW65W76VNEZNM6YB6OMDVHJOGYZFM`. The two other known image timestamps were reconfirmed (17:56:09 and 18:02:39 UTC on that date). The Grupo homepage returned the two already-known 2013/2020 captures. This adds one exact timestamp to the prior evidence; it does not add a downloaded or verified snapshot.

The declared Grupo inner pages and 40 media URLs, five FC2 URLs, auone URL and old Twitter URL returned no rows in these exact queries. Those preservation gaps remain unresolved; no-capture-returned must not be restated as proof that no snapshots exist. No original URL, replay page, image, PDF, account or historical contact was fetched during this reconciliation.

The tool distinguishes `capture-located`, `no-capture-returned`, `query-blocked`, `rate-limited`, and `query-failed`. Even a successful bounded empty CDX result means only that this query returned no rows, not that no snapshot ever existed. A located capture is an index reference, not a verified replay or downloaded artifact.

No newly located text, photograph, identity, date, event claim, attachment, ownership, consent or account continuity is established automatically. Do not copy local live caches or raw archive material into a public commit without a separate privacy/content review. The historical third-image timestamp, incomplete Grupo/FC2/auone coverage and other unresolved gaps remain open whenever the recorded live query could not establish them.

Primary API reference: [Internet Archive CDX server documentation](https://github.com/internetarchive/wayback/blob/master/wayback-cdx-server/README.md). Queries request JSON, an exact match, explicit fields and a fixed result limit; server-side digest collapse is intentionally not used because it can discard provenance.
