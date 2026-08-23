import { createHash } from "node:crypto"
import { access, mkdir, readFile, rename, rm, writeFile } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

export const DEFAULT_REGISTRY_PATH = "archive/source-registry.json"
export const DEFAULT_MANIFEST_PATH = "archive/archive-manifest.json"
export const DEFAULT_RAW_ROOT = "archive/raw"
export const DEFAULT_DELAY_MS = 250
export const DEFAULT_USER_AGENT = "snie-portal-historical-archive/2.0 (+https://github.com/nurockplayer/snie-portal)"

const DISCOVERY_STATES = new Set(["discovered"])
const ARCHIVE_STATES = new Set([
  "not-captured",
  "metadata-only",
  "external-snapshot-only",
  "raw-capture",
  "partial",
  "unavailable",
])
const STRUCTURE_STATES = new Set(["unstructured", "metadata-only", "content-structured"])
const VERIFICATION_STATES = new Set([
  "unverified",
  "candidate",
  "self-identified-official",
  "corroborated-official",
  "external-corroboration",
  "explicitly-verified",
])
const PUBLICATION_STATES = new Set(["not-reviewed", "blocked", "approved"])
const SOURCE_CLASSES = new Set([
  "first-party-candidate",
  "historical-first-party",
  "social-candidate",
  "external-corroboration",
  "dead-source",
])
const CAPTURE_MODES = new Set(["raw", "metadata-only"])
const MAX_REGISTRY_SOURCES = 100
const MAX_PAGES_PER_SOURCE = 50
const MAX_LINKS_PER_PAGE = 500
const MAX_TOTAL_RAW_BYTES = 100_000_000

function compareStrings(left, right) {
  return left < right ? -1 : left > right ? 1 : 0
}

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value)
}

function assertNonEmptyString(value, label) {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`${label} must be a non-empty string`)
  }
}

function normalizeOrigin(value, label) {
  assertNonEmptyString(value, label)

  let url
  try {
    url = new URL(value)
  } catch {
    throw new Error(`${label} must be a valid URL origin`)
  }

  if (!/^https?:$/.test(url.protocol) || url.username || url.password || url.origin !== value) {
    throw new Error(`${label} must be an exact HTTP(S) origin`)
  }

  return url.origin
}

function validateIsoTimestamp(value, label) {
  assertNonEmptyString(value, label)
  const parsed = new Date(value)

  if (Number.isNaN(parsed.valueOf()) || parsed.toISOString() !== value) {
    throw new Error(`${label} must be an ISO 8601 UTC timestamp`)
  }
}

export function derivePublishable(source) {
  const publication = source?.states?.publication

  return Boolean(
    publication?.status === "approved" &&
      typeof publication.reviewedBy === "string" &&
      publication.reviewedBy.trim() !== "" &&
      typeof publication.reviewedAt === "string" &&
      !Number.isNaN(new Date(publication.reviewedAt).valueOf()) &&
      typeof publication.decisionRef === "string" &&
      publication.decisionRef.trim() !== "",
  )
}

function validateSourceStates(source, label) {
  if (!isPlainObject(source.states)) {
    throw new Error(`${label}.states must be an object`)
  }

  if (!DISCOVERY_STATES.has(source.states.discovery)) {
    throw new Error(`${label}.states.discovery is invalid`)
  }
  if (!ARCHIVE_STATES.has(source.states.archive)) {
    throw new Error(`${label}.states.archive is invalid`)
  }
  if (!STRUCTURE_STATES.has(source.states.structure)) {
    throw new Error(`${label}.states.structure is invalid`)
  }
  if (!VERIFICATION_STATES.has(source.states.verification)) {
    throw new Error(`${label}.states.verification is invalid`)
  }

  const publication = source.states.publication
  if (!isPlainObject(publication) || !PUBLICATION_STATES.has(publication.status)) {
    throw new Error(`${label}.states.publication is invalid`)
  }

  if (publication.status === "approved") {
    const complete = [publication.reviewedBy, publication.reviewedAt, publication.decisionRef].every(
      (value) => typeof value === "string" && value.trim() !== "",
    )

    if (!complete) {
      throw new Error(`${label}: approved publication requires reviewedBy, reviewedAt, and decisionRef`)
    }

    validateIsoTimestamp(publication.reviewedAt, `${label}.states.publication.reviewedAt`)
  }
}

