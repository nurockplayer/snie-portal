import fs from "node:fs"
import path from "node:path"
import { createHash } from "node:crypto"

const root = process.cwd()
const locales = ["ja", "en", "zh-TW"]
const pages = ["", "about", "activities", "news", "join", "contact", "privacy", "history"]
const dictionaryFiles = locales.map((locale) => path.join(root, "src", "i18n", "dictionaries", `${locale}.json`))
const sourceExtensions = new Set([".ts", ".tsx", ".json", ".css"])
const errors = []
const dictionaries = {}
const outputDirectory = path.join(root, "out")
const defaultSiteUrl = "https://snie-portal.pages.dev"
const publicContactSourceUrl = "https://snie.my.canva.site/snie-com"
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
    return new URL(defaultSiteUrl)
  }

  try {
    const url = new URL(configuredUrl)

    return url.protocol === "https:" ? url : new URL(defaultSiteUrl)
  } catch {
    return new URL(defaultSiteUrl)
  }
}

const configuredSiteUrl = getConfiguredSiteUrl()

function metadataUrl(pathname) {
  return new URL(pathname, configuredSiteUrl).toString()
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


    const actualParticipationPathIds = dictionary.pages?.join?.paths?.map((item) => item.id)

    if (JSON.stringify(actualParticipationPathIds) !== JSON.stringify(participationPathIds)) {
      errors.push(`inconsistent participation path IDs: ${path.relative(root, file)}`)
    }
  } catch (error) {
    errors.push(`invalid dictionary ${path.relative(root, file)}: ${error.message}`)
  }
}

function dictionaryShape(value, prefix = "") {
  if (value && typeof value === "object") {
    return Object.entries(value).flatMap(([key, child]) => dictionaryShape(child, `${prefix}.${key}`)).sort()
  }
  return [prefix]
}
const referenceDictionaryShape = JSON.stringify(dictionaryShape(dictionaries.ja))
for (const locale of locales) {
  if (JSON.stringify(dictionaryShape(dictionaries[locale])) !== referenceDictionaryShape) errors.push(`dictionary key/array parity mismatch: ${locale}`)
}
if (/掲載|開催/.test(JSON.stringify(dictionaries["zh-TW"]))) errors.push("Japanese-only wording remains in the Traditional Chinese dictionary")
if (dictionaries["zh-TW"].metadata.news.title !== `${dictionaries["zh-TW"].nav.news} | SNIE`) errors.push("Traditional Chinese news title/navigation mismatch")

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

  if (["join", "contact", "privacy", "history"].includes(page) && !html.includes(`href="${publicContactSourceUrl}"`)) {
    errors.push(`missing verified contact-source link for ${route}`)
  }

  if (["join", "contact", "privacy", "history"].includes(page) && !html.includes('target="_blank" rel="noreferrer"')) {
    errors.push(`contact-source link must identify its external navigation behavior for ${route}`)
  }

  if (page === "" && !html.includes(`<span class="block">${escapeHtml(dictionary.media.captionFallback)}</span>`)) {
    errors.push(`home media captions must use localized dictionary content for ${route}`)
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
const sitemapLocations = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1])
const sitemapRoutes = new Set(
  sitemapLocations.map((location) => {
    try {
      return new URL(location).pathname
    } catch {
      return location
    }
  }),
)

for (const location of sitemapLocations) {
  if (!location.startsWith(`${configuredSiteUrl.origin}/`)) {
    errors.push(`sitemap URL must use the production HTTPS origin: ${location}`)
  }
}

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

if (robots && !robots.includes(`Sitemap: ${metadataUrl("/sitemap.xml")}`)) {
  errors.push("generated robots.txt is missing the absolute production sitemap URL")
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

    // Next preloads the high-priority, locally archived hero photograph.
    // Accept an image link only when the exported file really exists.
    if ((route.startsWith("/images/") || route.startsWith("/documents/")) && fs.existsSync(path.join(outputDirectory, route.slice(1)))) {
      continue
    }

    if (!allowedInternalRoutes.has(route)) {
      errors.push(`built internal link does not resolve to an expected route: ${href} (${path.relative(root, file)})`)
    }
  }
}

