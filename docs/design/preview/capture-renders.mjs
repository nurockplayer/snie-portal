// Captures design renders and measured evidence from the preview with headless Chrome.
//
//   node docs/design/preview/build-preview.mjs
//   node docs/design/preview/capture-renders.mjs
//
// Uses the Chrome DevTools Protocol over Node's built-in WebSocket; no dependencies.
// Set CHROME_PATH to override the browser. Writes docs/design/renders/*.png and
// docs/design/renders/evidence.json. Exits non-zero when any asserted check fails.
//
// Legacy SNIE photos are NOT reproduced in committed renders. Their consent is
// `unknown-public-source` (src/content/media-review.json) and #51 has not decided
// whether further persistent copies are permitted, so every request to the legacy
// host is answered with a neutral placeholder of the same role.

import { spawn, execFileSync } from "node:child_process"
import crypto from "node:crypto"
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
const viewports = { 320: [320, 640], 375: [375, 812], 768: [768, 1024], 1280: [1280, 800] }
// Below the 64rem navigation breakpoint the mobile menu is the only navigation.
// 320x200 is a 1280x800 window at 400% zoom; 640x360 is a landscape phone or 200% zoom.
const menuViewports = [[320, 200], [640, 360], [320, 640], [375, 812], [768, 1024]]
const lcpViewports = [[375, 812], [412, 823], [768, 1024], [1280, 800], [1440, 900], [1920, 1080]]
const evidenceInputs = [
  "docs/design/tokens/snie-tokens.json",
  "docs/design/tokens/snie-theme.css",
  "docs/design/preview/preview.css",
  "docs/design/preview/build-preview.mjs",
  "docs/design/preview/capture-renders.mjs",
  "docs/design/proposed-dictionary-keys.json",
  "docs/design/assets/social-preview.svg",
  "src/i18n/dictionaries/ja.json",
  "src/i18n/dictionaries/en.json",
  "src/i18n/dictionaries/zh-TW.json",
  "src/content/media-manifest.json",
  "src/content/media-review.json",
]

if (!fs.existsSync(path.join(dist, "index.html"))) {
  throw new Error("Run build-preview.mjs first")
}

const pageUrl = (locale, page, hash = "") =>
  `${pathToFileURL(path.join(dist, page ? `${locale}/${page}/index.html` : `${locale}/index.html`)).href}${hash}`
const distUrl = (file) => pathToFileURL(path.join(dist, file)).href

const photoPlaceholder = Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" width="592" height="444" viewBox="0 0 592 444"><rect width="592" height="444" fill="#E9EBF1"/><path d="M0 444L592 0M-148 444L444 0M148 444L740 0" stroke="#DFE2EA" stroke-width="40"/><text x="296" y="214" text-anchor="middle" font-family="Inter, sans-serif" font-size="20" fill="#5B6072">Legacy photo withheld</text><text x="296" y="244" text-anchor="middle" font-family="Inter, sans-serif" font-size="16" fill="#5B6072">not reproduced in design evidence (#51)</text></svg>`,
).toString("base64")

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
await cdp("DOM.enable")
await cdp("CSS.enable")
await cdp("Fetch.enable", { patterns: [{ urlPattern: "*snie.my.canva.site/*", requestStage: "Request" }] })

let photoRequestsWithheld = 0
listeners.add((message) => {
  if (message.method !== "Fetch.requestPaused" || message.sessionId !== sessionId) return
  const { requestId, resourceType } = message.params
  photoRequestsWithheld += resourceType === "Image" ? 1 : 0
  cdp("Fetch.fulfillRequest", {
    requestId,
    responseCode: 200,
    responseHeaders: [{ name: "Content-Type", value: "image/svg+xml" }],
    body: photoPlaceholder,
  }).catch(() => {
    // The page navigated away and Chrome cancelled the request; nothing to fulfil.
  })
})

async function evaluate(expression) {
  const result = await cdp("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true })
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description ?? expression)
  return result.result.value
}

const frame = "new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))"
const settle = `Promise.race([
    Promise.all([...document.images].filter((img) => img.loading !== "lazy").map((img) => img.complete ? 0 : new Promise((r) => { img.onload = img.onerror = r }))),
    new Promise((r) => setTimeout(r, 6000)),
  ]).then(() => document.fonts.ready).then(() => ${frame})`

