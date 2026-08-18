import { spawn } from "node:child_process"
import fs from "node:fs"
import path from "node:path"

const root = process.cwd()
const locales = ["ja", "en", "zh-TW"]
const pages = ["", "about", "activities", "news", "join", "contact", "privacy"]
const dictionaryFiles = locales.map((locale) => path.join(root, "src", "i18n", "dictionaries", `${locale}.json`))
const sourceExtensions = new Set([".ts", ".tsx", ".json", ".css"])
const errors = []
const dictionaries = {}

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

async function waitForServer(server, serverOutput, serverError) {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    if (server.exitCode !== null) {
      throw new Error(`production server exited before becoming ready: ${serverOutput().slice(-500)}`)
    }

    if (serverError()) {
      throw new Error(`production server failed to start: ${serverError().message}`)
    }

    const readyUrl = serverOutput().match(/- Local:\s+(http:\/\/127\.0\.0\.1:\d+)/)?.[1]

    if (!readyUrl) {
      await new Promise((resolve) => setTimeout(resolve, 250))
      continue
    }

    try {
      await fetch(`${readyUrl}/`, { signal: AbortSignal.timeout(750) })
      return readyUrl
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 250))
    }
  }

  throw new Error(`server did not become ready: ${serverOutput().slice(-500)}`)
}

async function stopServer(server) {
  const killServer = (signal) => {
    if (process.platform !== "win32" && server.pid) {
      try {
        process.kill(-server.pid, signal)
        return
      } catch {
        // The process group may already have exited.
      }
    }

    server.kill(signal)
  }

  if (server.exitCode !== null) {
    killServer("SIGKILL")
    return
  }

  await new Promise((resolve) => {
    const timeout = setTimeout(() => {
      killServer("SIGKILL")
      resolve()
    }, 1_000)

    server.once("exit", () => {
      clearTimeout(timeout)
      killServer("SIGKILL")
      resolve()
    })

    killServer("SIGTERM")
  })
}

async function validateNotFoundResponses() {
  const command = process.platform === "win32" ? "pnpm.cmd" : "pnpm"
  let output = ""
  let serverError = null
  const server = spawn(command, ["start", "--hostname", "127.0.0.1", "--port", "0"], {
    cwd: root,
    env: process.env,
    detached: process.platform !== "win32",
    stdio: ["ignore", "pipe", "pipe"],
  })

  server.once("error", (error) => {
    serverError = error
  })

  server.stdout.on("data", (chunk) => {
    output += chunk.toString()
  })
  server.stderr.on("data", (chunk) => {
    output += chunk.toString()
  })

  try {
    const readyUrl = await waitForServer(server, () => output, () => serverError)

    for (const [requestPath, expectedLocale] of [
      ["/does-not-exist/", "ja"],
      ["/fr/", "ja"],
      ["/fr/about/", "ja"],
      ["/fr/activities/", "ja"],
      ["/fr/news/", "ja"],
      ["/fr/join/", "ja"],
      ["/fr/contact/", "ja"],
      ["/fr/privacy/", "ja"],
      ["/ja/not-a-real-page/", "ja"],
      ["/en/not-a-real-page/", "en"],
      ["/zh-TW/not-a-real-page/", "zh-TW"],
    ]) {
      const response = await fetch(`${readyUrl}${requestPath}`, {
        signal: AbortSignal.timeout(2_000),
      })
      const html = await response.text()

      if (response.status !== 404) {
        errors.push(`expected HTTP 404 for ${requestPath}, received ${response.status}`)
      }

      if (!/<html\b[^>]*\slang="[^"]+"/i.test(html)) {
        errors.push(`missing html lang on not-found response: ${requestPath}`)
      } else if (!new RegExp(`<html\\b[^>]*\\slang="${expectedLocale}"`, "i").test(html)) {
        errors.push(`unexpected html lang on not-found response: ${requestPath} (expected ${expectedLocale})`)
      }

      const expectedTitle = `${dictionaries[expectedLocale].notFound.title} | ${dictionaries[expectedLocale].site.name}`

      if (!html.includes(`<title>${expectedTitle}</title>`)) {
        errors.push(`unexpected title on not-found response: ${requestPath}`)
      }
    }
  } catch (error) {
    errors.push(`could not inspect not-found HTTP responses: ${error.message}`)
  } finally {
    await stopServer(server)
  }
}

if (fs.existsSync(path.join(root, ".next", "BUILD_ID"))) {
  await validateNotFoundResponses()
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
