import fs from "node:fs"
import path from "node:path"

const root = process.cwd()
const locales = ["ja", "en", "zh-TW"]
const pages = ["", "about", "activities", "news", "join", "contact", "privacy"]
const dictionaryFiles = locales.map((locale) => path.join(root, "src", "i18n", "dictionaries", `${locale}.json`))
const sourceExtensions = new Set([".ts", ".tsx", ".json", ".css"])
const errors = []
const dictionaries = {}
const outputDirectory = path.join(root, "out")
const publicIssuesUrl = "https://github.com/nurockplayer/snie-portal/issues/new"
const participationPathIds = ["japanese-university-students", "international-students", "partner-organizations"]

function escapeHtml(value) {
  return value.replace(
    /[&<>'"]/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "'": "&#39;",
        '"': "&quot;",
      })[character] ?? character,
  )
}

function requireFile(relativePath) {
  if (!fs.existsSync(path.join(root, relativePath))) {
    errors.push(`missing required file: ${relativePath}`)
  }
}

function walk(directory) {
  if (!fs.existsSync(directory)) {
    return []
  }

  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name)

    if (entry.isDirectory()) {
      return walk(entryPath)
    }

    return sourceExtensions.has(path.extname(entry.name)) ? [entryPath] : []
  })
}

function collectFiles(directory) {
  if (!fs.existsSync(directory)) {
    return []
  }

  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name)

    if (entry.isDirectory()) {
      return collectFiles(entryPath)
    }

    return [entryPath]
  })
}

function readOutput(relativePath) {
  const absolutePath = path.join(outputDirectory, relativePath)

  if (!fs.existsSync(absolutePath)) {
    errors.push(`missing generated artifact: out/${relativePath}`)
    return ""
  }

  return fs.readFileSync(absolutePath, "utf8")
}

function localizedRoute(locale, page) {
  return page ? `/${locale}/${page}/` : `/${locale}/`
}

function outputFileForRoute(route) {
  return path.join(route.slice(1), "index.html")
}

function getConfiguredSiteUrl() {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim()

  if (!configuredUrl) {
    return undefined
  }

  try {
    const url = new URL(configuredUrl)

    return url.protocol === "https:" ? url : undefined
  } catch {
    return undefined
  }
}

const configuredSiteUrl = getConfiguredSiteUrl()

function metadataUrl(pathname) {
  return configuredSiteUrl ? new URL(pathname, configuredSiteUrl).toString() : pathname
}

const openGraphLocales = {
  ja: "ja_JP",
  en: "en_US",
  "zh-TW": "zh_TW",
}

for (const relativePath of [
  "next.config.ts",
  "src/app/robots.ts",
  "src/app/sitemap.ts",
  "src/app/not-found.tsx",
  "src/app/global-not-found.tsx",
  "out/404.html",
  "out/favicon.ico",
  "out/robots.txt",
  "out/sitemap.xml",
]) {
  requireFile(relativePath)
}

const removedRuntimeRoute = path.join(root, "src", "app", "(site)", "[locale]", "[...missing]", "route.ts")

if (fs.existsSync(removedRuntimeRoute)) {
  errors.push("static export must not include the server-runtime localized catch-all route")
}

for (const [index, file] of dictionaryFiles.entries()) {
  try {
    const dictionary = JSON.parse(fs.readFileSync(file, "utf8"))
    dictionaries[locales[index]] = dictionary
    const requiredKeys = ["site", "metadata", "nav", "accessibility", "hero", "features", "pages", "notFound", "footer"]

    for (const key of requiredKeys) {
      if (!(key in dictionary)) {
        errors.push(`missing dictionary key ${key}: ${path.relative(root, file)}`)
      }
    }

    for (const page of ["home", ...pages.slice(1)]) {
      if (!dictionary.metadata?.[page]) {
        errors.push(`missing metadata.${page}: ${path.relative(root, file)}`)
      }
    }

    for (const page of ["join", "contact", "privacy"]) {
      if (dictionary.pages?.[page]?.publicIssuesUrl !== publicIssuesUrl) {
        errors.push(`unexpected pages.${page}.publicIssuesUrl: ${path.relative(root, file)}`)
      }
    }

    const actualParticipationPathIds = dictionary.pages?.join?.paths?.map((item) => item.id)

    if (JSON.stringify(actualParticipationPathIds) !== JSON.stringify(participationPathIds)) {
      errors.push(`inconsistent participation path IDs: ${path.relative(root, file)}`)
    }
  } catch (error) {
    errors.push(`invalid dictionary ${path.relative(root, file)}: ${error.message}`)
  }
}