async function setViewport([width, height], forcedColors = false) {
  await cdp("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile: width < 768 })
  await cdp("Emulation.setEmulatedMedia", { features: [{ name: "forced-colors", value: forcedColors ? "active" : "none" }] })
}

async function open(url, size, { forcedColors = false } = {}) {
  await setViewport(size, forcedColors)
  await cdp("Page.navigate", { url: "about:blank" })
  const loaded = waitForEvent("Page.loadEventFired", sessionId)
  await cdp("Page.navigate", { url })
  await loaded
  await evaluate(settle)
}

async function press(key, { shift = false } = {}) {
  const codes = { Tab: 9, Enter: 13, Escape: 27, " ": 32 }
  const base = { key, code: key === " " ? "Space" : key, windowsVirtualKeyCode: codes[key], modifiers: shift ? 8 : 0 }
  const text = key === "Enter" ? "\r" : key === " " ? " " : undefined
  await cdp("Input.dispatchKeyEvent", { type: "keyDown", ...base, ...(text ? { text } : {}) })
  await cdp("Input.dispatchKeyEvent", { type: "keyUp", ...base })
  await evaluate(frame).catch(() => null)
}

async function waitForLocation(fragment, timeoutMs = 10000) {
  const start = Date.now()
  while (Date.now() - start < timeoutMs) {
    const href = await evaluate("document.readyState === 'complete' ? location.href : ''").catch(() => "")
    if (href.includes(fragment)) {
      await evaluate(settle)
      return true
    }
    await new Promise((r) => setTimeout(r, 100))
  }
  return false
}

// Visible = fully inside the viewport and the topmost element at its centre is itself or a descendant.
const visibilityOf = (expr) => `(() => {
  const el = ${expr}
  if (!el) return { ok: false, reason: "missing" }
  const r = el.getBoundingClientRect()
  const inside = r.top >= 0 && r.left >= 0 && r.bottom <= innerHeight + 0.5 && r.right <= innerWidth + 0.5
  const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2)
  const unobscured = !!hit && (hit === el || el.contains(hit))
  return { ok: inside && unobscured, inside, unobscured, top: Math.round(r.top), bottom: Math.round(r.bottom), text: el.textContent.trim().slice(0, 40) }
})()`

const measureExpression = `(() => {
  const header = document.querySelector(".site-header").getBoundingClientRect()
  const bar = document.querySelector(".locale-bar").getBoundingClientRect()
  const target = location.hash ? document.getElementById(decodeURIComponent(location.hash.slice(1))) : null
  const heading = target ? target.querySelector("h3") : null
  const img = document.querySelector(".photo-card img")
  const targets = [...document.querySelectorAll("a, summary, button")]
    .filter((el) => el.getClientRects().length && getComputedStyle(el).visibility !== "hidden" && !el.classList.contains("skip-link"))
    .map((el) => [el, el.getBoundingClientRect()])
  return {
    localeBarHeight: bar.height,
    headerHeight: header.height,
    headerBottom: header.bottom,
    headerPosition: getComputedStyle(document.querySelector(".site-header")).position,
    targetTop: target ? target.getBoundingClientRect().top : null,
    headingTop: heading ? heading.getBoundingClientRect().top : null,
    targetMatches: target ? target.matches(":target") : null,
    horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    documentHeight: document.documentElement.scrollHeight,
    interactiveTargets: targets.length,
    smallTargets: targets.filter(([, r]) => r.width < 44 || r.height < 44).map(([el, r]) => (el.className || el.tagName) + " '" + el.textContent.trim().slice(0, 24) + "' " + Math.round(r.width) + "x" + Math.round(r.height)),
    firstImage: img ? { loading: img.loading, fetchPriority: img.fetchPriority, top: Math.round(img.getBoundingClientRect().top + scrollY), inInitialViewport: img.getBoundingClientRect().top < innerHeight } : null,
  }
})()`

async function screenshot(name, fullPage, [width, height]) {
  let captureHeight = height
  let y = 0
  if (fullPage) {
    // Scroll through like a visitor so lazy images load, then return to the top.
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
      await ${frame}
    })()`)
    captureHeight = await evaluate("document.documentElement.scrollHeight")
  } else {
    y = await evaluate("scrollY")
  }
  const { data } = await cdp("Page.captureScreenshot", {
    format: "png",
    captureBeyondViewport: fullPage,
    clip: { x: 0, y, width, height: captureHeight, scale: 1 },
  })
  fs.writeFileSync(path.join(rendersDir, `${name}.png`), Buffer.from(data, "base64"))
  return `${name}.png`
}

async function platformFonts(selector) {
  const { root } = await cdp("DOM.getDocument", { depth: 0 })
  const { nodeId } = await cdp("DOM.querySelector", { nodeId: root.nodeId, selector })
  if (!nodeId) return null
  const { fonts } = await cdp("CSS.getPlatformFontsForNode", { nodeId })
  return fonts.map((font) => font.familyName)
}

// ---------- Run ----------

// DESIGN_CAPTURE_ONLY=menu or =focus runs only that suite and leaves renders/ untouched;
// used for negative controls (for example, against the pre-review menu CSS).
const only = process.env.DESIGN_CAPTURE_ONLY ?? null
const skip = (suite) => only !== null && only !== suite
if (only === null) {
  fs.mkdirSync(rendersDir, { recursive: true })
  for (const file of fs.readdirSync(rendersDir)) {
    if (file.endsWith(".png")) fs.rmSync(path.join(rendersDir, file))
  }
}

const failures = []
const measurements = []
const renders = []
const fail = (message) => failures.push(message)

// 1. Layout invariants on every localized route, locale and width; normal and forced colours.
for (const forcedColors of skip("layout") ? [] : [false, true]) {
  for (const locale of locales) {
    for (const page of pages) {
      for (const [label, size] of Object.entries(viewports)) {
        if (forcedColors && !["375", "1280"].includes(label)) continue
        await open(pageUrl(locale, page), size, { forcedColors })
        const m = await evaluate(measureExpression)
        const where = `/${locale}/${page} @${label}${forcedColors ? " forced-colors" : ""}`
        measurements.push({ kind: "layout", route: `/${locale}/${page}`, viewport: label, forcedColors, ...m })
        if (m.headerHeight !== 64) fail(`header ${m.headerHeight}px on ${where}`)
        if (m.localeBarHeight !== 44) fail(`locale bar ${m.localeBarHeight}px on ${where}`)
        if (m.horizontalOverflow) fail(`horizontal overflow on ${where}`)
        if (m.smallTargets.length) fail(`targets under 44x44 on ${where}: ${m.smallTargets.join("; ")}`)
        if (page === "" && m.firstImage?.loading !== "eager") fail(`first photo is lazy on ${where} (provisional #55 policy)`)
      }
    }
  }
}

