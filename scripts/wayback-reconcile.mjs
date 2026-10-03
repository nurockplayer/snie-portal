import fs from "node:fs/promises"
import path from "node:path"
import { createHash } from "node:crypto"
import { pathToFileURL } from "node:url"

export const endpoint = "https://web.archive.org/cdx/search/cdx"
export const fields = ["timestamp", "original", "statuscode", "mimetype", "digest"]
export const limits = Object.freeze({ maxQueries: 80, resultsPerQuery: 100, maxResults: 2000, maxResponseBytes: 262144, maxTotalBytes: 8388608, timeoutMs: 15000, delayMs: 1500 })
export const canonicalization = "v1: HTTP/HTTPS share a key; default ports and trailing slashes normalize; utm_*, fbclid, gclid are removed; other query pairs are sorted; hosts/accounts and path case remain distinct. Group only a non-empty, non-dash CDX digest with the same canonical source key."
export const sha256 = (value) => createHash("sha256").update(value).digest("hex")
export const serialize = (value) => `${JSON.stringify(value, null, 2)}\n`

function publicUrl(value) {
  const url = new URL(value)
  if (!["http:", "https:"].includes(url.protocol) || url.username || url.password || url.hash || /[*\s]/.test(value)) throw new Error("Expected an exact credential-free HTTP(S) URL")
  if (url.port || !url.hostname.includes(".") || /^(?:localhost|127\.|0\.|10\.|192\.168\.|169\.254\.|\[)/i.test(url.hostname)) throw new Error("Expected a public URL without a custom port")
  return url
}

export function canonicalKey(value) {
  const url = publicUrl(value)
  const params = [...url.searchParams].filter(([key]) => !/^utm_/i.test(key) && !/^(?:fbclid|gclid)$/i.test(key)).sort(([ak, av], [bk, bv]) => ak.localeCompare(bk, "en") || av.localeCompare(bv, "en"))
  const query = new URLSearchParams(params).toString()
  return `${url.hostname.toLowerCase()}${url.pathname.replace(/\/+$/, "") || "/"}${query ? `?${query}` : ""}`
}

export function validateLimits(overrides = {}) {
  const result = { ...limits, ...overrides }
  for (const key of Object.keys(result)) {
    if (!Object.hasOwn(limits, key) || !Number.isSafeInteger(result[key]) || result[key] < 1 || result[key] > limits[key]) throw new Error(`Invalid or expanded bound: ${key}`)
  }
  // A shorter delay increases traffic, so it is not a permitted override.
  if (result.delayMs < limits.delayMs) throw new Error("Request delay cannot be reduced")
  return result
}

export function createPlan(registry, options = {}) {
  const bounds = validateLimits(options)
  if (registry.schemaVersion !== 1 || registry.purpose !== "bounded-wayback-index-reconciliation" || !Array.isArray(registry.sources) || !registry.sources.length) throw new Error("Invalid reconciliation registry")
  const plan = [], ids = new Set(), sourceIds = new Set(), requests = new Set()
  for (const source of registry.sources) {
    if (typeof source.id !== "string" || !/^[a-z0-9-]+$/.test(source.id) || sourceIds.has(source.id) || source.publicationAllowed !== false || !Array.isArray(source.queries) || !source.queries.length) throw new Error("Invalid source or publication boundary")
    sourceIds.add(source.id)
    publicUrl(source.canonicalUrl)
    for (const query of source.queries) {
      if (typeof query.id !== "string" || !/^[a-z0-9-]+$/.test(query.id) || typeof query.purpose !== "string" || !query.purpose) throw new Error("Invalid query identity or purpose")
      publicUrl(query.url)
      const id = `${source.id}/${query.id}`
      if (ids.has(id)) throw new Error("Duplicate query identity")
      ids.add(id)
      const request = new URL(endpoint)
      request.search = new URLSearchParams({ url: query.url, matchType: "exact", output: "json", fl: fields.join(","), limit: String(bounds.resultsPerQuery) }).toString()
      if (requests.has(request.href)) throw new Error("Duplicate exact request would share a cache identity")
      requests.add(request.href)
      plan.push({ id, sourceId: source.id, originalUrl: query.url, canonicalSourceKey: canonicalKey(query.url), requestUrl: request.href, cacheFile: `${sha256(request.href)}.json` })
    }
  }
  if (plan.length > limits.maxQueries) throw new Error("Registry exceeds hard query bound")
  return { bounds, queries: plan }
}

function validTimestamp(value) {
  if (!/^\d{14}$/.test(value)) return false
  const iso = `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}T${value.slice(8, 10)}:${value.slice(10, 12)}:${value.slice(12, 14)}Z`
  return Number.isFinite(Date.parse(iso)) && new Date(iso).toISOString().replace(/[-:TZ.]/g, "").slice(0, 14) === value
}

export function parseCdx(body, query, bounds) {
  // An empty array is CDX's valid empty JSON result. Blank/HTML bodies are failures.
  const rows = JSON.parse(body.replace(/^\uFEFF/, ""))
  if (!Array.isArray(rows)) throw new Error("CDX response is not an array")
  if (!rows.length) return { captures: [], truncated: false }
  if (JSON.stringify(rows[0]) !== JSON.stringify(fields)) throw new Error("Unexpected CDX field schema")
  if (rows.length - 1 > bounds.resultsPerQuery) throw new Error("CDX result limit exceeded")
  const captures = rows.slice(1).map((row) => {
    if (!Array.isArray(row) || row.length !== fields.length || row.some((value) => typeof value !== "string")) throw new Error("Invalid CDX row")
    const [timestamp, original, status, mime, digest] = row
    if (!validTimestamp(timestamp) || !/^(?:[1-5]\d\d|-)$/.test(status) || !/^[\w.+/-]+$/.test(mime) || !/^(?:[A-Z0-9]{16,128}|-)$/.test(digest)) throw new Error("Invalid CDX capture fields")
    if (canonicalKey(original) !== query.canonicalSourceKey) throw new Error("CDX result escaped the declared exact URL")
    return { timestamp, original, status, mime, digest, replayUrl: `https://web.archive.org/web/${timestamp}/${original}`, publicationAllowed: false }
  })
  return { captures, truncated: captures.length === bounds.resultsPerQuery }
}

async function readBoundedBody(response, maxBytes) {
  const declaredLength = Number(response.headers.get("content-length"))
  if (declaredLength > maxBytes) throw new Error("Response byte bound exceeded")
  if (!response.body) return ""
  const reader = response.body.getReader(), chunks = []; let bytes = 0
  try {
    for (;;) {
      const { done, value } = await reader.read()
      if (done) break
      bytes += value.byteLength
      if (bytes > maxBytes) throw new Error("Response byte bound exceeded")
      chunks.push(value)
    }
  } catch (error) { await reader.cancel().catch(() => {}); throw error }
  return new TextDecoder("utf-8", { fatal: true, ignoreBOM: true }).decode(Buffer.concat(chunks))
}

export async function requestCdx(query, bounds, { fetchImpl = fetch, now = () => new Date().toISOString() } = {}) {
  const queriedAt = now()
  let status = null
  const failure = () => ({ schemaVersion: 1, queryId: query.id, requestUrl: query.requestUrl, queriedAt, status, responseBodyComplete: false, failure: "non-200-network-size-encoding-or-invalid-cdx-response", body: "", responseSha256: sha256(""), responseBytes: 0 })
  try {
    const response = await fetchImpl(query.requestUrl, { redirect: "manual", signal: AbortSignal.timeout(bounds.timeoutMs), headers: { "user-agent": "SNIE-Wayback-index-reconciliation/1.0", accept: "application/json" } })
    status = response.status
    if (status !== 200) {
      await response.body?.cancel().catch(() => {})
      return failure()
    }
    const body = await readBoundedBody(response, bounds.maxResponseBytes)
    // Only validated, in-scope CDX JSON may be retained in any cache directory.
    // In particular, a 200 challenge page must not save provider tokens or HTML.
    parseCdx(body, query, bounds)
    return { schemaVersion: 1, queryId: query.id, requestUrl: query.requestUrl, queriedAt, status, contentType: response.headers.get("content-type") ?? "", responseBodyComplete: true, body, responseSha256: sha256(body), responseBytes: Buffer.byteLength(body) }
  } catch {
    // Do not persist platform error messages, headers, credentials, or internal paths.
    return failure()
  }
}

export function validateCache(cache, query, bounds) {
  if (cache.schemaVersion !== 1 || cache.queryId !== query.id || cache.requestUrl !== query.requestUrl || typeof cache.body !== "string" || typeof cache.responseBodyComplete !== "boolean" || !Number.isFinite(Date.parse(cache.queriedAt)) || (cache.status !== null && (!Number.isInteger(cache.status) || cache.status < 100 || cache.status > 599))) throw new Error("Cache identity or schema mismatch")
  if (sha256(cache.body) !== cache.responseSha256 || Buffer.byteLength(cache.body) !== cache.responseBytes || cache.responseBytes > bounds.maxResponseBytes) throw new Error("Cache integrity or response bound mismatch")
}

function classify(cache, query, bounds) {
  if (cache.status === 429) return { outcome: "rate-limited", reason: "HTTP 429; stopped without retry", captures: [], stop: true }
  if (cache.status === null || cache.status >= 500 || cache.status === 408) return { outcome: "query-failed", reason: "Network, timeout, size, encoding or server failure; stopped without retry", captures: [], stop: true }
  if (cache.status !== 200) return { outcome: "query-blocked", reason: `HTTP ${cache.status}; redirects and access restrictions are not followed`, captures: [], stop: true }
  if (!cache.responseBodyComplete) return { outcome: "query-failed", reason: "Incomplete, oversized or invalid response body; stopped", captures: [], stop: true }
  try {
    const parsed = parseCdx(cache.body, query, bounds)
    return { outcome: parsed.captures.length ? "capture-located" : "no-capture-returned", reason: parsed.truncated ? "Result bound reached; coverage is incomplete" : "Bounded exact-URL query", ...parsed, stop: false }
  } catch { return { outcome: "query-failed", reason: "Invalid, out-of-scope or over-limit CDX response; stopped", captures: [], stop: true } }
}

export async function reconcile(registry, { online = false, cacheDir, cacheBundle, bounds: overrides = {}, fetchImpl = fetch, now, wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms)) } = {}) {
  if (!cacheDir && !cacheBundle) throw new Error("An explicit cache directory or offline bundle is required")
  if (online && cacheBundle) throw new Error("A reviewed cache bundle is offline-only")
  const { bounds, queries } = createPlan(registry, overrides)
  const bundled = new Map()
  if (cacheBundle) {
    if (cacheBundle.schemaVersion !== 1 || cacheBundle.registrySha256 !== sha256(serialize(registry)) || !Array.isArray(cacheBundle.caches) || cacheBundle.caches.length > limits.maxQueries) throw new Error("Invalid evidence bundle or registry digest")
    for (const cache of cacheBundle.caches) {
      const query = queries.find((query) => query.requestUrl === cache.requestUrl)
      if (!query || bundled.has(cache.requestUrl)) throw new Error("Unexpected or duplicate bundled query")
      validateCache(cache, query, bounds)
      bundled.set(cache.requestUrl, cache)
    }
  }
  const results = [], groups = new Map(); let stopped = false, totalBytes = 0, totalResults = 0, networkQueries = 0
  for (let index = 0; index < queries.length; index++) {
    const query = queries[index]
    const base = { ...query, publicationAllowed: false }
    if (stopped || index >= bounds.maxQueries || totalBytes >= bounds.maxTotalBytes || totalResults + bounds.resultsPerQuery > bounds.maxResults) {
      results.push({ ...base, outcome: "query-blocked", reason: stopped ? "Not requested after the preceding stop condition" : "Not requested: configured query, byte or result bound", queriedAt: null, captures: [] })
      continue
    }
    const cachePath = cacheDir ? path.join(cacheDir, query.cacheFile) : undefined
    let cache = bundled.get(query.requestUrl)
    try { if (!cache) { if (cacheBundle) throw Object.assign(new Error("Missing bundled cache"), { code: "ENOENT" }); cache = JSON.parse(await fs.readFile(cachePath, "utf8")) } } catch (error) {
      if (error.code !== "ENOENT") throw new Error(`Unreadable cache for ${query.id}`)
      if (!online) { results.push({ ...base, outcome: "query-blocked", reason: "Offline cache missing; no request made", queriedAt: null, captures: [] }); continue }
      if (networkQueries) await wait(bounds.delayMs)
      cache = await requestCdx(query, { ...bounds, maxResponseBytes: Math.min(bounds.maxResponseBytes, bounds.maxTotalBytes - totalBytes) }, { fetchImpl, now })
      networkQueries++
      await fs.mkdir(cacheDir, { recursive: true })
      // Never overwrite an existing response. A new directory is an explicit fresh run.
      await fs.writeFile(cachePath, serialize(cache), { flag: "wx" })
    }
    validateCache(cache, query, bounds)
    if (totalBytes + cache.responseBytes > bounds.maxTotalBytes) {
      stopped = true
      results.push({ ...base, outcome: "query-blocked", reason: "Aggregate response byte bound reached", queriedAt: cache.queriedAt, captures: [] }); continue
    }
    totalBytes += cache.responseBytes
    const result = classify(cache, query, bounds)
    totalResults += result.captures.length
    if (totalResults > bounds.maxResults) {
      stopped = true
      results.push({ ...base, outcome: "query-blocked", reason: "Aggregate result bound reached", queriedAt: cache.queriedAt, captures: [] }); continue
    }
    const { stop, ...data } = result
    stopped = stop
    results.push({ ...base, queriedAt: cache.queriedAt, httpStatus: cache.status, responseSha256: cache.responseSha256, responseBytes: cache.responseBytes, ...data })
    for (const capture of result.captures) {
      if (capture.digest === "-") continue
      const key = `${query.sourceId}\n${query.canonicalSourceKey}\n${capture.digest}`
      const group = groups.get(key) ?? { sourceId: query.sourceId, canonicalSourceKey: query.canonicalSourceKey, digest: capture.digest, members: [] }
      group.members.push({ queryId: query.id, ...capture })
      groups.set(key, group)
    }
  }
  const outcomes = Object.fromEntries(["capture-located", "no-capture-returned", "query-blocked", "rate-limited", "query-failed"].map((outcome) => [outcome, results.filter((result) => result.outcome === outcome).length]))
  return { schemaVersion: 1, registrySha256: sha256(serialize(registry)), bounds, canonicalization, publicationAllowed: false, sourceCount: registry.sources.length, queryCount: queries.length, coverage: { ...outcomes, captureRows: results.reduce((sum, result) => sum + result.captures.length, 0), responseBytes: totalBytes, incomplete: results.some((result) => !["capture-located", "no-capture-returned"].includes(result.outcome) || result.truncated) }, results, digestGroups: [...groups.values()].sort((a, b) => `${a.sourceId}|${a.canonicalSourceKey}|${a.digest}`.localeCompare(`${b.sourceId}|${b.canonicalSourceKey}|${b.digest}`, "en")).map((group) => ({ ...group, members: group.members.sort((a, b) => serialize(a).localeCompare(serialize(b), "en")) })) }
}