function validateCrawl(source, label) {
  if (source.crawl === undefined) {
    return
  }
  if (!isPlainObject(source.crawl)) {
    throw new Error(`${label}.crawl must be an object`)
  }

  const origins = source.crawl.allowedOrigins
  if (!Array.isArray(origins) || origins.length === 0) {
    throw new Error(`${label}.crawl.allowedOrigins must be a non-empty array`)
  }
  const normalizedOrigins = origins.map((origin, index) => normalizeOrigin(origin, `${label}.crawl.allowedOrigins[${index}]`))
  if (new Set(normalizedOrigins).size !== normalizedOrigins.length) {
    throw new Error(`${label}.crawl.allowedOrigins contains duplicates`)
  }

  const pages = source.crawl.pages
  if (!Array.isArray(pages) || pages.length === 0 || pages.length > MAX_PAGES_PER_SOURCE) {
    throw new Error(`${label}.crawl.pages must contain 1-${MAX_PAGES_PER_SOURCE} pages`)
  }

  const pageIds = new Set()
  for (const [index, page] of pages.entries()) {
    const pageLabel = `${label}.crawl.pages[${index}]`
    if (!isPlainObject(page)) {
      throw new Error(`${pageLabel} must be an object`)
    }
    assertNonEmptyString(page.id, `${pageLabel}.id`)
    if (!/^[a-z0-9][a-z0-9-]*$/.test(page.id) || pageIds.has(page.id)) {
      throw new Error(`${pageLabel}.id must be unique kebab-case`)
    }
    pageIds.add(page.id)
    assertNonEmptyString(page.url, `${pageLabel}.url`)
    const normalizedUrl = canonicalizeUrl(page.url, undefined, { allowedOrigins: normalizedOrigins })
    if (!normalizedUrl || normalizedUrl !== page.url) {
      throw new Error(`${pageLabel}.url must be canonical and inside allowedOrigins`)
    }
    if (!Array.isArray(page.expectedContentTypes) || page.expectedContentTypes.length === 0) {
      throw new Error(`${pageLabel}.expectedContentTypes must be a non-empty array`)
    }
    if (!CAPTURE_MODES.has(page.capture)) {
      throw new Error(`${pageLabel}.capture is invalid`)
    }
    if (page.capture === "raw") {
      assertNonEmptyString(page.fileExtension, `${pageLabel}.fileExtension`)
      if (!/^[a-z0-9]+$/.test(page.fileExtension)) {
        throw new Error(`${pageLabel}.fileExtension must be lowercase alphanumeric`)
      }
    }
  }

  if (source.crawl.media !== undefined) {
    const media = source.crawl.media
    if (!isPlainObject(media)) {
      throw new Error(`${label}.crawl.media must be an object`)
    }
    const mediaOrigins = media.allowedOrigins
    if (!Array.isArray(mediaOrigins) || mediaOrigins.length === 0) {
      throw new Error(`${label}.crawl.media.allowedOrigins must be a non-empty array`)
    }
    mediaOrigins.forEach((origin, index) => normalizeOrigin(origin, `${label}.crawl.media.allowedOrigins[${index}]`))
    if (!Number.isSafeInteger(media.maxResources) || media.maxResources < 1 || media.maxResources > 1_000) {
      throw new Error(`${label}.crawl.media.maxResources must be between 1 and 1000`)
    }
    if (!Number.isSafeInteger(media.maxBytesPerResource) || media.maxBytesPerResource < 1) {
      throw new Error(`${label}.crawl.media.maxBytesPerResource must be a positive integer`)
    }
    if (!Array.isArray(media.fromPageIds) || media.fromPageIds.some((id) => !pageIds.has(id))) {
      throw new Error(`${label}.crawl.media.fromPageIds must reference declared pages`)
    }
    if (media.seedResources !== undefined && !Array.isArray(media.seedResources)) {
      throw new Error(`${label}.crawl.media.seedResources must be an array`)
    }
  }
}