// Root fallback and global 404.
for (const [file, label] of skip("layout") ? [] : [["root/fallback.html", "root"], ["404.html", "404"]]) {
  for (const size of [viewports[320], viewports[1280]]) {
    await open(distUrl(file), size)
    const m = await evaluate(measureExpression)
    const links = await evaluate(`[...document.querySelectorAll(".locale-link")].map((a) => a.getAttribute("hreflang") + "=" + a.getAttribute("href"))`)
    measurements.push({ kind: "layout", route: label, viewport: size.join("x"), localeLinks: links, ...m })
    if (m.headerHeight !== 64 || m.localeBarHeight !== 44 || m.horizontalOverflow || m.smallTargets.length) {
      fail(`${label} @${size.join("x")}: ${JSON.stringify({ h: m.headerHeight, bar: m.localeBarHeight, overflow: m.horizontalOverflow, small: m.smallTargets })}`)
    }
    if (links.length !== 3) fail(`${label}: expected three locale links, got ${links.length}`)
  }
}

// Short viewport: header becomes static and the anchor offset drops to 1rem.
for (const locale of skip("layout") ? [] : locales) {
  await open(pageUrl(locale, "join", "#partner-organizations"), [320, 200])
  const m = await evaluate(measureExpression)
  measurements.push({ kind: "short-viewport-fragment", route: `/${locale}/join/#partner-organizations`, viewport: "320x200", ...m })
  if (m.headerPosition !== "static") fail(`header not static at 320x200 (${locale})`)
  if (!(m.headingTop >= 0 && m.headingTop < 200)) fail(`fragment heading not visible at 320x200 (${locale}): ${m.headingTop}`)
}

// 2. Fragment targets clear the sticky header (#54): direct entry.
for (const locale of skip("layout") ? [] : locales) {
  for (const id of pathIds) {
    for (const label of ["375", "768", "1280"]) {
      await open(pageUrl(locale, "join", `#${id}`), viewports[label])
      const m = await evaluate(measureExpression)
      const clearance = m.headingTop - m.headerBottom
      measurements.push({ kind: "fragment", route: `/${locale}/join/#${id}`, viewport: label, clearance, ...m })
      if (!m.targetMatches) fail(`:target not applied for ${id} (${locale} @${label})`)
      if (clearance < 16) fail(`heading clearance ${clearance}px for ${id} (${locale} @${label})`)
    }
  }
}

// 2b. Home card -> join -> back -> forward (static-document navigation; Next.js client
// navigation is an implementation gate).
const navigationPath = []
for (const locale of skip("layout") ? [] : locales) {
  for (const label of ["375", "1280"]) {
    await open(pageUrl(locale, ""), viewports[label])
    await evaluate(`document.querySelectorAll(".path-card__link")[1].focus()`)
    await press("Enter")
    const arrived = await waitForLocation("#international-students")
    const atTarget = arrived ? await evaluate(measureExpression) : null
    await evaluate("history.back()")
    const backHome = await waitForLocation(`${locale}/index.html`)
    const homeRestored = backHome && (await evaluate(`!location.hash && !!document.querySelector(".hero")`))
    await evaluate("history.forward()")
    const forward = await waitForLocation("#international-students")
    const afterForward = forward ? await evaluate(measureExpression) : null
    const result = {
      locale,
      viewport: label,
      arrived,
      clearanceOnArrival: atTarget ? atTarget.headingTop - atTarget.headerBottom : null,
      targetOnArrival: atTarget?.targetMatches ?? null,
      homeRestored,
      clearanceAfterForward: afterForward ? afterForward.headingTop - afterForward.headerBottom : null,
      targetAfterForward: afterForward?.targetMatches ?? null,
    }
    navigationPath.push(result)
    if (!arrived || result.clearanceOnArrival < 16 || !result.targetOnArrival || !homeRestored || !forward || result.clearanceAfterForward < 16 || !result.targetAfterForward) {
      fail(`home card navigation path: ${JSON.stringify(result)}`)
    }
  }
}

