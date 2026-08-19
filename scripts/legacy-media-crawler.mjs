import { createHash } from "node:crypto"
import { access, mkdir, readFile, writeFile } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

export const DEFAULT_START_URL = "https://snie.my.canva.site/snie-com"
export const DEFAULT_USER_AGENT = "snie-portal-issue-38/1.0 (+https://github.com/nurockplayer/snie-portal)"
export const DEFAULT_MAX_PAGES = 20
export const DEFAULT_DELAY_MS = 250
export const DEFAULT_OUTPUT_PATH = "src/content/media-manifest.json"

const DEFAULT_ALLOWED_ORIGIN = "https://snie.my.canva.site"
const DEFAULT_ALLOWED_PATH_PREFIX = "/snie-com"
const IMAGE_REFERENCE_PATTERN = /<(?:img|source)\b[^>]*>/gi
const HEADING_PATTERN = /<h[1-6]\b[^>]*>([\s\S]*?)<\/h[1-6]>/gi

function compareStrings(left, right) {
  return left < right ? -1 : left > right ? 1 : 0
}

function decodeHtmlEntities(value) {
  return value
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#x27;/gi, "'")
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&#x([0-9a-f]+);?/gi, (_, hex) => String.fromCodePoint(Number.parseInt(hex, 16)))
    .replace(/&#([0-9]+);?/g, (_, decimal) => String.fromCodePoint(Number.parseInt(decimal, 10)))
}

function parseAttribute(tag, name) {
  const pattern = new RegExp(`\\b${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, "i")
  const match = tag.match(pattern)

  if (!match) {
    return null
  }

  return decodeHtmlEntities(match.slice(1).find((value) => value !== undefined) ?? "")
}

function stripTags(value) {
  return decodeHtmlEntities(
    value
      .replace(/<script\b[\s\S]*?<\/script>/gi, " ")
      .replace(/<style\b[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " "),
  )
    .replace(/\s+/g, " ")
    .trim()
}

function pathMatchesPrefix(pathname, prefix) {
  const normalizedPrefix = prefix.endsWith("/") ? prefix.slice(0, -1) : prefix

  return pathname === normalizedPrefix || pathname.startsWith(`${normalizedPrefix}/`)
}

function normalizeAllowedOptions(options = {}) {
  return {
    allowedOrigin: options.allowedOrigin ?? DEFAULT_ALLOWED_ORIGIN,
    allowedPathPrefix: options.allowedPathPrefix ?? DEFAULT_ALLOWED_PATH_PREFIX,
  }
}

export function normalizeUrl(rawUrl, baseUrl, options = {}) {
  if (typeof rawUrl !== "string" || rawUrl.trim() === "") {
    return null
  }

  const { allowedOrigin, allowedPathPrefix } = normalizeAllowedOptions(options)
  let url

  try {
    url = new URL(rawUrl.trim(), baseUrl)
  } catch {
    return null
  }

  if (!/^https?:$/.test(url.protocol) || url.username || url.password) {
    return null
  }

  if (url.origin !== allowedOrigin || !pathMatchesPrefix(url.pathname, allowedPathPrefix)) {
    return null
  }

  url.hash = ""
  return url.toString()
}

function parseSrcset(value, baseUrl, options) {
  if (!value) {
    return []
  }

  return value
    .split(",")
    .map((candidate) => candidate.trim())
    .filter(Boolean)
    .map((candidate) => {
      const [rawUrl, descriptor] = candidate.split(/\s+/)
      const widthMatch = descriptor?.match(/^(\d+)w$/i)
      const url = normalizeUrl(rawUrl, baseUrl, options)

      if (!url) {
        return null
      }

      return {
        url,
        width: widthMatch ? Number.parseInt(widthMatch[1], 10) : null,
      }
    })
    .filter(Boolean)
}

function parseDimensionAttribute(tag, name) {
  const value = parseAttribute(tag, name)

  if (!value || !/^\d+$/.test(value)) {
    return null
  }

  return Number.parseInt(value, 10)
}

function mergeVariants(variants) {
  const byUrl = new Map()

  for (const variant of variants) {
    const current = byUrl.get(variant.url)

    if (!current || (variant.width ?? 0) > (current.width ?? 0)) {
      byUrl.set(variant.url, variant)
    }
  }

  return [...byUrl.values()].sort((left, right) => compareStrings(left.url, right.url))
}

function findPictureSourceTags(html, imageStart) {
  const pictureStart = html.lastIndexOf("<picture", imageStart)
  const pictureEnd = html.indexOf("</picture>", imageStart)

  if (pictureStart < 0 || pictureEnd < imageStart) {
    return []
  }

  return [...html.slice(pictureStart, imageStart).matchAll(/<source\b[^>]*>/gi)].map((match) => match[0])
}

function findFigureCaption(html, imageStart) {
  const figureStart = html.lastIndexOf("<figure", imageStart)
  const figureEnd = html.indexOf("</figure>", imageStart)

  if (figureStart < 0 || figureEnd < imageStart) {
    return null
  }

  const figure = html.slice(figureStart, figureEnd)
  const caption = figure.match(/<figcaption\b[^>]*>([\s\S]*?)<\/figcaption>/i)?.[1]
  const text = caption ? stripTags(caption) : ""

  return text || null
}

function findContext(html, imageStart) {
  const sectionStart = html.lastIndexOf("<section", imageStart)
  const sectionEnd = html.indexOf("</section>", imageStart)
  const start = sectionStart >= 0 && sectionEnd >= imageStart ? sectionStart : 0
  const sectionBeforeImage = html.slice(start, imageStart)
  const headings = [...sectionBeforeImage.matchAll(HEADING_PATTERN)].map((match) => stripTags(match[1])).filter(Boolean)

  if (headings.length) {
    return headings.at(-1)
  }

  const sectionText = stripTags(sectionBeforeImage)
  return sectionText ? sectionText.slice(0, 240) : null
}

function findDocumentBaseUrl(html, pageUrl) {
  const baseTag = html.match(/<base\b[^>]*>/i)?.[0]
  const rawBase = baseTag ? parseAttribute(baseTag, "href") : null

  if (!rawBase) {
    return pageUrl
  }

  try {
    return new URL(rawBase, pageUrl).toString()
  } catch {
    return pageUrl
  }
}

export function extractImageReferences(html, pageUrl, options = {}) {
  const { allowedOrigin, allowedPathPrefix } = normalizeAllowedOptions(options)
  const baseUrl = findDocumentBaseUrl(html, pageUrl)
  const references = []

  for (const match of html.matchAll(IMAGE_REFERENCE_PATTERN)) {
    const tag = match[0]

    if (!/^<img\b/i.test(tag)) {
      continue
    }

    const imageStart = match.index ?? 0
    const primaryUrl = normalizeUrl(parseAttribute(tag, "src"), baseUrl, { allowedOrigin, allowedPathPrefix })
    const imgVariants = parseSrcset(parseAttribute(tag, "srcset"), baseUrl, { allowedOrigin, allowedPathPrefix })
    const pictureVariants = findPictureSourceTags(html, imageStart).flatMap((sourceTag) =>
      parseSrcset(parseAttribute(sourceTag, "srcset"), baseUrl, { allowedOrigin, allowedPathPrefix }),
    )
    const allVariants = mergeVariants([...imgVariants, ...pictureVariants])
    const fallbackPrimary = [...allVariants]
      .filter((variant) => variant.width !== null)
      .sort((left, right) => (right.width ?? 0) - (left.width ?? 0) || compareStrings(left.url, right.url))[0]?.url
    const resolvedPrimaryUrl = primaryUrl ?? fallbackPrimary
    const primaryWidth = allVariants.find((variant) => variant.url === resolvedPrimaryUrl)?.width ?? null

    if (!resolvedPrimaryUrl) {
      continue
    }

    references.push({
      primaryUrl: resolvedPrimaryUrl,
      primaryWidth,
      variants: allVariants.filter((variant) => variant.url !== resolvedPrimaryUrl),
      alt: parseAttribute(tag, "alt"),
      caption: findFigureCaption(html, imageStart),
      context: findContext(html, imageStart),
      dimensions: {
        width: parseDimensionAttribute(tag, "width"),
        height: parseDimensionAttribute(tag, "height"),
      },
    })
  }

  return references
}

function stableAssetId(originalUrl) {
  return `snie-legacy-${createHash("sha256").update(originalUrl).digest("hex").slice(0, 16)}`
}

function chooseMetadataValue(values) {
  return [...new Set(values.filter((value) => typeof value === "string" && value.trim() !== ""))].sort((left, right) =>
    compareStrings(left, right),
  )[0] ?? null
}

export function deduplicateAssets(references, capturedAt) {
  const grouped = new Map()

  for (const reference of references) {
    const current = grouped.get(reference.primaryUrl) ?? {
      originalUrl: reference.primaryUrl,
      primaryWidths: [],
      variants: [],
      sourcePages: [],
      dimensions: [],
      metadata: {
        alts: [],
        captions: [],
        contexts: [],
      },
    }

    current.variants.push(...reference.variants)
    current.primaryWidths.push(reference.primaryWidth ?? null)
    current.dimensions.push(reference.dimensions ?? { width: null, height: null })

    if (reference.sourcePageUrl) {
      current.sourcePages.push(reference.sourcePageUrl)
    }

    current.metadata.alts.push(reference.alt)
    current.metadata.captions.push(reference.caption)
    current.metadata.contexts.push(reference.context)
    grouped.set(reference.primaryUrl, current)
  }

  return [...grouped.values()]
    .sort((left, right) => compareStrings(left.originalUrl, right.originalUrl))
    .map((asset) => {
      const variants = mergeVariants(asset.variants)
      const originalWidths = asset.primaryWidths.filter((width) => width !== null)
      const widths = [...variants.map((variant) => variant.width), ...originalWidths].filter((width) => width !== null)
      const detectedDimensions = asset.dimensions
        .filter((dimensions) => dimensions.width !== null || dimensions.height !== null)
        .sort(
          (left, right) =>
            (right.width ?? 0) - (left.width ?? 0) || (right.height ?? 0) - (left.height ?? 0),
        )[0]

      return {
        id: stableAssetId(asset.originalUrl),
        originalUrl: asset.originalUrl,
        originalWidth: originalWidths.length ? Math.max(...originalWidths) : null,
        provenance: "legacy-snie-canva",
        variants,
        sourcePages: [...new Set(asset.sourcePages)].sort(compareStrings),
        sourceMetadata: {
          alt: chooseMetadataValue(asset.metadata.alts),
          caption: chooseMetadataValue(asset.metadata.captions),
          context: chooseMetadataValue(asset.metadata.contexts),
        },
        dimensions: {
          width: detectedDimensions?.width ?? (widths.length ? Math.max(...widths) : null),
          height: detectedDimensions?.height ?? null,
        },
        review: {
          status: "inventory-only",
          reuse: "not-reviewed",
          consent: "not-reviewed",
          publishable: false,
          notes: `Crawled from the public source at ${capturedAt}; manual reuse and photo-consent review is required.`,
        },
      }
    })
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

    if (separator < 0) {
      continue
    }

    const directive = line.slice(0, separator).trim().toLowerCase()
    const value = line.slice(separator + 1).trim()

    if (directive === "user-agent") {
      if (current && current.rules.length === 0) {
        current.agents.push(value.toLowerCase())
      } else {
        current = { agents: [value.toLowerCase()], rules: [] }
        groups.push(current)
      }
      continue
    }

    if (!current || !["allow", "disallow"].includes(directive) || value === "") {
      continue
    }

    current.rules.push({
      allow: directive === "allow",
      pattern: value,
      regex: robotsPatternToRegExp(value),
    })
  }

  const normalizedAgent = userAgent.toLowerCase()
  const exactGroups = groups.filter((group) => group.agents.some((agent) => agent !== "*" && normalizedAgent.includes(agent)))
  const applicableGroups = exactGroups.length ? exactGroups : groups.filter((group) => group.agents.includes("*"))
  const rules = applicableGroups.flatMap((group) => group.rules)

  return (requestPath) => {
    const pathname = requestPath.split(/[?#]/, 1)[0] || "/"
    const matches = rules
      .filter((rule) => rule.regex.test(pathname))
      .sort((left, right) => right.pattern.length - left.pattern.length || Number(right.allow) - Number(left.allow))

    return matches[0]?.allow ?? true
  }
}

function extractLinks(html, pageUrl, options) {
  return [...html.matchAll(/<a\b[^>]*>/gi)]
    .map((match) => normalizeUrl(parseAttribute(match[0], "href"), pageUrl, options))
    .filter(Boolean)
}

function extractPageTitle(html) {
  const title = html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1]
  return title ? stripTags(title) || null : null
}

function normalizeCaptureTimestamp(value) {
  const date = new Date(value)

  if (Number.isNaN(date.valueOf())) {
    throw new Error(`Invalid capture timestamp: ${value}`)
  }

  return date.toISOString()
}

async function wait(milliseconds) {
  if (milliseconds <= 0) {
    return
  }

  await new Promise((resolve) => setTimeout(resolve, milliseconds))
}

async function fetchRobots(fetchImpl, sourceUrl, userAgent) {
  const robotsUrl = new URL("/robots.txt", sourceUrl).toString()
  let response

  try {
    response = await fetchImpl(robotsUrl, { headers: { "user-agent": userAgent } })
  } catch (error) {
    throw new Error(`Unable to check robots.txt at ${robotsUrl}: ${error.message}`)
  }

  if (response.status === 404) {
    return {
      url: robotsUrl,
      status: response.status,
      present: false,
      canFetch: () => true,
    }
  }

  if (!response.ok) {
    throw new Error(`Unable to check robots.txt at ${robotsUrl}: HTTP ${response.status}`)
  }

  return {
    url: robotsUrl,
    status: response.status,
    present: true,
    canFetch: parseRobotsTxt(await response.text(), userAgent),
  }
}

export async function crawlSite({
  startUrl = DEFAULT_START_URL,
  capturedAt = new Date().toISOString(),
  maxPages = DEFAULT_MAX_PAGES,
  delayMs = DEFAULT_DELAY_MS,
  fetchImpl = globalThis.fetch,
  userAgent = DEFAULT_USER_AGENT,
} = {}) {
  const normalizedStartUrl = normalizeUrl(startUrl, startUrl, {
    allowedOrigin: DEFAULT_ALLOWED_ORIGIN,
    allowedPathPrefix: DEFAULT_ALLOWED_PATH_PREFIX,
  })
  const captureTimestamp = normalizeCaptureTimestamp(capturedAt)

  if (!normalizedStartUrl) {
    throw new Error(`Start URL must be within ${DEFAULT_ALLOWED_ORIGIN}${DEFAULT_ALLOWED_PATH_PREFIX}`)
  }

  if (typeof fetchImpl !== "function") {
    throw new Error("A fetch implementation is required")
  }

  const options = {
    allowedOrigin: DEFAULT_ALLOWED_ORIGIN,
    allowedPathPrefix: DEFAULT_ALLOWED_PATH_PREFIX,
  }
  const robots = await fetchRobots(fetchImpl, normalizedStartUrl, userAgent)
  const queue = [normalizedStartUrl]
  const visited = new Set()
  const pages = []
  const references = []

  while (queue.length && pages.length < maxPages) {
    const pageUrl = queue.shift()

    if (!pageUrl || visited.has(pageUrl)) {
      continue
    }

    visited.add(pageUrl)

    if (!robots.canFetch(new URL(pageUrl).pathname)) {
      continue
    }

    if (pages.length > 0) {
      await wait(delayMs)
    }

    const response = await fetchImpl(pageUrl, { headers: { "user-agent": userAgent } })

    if (!response.ok) {
      throw new Error(`Unable to crawl ${pageUrl}: HTTP ${response.status}`)
    }

    const contentType = response.headers.get("content-type") ?? ""

    if (contentType && !contentType.toLowerCase().includes("text/html")) {
      continue
    }

    const html = await response.text()
    const pageReferences = extractImageReferences(html, pageUrl, options).map((reference) => ({
      ...reference,
      sourcePageUrl: pageUrl,
    }))

    pages.push({
      url: pageUrl,
      title: extractPageTitle(html),
      status: response.status,
      imageReferenceCount: pageReferences.length,
    })
    references.push(...pageReferences)

    for (const link of extractLinks(html, findDocumentBaseUrl(html, pageUrl), options)) {
      if (!visited.has(link) && robots.canFetch(new URL(link).pathname)) {
        queue.push(link)
      }
    }
  }

  const assets = deduplicateAssets(references, captureTimestamp)
  const uniqueImageUrls = new Set([
    ...references.flatMap((reference) => [reference.primaryUrl, ...reference.variants.map((variant) => variant.url)]),
  ])

  return {
    schemaVersion: 1,
    source: {
      id: "legacy-snie-canva",
      label: "SNIE legacy Canva site",
      startUrl: normalizedStartUrl,
      allowedOrigin: DEFAULT_ALLOWED_ORIGIN,
      allowedPathPrefix: DEFAULT_ALLOWED_PATH_PREFIX,
    },
    capturedAt: captureTimestamp,
    crawl: {
      userAgent,
      maxPages,
      delayMs,
      robots: {
        url: robots.url,
        status: robots.status,
        present: robots.present,
        rulesApplied: true,
      },
      pagesCrawled: pages.length,
      rawImageReferences: references.reduce(
        (count, reference) => count + 1 + reference.variants.length,
        0,
      ),
      uniqueImageUrls: uniqueImageUrls.size,
      uniqueAssets: assets.length,
    },
    pages,
    assets,
  }
}

const REVIEW_STATUS_VALUES = new Set(["inventory-only", "reviewed", "rejected"])
const REVIEW_REUSE_VALUES = new Set(["not-reviewed", "approved", "approved-for-issue-38", "rejected"])
const REVIEW_CONSENT_VALUES = new Set([
  "not-reviewed",
  "pending-policy-confirmation",
  "task-scope-authorized",
  "confirmed",
  "not-applicable",
])
const REVIEW_KEYS = new Set(["status", "reuse", "consent", "publishable", "altText", "notes"])

function validateReviewMetadata(assetId, review) {
  const unexpectedKey = Object.keys(review).find((key) => !REVIEW_KEYS.has(key))

  if (unexpectedKey) {
    throw new Error(`Unsupported review field for ${assetId}: ${unexpectedKey}`)
  }

  if (!REVIEW_STATUS_VALUES.has(review.status) || !REVIEW_REUSE_VALUES.has(review.reuse)) {
    throw new Error(`Invalid review state for ${assetId}`)
  }

  if (!REVIEW_CONSENT_VALUES.has(review.consent)) {
    throw new Error(`Invalid consent state for ${assetId}`)
  }

  if (typeof review.publishable !== "boolean") {
    throw new Error(`Review publishable flag must be boolean for ${assetId}`)
  }

  if (review.altText !== undefined && typeof review.altText !== "string") {
    throw new Error(`Review altText must be a string for ${assetId}`)
  }

  if (review.notes !== undefined && typeof review.notes !== "string") {
    throw new Error(`Review notes must be a string for ${assetId}`)
  }

  if (
    review.publishable &&
    (review.status !== "reviewed" ||
      !["approved", "approved-for-issue-38"].includes(review.reuse) ||
      !["confirmed", "not-applicable"].includes(review.consent))
  ) {
    throw new Error(`publishable review override requires confirmed or non-applicable consent for ${assetId}`)
  }
}

export function applyReviewOverrides(manifest, overrides = {}) {
  return {
    ...manifest,
    assets: manifest.assets.map((asset) => {
      const override = overrides[asset.id]

      if (!override) {
        return asset
      }

      const review = {
        ...asset.review,
        ...override,
      }

      validateReviewMetadata(asset.id, review)

      return {
        ...asset,
        review,
      }
    }),
  }
}

function canonicalize(value) {
  if (Array.isArray(value)) {
    return value.map(canonicalize)
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.keys(value)
        .sort(compareStrings)
        .map((key) => [key, canonicalize(value[key])]),
    )
  }

  return value
}

export function serializeManifest(manifest) {
  return `${JSON.stringify(canonicalize(manifest), null, 2)}\n`
}

export function parseCliArguments(argv) {
  const args = {}

  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index]

    if (value === "--") {
      continue
    }

    if (!value.startsWith("--")) {
      continue
    }

    const [key, inlineValue] = value.slice(2).split("=", 2)
    args[key] = inlineValue ?? argv[index + 1]

    if (inlineValue === undefined) {
      index += 1
    }
  }

  return args
}

async function readReviewOverrides(cwd) {
  const reviewPath = path.join(cwd, "src", "content", "media-review.json")

  try {
    await access(reviewPath)
    return JSON.parse(await readFile(reviewPath, "utf8"))
  } catch (error) {
    if (error.code === "ENOENT") {
      return {}
    }

    throw error
  }
}

async function runCli() {
  const args = parseCliArguments(process.argv.slice(2))
  const cwd = process.cwd()
  const outputPath = path.resolve(cwd, args.output ?? DEFAULT_OUTPUT_PATH)
  const manifest = await crawlSite({
    capturedAt: args["captured-at"] ?? new Date().toISOString(),
    maxPages: Number.parseInt(args["max-pages"] ?? `${DEFAULT_MAX_PAGES}`, 10),
    delayMs: Number.parseInt(args["delay-ms"] ?? `${DEFAULT_DELAY_MS}`, 10),
  })
  const reviewedManifest = applyReviewOverrides(manifest, await readReviewOverrides(cwd))

  await mkdir(path.dirname(outputPath), { recursive: true })
  await writeFile(outputPath, serializeManifest(reviewedManifest), "utf8")

  console.error(
    `Crawled ${reviewedManifest.crawl.pagesCrawled} page(s): ${reviewedManifest.crawl.rawImageReferences} raw image reference(s), ${reviewedManifest.crawl.uniqueImageUrls} unique URL(s), ${reviewedManifest.crawl.uniqueAssets} asset(s).`,
  )
  console.error(`Manifest: ${path.relative(cwd, outputPath)}`)
}

const isMainModule = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)

if (isMainModule) {
  runCli().catch((error) => {
    console.error(error instanceof Error ? error.message : error)
    process.exitCode = 1
  })
}