const expectedRoutes = locales.flatMap((locale) => pages.map((page) => localizedRoute(locale, page)))
const generatedHtmlFiles = collectFiles(outputDirectory).filter((file) => file.endsWith(".html"))

for (const route of expectedRoutes) {
  const relativePath = outputFileForRoute(route)
  const html = readOutput(relativePath)
  const [locale, page = ""] = route.slice(1, -1).split("/")
  const pageKey = page || "home"
  const dictionary = dictionaries[locale]

  if (!html || !dictionary) {
    continue
  }

  if (["join", "contact", "privacy"].includes(page) && !html.includes(`href="${publicIssuesUrl}"`)) {
    errors.push(`missing public issues link for ${route}`)
  }

  if (["join", "contact", "privacy"].includes(page) && !html.includes('target="_blank" rel="noreferrer"')) {
    errors.push(`public issues link must identify its external navigation behavior for ${route}`)
  }

  if (!new RegExp(`<html\\b[^>]*\\slang="${locale}"`, "i").test(html)) {
    errors.push(`unexpected html lang for ${route}: expected ${locale}`)
  }

  const metadata = dictionary.metadata?.[pageKey]

  if (metadata) {
    if (!html.includes(`<title>${escapeHtml(metadata.title)}</title>`)) {
      errors.push(`unexpected title for ${route}`)
    }

    if (!html.includes(`<meta name="description" content="${escapeHtml(metadata.description)}"`)) {
      errors.push(`unexpected description metadata for ${route}`)
    }

    if (!html.includes(`<link rel="canonical" href="${metadataUrl(localizedRoute(locale, page))}"`)) {
      errors.push(`missing canonical metadata for ${route}`)
    }

    for (const targetLocale of locales) {
      const alternate = `<link rel="alternate" hrefLang="${targetLocale}" href="${metadataUrl(localizedRoute(targetLocale, page))}"`

      if (!html.includes(alternate)) {
        errors.push(`missing ${targetLocale} alternate metadata for ${route}`)
      }
    }

    const defaultAlternate = `<link rel="alternate" hrefLang="x-default" href="${metadataUrl(localizedRoute("ja", page))}"`

    if (!html.includes(defaultAlternate)) {
      errors.push(`missing x-default alternate metadata for ${route}`)
    }

    for (const [label, value] of [
      ["og:title", metadata.title],
      ["og:description", metadata.description],
      ["og:url", metadataUrl(localizedRoute(locale, page))],
      ["og:site_name", dictionary.site.fullName],
      ["og:locale", openGraphLocales[locale]],
      ["og:type", "website"],
      ["twitter:card", "summary"],
      ["twitter:title", metadata.title],
      ["twitter:description", metadata.description],
    ]) {
      const attribute = label.startsWith("og:") ? `property="${label}"` : `name="${label}"`
      const expected = `<meta ${attribute} content="${escapeHtml(value)}"`

      if (!html.includes(expected)) {
        errors.push(`missing ${label} metadata for ${route}`)
      }
    }

    if (!html.includes('rel="icon" href="/favicon.ico')) {
      errors.push(`missing favicon metadata for ${route}`)
    }
  }
}

const rootHtml = readOutput("index.html")

if (rootHtml && !/<meta[^>]*http-equiv="refresh"[^>]*url=\/ja\//i.test(rootHtml)) {
  errors.push("root static artifact does not provide an accessible redirect to /ja/")
}

