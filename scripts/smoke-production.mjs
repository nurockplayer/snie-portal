import { pathToFileURL } from "node:url"
import ja from "../src/i18n/dictionaries/ja.json" with { type: "json" }
import en from "../src/i18n/dictionaries/en.json" with { type: "json" }
import zhTW from "../src/i18n/dictionaries/zh-TW.json" with { type: "json" }
import { socialPreview, validateSocialPreview } from "../src/content/social-preview.mjs"
import { activityPageSegments, activityById, activityRecordPath } from "../src/content/activity-records.mjs"
const dictionaries = { ja, en, "zh-TW": zhTW }

const locales = ["ja", "en", "zh-TW"]
const pageSegments = ["", "about", "activities", "news", "join", "contact", "privacy", "history", ...activityPageSegments]
const placeholderPattern = /To be verified|Coming soon|Check back later/i
const defaultOrigin = "https://snie-portal.pages.dev"

export const expectedLocalizedRoutes = locales.flatMap((locale) =>
  pageSegments.map((segment) => (segment ? `/${locale}/${segment}/` : `/${locale}/`)),
)

function normalizedOrigin(value) {
  try {
    const url = new URL(value)

    if (url.protocol !== "https:") {
      return undefined
    }

    return url.origin
  } catch {
    return undefined
  }
}

function expectedAlternates(origin, route) {
  const suffix = route.replace(/^\/(?:ja|en|zh-TW)/, "")

  return [
    ...locales.map((locale) => ({ locale, url: `${origin}/${locale}${suffix}` })),
    { locale: "x-default", url: `${origin}/ja${suffix}` },
  ]
}