// 3. Mobile menu keyboard and scroll suite (#58, short-viewport reflow).
const menuSuite = []
async function menuRun(locale, size, start, forcedColors = false) {
  const where = `${locale} ${size.join("x")} ${start}${forcedColors ? " forced-colors" : ""}`
  const issues = []
  await open(pageUrl(locale, "join"), size, { forcedColors })
  if (start === "scrolled") {
    await evaluate("scrollTo(0, 600)")
    await evaluate(frame)
  }
  const headerPosition = await evaluate(`getComputedStyle(document.querySelector(".site-header")).position`)
  const headerTop = await evaluate(`Math.round(document.querySelector(".site-header").getBoundingClientRect().top)`)
  const count = await evaluate(`document.querySelectorAll(".menu-link").length`)
  const isOpen = () => evaluate(`document.querySelector("details.menu").open`)
  const activeIsLink = (i) => evaluate(`document.activeElement === document.querySelectorAll(".menu-link")[${i}]`)
  const activeIsSummary = () => evaluate(`document.activeElement === document.querySelector("details.menu summary")`)

  // Open with Space.
  await evaluate(`document.querySelector("details.menu summary").focus()`)
  const summaryVisible = await evaluate(visibilityOf(`document.querySelector("details.menu summary")`))
  if (!summaryVisible.ok) issues.push(`summary not visible ${JSON.stringify(summaryVisible)}`)
  await press(" ")
  if (!(await isOpen())) issues.push("Space did not open")

  // Tab forward through every link.
  for (let i = 0; i < count; i++) {
    await press("Tab")
    if (!(await activeIsLink(i))) issues.push(`Tab ${i + 1}: focus not on link ${i + 1}`)
    const v = await evaluate(visibilityOf("document.activeElement"))
    if (!v.ok) issues.push(`Tab ${i + 1}: focused link not visible ${JSON.stringify(v)}`)
  }

  // Shift+Tab back through every link to the summary.
  for (let i = count - 2; i >= -1; i--) {
    await press("Tab", { shift: true })
    const expectSummary = i === -1
    const onTarget = expectSummary ? await activeIsSummary() : await activeIsLink(i)
    if (!onTarget) issues.push(`Shift+Tab: focus not on ${expectSummary ? "summary" : `link ${i + 1}`}`)
    const v = await evaluate(visibilityOf("document.activeElement"))
    if (!v.ok) issues.push(`Shift+Tab to ${expectSummary ? "summary" : `link ${i + 1}`}: not visible ${JSON.stringify(v)}`)
  }

  // Scrolling: with the menu open, scroll the page to the end, then reveal the last link.
  await evaluate("scrollTo(0, document.documentElement.scrollHeight)")
  await evaluate(`document.querySelectorAll(".menu-link")[${count - 1}].scrollIntoView({ block: "nearest" })`)
  const lastAfterScroll = await evaluate(visibilityOf(`document.querySelectorAll(".menu-link")[${count - 1}]`))
  if (!lastAfterScroll.ok) issues.push(`last link not reachable by scrolling ${JSON.stringify(lastAfterScroll)}`)

  // Tab out of the menu: it closes and the next focused element is visible.
  await evaluate(`document.querySelectorAll(".menu-link")[${count - 1}].focus()`)
  await press("Tab")
  const closedOnLeave = !(await isOpen())
  const leftTo = await evaluate(visibilityOf("document.activeElement"))
  if (!closedOnLeave) issues.push("menu stayed open after focus left it")
  if (!leftTo.ok) issues.push(`element after the menu not visible ${JSON.stringify(leftTo)}`)

  // Enter reopens; Escape from a link closes and returns focus to the summary.
  await evaluate(`document.querySelector("details.menu summary").focus()`)
  await press("Enter")
  if (!(await isOpen())) issues.push("Enter did not open")
  await press("Tab")
  await press("Tab")
  await press("Escape")
  if ((await isOpen()) || !(await activeIsSummary())) issues.push("Escape from a link did not close and return focus")

  // Escape from the summary.
  await press("Enter")
  await press("Escape")
  if ((await isOpen()) || !(await activeIsSummary())) issues.push("Escape from the summary did not close")

  const result = { where, headerPosition, headerTopAtStart: headerTop, links: count, issues }
  menuSuite.push(result)
  if (issues.length) fail(`menu suite ${where}: ${issues.join(" | ")}`)
}

for (const locale of skip("menu") ? [] : locales) {
  for (const size of menuViewports) {
    for (const start of ["top", "scrolled"]) {
      await menuRun(locale, size, start)
    }
  }
}
for (const locale of skip("menu") ? [] : locales) {
  await menuRun(locale, [320, 200], "top", true)
  await menuRun(locale, [375, 812], "scrolled", true)
}

