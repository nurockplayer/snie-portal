import fs from "node:fs"
import path from "node:path"

const root = process.cwd()
const locales = ["ja", "en", "zh-TW"]
const pages = ["", "about", "activities", "news", "join", "contact", "privacy"]
const dictionaryFiles = locales.map((locale) => path.join(root, "src", "i18n", "dictionaries", `${locale}.json`))
const sourceExtensions = new Set([".ts", ".tsx", ".json", ".css"])
const errors = []

function requireFile(relativePath) {
  const absolutePath = path.join(root, relativePath)

  if (!fs.existsSync(absolutePath)) {
    errors.push(`missing required file: ${relativePath}`)
  }
}

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name)

    if (entry.isDirectory()) {
      return walk(entryPath)
    }

    return sourceExtensions.has(path.extname(entry.name)) ? [entryPath] : []
  })
}

function collectFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name)

    if (entry.isDirectory()) {
      return collectFiles(entryPath)
    }

    return [entryPath]
  })
}

for (const relativePath of [
  "src/app/robots.ts",
  "src/app/sitemap.ts",
  "src/app/not-found.tsx",
  "src/app/(site)/[locale]/[...missing]/route.ts",
  ".next/prerender-manifest.json",
]) {
  requireFile(relativePath)
}

for (const file of dictionaryFiles) {
  try {
    const dictionary = JSON.parse(fs.readFileSync(file, "utf8"))
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
  } catch (error) {
    errors.push(`invalid dictionary ${path.relative(root, file)}: ${error.message}`)
  }
}

const expectedRoutes = locales.flatMap((locale) =>
  pages.map((page) => (page ? `/${locale}/${page}` : `/${locale}`)),
)
let generatedRoutes = new Set()

try {
  const manifest = JSON.parse(fs.readFileSync(path.join(root, ".next", "prerender-manifest.json"), "utf8"))
  generatedRoutes = new Set(Object.keys(manifest.routes))

  for (const route of expectedRoutes) {
    if (!generatedRoutes.has(route)) {
      errors.push(`missing generated route: ${route}`)
    }
  }
} catch (error) {
  errors.push(`could not inspect prerender manifest: ${error.message}`)
}

const allowedInternalRoutes = new Set(["/", "/robots.txt", "/sitemap.xml", ...expectedRoutes])
const builtHtmlFiles = collectFiles(path.join(root, ".next", "server", "app")).filter((file) => file.endsWith(".html"))

for (const file of builtHtmlFiles) {
  const html = fs.readFileSync(file, "utf8")
  const hrefs = [...html.matchAll(/href="(\/[^\"]*)"/g)].map((match) => match[1])

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

if (!fs.existsSync(path.join(root, ".next", "server", "app", "robots.txt.body"))) {
  errors.push("missing generated robots.txt")
}

if (!fs.existsSync(path.join(root, ".next", "server", "app", "sitemap.xml.body"))) {
  errors.push("missing generated sitemap.xml")
}

if (errors.length > 0) {
  console.error("MVP validation failed:")
  for (const error of errors) {
    console.error(`- ${error}`)
  }
  process.exitCode = 1
} else {
  console.log(`MVP validation passed: ${locales.length * pages.length} localized routes, internal links, dictionaries, metadata endpoints, and placeholder checks.`)
}
