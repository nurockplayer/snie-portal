// Static checks for the SNIE Porcelain design authority. No dependencies.
//
//   node docs/design/preview/build-preview.mjs
//   node docs/design/preview/check-design.mjs
//
// Verifies: token JSON and theme CSS agree; every declared contrast pair passes;
// proposed dictionary keys are complete and new; the preview keeps the product
// contracts that scripts/validate-mvp.mjs enforces on the real build.

import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const here = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(here, "../../..")
const designRoot = path.resolve(here, "..")
const dist = path.join(here, "dist")
const locales = ["ja", "en", "zh-TW"]
const pages = ["", "about", "activities", "news", "join", "contact", "privacy"]
const publicIssuesUrl = "https://github.com/nurockplayer/snie-portal/issues/new"
const errors = []
const notes = []

const readJson = (file) => JSON.parse(fs.readFileSync(file, "utf8"))
const tokens = readJson(path.join(designRoot, "tokens/snie-tokens.json"))
const themeCss = fs.readFileSync(path.join(designRoot, "tokens/snie-theme.css"), "utf8")
const proposed = readJson(path.join(designRoot, "proposed-dictionary-keys.json")).keys
const dictionaries = Object.fromEntries(
  locales.map((locale) => [locale, readJson(path.join(repoRoot, `src/i18n/dictionaries/${locale}.json`))]),
)

// 1. Token parity.
for (const [role, token] of Object.entries(tokens.color)) {
  const match = themeCss.match(new RegExp(`${token.css}:\\s*(#[0-9a-fA-F]{6})`))
  if (!match) errors.push(`theme CSS is missing ${token.css} (${role})`)
  else if (match[1].toLowerCase() !== token.value.toLowerCase()) {
    errors.push(`${role}: JSON ${token.value} but CSS ${match[1]}`)
  }
}

const porcelain = tokens.material.porcelain.value.toLowerCase()
if (!themeCss.toLowerCase().includes(`--snie-material-porcelain: ${porcelain}`)) {
  errors.push("porcelain material differs between JSON and CSS")
}

for (const [cssName, expected] of [
  ["--snie-header-height", tokens.layout.headerHeight.value],
  ["--snie-locale-bar-height", tokens.layout.localeBarHeight.value],
  ["--snie-anchor-offset", tokens.layout.anchorOffset.value],
  ["--snie-target-min", tokens.target.minimum.value],
  ["--snie-radius-control", tokens.radius.control.value],
  ["--snie-radius-container", tokens.radius.container.value],
  ["--snie-focus-width", tokens.focus.width.value],
  ["--snie-focus-offset", tokens.focus.offset.value],
  ["--snie-shadow-overlay", tokens.elevation.overlay.value],
]) {
  if (!themeCss.includes(`${cssName}: ${expected};`)) errors.push(`${cssName} should be ${expected}`)
}

if (!/scroll-padding-top:\s*var\(--snie-anchor-offset\)/.test(themeCss)) {
  errors.push("html scroll-padding-top must use --snie-anchor-offset (#54)")
}

// Tachiko upstream values must match the pinned mapping when the sibling checkout exists.
const upstreamMapping = path.resolve(repoRoot, "../tachiko-sheet/docs/design/interface-profile-v1-mapping.json")
if (fs.existsSync(upstreamMapping)) {
  const upstream = Object.fromEntries(readJson(upstreamMapping).roles.map((row) => [row.role, row.value]))
  for (const [role, token] of Object.entries(tokens.color)) {
    const upstreamRole = token.tachiko.split(" ")[0]
    if (upstreamRole in upstream && upstream[upstreamRole].toLowerCase() !== token.value.toLowerCase()) {
      errors.push(`${role} drifted from Tachiko ${upstreamRole}: ${token.value} vs ${upstream[upstreamRole]}`)
    }
  }
  notes.push("Tachiko upstream mapping compared")
} else {
  notes.push("Tachiko sibling checkout not found; upstream comparison skipped")
}

// 2. Contrast.
function luminance(hex) {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
  const linear = (c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
  return 0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b)
}

function contrast(a, b) {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (light + 0.05) / (dark + 0.05)
}