if (only === "menu") {
  socket.close()
  chrome.kill()
  console.log(`Menu-only run: ${menuSuite.length} runs, ${failures.length} failure(s)`)
  for (const failure of failures.slice(0, 40)) console.log(`- ${failure}`)
  process.exit(failures.length ? 1 : 0)
}

// Back navigation after choosing a menu link: the restored page shows a closed menu.
const menuBack = []
for (const locale of skip("menu") ? [] : locales) {
  await open(pageUrl(locale, "join"), viewports[375])
  await evaluate(`document.querySelector("details.menu summary").focus()`)
  await press("Enter")
  await press("Tab")
  await press("Tab")
  await press("Enter")
  const arrived = await waitForLocation(`${locale}/about/index.html`)
  await evaluate("history.back()")
  const back = await waitForLocation(`${locale}/join/index.html`)
  const closed = back && !(await evaluate(`document.querySelector("details.menu").open`))
  menuBack.push({ locale, arrived, back, menuClosedAfterBack: closed })
  if (!arrived || !back || !closed) fail(`menu back navigation (${locale}): ${JSON.stringify({ arrived, back, closed })}`)
}

// 4. Fonts actually used (macOS Chrome only; other platforms untested).
const fontChecks = []
async function expectFonts(label, url, selector, expected) {
  if (only !== null) return
  await open(url, viewports[1280])
  const families = await platformFonts(selector)
  const ok = expected.every((family) => families?.includes(family))
  fontChecks.push({ label, selector, families, expected, ok })
  if (!ok) fail(`fonts for ${label}: got ${JSON.stringify(families)}, expected ${expected.join(" + ")}`)
}
await expectFonts("en h1", pageUrl("en", ""), "h1", ["Inter"])
await expectFonts("ja h1", pageUrl("ja", ""), "h1", ["Inter", "Hiragino Sans"])
await expectFonts("zh-TW h1", pageUrl("zh-TW", ""), "h1", ["Inter", "PingFang TC"])
await expectFonts("繁體中文 link on a ja page", pageUrl("ja", ""), '.locale-link[lang="zh-TW"]', ["PingFang TC"])
await expectFonts("日本語 link on a zh-TW page", pageUrl("zh-TW", ""), '.locale-link[lang="ja"]', ["Hiragino Sans"])
await expectFonts("zh-TW body copy", pageUrl("zh-TW", "join"), ".path-card__description", ["PingFang TC"])
await expectFonts("root fallback h1", distUrl("root/fallback.html"), "h1", ["Inter"])
await expectFonts("root fallback lead (ja)", distUrl("root/fallback.html"), ".lead", ["Hiragino Sans"])
await expectFonts("global 404 h1 (ja)", distUrl("404.html"), "h1", ["Hiragino Sans"])
await expectFonts("繁體中文 link on the global 404", distUrl("404.html"), '.locale-link[lang="zh-TW"]', ["PingFang TC"])
// Fallback: a root without --font-inter still resolves the intended stack (R2).
if (only === null) {
await open(pageUrl("en", "about"), viewports[1280])
await evaluate(`document.querySelectorAll("style").forEach((s) => s.textContent.includes("--font-inter") && s.remove())`)
await evaluate(settle)
const fallbackFonts = await platformFonts("h1")
const fallbackDeclared = await evaluate(`getComputedStyle(document.body).fontFamily`)
fontChecks.push({ label: "en h1 with --font-inter undefined", families: fallbackFonts, computedFontFamily: fallbackDeclared, ok: !!fallbackFonts?.includes("Inter") })
if (!fallbackFonts?.includes("Inter")) fail(`font fallback without --font-inter: ${JSON.stringify(fallbackFonts)}`)
}

