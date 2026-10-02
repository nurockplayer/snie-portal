// Captures design renders and layout measurements from the preview with headless Chrome.
//
//   node docs/design/preview/build-preview.mjs
//   node docs/design/preview/capture-renders.mjs
//
// Uses the Chrome DevTools Protocol over Node's built-in WebSocket; no dependencies.
// Set CHROME_PATH to override the browser. Writes docs/design/renders/*.png and
// docs/design/renders/evidence.json. Exits non-zero when a layout check fails.

import { spawn, execFileSync } from "node:child_process"
import fs from "node:fs"
import os from "node:os"
import path from "node:path"
import { fileURLToPath, pathToFileURL } from "node:url"

const here = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(here, "../../..")
const dist = path.join(here, "dist")
const rendersDir = path.resolve(here, "../renders")
const chromePath = process.env.CHROME_PATH ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
const locales = ["ja", "en", "zh-TW"]
const pages = ["", "about", "activities", "news", "join", "contact", "privacy"]
const pathIds = ["japanese-university-students", "international-students", "partner-organizations"]
const viewports = {
  320: [320, 640],
  375: [375, 812],
  768: [768, 1024],
  1280: [1280, 800],
}

if (!fs.existsSync(path.join(dist, "index.html"))) {
  throw new Error("Run build-preview.mjs first")
}

const pageUrl = (locale, page, hash = "") =>
  `${pathToFileURL(path.join(dist, page ? `${locale}/${page}/index.html` : `${locale}/index.html`)).href}${hash}`

// ---------- Minimal CDP client ----------

const profileDir = fs.mkdtempSync(path.join(os.tmpdir(), "snie-design-chrome-"))
const chrome = spawn(chromePath, [
  "--headless=new",
  "--remote-debugging-port=0",
  `--user-data-dir=${profileDir}`,
  "--no-first-run",
  "--no-default-browser-check",
  "--hide-scrollbars",
  "--allow-file-access-from-files",
  "about:blank",
])

const browserWsUrl = await new Promise((resolve, reject) => {
  let buffer = ""
  chrome.stderr.on("data", (chunk) => {
    buffer += chunk
    const match = buffer.match(/DevTools listening on (ws:\/\/\S+)/)
    if (match) resolve(match[1])
  })
  chrome.on("exit", (code) => reject(new Error(`Chrome exited early (${code}): ${buffer}`)))
})

const socket = new WebSocket(browserWsUrl)
await new Promise((resolve) => socket.addEventListener("open", resolve, { once: true }))

let nextId = 1
const pending = new Map()
const listeners = new Set()

socket.addEventListener("message", (event) => {
  const message = JSON.parse(event.data)
  if (message.id && pending.has(message.id)) {
    const { resolve, reject } = pending.get(message.id)
    pending.delete(message.id)
    if (message.error) reject(new Error(`${message.error.message} ${message.error.data ?? ""}`))
    else resolve(message.result)
  } else if (message.method) {
    for (const listener of listeners) listener(message)
  }
})

function send(method, params = {}, sessionId) {
  const id = nextId++
  socket.send(JSON.stringify({ id, method, params, sessionId }))
  return new Promise((resolve, reject) => pending.set(id, { resolve, reject }))
}

function waitForEvent(method, sessionId, timeoutMs = 15000) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      listeners.delete(listener)
      reject(new Error(`timeout waiting for ${method}`))
    }, timeoutMs)
    const listener = (message) => {
      if (message.method === method && message.sessionId === sessionId) {
        clearTimeout(timer)
        listeners.delete(listener)
        resolve(message.params)
      }
    }
    listeners.add(listener)
  })
}

const { targetId } = await send("Target.createTarget", { url: "about:blank" })
const { sessionId } = await send("Target.attachToTarget", { targetId, flatten: true })
const cdp = (method, params) => send(method, params, sessionId)
await cdp("Page.enable")
await cdp("Runtime.enable")

async function evaluate(expression) {
  const result = await cdp("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true })
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description ?? expression)
  return result.result.value
}