if (rootHtml && !rootHtml.includes('href="/ja/"')) {
  errors.push("root static artifact is missing its /ja/ fallback link")
}

if (rootHtml && !rootHtml.includes(`<link rel="canonical" href="${metadataUrl("/ja/")}"`)) {
  errors.push("root static artifact is missing its /ja/ canonical metadata")
}

if (rootHtml && !/<meta name="robots" content="noindex(?:, follow)?"/i.test(rootHtml)) {
  errors.push("root static artifact must be excluded from indexing")
}

const notFoundHtml = readOutput("404.html")
const defaultDictionary = dictionaries.ja

if (notFoundHtml && defaultDictionary) {
  if (!/<html\b[^>]*\slang="ja"/i.test(notFoundHtml)) {
    errors.push("static 404 artifact must use the default locale ja")
  }

  for (const value of [
    defaultDictionary.notFound.title,
    defaultDictionary.notFound.description,
    defaultDictionary.notFound.backHome,
  ]) {
    if (!notFoundHtml.includes(escapeHtml(value))) {
      errors.push(`static 404 artifact is missing default-locale not-found content: ${value}`)
    }
  }

  for (const locale of locales) {
    if (!notFoundHtml.includes(`href="/${locale}/"`)) {
      errors.push(`static 404 artifact is missing a ${locale} locale fallback link`)
    }
  }
}

const sitemap = readOutput("sitemap.xml")
const sitemapRoutes = new Set(
  [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => {
    try {
      return new URL(match[1]).pathname
    } catch {
      return match[1]
    }
  }),
)

for (const route of expectedRoutes) {
  if (sitemap && !sitemapRoutes.has(route)) {
    errors.push(`sitemap is missing ${route}`)
  }
}

if (sitemap && sitemapRoutes.size !== expectedRoutes.length) {
  errors.push(`sitemap contains ${sitemapRoutes.size} routes; expected exactly ${expectedRoutes.length}`)
}

const robots = readOutput("robots.txt")

if (robots && !/User-Agent:\s*\*/i.test(robots)) {
  errors.push("generated robots.txt is missing the wildcard user-agent rule")
}

if (robots && !/Allow:\s*\//i.test(robots)) {
  errors.push("generated robots.txt is missing the root allow rule")
}

const allowedInternalRoutes = new Set(["/", "/404", "/robots.txt", "/sitemap.xml", ...expectedRoutes.map((route) => route.replace(/\/$/, ""))])

for (const file of generatedHtmlFiles) {
  const html = fs.readFileSync(file, "utf8")
  const hrefs = [...html.matchAll(/href="(\/[^"]*)"/g)].map((match) => match[1])

  for (const href of new Set(hrefs)) {
    const route = href.split(/[?#]/)[0].replace(/\/+$/, "") || "/"

    if (route.startsWith("/_next") || route === "/favicon.ico" || route.startsWith("/favicon.ico?")) {
      continue
    }

    if (!allowedInternalRoutes.has(route)) {
      errors.push(`built internal link does not resolve to an expected route: ${href} (${path.relative(root, file)})`)
    }
  }
}

const sourceText = walk(path.join(root, "src"))
  .map((file) => fs.readFileSync(file, "utf8"))
  .join("\n")

for (const [label, pattern] of [
  ["fragment placeholder", /href\s*=\s*["']#["']/],
  ["obvious placeholder URL", /https?:\/\/(?:example\.(?:com|org)|your-domain|placeholder)/i],
  ["draft marker", /To be verified|Coming soon|Check back later/],
]) {
  if (pattern.test(sourceText)) {
    errors.push(`found ${label} in src`)
  }
}

if (errors.length > 0) {
  console.error("MVP validation failed:")
  for (const error of errors) {
    console.error(`- ${error}`)
  }
  process.exitCode = 1
} else {
  console.log(`MVP validation passed: ${expectedRoutes.length} localized routes, static out/ artifacts, metadata endpoints, internal links, dictionaries, and placeholder checks.`)
}