// Content-rich migration gates: every displayed archive asset must be exported,
// byte-identical to its recorded source, and rendered in each localized gallery.
const gallery = JSON.parse(fs.readFileSync(path.join(root, "src/content/gallery.json"), "utf8"))
const recentRecords = JSON.parse(fs.readFileSync(path.join(root, "src/content/recent-records.json"), "utf8"))
const photoIds = new Set()
for (const photo of gallery.photos) {
  if (photoIds.has(photo.id)) errors.push(`duplicate gallery photo ID: ${photo.id}`)
  photoIds.add(photo.id)
  const photoPath = path.join(outputDirectory, photo.src.replace(/^\//, ""))
  if (!photo.src.startsWith("/images/archive/") || !fs.existsSync(photoPath)) {
    errors.push(`missing exported gallery asset: ${photo.src}`)
    continue
  }
  if (createHash("sha256").update(fs.readFileSync(photoPath)).digest("hex") !== photo.sha256) {
    errors.push(`gallery asset digest mismatch: ${photo.src}`)
  }
  if (!photo.sourceUrl?.startsWith("https://") || photo.width <= 0 || photo.height <= 0) {
    errors.push(`invalid gallery source or dimensions: ${photo.id}`)
  }
  for (const locale of locales) {
    const html = readOutput(`${locale}/activities/index.html`)
    if (!html.includes(`src="${photo.src}"`) || !html.includes(`href="${photo.sourceUrl}"`)) {
      errors.push(`missing gallery image or attribution for ${locale}: ${photo.id}`)
    }
  }
}
const presentationImages = JSON.parse(fs.readFileSync(path.join(root, "src/content/presentation-images.json"), "utf8"))
for (const [name, mapping] of Object.entries(presentationImages)) {
  const photo = gallery.photos.find((item) => item.id === mapping.photoId)
  if (!photo || !photo.variants.some((variant) => variant.url === mapping.originalUrl)) { errors.push(`unverified source presentation image: ${name}`); continue }
  for (const locale of locales) {
    const html = readOutput(`${locale}/index.html`)
    if (!html.includes(`src="${photo.src}"`)) errors.push(`missing source-matched presentation photo: ${locale}/${name}`)
  }
}
const portfolio = JSON.parse(fs.readFileSync(path.join(root, "src/content/portfolio.json"), "utf8"))
if (portfolio.length !== 13) errors.push("source portfolio must retain 13 images")
for (const photo of portfolio) {
  const asset = path.join(outputDirectory, photo.src.replace(/^\//, ""))
  if (!fs.existsSync(asset) || createHash("sha256").update(fs.readFileSync(asset)).digest("hex") !== photo.sha256) errors.push(`portfolio source digest mismatch: ${photo.id}`)
  for (const locale of locales) if (!readOutput(`${locale}/index.html`).includes(`src="${photo.src}"`)) errors.push(`missing home portfolio photo: ${locale}/${photo.id}`)
}
// Homepage imagery stays visible without expanding archive disclosures.
const schoolImages = JSON.parse(fs.readFileSync(path.join(root, "src/content/school-images.json"), "utf8"))
if (schoolImages.length !== 4 || new Set(schoolImages.map((image) => image.school)).size !== 4) errors.push("four distinct verified school images required")
for (const image of schoolImages) {
  const asset = path.join(outputDirectory, image.src.replace(/^\//, ""))
  if (!fs.existsSync(asset) || createHash("sha256").update(fs.readFileSync(asset)).digest("hex") !== image.sha256) errors.push(`school-image source digest mismatch: ${image.school}`)
  for (const locale of locales) {
    const school = dictionaries[locale].schools.items.find((item) => item.name === image.school)
    if (!school || school.club !== image.club) errors.push(`school-image association mismatch: ${locale}/${image.school}`)
    for (const route of ["", "about/"]) {
      const html = readOutput(`${locale}/${route}index.html`)
      if (!html.includes(`src="${image.src}"`) || !html.includes(escapeHtml(dictionaries[locale].archive.clubImageAlt.replace("{club}", image.club)))) errors.push(`school image missing from ${locale}/${route}: ${image.school}`)
    }
  }
}
for (const locale of locales) {
  const html = readOutput(`${locale}/index.html`)
  const imageCount = [...html.matchAll(/<img /g)].length
  if (imageCount < 31 || !html.includes('class="community-hero__image"') || !html.includes('home-photo-collection')) errors.push(`homepage must retain the photo-led hero, all source sections and 31 images: ${locale}`)
  if (dictionaries[locale].leadership.items.length !== 4) errors.push(`all four source interview questions required: ${locale}`)
}
if (gallery.displayedPhotoCount !== gallery.photos.length || gallery.photos.length < 80) {
  errors.push("gallery must retain all 80 recovered display entries and its accurate count")
}
for (const record of recentRecords) {
  if (!record.sourceUrl?.startsWith("https://") || !/^\d{4}-\d{2}-\d{2}$/.test(record.eventDate)) {
    errors.push(`invalid recent-record source/date: ${record.id}`)
  }
  for (const locale of locales) {
    if (!record.title[locale] || !record.summary[locale]) errors.push(`missing ${locale} recent-record translation: ${record.id}`)
    const html = readOutput(`${locale}/news/index.html`)
    if (!html.includes(escapeHtml(record.title[locale])) || !html.includes(`href="${record.sourceUrl}"`)) {
      errors.push(`missing recent record or attribution for ${locale}: ${record.id}`)
    }
  }
}
const history = JSON.parse(fs.readFileSync(path.join(root, "src/content/history.json"), "utf8"))
if (history.records.length !== 24 || history.records.filter((record) => record.format === "PDF").length !== 2) {
  errors.push("history must retain the 22 recovered HTML sources and two newsletters")
}
const historicalArticleDates = {
  "grupo-historical-site-blog-426905": { publishedAt: "2013-11-10", adjacentNavigationDate: "2013年05月04日" },
  "grupo-historical-site-blog-314658": { publishedAt: "2013-05-04", adjacentNavigationDate: "2013年11月10日" },
}
for (const [id, expected] of Object.entries(historicalArticleDates)) {
  const record = history.records.find((item) => item.id === id)
  if (!record || record.publishedAt !== expected.publishedAt || !record.title.includes(expected.publishedAt)
      || record.blocks.includes(expected.adjacentNavigationDate)) {
    errors.push(`historical article date/navigation contamination: ${id}`)
  }
}
for (const record of history.records) {
  if (!record.blocks.length || !record.sourceUrl || !record.sourceSha256) {
    errors.push(`incomplete historical source: ${record.id}`)
  }
  if (record.documentUrl) {
    const documentPath = path.join(outputDirectory, record.documentUrl.replace(/^\//, ""))
    if (!fs.existsSync(documentPath) || createHash("sha256").update(fs.readFileSync(documentPath)).digest("hex") !== record.sourceSha256) {
      errors.push(`missing or modified archived document: ${record.id}`)
    }
  }
  for (const locale of locales) {
    const html = readOutput(`${locale}/history/index.html`)
    if (!html.includes(`id="${record.id}"`) || !html.includes(`href="${record.sourceUrl}"`)) {
      errors.push(`missing historical source or attribution for ${locale}: ${record.id}`)
    }
  }
}

// A link with a fragment must reach a real heading or section in the export.
for (const file of generatedHtmlFiles) {
  const html = fs.readFileSync(file, "utf8")
  for (const match of html.matchAll(/href="((?:\/[^"#]*)?)#([^"\s]+)"/g)) {
    const [, pathname, fragment] = match
    const target = pathname ? path.join(outputDirectory, pathname.replace(/^\//, ""), "index.html") : file
    if (fs.existsSync(target) && !fs.readFileSync(target, "utf8").includes(`id="${fragment}"`)) {
      errors.push(`broken fragment #${fragment} in ${path.relative(root, file)}`)
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