async function main() {
  const args = process.argv.slice(2).filter((arg) => arg !== "--")
  const online = args.includes("--online")
  const value = (key, fallback) => { const i = args.indexOf(key); if (i < 0) return fallback; if (!args[i + 1] || args[i + 1].startsWith("--")) throw new Error(`Missing ${key} value`); return args[i + 1] }
  const recognized = new Set(["--online", "--registry", "--cache-dir", "--cache-bundle", "--output", "--max-queries"])
  for (let i = 0; i < args.length; i++) { if (!recognized.has(args[i])) throw new Error(`Unknown option: ${args[i]}`); if (args[i] !== "--online") i++ }
  const registry = JSON.parse(await fs.readFile(value("--registry", "archive/source-registry.json"), "utf8"))
  const output = value("--output", "archive/wayback-reconciliation.json")
  const bundlePath = value("--cache-bundle", undefined)
  const cacheBundle = bundlePath ? JSON.parse(await fs.readFile(bundlePath, "utf8")) : undefined
  const report = await reconcile(registry, { online, cacheDir: value("--cache-dir", "archive/wayback-cache"), cacheBundle, bounds: { maxQueries: Number(value("--max-queries", String(limits.maxQueries))) } })
  await fs.mkdir(path.dirname(output), { recursive: true })
  await fs.writeFile(output, serialize(report))
  console.log(serialize({ output, coverage: report.coverage }))
  // Incomplete evidence is saved, but cannot masquerade as a successful complete scan.
  if (report.coverage.incomplete) process.exitCode = 2
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main().catch((error) => { console.error(error.message); process.exitCode = 1 })