async function open(url, [width, height], { forcedColors = false } = {}) {
  await cdp("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile: width < 768 })
  await cdp("Emulation.setEmulatedMedia", {
    features: [{ name: "forced-colors", value: forcedColors ? "active" : "none" }],
  })
  await cdp("Page.navigate", { url: "about:blank" })
  const loaded = waitForEvent("Page.loadEventFired", sessionId)
  await cdp("Page.navigate", { url })
  await loaded
  // Let remote photos settle (they may be unreachable offline; the fallback then renders).
  await evaluate(`Promise.race([
    Promise.all([...document.images].map((img) => img.complete ? 0 : new Promise((r) => { img.onload = img.onerror = r }))),
    new Promise((r) => setTimeout(r, 6000)),
  ]).then(() => document.fonts.ready).then(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))))`)
}

const measureExpression = `(() => {
  const header = document.querySelector(".site-header").getBoundingClientRect()
  const bar = document.querySelector(".locale-bar").getBoundingClientRect()
  const target = location.hash ? document.getElementById(decodeURIComponent(location.hash.slice(1))) : null
  const heading = target ? target.querySelector("h3") : null
  const img = document.querySelector(".photo-card img")
  return {
    localeBarHeight: bar.height,
    headerHeight: header.height,
    headerBottom: header.bottom,
    targetTop: target ? target.getBoundingClientRect().top : null,
    headingTop: heading ? heading.getBoundingClientRect().top : null,
    targetMatches: target ? target.matches(":target") : null,
    horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    documentHeight: document.documentElement.scrollHeight,
    primaryNavVisible: getComputedStyle(document.querySelector(".primary-nav")).display !== "none",
    bodyFontHead: getComputedStyle(document.body).fontFamily.split(",").slice(0, 3).map((s) => s.trim()).join(", "),
    firstImage: img ? { loading: img.loading, fetchPriority: img.fetchPriority, loaded: img.complete && img.naturalWidth > 0, top: Math.round(img.getBoundingClientRect().top + scrollY), inInitialViewport: img.getBoundingClientRect().top < innerHeight } : null,
    photosUnavailable: document.querySelectorAll(".photo-card__unavailable").length,
    smallTargets: [...document.querySelectorAll("main a, header a, summary, footer a, .locale-bar a")]
      .filter((el) => el.offsetParent !== null && !el.closest(".prose, .statement__body"))
      .map((el) => [el, el.getBoundingClientRect()])
      .filter(([, r]) => r.width > 0 && (r.height < 44 || r.width < 24))
      .map(([el, r]) => el.className + " " + Math.round(r.width) + "x" + Math.round(r.height)),
  }
})()`

async function screenshot(name, fullPage, [width, height]) {
  let captureHeight = height
  if (fullPage) {
    // Scroll through like a visitor so lazy photos load, then return to the top.
    await evaluate(`(async () => {
      for (let y = 0; y < document.documentElement.scrollHeight; y += innerHeight / 2) {
        scrollTo(0, y)
        await new Promise((r) => setTimeout(r, 120))
      }
      await Promise.race([
        Promise.all([...document.images].map((img) => img.complete ? 0 : new Promise((r) => { img.onload = img.onerror = r }))),
        new Promise((r) => setTimeout(r, 6000)),
      ])
      scrollTo(0, 0)
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))
    })()`)
    captureHeight = await evaluate("document.documentElement.scrollHeight")
  }
  const { data } = await cdp("Page.captureScreenshot", {
    format: "png",
    captureBeyondViewport: fullPage,
    clip: { x: 0, y: fullPage ? 0 : await evaluate("scrollY"), width, height: captureHeight, scale: 1 },
  })
  fs.writeFileSync(path.join(rendersDir, `${name}.png`), Buffer.from(data, "base64"))
  return `${name}.png`
}

// ---------- Run ----------

fs.mkdirSync(rendersDir, { recursive: true })
for (const file of fs.readdirSync(rendersDir)) {
  if (file.endsWith(".png")) fs.rmSync(path.join(rendersDir, file))
}

const failures = []
const measurements = []
const renders = []

// 1. Layout invariants on every route, locale and width.
for (const locale of locales) {
  for (const page of pages) {
    for (const [label, size] of Object.entries(viewports)) {
      await open(pageUrl(locale, page), size)
      const m = await evaluate(measureExpression)
      measurements.push({ route: `/${locale}/${page}`, viewport: label, ...m })
      if (m.headerHeight !== 64) failures.push(`header ${m.headerHeight}px on /${locale}/${page} @${label}`)
      if (m.localeBarHeight !== 44) failures.push(`locale bar ${m.localeBarHeight}px on /${locale}/${page} @${label}`)
      if (m.horizontalOverflow) failures.push(`horizontal overflow on /${locale}/${page} @${label}`)
      if (m.smallTargets.length) failures.push(`targets under 44px on /${locale}/${page} @${label}: ${m.smallTargets.join("; ")}`)
      // D-08: with paths above the archive, no photo may be an initial-viewport (LCP) candidate.
      if (page === "" && m.firstImage?.inInitialViewport) failures.push(`first photo inside the initial viewport on /${locale}/ @${label}; revisit D-08`)
    }
  }
}

// 2. Fragment targets clear the sticky header (#54).
for (const locale of locales) {
  for (const id of pathIds) {
    for (const label of ["375", "768", "1280"]) {
      await open(pageUrl(locale, "join", `#${id}`), viewports[label])
      const m = await evaluate(measureExpression)
      const clearance = m.headingTop - m.headerBottom
      measurements.push({ route: `/${locale}/join/#${id}`, viewport: label, clearance, ...m })
      if (!m.targetMatches) failures.push(`:target not applied for ${id} (${locale} @${label})`)
      if (m.targetTop < m.headerBottom) failures.push(`target under header for ${id} (${locale} @${label})`)
      if (clearance < 16) failures.push(`heading clearance ${clearance}px for ${id} (${locale} @${label})`)
    }
  }
}

// 3. Escape closes the mobile menu and returns focus to the summary (#58).
const keyboard = []
for (const locale of locales) {
  await open(pageUrl(locale, "about"), viewports[375])
  await evaluate(`document.querySelector("details.menu summary").focus()`)
  await cdp("Input.dispatchKeyEvent", { type: "keyDown", key: "Enter", code: "Enter", windowsVirtualKeyCode: 13, text: "\r" })
  await cdp("Input.dispatchKeyEvent", { type: "keyUp", key: "Enter", code: "Enter", windowsVirtualKeyCode: 13 })
  const openedByEnter = await evaluate(`document.querySelector("details.menu").open`)
  await cdp("Input.dispatchKeyEvent", { type: "keyDown", key: "Tab", code: "Tab", windowsVirtualKeyCode: 9 })
  await cdp("Input.dispatchKeyEvent", { type: "keyUp", key: "Tab", code: "Tab", windowsVirtualKeyCode: 9 })
  const focusInsideMenu = await evaluate(`!!document.activeElement.closest(".menu__panel")`)
  await cdp("Input.dispatchKeyEvent", { type: "keyDown", key: "Escape", code: "Escape", windowsVirtualKeyCode: 27 })
  await cdp("Input.dispatchKeyEvent", { type: "keyUp", key: "Escape", code: "Escape", windowsVirtualKeyCode: 27 })
  const closed = await evaluate(`!document.querySelector("details.menu").open`)
  const focusOnSummary = await evaluate(`document.activeElement === document.querySelector("details.menu summary")`)
  const result = { locale, openedByEnter, focusInsideMenu, closedByEscape: closed, focusReturnedToSummary: focusOnSummary }
  keyboard.push(result)
  if (!openedByEnter || !focusInsideMenu || !closed || !focusOnSummary) failures.push(`menu keyboard path failed: ${JSON.stringify(result)}`)
}

// 4. Renders.
const shots = [
  ["home-ja-1280", pageUrl("ja", ""), 1280, true],
  ["home-en-1280", pageUrl("en", ""), 1280, true],
  ["home-zh-TW-1280", pageUrl("zh-TW", ""), 1280, true],
  ["home-ja-375", pageUrl("ja", ""), 375, true],
  ["home-en-375", pageUrl("en", ""), 375, true],
  ["home-zh-TW-375", pageUrl("zh-TW", ""), 375, true],
  ["home-en-320", pageUrl("en", ""), 320, true],
  ["home-ja-768", pageUrl("ja", ""), 768, true],
  ["join-en-1280", pageUrl("en", "join"), 1280, true],
  ["join-ja-375", pageUrl("ja", "join"), 375, true],
  ["join-target-ja-375", pageUrl("ja", "join", "#international-students"), 375, false],
  ["join-target-en-375", pageUrl("en", "join", "#partner-organizations"), 375, false],
  ["join-target-zh-TW-1280", pageUrl("zh-TW", "join", "#japanese-university-students"), 1280, false],
  ["about-ja-375", pageUrl("ja", "about"), 375, true],
  ["activities-ja-1280", pageUrl("ja", "activities"), 1280, true],
  ["news-zh-TW-375", pageUrl("zh-TW", "news"), 375, true],
  ["contact-en-1280", pageUrl("en", "contact"), 1280, true],
  ["contact-zh-TW-375", pageUrl("zh-TW", "contact"), 375, true],
  ["privacy-zh-TW-1280", pageUrl("zh-TW", "privacy"), 1280, true],
  ["privacy-en-375", pageUrl("en", "privacy"), 375, true],
]

for (const [name, url, width, fullPage] of shots) {
  const size = viewports[width]
  await open(url, size)
  renders.push({ file: await screenshot(name, fullPage, size), url: path.relative(dist, fileURLToPath(url.split("#")[0])) + (url.includes("#") ? `#${url.split("#")[1]}` : ""), viewport: size, fullPage })
}

await open(pageUrl("ja", "about"), viewports[375])
await evaluate(`document.querySelector("details.menu").open = true`)
renders.push({ file: await screenshot("menu-open-ja-375", false, viewports[375]), url: "ja/about/index.html", viewport: viewports[375], state: "mobile menu open" })

await open(pageUrl("en", "join", "#international-students"), viewports[1280], { forcedColors: true })
const forcedTargetBorder = await evaluate(`getComputedStyle(document.getElementById("international-students")).borderTopWidth`)
if (forcedTargetBorder !== "3px") failures.push(`forced-colors :target edge is ${forcedTargetBorder}`)
renders.push({ file: await screenshot("forced-colors-join-en-1280", false, viewports[1280]), url: "en/join/index.html#international-students", viewport: viewports[1280], state: "forced-colors: active (emulated)" })

await open(pathToFileURL(path.join(dist, "components.html")).href, viewports[1280])
renders.push({ file: await screenshot("components-board-1280", true, viewports[1280]), url: "components.html", viewport: viewports[1280], fullPage: true })

await open(pathToFileURL(path.resolve(here, "../assets/social-preview.svg")).href, [1200, 630])
renders.push({ file: await screenshot("social-preview-candidate", false, [1200, 630]), url: "../assets/social-preview.svg", viewport: [1200, 630] })

const version = await send("Browser.getVersion")
socket.close()
const exited = new Promise((resolve) => chrome.once("exit", resolve))
chrome.kill()
await exited
fs.rmSync(profileDir, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 })