// Inspect emitted HTML, not component source: a priority prop can be lost while
// rendering. Ignore inert text that cannot start an image request on page load.
export function validateHomeImagePriority({ route, html }) {
  const errors = []
  const activeHtml = html.replace(/<!--[\s\S]*?-->|<(script|style|template|noscript)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, "")
  const images = [...activeHtml.matchAll(/<img\b(?:[^"'<>]|"[^"]*"|'[^']*')*>/gi)].map(([tag]) => {
    const attributes = new Map()
    for (const [, name, doubleQuoted, singleQuoted, unquoted] of tag.matchAll(/\s+([^\s=/>]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g)) {
      if (!attributes.has(name.toLowerCase())) attributes.set(name.toLowerCase(), doubleQuoted ?? singleQuoted ?? unquoted)
    }
    return attributes
  })
  const heroes = images.filter((image) => image.get("class")?.split(/\s+/).includes("community-hero__image"))
  if (heroes.length !== 1 || images[0] !== heroes[0]) {
    errors.push(`${route}: expected exactly one first-position homepage hero image`)
  }
  const hero = heroes[0]
  if (hero) {
    if (hero.get("loading")?.toLowerCase() !== "eager" || hero.get("fetchpriority")?.toLowerCase() !== "high") {
      errors.push(`${route}: homepage hero must be eager and high priority`)
    }
    if (!hero.get("src")?.trim() || !hero.get("srcset")?.trim() || !hero.get("sizes")?.trim()) {
      errors.push(`${route}: homepage hero must expose src, srcset and sizes in initial HTML`)
    }
    if (!hero.get("alt")?.trim() || !/^[1-9]\d*$/.test(hero.get("width") ?? "") || !/^[1-9]\d*$/.test(hero.get("height") ?? "")) {
      errors.push(`${route}: homepage hero must preserve descriptive alt text and dimensions`)
    }
  }
  for (const image of images.filter((image) => image !== hero)) {
    if (image.get("loading")?.toLowerCase() !== "lazy" || image.get("fetchpriority")?.toLowerCase() === "high") {
      errors.push(`${route}: later homepage images must stay lazy without high priority`)
    }
  }
  return errors
}

export function validateHtmlRoute({ origin, route, locale, status, html }) {
  const errors = []

  if (status !== 200) {
    errors.push(`${route}: expected HTTP 200, received ${status}`)
  }

  if (!new RegExp(`<html\\b[^>]*\\slang="${locale}"`, "i").test(html)) {
    errors.push(`${route}: expected html lang ${locale}`)
  }

  if (!/<title>[^<]+<\/title>/i.test(html) || !/<meta name="description" content="[^"]+"/i.test(html)) {
    errors.push(`${route}: missing title or description metadata`)
  }

  const canonical = `${origin}${route}`

  if (!html.includes(`<link rel="canonical" href="${canonical}"`)) {
    errors.push(`${route}: missing production canonical ${canonical}`)
  }

  if (!html.includes(`<meta property="og:url" content="${canonical}"`)) {
    errors.push(`${route}: missing production Open Graph URL ${canonical}`)
  }

  const imageUrl = `${origin}${socialPreview.path}`
  const imageAlt = dictionaries[locale].socialPreview.alt
  for (const [name, value] of [["og:image", imageUrl], ["og:image:width", String(socialPreview.width)], ["og:image:height", String(socialPreview.height)], ["og:image:type", socialPreview.type], ["og:image:alt", imageAlt]]) {
    if (!html.includes(`<meta property="${name}" content="${value}"`)) errors.push(`${route}: missing or invalid ${name}`)
  }
  for (const [name, value] of [["twitter:card", "summary_large_image"], ["twitter:image", imageUrl], ["twitter:image:alt", imageAlt]]) {
    if (!html.includes(`<meta name="${name}" content="${value}"`)) errors.push(`${route}: missing or invalid ${name}`)
  }

  for (const alternate of expectedAlternates(origin, route)) {
    if (!html.includes(`<link rel="alternate" hrefLang="${alternate.locale}" href="${alternate.url}"`)) {
      errors.push(`${route}: missing ${alternate.locale} alternate ${alternate.url}`)
    }
  }

  if (placeholderPattern.test(html)) {
    errors.push(`${route}: exposed a forbidden placeholder marker`)
  }

  if (route === `/${locale}/`) {
    errors.push(...validateHomeImagePriority({ route, html }))
    for (const targetLocale of locales) {
      if (!html.includes(`href="/${targetLocale}/"`)) {
        errors.push(`${route}: missing ${targetLocale} locale navigation`)
      }
    }
  }

  const match = /^\/(?:ja|en|zh-TW)\/news\/([^/]+)\/$/.exec(route)
  if (match) {
    const record = activityById.get(match[1])
    if (!record) errors.push(`${route}: unexpected activity record route`)
    else {
      const escaped = (value) => value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char])
      for (const text of [record.title[locale], record.summary[locale], dictionaries[locale].activityRecord.pastNotice, record.eventDate, record.publishedAt]) if (!html.includes(escaped(text))) errors.push(`${route}: missing source-backed record text`)
      if (!html.includes(`<meta property="og:type" content="article"`)) errors.push(`${route}: missing article metadata`)
      if (!html.includes(`href="${record.sourceUrl}"`) || !html.includes(`href="/${locale}/news/"`)) errors.push(`${route}: missing source or return navigation`)
      for (const target of locales) if (!html.includes(`href="${activityRecordPath(target, record.id)}"`)) errors.push(`${route}: language switch loses the record`)
    }
  }

  return errors
}

export function validateSitemap({ origin, status, xml }) {
  const errors = []

  if (status !== 200) {
    errors.push(`/sitemap.xml: expected HTTP 200, received ${status}`)
  }

  const actual = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]).sort()
  const expected = expectedLocalizedRoutes.map((route) => `${origin}${route}`).sort()

  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    errors.push(`/sitemap.xml: expected the exact ${expected.length}-route absolute production set`)
  }

  return errors
}

export function validateRobots({ origin, status, text }) {
  const errors = []

  if (status !== 200) {
    errors.push(`/robots.txt: expected HTTP 200, received ${status}`)
  }

  if (!/^User-Agent:\s*\*\s*$/im.test(text) || !/^Allow:\s*\/\s*$/im.test(text)) {
    errors.push("/robots.txt: missing wildcard allow rule")
  }

  if (!text.includes(`Sitemap: ${origin}/sitemap.xml`)) {
    errors.push("/robots.txt: missing absolute production sitemap URL")
  }

  return errors
}