// 4b. Keyboard focus sweep: Tab forward through every focusable element, then Shift+Tab
// back, on every route plus the root fallback and 404, at 375x812 and 1280x800. Each focused
// element must show an indicator (an outline of at least 2px, or the card's ::after ring)
// and be fully visible and unobscured, including by the sticky header (WCAG 2.4.7, 2.4.11).
const focusSweep = []
const focusTargets = [
  ...locales.flatMap((locale) => pages.map((page) => [`/${locale}/${page}`, pageUrl(locale, page)])),
  ["root", distUrl("root/fallback.html")],
  ["404", distUrl("404.html")],
]
const focusState = `(() => {
  const el = document.activeElement
  if (!el || el === document.body) return { atBody: true }
  const own = getComputedStyle(el)
  const ring = el.matches(".path-card__link") ? getComputedStyle(el, "::after") : own
  const indicator = ring.outlineStyle !== "none" && parseFloat(ring.outlineWidth) >= 2
  const r = el.getBoundingClientRect()
  const inside = r.top >= 0 && r.left >= 0 && r.bottom <= innerHeight + 0.5 && r.right <= innerWidth + 0.5
  // Hit-test the centre and three points along the top edge: respects stacking order and
  // catches an element partly hidden under the stuck header, not just one hidden at its centre.
  const clampX = (x) => Math.min(innerWidth - 1, Math.max(0, x))
  const clampY = (y) => Math.min(innerHeight - 1, Math.max(0, y))
  const points = [[r.left + r.width / 2, r.top + r.height / 2], [r.left + 3, r.top + 3], [r.left + r.width / 2, r.top + 3], [r.right - 3, r.top + 3]]
  const unobscured = points.every(([x, y]) => {
    const hit = document.elementFromPoint(clampX(x), clampY(y))
    return !!hit && (hit === el || el.contains(hit) || hit.contains(el))
  })
  return { atBody: false, key: (el.className || el.tagName) + " '" + el.textContent.trim().slice(0, 24) + "'", indicator, inside, unobscured, top: Math.round(r.top) }
})()`
for (const [label, url] of skip("focus") ? [] : focusTargets) {
  for (const size of [viewports[375], viewports[1280]]) {
    await open(url, size)
    await evaluate("document.activeElement && document.activeElement.blur(); scrollTo(0, 0)")
    const issues = []
    let forward = 0
    for (let i = 0; i < 120; i++) {
      await press("Tab")
      const state = await evaluate(focusState)
      if (state.atBody) break
      forward++
      if (!state.indicator) issues.push(`Tab ${forward} ${state.key}: no focus indicator`)
      if (!state.inside || !state.unobscured) issues.push(`Tab ${forward} ${state.key}: ${state.inside ? "obscured" : "outside viewport"}`)
    }
    // Headless Chrome wraps focus at the document edges, so walk back exactly as many stops.
    let backward = 0
    for (let i = 0; i < forward; i++) {
      await press("Tab", { shift: true })
      const state = await evaluate(focusState)
      if (state.atBody) {
        issues.push(`Shift+Tab reached the document edge after ${backward} of ${forward} stops`)
        break
      }
      backward++
      if (!state.indicator) issues.push(`Shift+Tab ${backward} ${state.key}: no focus indicator`)
      if (!state.inside || !state.unobscured) issues.push(`Shift+Tab ${backward} ${state.key}: ${state.inside ? "obscured" : "outside viewport"}`)
    }
    focusSweep.push({ route: label, viewport: size.join("x"), forward, backward, issues })
    if (issues.length) fail(`focus sweep ${label} @${size.join("x")}: ${issues.slice(0, 6).join(" | ")}`)
  }
}

if (only === "focus") {
  socket.close()
  chrome.kill()
  console.log(`Focus-only run: ${focusSweep.length} sweeps, ${failures.length} failure(s)`)
  for (const failure of failures.slice(0, 40)) console.log(`- ${failure}`)
  process.exit(failures.length ? 1 : 0)
}

// 5. Observations (recorded, not asserted): first photo position and the LCP element
// the preview reports. Not a performance measurement; #55 is qualified by Lighthouse
// on the implemented build.
const lcpObservations = []
for (const locale of locales) {
  for (const size of lcpViewports) {
    await open(pageUrl(locale, ""), size)
    const observation = await evaluate(`new Promise((resolve) => {
      let last = null
      new PerformanceObserver((list) => { const entries = list.getEntries(); last = entries[entries.length - 1] }).observe({ type: "largest-contentful-paint", buffered: true })
      setTimeout(() => {
        const img = document.querySelector(".photo-card img")
        resolve({
          lcpElement: last && last.element ? last.element.tagName.toLowerCase() + (last.element.className ? "." + String(last.element.className).split(" ")[0] : "") : null,
          firstPhotoTop: img ? Math.round(img.getBoundingClientRect().top + scrollY) : null,
          firstPhotoInInitialViewport: img ? img.getBoundingClientRect().top < innerHeight : null,
        })
      }, 500)
    })`)
    lcpObservations.push({ locale, viewport: size.join("x"), ...observation })
  }
}

// 6. Exploratory (U-04, recorded only): does a sixth primary item (Contact) fit at 1024px?
const contactFit = []
for (const locale of locales) {
  const label = JSON.parse(fs.readFileSync(path.join(repoRoot, `src/i18n/dictionaries/${locale}.json`), "utf8")).nav.contact
  await open(pageUrl(locale, "about"), [1024, 768])
  const result = await evaluate(`(() => {
    const list = document.querySelector(".primary-nav ul")
    const item = list.lastElementChild.cloneNode(true)
    item.querySelector("a").textContent = ${JSON.stringify(label)}
    item.querySelector("a").removeAttribute("aria-current")
    list.appendChild(item)
    const header = document.querySelector(".site-header__inner").getBoundingClientRect()
    const nav = document.querySelector(".primary-nav").getBoundingClientRect()
    const wordmark = document.querySelector(".wordmark").getBoundingClientRect()
    const rows = new Set([...document.querySelectorAll(".primary-nav li")].map((li) => Math.round(li.getBoundingClientRect().top))).size
    return { singleRow: rows === 1, gapToWordmarkPx: Math.round(nav.left - wordmark.right), fitsHeader: nav.right <= header.right + 0.5, overflow: document.documentElement.scrollWidth > innerWidth }
  })()`)
  contactFit.push({ locale, viewport: "1024x768", ...result })
}