let commit = null
try {
  commit = execFileSync("git", ["rev-parse", "HEAD"], { cwd: repoRoot, encoding: "utf8" }).trim()
} catch {
  commit = null
}

const fragmentRows = measurements.filter((m) => m.clearance !== undefined)
const evidence = {
  label: "MEASURED",
  capturedAt: new Date().toISOString(),
  baseCommit: commit,
  note: "baseCommit is the checkout HEAD when captured; the renders reflect the working tree design files at that time.",
  browser: version.product,
  platform: `${os.platform()} ${os.release()}`,
  deviceScaleFactor: 1,
  zoom: "100%",
  colorScheme: "light",
  photoOrigin: "Remote photos are requested from snie.my.canva.site. If unreachable, the localized unavailable block renders instead.",
  photosUnavailableOnHome: measurements.filter((m) => /^\/[^/]+\/$/.test(m.route)).map((m) => m.photosUnavailable),
  checks: {
    routesChecked: locales.length * pages.length,
    viewportsChecked: Object.keys(viewports).map(Number),
    headerHeights: [...new Set(measurements.map((m) => m.headerHeight))],
    localeBarHeights: [...new Set(measurements.map((m) => m.localeBarHeight))],
    horizontalOverflow: measurements.some((m) => m.horizontalOverflow),
    fragmentClearancePx: { min: Math.min(...fragmentRows.map((m) => m.clearance)), max: Math.max(...fragmentRows.map((m) => m.clearance)) },
    keyboardMenu: keyboard,
    failures,
  },
  renders,
  measurements,
}

fs.writeFileSync(path.join(rendersDir, "evidence.json"), `${JSON.stringify(evidence, null, 2)}\n`)

if (failures.length) {
  console.error(`Design capture found ${failures.length} failure(s):`)
  for (const failure of failures) console.error(`- ${failure}`)
  process.exitCode = 1
} else {
  console.log(`Design capture passed: ${measurements.length} measurements, ${renders.length} renders, keyboard menu path in ${keyboard.length} locales.`)
}
