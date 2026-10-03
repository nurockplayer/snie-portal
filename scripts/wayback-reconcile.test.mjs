import test from "node:test"
import assert from "node:assert/strict"
import fs from "node:fs/promises"
import os from "node:os"
import path from "node:path"
import { canonicalKey, createPlan, fields, limits, parseCdx, reconcile, requestCdx, serialize, sha256, validateCache, validateLimits } from "./wayback-reconcile.mjs"

const digestA = "A".repeat(32), digestB = "B".repeat(32)
const registry = (urls = ["https://example.org/page/", "https://example.org/other/"]) => ({ schemaVersion: 1, purpose: "bounded-wayback-index-reconciliation", sources: [{ id: "declared-source", canonicalUrl: "https://example.org/", publicationAllowed: false, queries: urls.map((url, index) => ({ id: `query-${index}`, url, purpose: "Test an exact public fixture URL" })) }] })
const row = (original = "https://example.org/page/", digest = digestA, timestamp = "20240522173115") => [timestamp, original, "200", "text/html", digest]
const body = (...rows) => JSON.stringify([fields, ...rows])
const clock = () => "2026-10-02T00:00:00.000Z"
async function directory(t) { const dir = await fs.mkdtemp(path.join(os.tmpdir(), "snie-cdx-")); t.after(() => fs.rm(dir, { recursive: true, force: true })); return dir }

test("registry declares 67 exact queries, no raw archive or publication promotion", async () => {
  const real = JSON.parse(await fs.readFile(new URL("../archive/source-registry.json", import.meta.url), "utf8"))
  const { queries } = createPlan(real)
  assert.equal(real.sources.length, 5)
  assert.equal(queries.length, 67)
  assert.equal(queries[0].id, "canva-legacy-snie-com/historical-image-3")
  assert.ok(real.sources.every((source) => source.publicationAllowed === false))
  assert.ok(queries.every((query) => new URL(query.requestUrl).origin === "https://web.archive.org"))
  assert.ok(queries.every((query) => new URL(query.requestUrl).searchParams.get("matchType") === "exact"))
  assert.equal(queries.filter((query) => query.sourceId === "grupo-historical-site").length, 57)
  assert.equal(queries.filter((query) => query.sourceId === "fc2-historical-2010-site").length, 5)
  assert.ok(!serialize(real).includes("archive/raw/"))
})

test("normalizes declared variants without merging hosts, accounts or significant queries", () => {
  assert.equal(canonicalKey("http://example.org:80/page/?utm_source=mail&b=2&a=1#"), "example.org/page?a=1&b=2")
  assert.equal(canonicalKey("https://example.org/page?a=1&b=2&gclid=x"), "example.org/page?a=1&b=2")
  assert.notEqual(canonicalKey("https://twitter.com/SNIE_13"), canonicalKey("https://x.com/SNIE_13"))
  assert.notEqual(canonicalKey("https://example.org/SNIE_13"), canonicalKey("https://example.org/SNIE_2024"))
  assert.notEqual(canonicalKey("https://example.org/page?id=1"), canonicalKey("https://example.org/page?id=2"))
  for (const url of ["file:///tmp/example", "https://person:secret@example.org/", "https://example.org/*", "https://localhost/", "https://127.0.0.1/", "https://example.org:8443/"]) assert.throws(() => canonicalKey(url))
})

test("fails closed on invalid registry identities, publication flags and expanded bounds", () => {
  for (const mutate of [(r) => delete r.sources[0].id, (r) => delete r.sources[0].queries[0].id, (r) => r.sources[0].publicationAllowed = true, (r) => r.sources.push(r.sources[0]), (r) => r.sources[0].queries.push(r.sources[0].queries[0])]) {
    const r = registry(); mutate(r); assert.throws(() => createPlan(r))
  }
  assert.throws(() => validateLimits({ maxQueries: 81 }))
  assert.throws(() => validateLimits({ delayMs: 1 }))
  assert.throws(() => validateLimits({ maxResults: Infinity }))
  assert.throws(() => validateLimits({ imaginary: 1 }))
})