// 7. Renders.
const shots = [
  ["home-ja-1280", pageUrl("ja", ""), viewports[1280], true],
  ["home-en-1280", pageUrl("en", ""), viewports[1280], true],
  ["home-zh-TW-1280", pageUrl("zh-TW", ""), viewports[1280], true],
  ["home-ja-375", pageUrl("ja", ""), viewports[375], true],
  ["home-en-375", pageUrl("en", ""), viewports[375], true],
  ["home-zh-TW-375", pageUrl("zh-TW", ""), viewports[375], true],
  ["home-en-320", pageUrl("en", ""), viewports[320], true],
  ["home-ja-768", pageUrl("ja", ""), viewports[768], true],
  ["join-en-1280", pageUrl("en", "join"), viewports[1280], true],
  ["join-ja-375", pageUrl("ja", "join"), viewports[375], true],
  ["join-target-ja-375", pageUrl("ja", "join", "#international-students"), viewports[375], false],
  ["join-target-en-375", pageUrl("en", "join", "#partner-organizations"), viewports[375], false],
  ["join-target-zh-TW-1280", pageUrl("zh-TW", "join", "#japanese-university-students"), viewports[1280], false],
  ["about-ja-375", pageUrl("ja", "about"), viewports[375], true],
  ["activities-ja-1280", pageUrl("ja", "activities"), viewports[1280], true],
  ["news-zh-TW-375", pageUrl("zh-TW", "news"), viewports[375], true],
  ["contact-en-1280", pageUrl("en", "contact"), viewports[1280], true],
  ["contact-zh-TW-375", pageUrl("zh-TW", "contact"), viewports[375], true],
  ["privacy-zh-TW-1280", pageUrl("zh-TW", "privacy"), viewports[1280], true],
  ["privacy-en-375", pageUrl("en", "privacy"), viewports[375], true],
  ["root-fallback-ja-375", distUrl("root/fallback.html"), viewports[375], true],
  ["not-found-ja-1280", distUrl("404.html"), viewports[1280], true],
]

for (const [name, url, size, fullPage] of shots) {
  await open(url, size)
  renders.push({ file: await screenshot(name, fullPage, size), url: path.relative(dist, fileURLToPath(url.split("#")[0])) + (url.includes("#") ? `#${url.split("#")[1]}` : ""), viewport: size, fullPage })
}

async function menuShot(name, locale, size, { scrolled = false, forcedColors = false, scrollPanel = false } = {}) {
  await open(pageUrl(locale, "join"), size, { forcedColors })
  if (scrolled) await evaluate("scrollTo(0, 600)")
  await evaluate(`document.querySelector("details.menu").open = true`)
  if (scrollPanel) await evaluate(`[...document.querySelectorAll(".menu-link")].at(-1).scrollIntoView({ block: "nearest" })`)
  await evaluate(frame)
  renders.push({ file: await screenshot(name, false, size), url: `${locale}/join/index.html`, viewport: size, state: `menu open${scrolled ? ", page scrolled" : ""}${scrollPanel ? ", last link revealed" : ""}${forcedColors ? ", forced-colors (emulated)" : ""}` })
}
await menuShot("menu-open-ja-375", "ja", viewports[375])
await menuShot("menu-open-en-320x200-top", "en", [320, 200])
await menuShot("menu-open-en-320x200-last-link", "en", [320, 200], { scrollPanel: true })
await menuShot("menu-open-zh-TW-375-stuck", "zh-TW", viewports[375], { scrolled: true })
await menuShot("menu-open-zh-TW-640x360", "zh-TW", [640, 360])
await menuShot("forced-colors-menu-ja-375", "ja", viewports[375], { scrolled: true, forcedColors: true })

await open(pageUrl("en", "join", "#international-students"), viewports[1280], { forcedColors: true })
const forcedTargetBorder = await evaluate(`getComputedStyle(document.getElementById("international-students")).borderTopWidth`)
if (forcedTargetBorder !== "3px") fail(`forced-colors :target edge is ${forcedTargetBorder}`)
renders.push({ file: await screenshot("forced-colors-join-en-1280", false, viewports[1280]), url: "en/join/index.html#international-students", viewport: viewports[1280], state: "forced-colors: active (emulated)" })

await open(distUrl("components.html"), viewports[1280])
renders.push({ file: await screenshot("components-board-1280", true, viewports[1280]), url: "components.html", viewport: viewports[1280], fullPage: true })

await open(pathToFileURL(path.resolve(here, "../assets/social-preview.svg")).href, [1200, 630])
renders.push({ file: await screenshot("social-preview-candidate", false, [1200, 630]), url: "../assets/social-preview.svg", viewport: [1200, 630] })