export function validateRegistry(registry) {
  if (!isPlainObject(registry) || registry.schemaVersion !== 1) {
    throw new Error("Archive source registry schemaVersion must be 1")
  }
  if (!Array.isArray(registry.sources) || registry.sources.length === 0 || registry.sources.length > MAX_REGISTRY_SOURCES) {
    throw new Error(`Archive source registry must contain 1-${MAX_REGISTRY_SOURCES} sources`)
  }

  const ids = new Set()
  for (const [index, source] of registry.sources.entries()) {
    const label = `sources[${index}]`
    if (!isPlainObject(source)) {
      throw new Error(`${label} must be an object`)
    }
    assertNonEmptyString(source.id, `${label}.id`)
    if (!/^[a-z0-9][a-z0-9-]*$/.test(source.id) || ids.has(source.id)) {
      throw new Error(`${label}.id must be unique kebab-case`)
    }
    ids.add(source.id)
    assertNonEmptyString(source.label, `${label}.label`)
    assertNonEmptyString(source.canonicalUrl, `${label}.canonicalUrl`)
    if (!canonicalizeUrl(source.canonicalUrl, undefined, { allowedOrigins: [new URL(source.canonicalUrl).origin] })) {
      throw new Error(`${label}.canonicalUrl must be HTTP(S) without credentials`)
    }
    if (!SOURCE_CLASSES.has(source.sourceClass)) {
      throw new Error(`${label}.sourceClass is invalid`)
    }
    validateSourceStates(source, label)
    if (!isPlainObject(source.rights) || typeof source.rights.status !== "string") {
      throw new Error(`${label}.rights must record a status`)
    }
    if (!Array.isArray(source.evidence) || source.evidence.length === 0) {
      throw new Error(`${label}.evidence must contain at least one item`)
    }
    for (const [evidenceIndex, evidence] of source.evidence.entries()) {
      assertNonEmptyString(evidence?.url, `${label}.evidence[${evidenceIndex}].url`)
      assertNonEmptyString(evidence?.note, `${label}.evidence[${evidenceIndex}].note`)
    }
    validateCrawl(source, label)
  }

  return registry
}

function shouldDropQueryParameter(name, patterns = []) {
  return patterns.some((pattern) =>
    pattern.endsWith("*") ? name.startsWith(pattern.slice(0, -1)) : name === pattern,
  )
}

export function canonicalizeUrl(rawUrl, baseUrl, boundary = {}) {
  if (typeof rawUrl !== "string" || rawUrl.trim() === "") {
    return null
  }

  let url
  try {
    url = new URL(rawUrl.trim(), baseUrl)
  } catch {
    return null
  }

  if (!/^https?:$/.test(url.protocol) || url.username || url.password) {
    return null
  }

  const allowedOrigins = boundary.allowedOrigins ?? []
  if (allowedOrigins.length > 0 && !allowedOrigins.includes(url.origin)) {
    return null
  }

  url.hash = ""
  for (const name of [...url.searchParams.keys()]) {
    if (shouldDropQueryParameter(name, boundary.dropQueryParameters)) {
      url.searchParams.delete(name)
    }
  }
  url.searchParams.sort()

  return url.toString()
}