const contrastReport = tokens.contrastPairs.map((pair) => {
  const ratio = contrast(tokens.color[pair.foreground].value, tokens.color[pair.background].value)
  if (ratio < pair.minimum) errors.push(`${pair.foreground} on ${pair.background}: ${ratio.toFixed(2)} < ${pair.minimum}`)
  return `${pair.foreground} on ${pair.background}: ${ratio.toFixed(2)}:1 (min ${pair.minimum})`
})

// 3. Proposed keys: complete, new, and free of draft markers.
const draftMarkers = /To be verified|Coming soon|Check back later/
const lookup = (object, dotted) => dotted.split(".").reduce((value, part) => value?.[part], object)
for (const [key, entry] of Object.entries(proposed)) {
  for (const locale of locales) {
    if (typeof entry[locale] !== "string" || !entry[locale].trim()) errors.push(`proposed ${key} missing ${locale}`)
    if (draftMarkers.test(entry[locale] ?? "")) errors.push(`proposed ${key} (${locale}) contains a draft marker`)
    if (lookup(dictionaries[locale], key) !== undefined) errors.push(`proposed ${key} already exists in ${locale}.json`)
  }
}

// 4. Preview keeps the product contracts.
if (!fs.existsSync(path.join(dist, "index.html"))) {
  errors.push("preview not built: run build-preview.mjs first")
} else {
  const escapeHtml = (value) =>
    value.replace(/[&<>'"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[c])

  for (const locale of locales) {
    const dict = dictionaries[locale]
    for (const page of pages) {
      const file = path.join(dist, page ? `${locale}/${page}/index.html` : `${locale}/index.html`)
      const html = fs.readFileSync(file, "utf8")
      const route = `/${locale}/${page}`

      if (!html.includes(`<html lang="${locale}">`)) errors.push(`${route}: html lang`)
      if (!html.includes(`<title>${escapeHtml(dict.metadata[page || "home"].title)}</title>`)) errors.push(`${route}: title`)
      if ((html.match(/<h1\b/g) ?? []).length !== 1) errors.push(`${route}: exactly one h1 required`)
      if (!html.includes('class="skip-link" href="#main-content"')) errors.push(`${route}: skip link`)
      for (const target of locales) {
        if (!new RegExp(`class="locale-link" lang="${target}" hreflang="${target}"`).test(html)) errors.push(`${route}: locale link ${target}`)
      }
      for (const anchor of html.match(/<a\b[^>]*target="_blank"[^>]*>/g) ?? []) {
        if (!anchor.includes('target="_blank" rel="noreferrer"')) errors.push(`${route}: external link attributes ${anchor}`)
      }
      if (["join", "contact", "privacy"].includes(page) && !html.includes(`href="${publicIssuesUrl}" target="_blank" rel="noreferrer"`)) {
        errors.push(`${route}: public issues link`)
      }
      if (page === "" && !html.includes(`<span class="block">${escapeHtml(dict.media.captionFallback)}</span>`)) {
        errors.push(`${route}: caption markup contract`)
      }
      if (page === "" && /<img [^>]*(loading="eager"|fetchpriority="high")/.test(html)) {
        errors.push(`${route}: photos below the initial viewport must stay lazy (#55, D-08)`)
      }
      if (page === "join") {
        for (const item of dict.pages.join.paths) {
          if (!html.includes(`<article id="${item.id}" class="path-card"`)) errors.push(`${route}: participation target ${item.id}`)
        }
      }
      if (draftMarkers.test(html)) errors.push(`${route}: draft marker`)
      if (/href="#"/.test(html)) errors.push(`${route}: fragment placeholder`)
    }
  }
}

console.log("Contrast:")
for (const line of contrastReport) console.log(`  ${line}`)
for (const note of notes) console.log(`Note: ${note}`)

if (errors.length) {
  console.error(`Design check failed (${errors.length}):`)
  for (const error of errors) console.error(`- ${error}`)
  process.exitCode = 1
} else {
  console.log(
    `Design check passed: ${Object.keys(tokens.color).length} colour roles in parity, ${tokens.contrastPairs.length} contrast pairs, ${Object.keys(proposed).length} proposed keys, ${locales.length * pages.length} preview routes.`,
  )
}