const version = await send("Browser.getVersion")
socket.close()
const exited = new Promise((resolve) => chrome.once("exit", resolve))
chrome.kill()
await exited
fs.rmSync(profileDir, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 })

const git = (...args) => {
  try {
    return execFileSync("git", args, { cwd: repoRoot, encoding: "utf8" }).trim()
  } catch {
    return null
  }
}
const sha256 = (file) => crypto.createHash("sha256").update(fs.readFileSync(path.join(repoRoot, file))).digest("hex")

const layoutRows = measurements.filter((m) => m.kind === "layout")
const fragmentRows = measurements.filter((m) => m.kind === "fragment")
const evidence = {
  label: "MEASURED (preview, macOS Chrome headless). See scope for what this does and does not establish.",
  scope: {
    asserted: [
      "64px header and 44px locale bar on 21 routes x 4 widths, on 21 routes x 2 widths in emulated forced colours, and on the root fallback and global 404",
      "no horizontal overflow; every visible link, summary and button is at least 44x44 CSS px",
      "fragment heading clearance of at least 16px below the header (direct entry, and home card -> back -> forward)",
      "static header and visible fragment heading at 320x200",
      "mobile menu: Space and Enter open; every link focused in order and fully visible and unobscured under Tab and Shift+Tab; last link reachable by scrolling; menu closes when focus leaves; Escape from a link or the summary closes it and returns focus. 5 viewports x 2 scroll states x 3 locales, plus 6 forced-colours runs",
      "menu closed after back navigation",
      "platform fonts used for Latin, Japanese and Traditional Chinese text on localized pages, the root fallback and the global 404, including the var() fallback",
      "keyboard focus sweep (Tab forward and Shift+Tab back through every focusable element) on 21 routes, the root fallback and the global 404 at 375x812 and 1280x800: every focused element has a visible indicator and is fully visible and unobscured, including by the sticky header",
      "forced-colours :target edge is a 3px border",
    ],
    recordedNotAsserted: ["LCP element and first photo position at six viewports (not a performance measurement)", "U-04 sixth navigation item fit at 1024px"],
    notCovered: [
      "iOS, Android and Windows rendering (fonts and layout were measured on macOS only)",
      "native Windows High Contrast (forced colours were emulated)",
      "screen readers",
      "Next.js client-side navigation lifecycle",
      "network performance and Lighthouse LCP",
      "visual quality judgement, which needs human review of the renders",
    ],
  },
  capturedAt: new Date().toISOString(),
  checkout: {
    head: git("rev-parse", "HEAD"),
    uncommittedInputs: git("status", "--porcelain", "--", ...evidenceInputs)?.split("\n").map((line) => line.trim()).filter(Boolean) ?? null,
  },
  inputs: Object.fromEntries(evidenceInputs.map((file) => [file, sha256(file)])),
  browser: version.product,
  platform: `${os.platform()} ${os.release()}`,
  deviceScaleFactor: 1,
  zoom: "100%; the 320x200 and 640x360 cases stand in for 400% and 200% zoom",
  colorScheme: "light",
  legacyPhotos: { policy: "withheld: every legacy-host request was answered with a neutral placeholder", requestsWithheld: photoRequestsWithheld },
  checks: {
    headerHeights: [...new Set(layoutRows.map((m) => m.headerHeight))],
    localeBarHeights: [...new Set(layoutRows.map((m) => m.localeBarHeight))],
    horizontalOverflow: layoutRows.some((m) => m.horizontalOverflow),
    interactiveTargetsChecked: layoutRows.reduce((sum, m) => sum + m.interactiveTargets, 0),
    fragmentClearancePx: { min: Math.min(...fragmentRows.map((m) => m.clearance)), max: Math.max(...fragmentRows.map((m) => m.clearance)) },
    navigationPath,
    menuSuite,
    menuBack,
    focusSweep,
    fontChecks,
    failures,
  },
  observations: { lcp: lcpObservations, contactFit },
  renders: renders.map((r) => ({ ...r, sha256: sha256(path.join("docs/design/renders", r.file)) })),
  measurements,
}

fs.writeFileSync(path.join(rendersDir, "evidence.json"), `${JSON.stringify(evidence, null, 2)}\n`)

if (failures.length) {
  console.error(`Design capture found ${failures.length} failure(s):`)
  for (const failure of failures.slice(0, 60)) console.error(`- ${failure}`)
  process.exitCode = 1
} else {
  console.log(
    `Design capture passed: ${measurements.length} layout measurements, ${evidence.checks.interactiveTargetsChecked} target checks, ${menuSuite.length} menu runs, ${focusSweep.length} focus sweeps (${focusSweep.reduce((n, f) => n + f.forward + f.backward, 0)} focus stops), ${navigationPath.length} navigation paths, ${fontChecks.length} font checks, ${renders.length} renders.`,
  )
}