function decodeHtmlEntities(value) {
  return value
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#x27;|&#39;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&#x([0-9a-f]+);?/gi, (_, hex) => String.fromCodePoint(Number.parseInt(hex, 16)))
    .replace(/&#([0-9]+);?/g, (_, decimal) => String.fromCodePoint(Number.parseInt(decimal, 10)))
}

function readAttribute(tag, name) {
  const match = tag.match(new RegExp(`\\b${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, "i"))
  return match ? decodeHtmlEntities(match.slice(1).find((value) => value !== undefined) ?? "") : null
}

function resolvePublicUrl(rawUrl, baseUrl) {
  if (typeof rawUrl !== "string" || rawUrl.trim() === "") {
    return null
  }

  try {
    const url = new URL(rawUrl.trim(), baseUrl)
    return /^https?:$/.test(url.protocol) && !url.username && !url.password ? url.toString() : null
  } catch {
    return null
  }
}

function documentBaseUrl(html, pageUrl) {
  const baseTag = html.match(/<base\b[^>]*>/i)?.[0]
  return resolvePublicUrl(baseTag ? readAttribute(baseTag, "href") : null, pageUrl) ?? pageUrl
}

export function extractHtmlReferences(html, pageUrl) {
  const baseUrl = documentBaseUrl(html, pageUrl)
  const links = []
  const media = []

  for (const match of html.matchAll(/<a\b[^>]*>/gi)) {
    const url = resolvePublicUrl(readAttribute(match[0], "href"), baseUrl)
    if (url) links.push(url)
  }

  for (const match of html.matchAll(/<(?:img|source)\b[^>]*>/gi)) {
    const tag = match[0]
    for (const attribute of ["src", "data-src", "data-original"]) {
      const url = resolvePublicUrl(readAttribute(tag, attribute), baseUrl)
      if (url) media.push(url)
    }
    const srcset = readAttribute(tag, "srcset")
    if (srcset) {
      for (const candidate of srcset.split(",")) {
        const rawUrl = candidate.trim().split(/\s+/, 1)[0]
        const url = resolvePublicUrl(rawUrl, baseUrl)
        if (url) media.push(url)
      }
    }
  }

  return {
    links: [...new Set(links)].sort(compareStrings),
    media: [...new Set(media)].sort(compareStrings),
  }
}

function robotsPatternToRegExp(pattern) {
  const endAnchored = pattern.endsWith("$")
  const source = pattern
    .replace(/\$$/, "")
    .split("*")
    .map((part) => part.replace(/[\\^$+?.()|[\]{}]/g, "\\$&"))
    .join(".*")

  return new RegExp(`^${source}${endAnchored ? "$" : ""}`)
}

export function parseRobotsTxt(text, userAgent = DEFAULT_USER_AGENT) {
  const groups = []
  let current = null

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.replace(/#.*$/, "").trim()
    if (!line) {
      current = null
      continue
    }
    const separator = line.indexOf(":")
    if (separator < 0) continue
    const directive = line.slice(0, separator).trim().toLowerCase()
    const value = line.slice(separator + 1).trim()

    if (directive === "user-agent") {
      if (current && current.rules.length === 0) current.agents.push(value.toLowerCase())
      else {
        current = { agents: [value.toLowerCase()], rules: [] }
        groups.push(current)
      }
      continue
    }
    if (current && ["allow", "disallow"].includes(directive) && value !== "") {
      current.rules.push({ allow: directive === "allow", pattern: value, regex: robotsPatternToRegExp(value) })
    }
  }

  const normalizedAgent = userAgent.toLowerCase()
  const productToken = normalizedAgent.split(/[\s/]/, 1)[0]
  const exact = groups.filter((group) => group.agents.includes(productToken))
  const applicable = exact.length ? exact : groups.filter((group) => group.agents.includes("*"))
  const rules = applicable.flatMap((group) => group.rules)

  return (requestPath) => {
    const pathname = requestPath.split(/[?#]/, 1)[0] || "/"
    const matches = rules
      .filter((rule) => rule.regex.test(pathname))
      .sort((left, right) => right.pattern.length - left.pattern.length || Number(right.allow) - Number(left.allow))
    return matches[0]?.allow ?? true
  }
}

export class ArchiveBoundaryError extends Error {
  constructor(message, details = {}) {
    super(message)
    this.name = "ArchiveBoundaryError"
    this.details = details
  }
}

export class ArchiveFetchError extends Error {
  constructor(message, details = {}) {
    super(message)
    this.name = "ArchiveFetchError"
    this.details = details
  }
}

async function readBoundedBody(response, maxBytes) {
  const declaredLength = Number.parseInt(response.headers.get("content-length") ?? "", 10)
  if (Number.isFinite(declaredLength) && declaredLength > maxBytes) {
    throw new ArchiveBoundaryError(`Response exceeded ${maxBytes} bytes`, { declaredLength, maxBytes })
  }

  if (!response.body) return Buffer.alloc(0)
  const reader = response.body.getReader()
  const chunks = []
  let total = 0

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      total += value.byteLength
      if (total > maxBytes) {
        await reader.cancel()
        throw new ArchiveBoundaryError(`Response exceeded ${maxBytes} bytes`, { bytesRead: total, maxBytes })
      }
      chunks.push(Buffer.from(value))
    }
  } finally {
    reader.releaseLock()
  }

  return Buffer.concat(chunks, total)
}

function contentTypeMatches(actual, expected) {
  const normalized = actual.toLowerCase().split(";", 1)[0].trim()
  return expected.some((value) => (value.endsWith("/*") ? normalized.startsWith(value.slice(0, -1)) : normalized === value))
}

export async function fetchBounded(
  url,
  {
    fetchImpl = globalThis.fetch,
    allowedOrigins,
    expectedContentTypes,
    maxBytes,
    userAgent = DEFAULT_USER_AGENT,
    timeoutMs = 20_000,
  },
) {
  if (typeof fetchImpl !== "function") throw new Error("A fetch implementation is required")
  if (!Number.isSafeInteger(maxBytes) || maxBytes < 1) throw new Error("maxBytes must be a positive integer")

  let response
  try {
    response = await fetchImpl(url, {
      redirect: "follow",
      signal: AbortSignal.timeout(timeoutMs),
      headers: { "user-agent": userAgent },
    })
  } catch (error) {
    throw new ArchiveFetchError(`Unable to fetch ${url}: ${error.message}`, { url, cause: error.name })
  }

  const finalUrl = response.url || url
  let final
  try {
    final = new URL(finalUrl)
  } catch {
    throw new ArchiveBoundaryError(`Response for ${url} had an invalid final URL`, { url, finalUrl })
  }
  if (!allowedOrigins.includes(final.origin)) {
    await response.body?.cancel()
    throw new ArchiveBoundaryError(`${url} redirected outside its declared boundary to ${finalUrl}`, { url, finalUrl })
  }
  if (!response.ok) {
    await response.body?.cancel()
    throw new ArchiveFetchError(`Unable to fetch ${url}: HTTP ${response.status}`, {
      url,
      finalUrl,
      status: response.status,
    })
  }

  const contentType = response.headers.get("content-type") ?? ""
  if (!contentTypeMatches(contentType, expectedContentTypes)) {
    await response.body?.cancel()
    throw new ArchiveBoundaryError(`${url} returned unexpected content type ${contentType || "(missing)"}`, {
      url,
      finalUrl,
      contentType,
      expectedContentTypes,
    })
  }

  const bytes = await readBoundedBody(response, maxBytes)
  return {
    url,
    finalUrl,
    status: response.status,
    contentType,
    bytes,
    byteLength: bytes.byteLength,
    sha256: createHash("sha256").update(bytes).digest("hex"),
    etag: response.headers.get("etag"),
    lastModified: response.headers.get("last-modified"),
  }
}

export function groupResourcesByDigest(resources) {
  const groups = new Map()
  for (const resource of resources) {
    if (!resource.sha256) continue
    const urls = groups.get(resource.sha256) ?? []
    urls.push(resource.url)
    groups.set(resource.sha256, urls)
  }

  return [...groups.entries()]
    .filter(([, urls]) => new Set(urls).size > 1)
    .map(([sha256, urls]) => ({ sha256, urls: [...new Set(urls)].sort(compareStrings) }))
    .sort((left, right) => compareStrings(left.sha256, right.sha256))
}

function sortObject(value) {
  if (Array.isArray(value)) return value.map(sortObject)
  if (!isPlainObject(value)) return value
  return Object.fromEntries(Object.keys(value).sort(compareStrings).map((key) => [key, sortObject(value[key])]))
}

export function serializeManifest(manifest) {
  return `${JSON.stringify(sortObject(manifest), null, 2)}\n`
}

export function summarizeManifest(manifest) {
  const sources = manifest.sources ?? []
  const pages = sources.flatMap((source) => source.pages ?? [])
  const resources = sources.flatMap((source) => source.resources ?? [])

  return {
    sourcesDiscovered: sources.filter((source) => source.states?.discovery === "discovered").length,
    sourcesWithRawCaptures: sources.filter((source) =>
      (source.pages ?? []).some((page) => page.status === "archived" && typeof page.rawPath === "string"),
    ).length,
    sourcesWithStructuredContent: sources.filter((source) => source.states?.structure === "content-structured").length,
    sourcesVerifiedByExplicitReview: sources.filter(
      (source) => source.states?.verification === "explicitly-verified",
    ).length,
    sourcesPublishable: sources.filter(derivePublishable).length,
    pagesArchived: pages.filter((page) => page.status === "archived").length,
    pagesUnavailable: pages.filter((page) => page.status === "unavailable").length,
    resourcesAvailable: resources.filter((resource) => resource.status === "available").length,
    resourcesUnavailable: resources.filter((resource) => resource.status === "unavailable").length,
  }
}

function extractTitle(html) {
  const title = html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1]
  return title ? decodeHtmlEntities(title.replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim() || null : null
}

function decodeText(bytes, contentType) {
  const declared = contentType.match(/charset\s*=\s*["']?([^;"'\s]+)/i)?.[1]?.toLowerCase()
  const charset = declared === "shift-jis" || declared === "shift_jis" || declared === "sjis" ? "shift_jis" : declared || "utf-8"
  try {
    return new TextDecoder(charset).decode(bytes)
  } catch {
    return new TextDecoder("utf-8").decode(bytes)
  }
}

function stableResourceId(url) {
  return `archive-resource-${createHash("sha256").update(url).digest("hex").slice(0, 16)}`
}

async function wait(milliseconds) {
  if (milliseconds > 0) await new Promise((resolve) => setTimeout(resolve, milliseconds))
}

async function pathExists(target) {
  try {
    await access(target)
    return true
  } catch (error) {
    if (error?.code === "ENOENT") return false
    throw error
  }
}

export async function fetchRobots(origin, { fetchImpl, userAgent, maxBytes = 1_000_000 }) {
  const url = new URL("/robots.txt", origin).toString()
  let response
  try {
    response = await fetchImpl(url, {
      redirect: "follow",
      signal: AbortSignal.timeout(20_000),
      headers: { "user-agent": userAgent },
    })
  } catch (error) {
    throw new ArchiveFetchError(`Unable to check robots.txt at ${url}: ${error.message}`, { url })
  }

  const finalUrl = response.url || url
  if (response.status === 429) {
    await response.body?.cancel()
    throw new ArchiveFetchError(`Unable to check robots.txt at ${url}: HTTP 429`, {
      url,
      status: response.status,
    })
  }
  if (response.status >= 400 && response.status <= 499) {
    await response.body?.cancel()
    return {
      url,
      finalUrl,
      status: response.status,
      present: false,
      availability: "unavailable",
      canFetch: () => true,
    }
  }
  if (new URL(finalUrl).origin !== origin) {
    await response.body?.cancel()
    throw new ArchiveBoundaryError(`robots.txt at ${url} redirected outside ${origin}`, { url, finalUrl })
  }
  if (!response.ok) {
    await response.body?.cancel()
    throw new ArchiveFetchError(`Unable to check robots.txt at ${url}: HTTP ${response.status}`, {
      url,
      status: response.status,
    })
  }
  const bytes = await readBoundedBody(response, maxBytes)
  return {
    url,
    finalUrl,
    status: response.status,
    present: true,
    availability: "available",
    sha256: createHash("sha256").update(bytes).digest("hex"),
    canFetch: parseRobotsTxt(new TextDecoder("utf-8").decode(bytes), userAgent),
  }
}

export function rawCapturePath(rawRoot, capturedAt, sourceId, page) {
  const timestamp = capturedAt.replace(/[:.]/g, "-")
  return path.join(rawRoot, timestamp, sourceId, `${page.id}.${page.fileExtension}`)
}

function publicSourceFields(source) {
  return {
    id: source.id,
    label: source.label,
    canonicalUrl: source.canonicalUrl,
    sourceClass: source.sourceClass,
    states: source.states,
    rights: source.rights,
    evidence: source.evidence,
    notes: source.notes ?? null,
    exclusions: source.exclusions ?? [],
    wayback: source.wayback ?? [],
    observations: source.observations ?? [],
    publishable: derivePublishable(source),
  }
}

export async function crawlRegistry(
  registry,
  {
    capturedAt = new Date().toISOString(),
    rawRoot = DEFAULT_RAW_ROOT,
    fetchImpl = globalThis.fetch,
    delayMs = DEFAULT_DELAY_MS,
    userAgent = DEFAULT_USER_AGENT,
    writeRaw = true,
  } = {},
) {
  validateRegistry(registry)
  const normalizedCapturedAt = new Date(capturedAt).toISOString()
  if (normalizedCapturedAt !== capturedAt) throw new Error("capturedAt must be a normalized ISO 8601 UTC timestamp")
  if (!Number.isSafeInteger(delayMs) || delayMs < 0) throw new Error("delayMs must be a non-negative integer")

  const captureDirectoryName = normalizedCapturedAt.replace(/[:.]/g, "-")
  const captureDirectory = path.join(rawRoot, captureDirectoryName)
  const stagingDirectory = `${captureDirectory}.staging-${process.pid}`
  if (writeRaw && (await pathExists(captureDirectory))) {
    throw new Error(`Raw capture timestamp already exists: ${captureDirectory}`)
  }
  if (writeRaw && (await pathExists(stagingDirectory))) {
    throw new Error(`Raw capture staging directory already exists: ${stagingDirectory}`)
  }

  const resultSources = []
  const mediaProbeCache = new Map()
  const pendingRawWrites = []
  let totalRawBytes = 0
  let requestCount = 0
  const pace = async () => {
    if (requestCount > 0) await wait(delayMs)
    requestCount += 1
  }

  for (const source of registry.sources) {
    const resultSource = { ...publicSourceFields(source), pages: [], resources: [], duplicateGroups: [] }
    if (!source.crawl) {
      resultSources.push(resultSource)
      continue
    }

    const robotsByOrigin = new Map()
    const robotsOrigins = new Set([
      ...source.crawl.allowedOrigins,
      ...(source.crawl.media?.allowedOrigins ?? []),
    ])
    for (const origin of robotsOrigins) {
      await pace()
      const robots = await fetchRobots(origin, { fetchImpl, userAgent })
      robotsByOrigin.set(origin, robots)
    }
    resultSource.robots = [...robotsByOrigin.values()].map((robots) => {
      const metadata = { ...robots }
      delete metadata.canFetch
      return metadata
    })

    const pageMedia = new Map()
    for (const page of source.crawl.pages) {
      const pageUrl = new URL(page.url)
      const robots = robotsByOrigin.get(pageUrl.origin)
      if (!robots?.canFetch(`${pageUrl.pathname}${pageUrl.search}`)) {
        throw new ArchiveBoundaryError(`robots.txt disallows declared page ${page.url}`, { sourceId: source.id, pageId: page.id })
      }

      await pace()
      const fetched = await fetchBounded(page.url, {
        fetchImpl,
        allowedOrigins: source.crawl.allowedOrigins,
        expectedContentTypes: page.expectedContentTypes,
        maxBytes: page.maxBytes ?? 5_000_000,
        userAgent,
      })
      let html = null
      let references = { links: [], media: [] }
      if (contentTypeMatches(fetched.contentType, ["text/html"])) {
        html = decodeText(fetched.bytes, fetched.contentType)
        references = extractHtmlReferences(html, fetched.finalUrl)
        if (references.links.length > MAX_LINKS_PER_PAGE) {
          throw new ArchiveBoundaryError(`${page.url} exceeded ${MAX_LINKS_PER_PAGE} outbound links`, {
            sourceId: source.id,
            pageId: page.id,
            links: references.links.length,
          })
        }
      }
      pageMedia.set(page.id, references.media)

      let rawPath = null
      if (page.capture === "raw" && writeRaw) {
        totalRawBytes += fetched.byteLength
        if (totalRawBytes > MAX_TOTAL_RAW_BYTES) {
          throw new ArchiveBoundaryError(`Raw capture exceeded ${MAX_TOTAL_RAW_BYTES} total bytes`, {
            maxBytes: MAX_TOTAL_RAW_BYTES,
            bytesRead: totalRawBytes,
          })
        }
        const finalTarget = rawCapturePath(rawRoot, normalizedCapturedAt, source.id, page)
        pendingRawWrites.push({
          relativePath: path.join(source.id, `${page.id}.${page.fileExtension}`),
          bytes: fetched.bytes,
        })
        rawPath = path.relative(process.cwd(), finalTarget).split(path.sep).join("/")
      }

      resultSource.pages.push({
        id: page.id,
        requestedUrl: page.url,
        finalUrl: fetched.finalUrl,
        status: "archived",
        httpStatus: fetched.status,
        contentType: fetched.contentType,
        byteLength: fetched.byteLength,
        sha256: fetched.sha256,
        etag: fetched.etag,
        lastModified: fetched.lastModified,
        title: html ? extractTitle(html) : null,
        rawPath,
        outboundLinks: references.links,
        mediaReferenceCount: references.media.length,
        publishable: false,
      })
    }

    const mediaConfig = source.crawl.media
    if (mediaConfig) {
      const candidates = new Map()
      for (const pageId of mediaConfig.fromPageIds) {
        const page = resultSource.pages.find((item) => item.id === pageId)
        for (const rawUrl of pageMedia.get(pageId) ?? []) {
          const url = canonicalizeUrl(rawUrl, page?.finalUrl, {
            allowedOrigins: mediaConfig.allowedOrigins,
            dropQueryParameters: mediaConfig.dropQueryParameters,
          })
          if (!url) continue
          const current = candidates.get(url) ?? { url, referringPages: [], wayback: [] }
          current.referringPages.push(page.requestedUrl)
          candidates.set(url, current)
        }
      }
      for (const seed of mediaConfig.seedResources ?? []) {
        const url = canonicalizeUrl(seed.url, source.canonicalUrl, {
          allowedOrigins: mediaConfig.allowedOrigins,
          dropQueryParameters: mediaConfig.dropQueryParameters,
        })
        if (!url) throw new ArchiveBoundaryError(`Seed resource escaped media boundary: ${seed.url}`, { sourceId: source.id })
        const current = candidates.get(url) ?? { url, referringPages: [], wayback: [] }
        current.referringPages.push(...(seed.referringPages ?? []))
        current.wayback.push(...(seed.wayback ?? []))
        candidates.set(url, current)
      }

      if (candidates.size > mediaConfig.maxResources) {
        throw new ArchiveBoundaryError(`${source.id} discovered ${candidates.size} media resources; maximum is ${mediaConfig.maxResources}`)
      }

      for (const candidate of [...candidates.values()].sort((left, right) => compareStrings(left.url, right.url))) {
        const resourceUrl = new URL(candidate.url)
        const robots = robotsByOrigin.get(resourceUrl.origin)
        if (!robots?.canFetch(`${resourceUrl.pathname}${resourceUrl.search}`)) {
          throw new ArchiveBoundaryError(`robots.txt disallows declared media ${candidate.url}`, {
            sourceId: source.id,
            resourceUrl: candidate.url,
          })
        }
        const cacheKey = `${candidate.url}\u0000${mediaConfig.maxBytesPerResource}`
        let probe = mediaProbeCache.get(cacheKey)
        if (!probe) {
          await pace()
          try {
            const fetched = await fetchBounded(candidate.url, {
              fetchImpl,
              allowedOrigins: mediaConfig.allowedOrigins,
              expectedContentTypes: mediaConfig.expectedContentTypes ?? ["image/*"],
              maxBytes: mediaConfig.maxBytesPerResource,
              userAgent,
            })
            probe = {
              status: "available",
              httpStatus: fetched.status,
              finalUrl: fetched.finalUrl,
              contentType: fetched.contentType,
              byteLength: fetched.byteLength,
              sha256: fetched.sha256,
              etag: fetched.etag,
              lastModified: fetched.lastModified,
            }
          } catch (error) {
            probe = {
              status: "unavailable",
              httpStatus: error.details?.status ?? null,
              finalUrl: error.details?.finalUrl ?? null,
              error: error.message,
            }
          }
          mediaProbeCache.set(cacheKey, probe)
        }

        resultSource.resources.push({
          id: stableResourceId(candidate.url),
          url: candidate.url,
          referringPages: [...new Set(candidate.referringPages)].sort(compareStrings),
          wayback: [...new Map(candidate.wayback.map((item) => [item.url, item])).values()].sort((left, right) =>
            compareStrings(left.url, right.url),
          ),
          archive: "metadata-only",
          publishable: false,
          ...probe,
        })
      }
      resultSource.duplicateGroups = groupResourcesByDigest(resultSource.resources)
    }

    resultSource.states = {
      ...resultSource.states,
      archive: resultSource.pages.some((page) => typeof page.rawPath === "string") ? "raw-capture" : "metadata-only",
    }

    resultSources.push(resultSource)
  }

  const manifest = {
    schemaVersion: 1,
    startingMainSha: registry.startingMainSha ?? null,
    capturedAt: normalizedCapturedAt,
    crawler: {
      userAgent,
      delayMs,
      bounded: true,
      exactPageAllowlist: true,
      requestCount,
    },
    sources: resultSources,
  }
  manifest.duplicateGroups = groupResourcesByDigest(resultSources.flatMap((source) => source.resources))
  manifest.coverage = summarizeManifest(manifest)

  if (writeRaw && pendingRawWrites.length > 0) {
    try {
      for (const pending of pendingRawWrites) {
        const target = path.join(stagingDirectory, pending.relativePath)
        await mkdir(path.dirname(target), { recursive: true })
        await writeFile(target, pending.bytes)
      }
      await rename(stagingDirectory, captureDirectory)
    } catch (error) {
      await rm(stagingDirectory, { recursive: true, force: true })
      throw error
    }
  }

  return manifest
}

export function parseCliArguments(argv) {
  const options = {
    registryPath: DEFAULT_REGISTRY_PATH,
    outputPath: DEFAULT_MANIFEST_PATH,
    rawRoot: DEFAULT_RAW_ROOT,
    capturedAt: new Date().toISOString(),
    delayMs: DEFAULT_DELAY_MS,
    writeRaw: true,
  }

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index]
    const next = argv[index + 1]
    if (argument === "--") continue
    if (argument === "--no-raw") options.writeRaw = false
    else if (["--registry", "--output", "--raw-root", "--captured-at", "--delay-ms"].includes(argument)) {
      if (!next) throw new Error(`${argument} requires a value`)
      if (argument === "--registry") options.registryPath = next
      if (argument === "--output") options.outputPath = next
      if (argument === "--raw-root") options.rawRoot = next
      if (argument === "--captured-at") options.capturedAt = next
      if (argument === "--delay-ms") options.delayMs = Number.parseInt(next, 10)
      index += 1
    } else throw new Error(`Unknown argument: ${argument}`)
  }
  return options
}

async function runCli() {
  const options = parseCliArguments(process.argv.slice(2))
  const registry = JSON.parse(await readFile(path.resolve(options.registryPath), "utf8"))
  const manifest = await crawlRegistry(registry, {
    capturedAt: options.capturedAt,
    rawRoot: path.resolve(options.rawRoot),
    delayMs: options.delayMs,
    writeRaw: options.writeRaw,
  })
  const outputPath = path.resolve(options.outputPath)
  await mkdir(path.dirname(outputPath), { recursive: true })
  await writeFile(outputPath, serializeManifest(manifest), "utf8")
  process.stdout.write(
    `${JSON.stringify({ output: path.relative(process.cwd(), outputPath), coverage: manifest.coverage }, null, 2)}\n`,
  )
}

const isCli = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
if (isCli) {
  runCli().catch((error) => {
    process.stderr.write(`${error.stack ?? error.message}\n`)
    process.exitCode = 1
  })
}