test("parses all capture fields and rejects malformed or scope-escaping responses", () => {
  const query = createPlan(registry()).queries[0]
  const parsed = parseCdx(body(row("http://example.org/page?utm_source=x")), query, limits)
  assert.equal(parsed.captures[0].status, "200")
  assert.equal(parsed.captures[0].mime, "text/html")
  assert.equal(parsed.captures[0].publicationAllowed, false)
  assert.match(parsed.captures[0].replayUrl, /^https:\/\/web.archive.org\/web\/20240522173115\//)
  assert.deepEqual(parseCdx("[]", query, limits), { captures: [], truncated: false })
  for (const invalid of ["", "<html>blocked</html>", "{}", "[[\"wrong\"]]", body(row("https://elsewhere.example/page")), body(row(undefined, digestA, "20240230173115")), body(row(undefined, "invalid"))]) assert.throws(() => parseCdx(invalid, query, limits))
})

test("same caches produce byte-identical output online and offline", async (t) => {
  const cacheDir = await directory(t); let requests = 0; const delays = []
  const online = await reconcile(registry(), { online: true, cacheDir, now: clock, wait: async (ms) => delays.push(ms), fetchImpl: async (url, init) => { requests++; assert.equal(init.redirect, "manual"); assert.ok(init.signal); return new Response(body(row(new URL(url).searchParams.get("url"))), { headers: { "content-type": "application/json" } }) } })
  const offline = await reconcile(registry(), { cacheDir, fetchImpl: () => assert.fail("Offline mode must not fetch") })
  assert.equal(requests, 2)
  assert.deepEqual(delays, [1500])
  assert.equal(serialize(online), serialize(offline))
  assert.equal(online.coverage["capture-located"], 2)
  assert.equal(online.coverage.incomplete, false)
  const cache = JSON.parse(await fs.readFile(path.join(cacheDir, createPlan(registry()).queries[0].cacheFile), "utf8"))
  assert.equal(cache.responseSha256, sha256(cache.body))
  assert.equal(cache.queriedAt, clock())
})

for (const [status, outcome] of [[429, "rate-limited"], [503, "query-failed"], [403, "query-blocked"], [302, "query-blocked"]]) {
  test(`HTTP ${status} stops without retry, redirect following or false no-capture`, async (t) => {
    const cacheDir = await directory(t); let requests = 0
    const report = await reconcile(registry(), { online: true, cacheDir, now: clock, fetchImpl: async (_url, options) => { requests++; assert.equal(options.redirect, "manual"); return new Response("blocked", { status, headers: { location: "https://outside.example/secret", "retry-after": "1" } }) } })
    assert.equal(requests, 1)
    assert.equal(report.results[0].outcome, outcome)
    assert.equal(report.results[1].outcome, "query-blocked")
    assert.equal(report.coverage["no-capture-returned"], 0)
    assert.equal(report.coverage.incomplete, true)
  })
}

test("network error and HTML challenge are explicit failed queries", async (t) => {
  for (const fetchImpl of [async () => { throw new Error("token=private-test-value") }, async () => new Response("<html>not CDX</html>")]) {
    const report = await reconcile(registry(), { online: true, cacheDir: await directory(t), now: clock, fetchImpl })
    assert.equal(report.results[0].outcome, "query-failed")
    assert.equal(report.coverage["no-capture-returned"], 0)
    assert.ok(!serialize(report).includes("private-test-value"))
  }
})

test("empty valid CDX is distinct from an offline missing cache", async (t) => {
  const cacheDir = await directory(t)
  const missing = await reconcile(registry(), { cacheDir, fetchImpl: () => assert.fail("must not fetch") })
  assert.equal(missing.coverage["query-blocked"], 2)
  const report = await reconcile(registry(), { online: true, cacheDir, now: clock, wait: async () => {}, fetchImpl: async () => new Response("[]") })
  assert.equal(report.coverage["no-capture-returned"], 2)
})

test("groups exact digest plus canonical source key and retains every provenance row", async (t) => {
  const report = await reconcile(registry(["https://example.org/page/"]), { online: true, cacheDir: await directory(t), now: clock, fetchImpl: async () => new Response(body(row(), row("http://example.org/page?utm_source=x", digestA, "20240610121846"), row(undefined, digestB), row(undefined, "-"))) })
  assert.equal(report.results[0].captures.length, 4)
  assert.equal(report.digestGroups.length, 2)
  assert.equal(report.digestGroups[0].members.length, 2)
  assert.equal(report.digestGroups[1].members.length, 1)
  assert.equal(report.coverage.captureRows, 4)
})

test("request, result and response-byte bounds stop further work honestly", async (t) => {
  let requests = 0
  const r = await reconcile(registry(), { online: true, cacheDir: await directory(t), bounds: { maxQueries: 1 }, now: clock, fetchImpl: async () => { requests++; return new Response("[]") } })
  assert.equal(requests, 1); assert.equal(r.results[1].outcome, "query-blocked")
  const q = createPlan(registry()).queries[0]
  const huge = await requestCdx(q, { ...limits, maxResponseBytes: 8 }, { now: clock, fetchImpl: async () => new Response("a".repeat(9)) })
  assert.equal(huge.status, 200); assert.equal(huge.responseBodyComplete, false)
  const declared = await requestCdx(q, { ...limits, maxResponseBytes: 8 }, { now: clock, fetchImpl: async () => new Response("[]", { headers: { "content-length": "9" } }) })
  assert.equal(declared.status, 200); assert.equal(declared.responseBodyComplete, false)
  requests = 0
  const budget = await reconcile(registry(), { online: true, cacheDir: await directory(t), bounds: { resultsPerQuery: 1, maxResults: 1 }, now: clock, fetchImpl: async () => { requests++; return new Response(body(row())) } })
  assert.equal(requests, 1); assert.equal(budget.results[0].truncated, true); assert.equal(budget.results[1].outcome, "query-blocked")
})

test("rejects tampered or mismatched caches before using evidence", async (t) => {
  const q = createPlan(registry()).queries[0]
  const cache = await requestCdx(q, limits, { now: clock, fetchImpl: async () => new Response("[]") })
  validateCache(cache, q, limits)
  assert.throws(() => validateCache({ ...cache, body: "{}" }, q, limits), /integrity/)
  assert.throws(() => validateCache({ ...cache, requestUrl: "https://outside.example" }, q, limits), /identity/)
  const cacheDir = await directory(t)
  await fs.writeFile(path.join(cacheDir, q.cacheFile), "invalid")
  await assert.rejects(reconcile(registry(), { online: true, cacheDir, fetchImpl: () => assert.fail("no retry for corrupt cache") }), /Unreadable cache/)
})

test("duplicate exact requests fail before network and oversized 429 retains rate-limit identity", async (t) => {
  assert.throws(() => createPlan(registry(["https://example.org/page/", "https://example.org/page/"])), /Duplicate exact request/)
  let requests = 0
  const report = await reconcile(registry(), { online: true, cacheDir: await directory(t), bounds: { maxResponseBytes: 8 }, now: clock, fetchImpl: async () => { requests++; return new Response("a".repeat(9), { status: 429 }) } })
  assert.equal(requests, 1)
  assert.equal(report.results[0].outcome, "rate-limited")
  assert.equal(report.results[0].httpStatus, 429)
})

test("aggregate byte bounds constrain subsequent reads and cached replay", async (t) => {
  const cacheDir = await directory(t); let requests = 0
  const report = await reconcile(registry(), { online: true, cacheDir, bounds: { maxTotalBytes: 3 }, now: clock, wait: async () => {}, fetchImpl: async () => { requests++; return new Response("[]") } })
  assert.equal(requests, 2)
  assert.equal(report.results[0].outcome, "no-capture-returned")
  assert.equal(report.results[1].outcome, "query-failed")
  assert.ok(report.coverage.responseBytes <= 3)
  assert.equal(serialize(report), serialize(await reconcile(registry(), { cacheDir, bounds: { maxTotalBytes: 3 } })))
})

test("cache digest keeps exact UTF-8 bytes including a BOM", async () => {
  const text = "\uFEFF[]", q = createPlan(registry()).queries[0]
  const cache = await requestCdx(q, limits, { now: clock, fetchImpl: async () => new Response(text) })
  assert.equal(cache.body, text)
  assert.equal(cache.responseSha256, sha256(Buffer.from(text)))
  assert.equal(cache.responseBytes, Buffer.byteLength(text))
})

test("reviewed 67-query evidence replays byte-identically without network", async () => {
  const real = JSON.parse(await fs.readFile(new URL("../archive/source-registry.json", import.meta.url), "utf8"))
  const bundle = JSON.parse(await fs.readFile(new URL("../archive/evidence/2026-10-02-wayback-cdx.json", import.meta.url), "utf8"))
  const expected = await fs.readFile(new URL("../archive/evidence/2026-10-02-reconciliation.json", import.meta.url), "utf8")
  const report = await reconcile(real, { cacheBundle: bundle, bounds: { maxQueries: 67 }, fetchImpl: () => assert.fail("Evidence replay must not request the network") })
  assert.equal(serialize(report), expected)
  assert.equal(bundle.caches.length, 67)
  assert.equal(report.coverage["capture-located"], 4)
  assert.equal(report.coverage["no-capture-returned"], 63)
  assert.equal(report.results[0].captures[0].timestamp, "20240522173943")
  assert.ok(bundle.caches.every((cache) => cache.status === 200 && cache.responseBodyComplete))
  await assert.rejects(reconcile(real, { cacheBundle: bundle, online: true }), /offline-only/)
  await assert.rejects(reconcile(real, { cacheBundle: { ...bundle, registrySha256: "tampered" } }), /digest/)
  await assert.rejects(reconcile(real, { cacheBundle: { ...bundle, caches: [...bundle.caches, bundle.caches[0]] } }), /duplicate/)
})

test("no chosen cache directory retains non-200 or invalid-CDX error content", async (t) => {
  const sentinel = "token=private-test-value"
  for (const [status, responseBody] of [[403, sentinel], [429, sentinel], [200, `<html>${sentinel}</html>`], [200, body(row(`https://outside.example/?${sentinel}`))]]) {
    const cacheDir = await directory(t)
    const report = await reconcile(registry(), { online: true, cacheDir, now: clock, fetchImpl: async () => new Response(responseBody, { status }) })
    assert.notEqual(report.results[0].outcome, "no-capture-returned")
    const files = await fs.readdir(cacheDir)
    assert.equal(files.length, 1)
    const persisted = await fs.readFile(path.join(cacheDir, files[0]), "utf8")
    assert.ok(!persisted.includes(sentinel), "a generic failure record must not retain the sentinel")
    const cache = JSON.parse(persisted)
    assert.equal(cache.status, status)
    assert.equal(cache.responseBodyComplete, false)
    assert.equal(cache.body, "")
    assert.ok(cache.failure)
    assert.equal(report.results[1].outcome, "query-blocked")
  }
})