function isRetryableStatus(status) {
  return status === 408 || status === 425 || status === 429 || status >= 500
}

function retryDelay(response, attempt) {
  const retryAfter = response.headers.get("retry-after")
  const retryAfterSeconds = retryAfter === null || retryAfter.trim() === "" ? Number.NaN : Number(retryAfter)

  if (Number.isFinite(retryAfterSeconds) && retryAfterSeconds >= 0) {
    return Math.min(retryAfterSeconds * 1_000, 10_000)
  }

  return attempt * 1_000
}

export async function fetchText(
  origin,
  route,
  { fetchImpl = fetch, wait = (duration) => new Promise((resolve) => setTimeout(resolve, duration)), redirect = "follow", includeHeaders = false, method = "GET", binary = false } = {},
) {
  let lastError

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const response = await fetchImpl(`${origin}${route}`, {
        headers: { "user-agent": "SNIE-Portal-production-smoke/1.0" },
        redirect,
        method,
        signal: AbortSignal.timeout(10_000),
      })
      const body = binary ? new Uint8Array(await response.arrayBuffer()) : await response.text()

      if (!isRetryableStatus(response.status) || attempt === 3) {
        return includeHeaders ? { status: response.status, body, headers: Object.fromEntries(response.headers) } : { status: response.status, body }
      }

      lastError = new Error(`HTTP ${response.status}`)
      await wait(retryDelay(response, attempt))
      continue
    } catch (error) {
      lastError = error
    }

    await wait(attempt * 1_000)
  }

  throw new Error(`${route}: request failed after retries: ${lastError?.message ?? "unknown error"}`)
}

export function validateRoot({ origin, status, headers = {} }) {
  if (![301, 308].includes(status)) return ["/: expected a permanent HTTP 301/308 redirect"]
  try {
    if (new URL(headers.location, origin).href !== `${origin}/ja/`) return ["/: expected Location /ja/"]
  } catch { return ["/: missing or invalid redirect Location"] }
  return []
}

export function validateNotFound({ route, locale, status, body }) {
  const errors = []
  const copy = dictionaries[locale].notFound
  if (status !== 404) errors.push(`${route}: expected HTTP 404`)
  if (!body.includes(`<html lang="${locale}"`)) errors.push(`${route}: expected html lang ${locale}`)
  if (!/<meta\b[^>]*name="robots"[^>]*content="[^"]*noindex/i.test(body)) errors.push(`${route}: expected noindex`)
  if (!body.includes(copy.title) || !body.includes(copy.description)) errors.push(`${route}: missing localized error copy`)
  const home = [...body.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi)].some((match) => match[1].includes(`href="/${locale}/"`) && match[2].replace(/<[^>]+>/g, "").trim() === copy.backHome)
  if (!home) errors.push(`${route}: missing locale-correct return-home action`)
  return errors
}

