import { pathToFileURL } from "node:url"

const locales = ["ja", "en", "zh-TW"]
const pageSegments = ["", "about", "activities", "news", "join", "contact", "privacy"]
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

  for (const alternate of expectedAlternates(origin, route)) {
    if (!html.includes(`<link rel="alternate" hrefLang="${alternate.locale}" href="${alternate.url}"`)) {
      errors.push(`${route}: missing ${alternate.locale} alternate ${alternate.url}`)
    }
  }

  if (placeholderPattern.test(html)) {
    errors.push(`${route}: exposed a forbidden placeholder marker`)
  }

  if (route === `/${locale}/`) {
    for (const targetLocale of locales) {
      if (!html.includes(`href="/${targetLocale}/"`)) {
        errors.push(`${route}: missing ${targetLocale} locale navigation`)
      }
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
  { fetchImpl = fetch, wait = (duration) => new Promise((resolve) => setTimeout(resolve, duration)) } = {},
) {
  let lastError

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const response = await fetchImpl(`${origin}${route}`, {
        headers: { "user-agent": "SNIE-Portal-production-smoke/1.0" },
        redirect: "follow",
        signal: AbortSignal.timeout(10_000),
      })
      const body = await response.text()

      if (!isRetryableStatus(response.status) || attempt === 3) {
        return { status: response.status, body }
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

async function runSmoke() {
  const origin = normalizedOrigin(process.env.PRODUCTION_SITE_URL?.trim() || defaultOrigin)

  if (!origin) {
    throw new Error("PRODUCTION_SITE_URL must be a valid HTTPS origin")
  }

  const errors = []
  const routeResults = await Promise.all(
    expectedLocalizedRoutes.map(async (route) => ({ route, ...(await fetchText(origin, route)) })),
  )

  for (const result of routeResults) {
    const locale = result.route.split("/")[1]
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
    fetchText(origin, "/"),
    fetchText(origin, "/sitemap.xml"),
    fetchText(origin, "/robots.txt"),
    fetchText(origin, "/production-smoke-missing-route"),
  ])

  if (root.status !== 200 || !/http-equiv="refresh"[^>]*url=\/ja\//i.test(root.body)) {
    errors.push("/: expected HTTP 200 with the /ja/ static redirect fallback")
  }

  if (notFound.status !== 404 || !/<html\b[^>]*\slang="ja"/i.test(notFound.body)) {
    errors.push("missing route: expected HTTP 404 with the Japanese fallback")
  }

  errors.push(...validateSitemap({ origin, status: sitemap.status, xml: sitemap.body }))
  errors.push(...validateRobots({ origin, status: robots.status, text: robots.body }))

  if (errors.length > 0) {
    console.error("Production smoke failed:")
    for (const error of errors) {
      console.error(`- ${error}`)
    }
    process.exitCode = 1
    return
  }

  console.log(
    `Production smoke passed: ${origin}, ${expectedLocalizedRoutes.length} localized routes, root fallback, 404, metadata, sitemap, and robots.`,
  )
}

const entryUrl = process.argv[1] ? pathToFileURL(process.argv[1]).href : undefined

if (entryUrl === import.meta.url) {
  await runSmoke()
}