export function extractHashedAssets(html) {
  const paths = [...new Set([...html.matchAll(/(?:src|href)="(\/_next\/static\/[^"]+)"/g)].map((match) => match[1]))]
  return [paths.find((path) => path.endsWith(".js")), paths.find((path) => path.endsWith(".css")), paths.find((path) => /\.woff2?(?:\?|$)/.test(path))].filter(Boolean)
}

export function validateAssetCache({ route, status, headers = {} }) {
  const policy = headers["cache-control"] ?? ""
  const maxAge = Number(/(?:^|,)\s*max-age=(\d+)/i.exec(policy)?.[1] ?? -1)
  return status === 200 && /(?:^|,)\s*immutable(?:,|$)/i.test(policy) && maxAge >= 31_536_000 ? [] : [`${route}: expected long-lived immutable asset caching`]
}

export function validateHtmlCache({ route, headers = {} }) {
  const policy = headers["cache-control"] ?? ""
  if (/immutable/i.test(policy) || (!/(?:^|,)\s*max-age=0(?:,|$)|no-cache|no-store/i.test(policy))) return [`${route}: HTML must remain revalidatable`]
  return []
}

async function runSmoke() {
  const origin = normalizedOrigin(process.env.PRODUCTION_SITE_URL?.trim() || defaultOrigin)

  if (!origin) {
    throw new Error("PRODUCTION_SITE_URL must be a valid HTTPS origin")
  }

  const errors = []
  const routeResults = await Promise.all(
    expectedLocalizedRoutes.map(async (route) => ({ route, ...(await fetchText(origin, route, { includeHeaders: true })) })),
  )

  for (const result of routeResults) {
    const locale = result.route.split("/")[1]
    errors.push(...validateHtmlCache(result))
    errors.push(
      ...validateHtmlRoute({
        origin,
        route: result.route,
        locale,
        status: result.status,
        html: result.body,
      }),
    )
  }

  const [root, sitemap, robots, notFound] = await Promise.all([
    fetchText(origin, "/", { redirect: "manual", includeHeaders: true }),
    fetchText(origin, "/sitemap.xml"),
    fetchText(origin, "/robots.txt"),
    fetchText(origin, "/production-smoke-missing-route", { includeHeaders: true }),
  ])

  errors.push(...validateRoot({ origin, ...root }))

  errors.push(...validateNotFound({ route: "/production-smoke-missing-route", locale: "ja", ...notFound }), ...validateHtmlCache({ route: "/production-smoke-missing-route", ...notFound }))
  for (const locale of locales) {
    const route = `/${locale}/production-smoke-missing/deep/`
    const result = await fetchText(origin, route, { includeHeaders: true })
    errors.push(...validateNotFound({ route, locale, ...result }), ...validateHtmlCache({ route, ...result }))
    const slash = await fetchText(origin, `/${locale}/about`, { redirect: "manual", includeHeaders: true })
    if (![301, 308].includes(slash.status) || new URL(slash.headers.location ?? "", origin).pathname !== `/${locale}/about/`) errors.push(`/${locale}/about: canonical trailing-slash redirect missing`)
  }
  const unsupported = await fetchText(origin, "/fr/production-smoke-missing/", { includeHeaders: true })
  errors.push(...validateNotFound({ route: "/fr/production-smoke-missing/", locale: "ja", ...unsupported }))
  const assets = extractHashedAssets(routeResults[0].body)
  if (!assets.some((path) => path.endsWith(".js")) || !assets.some((path) => /\.(?:css|woff2?)(?:\?|$)/.test(path))) errors.push("home: cannot discover hashed JS and CSS/font assets")
  for (const route of assets) errors.push(...validateAssetCache({ route, ...await fetchText(origin, route, { method: "HEAD", includeHeaders: true }) }))
  errors.push(...validateSocialPreview(await fetchText(origin, socialPreview.path, { binary: true, includeHeaders: true })))

  errors.push(...validateSitemap({ origin, status: sitemap.status, xml: sitemap.body }))
  errors.push(...validateRobots({ origin, status: robots.status, text: robots.body }))

  const expectedCommit = process.env.EXPECTED_DEPLOY_COMMIT?.trim()
  if (expectedCommit) {
    const buildInfo = await fetchText(origin, "/build-info.json")
    try {
      const data = JSON.parse(buildInfo.body)
      if (buildInfo.status !== 200 || data.project !== "SNIE" || data.commit !== expectedCommit) {
        errors.push(`deployment identity mismatch: expected ${expectedCommit}, received ${data.commit ?? "unknown"}`)
      }
    } catch {
      errors.push("deployment identity endpoint did not return valid JSON")
    }
  }

  if (errors.length > 0) {
    console.error("Production smoke failed:")
    for (const error of errors) {
      console.error(`- ${error}`)
    }
    process.exitCode = 1
    return
  }

  console.log(
    `Production smoke passed: ${origin}, ${expectedLocalizedRoutes.length} localized routes, permanent root redirect, localized 404s, immutable assets, metadata, sitemap, and robots.`,
  )
}

const entryUrl = process.argv[1] ? pathToFileURL(process.argv[1]).href : undefined

if (entryUrl === import.meta.url) {
  await runSmoke()
}
