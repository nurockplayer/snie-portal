// Static checks for the SNIE Porcelain design authority. No dependencies.
//
//   node docs/design/preview/build-preview.mjs
//   node docs/design/preview/check-design.mjs
//
// Verifies, as structural checks (no rendering):
// - token JSON and theme CSS agree, and every font stack carries the var() fallback;
// - SNIE values match Tachiko Sheet at the pinned commit, read with `git show` and
//   verified by SHA-256 (set TACHIKO_SHEET_DIR if the checkout is not ../tachiko-sheet;
//   set DESIGN_ALLOW_UPSTREAM_SKIP=1 to report the comparison as SKIPPED instead of failing);
// - every declared contrast pair passes (numeric token check, not rendered-page contrast);
// - proposed dictionary keys are complete and new;
// - the preview keeps the contracts scripts/validate-mvp.mjs enforces on the real build,
//   including the root fallback and global 404;
// - renders/evidence.json was captured from exactly the current inputs and recorded no failures.

import { execFileSync } from "node:child_process"
import crypto from "node:crypto"
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

for (const stack of ["--snie-font-latin", "--snie-font-ja", "--snie-font-zh-tw"]) {
  if (!new RegExp(`${stack}: var\\(--font-inter, Inter\\),`).test(themeCss)) errors.push(`${stack} must start with var(--font-inter, Inter)`)
}
if (/var\(--font-inter\)/.test(themeCss)) errors.push("bare var(--font-inter) without a fallback in theme CSS")

// Tachiko upstream, bound to the pinned commit and source hashes.
const sha256 = (buffer) => crypto.createHash("sha256").update(buffer).digest("hex")
const tachikoDir = process.env.TACHIKO_SHEET_DIR ?? path.resolve(repoRoot, "../tachiko-sheet")
let upstreamStatus = "SKIPPED"
function upstreamFile(file) {
  return execFileSync("git", ["-C", tachikoDir, "show", `${tokens.upstream.commit}:${file}`], { maxBuffer: 1 << 26 })
}
try {
  const sources = {}
  for (const source of tokens.upstream.sources) {
    const buffer = upstreamFile(source.path)
    if (sha256(buffer) !== source.sha256) errors.push(`upstream ${source.path} at ${tokens.upstream.commit.slice(0, 7)} hash mismatch`)
    sources[source.path] = buffer.toString("utf8")
  }
  const mapping = Object.fromEntries(JSON.parse(sources["docs/design/interface-profile-v1-mapping.json"]).roles.map((row) => [row.role, row.value]))
  const shellCss = sources["src/ui/sheet-shell.css"]
  let compared = 0
  for (const [role, token] of Object.entries(tokens.color)) {
    const source = token.tachiko.split(" ")[0]
    let upstreamValue = null
    if (source in mapping) upstreamValue = mapping[source]
    else if (source.startsWith("--ts-")) upstreamValue = shellCss.match(new RegExp(`${source}:\\s*(#[0-9a-fA-F]{6})`))?.[1] ?? null
    if (!upstreamValue) {
      errors.push(`${role}: upstream source ${source} not found at the pinned commit`)
      continue
    }
    compared++
    if (upstreamValue.toLowerCase() !== token.value.toLowerCase()) errors.push(`${role} differs from Tachiko ${source}: ${token.value} vs ${upstreamValue}`)
  }
  if (!shellCss.includes(`--ts-shadow: ${tokens.elevation.overlay.value};`)) errors.push("overlay shadow differs from Tachiko --ts-shadow")
  if (!/:root\[data-ts-profile-chrome="porcelain"\] \{\s*--ts-radius: 7px;/.test(shellCss)) errors.push("control radius differs from Tachiko porcelain --ts-radius")
  upstreamStatus = `PASS (${compared} colour roles, 4 sources hash-verified at ${tokens.upstream.commit.slice(0, 7)})`
} catch (error) {
  if (process.env.DESIGN_ALLOW_UPSTREAM_SKIP === "1") upstreamStatus = `SKIPPED (${error.message.split("\n")[0]})`
  else errors.push(`cannot read Tachiko at ${tokens.upstream.commit.slice(0, 7)} from ${tachikoDir}: ${error.message.split("\n")[0]}`)
}
notes.push(`Tachiko upstream comparison: ${upstreamStatus}`)

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
      if (page === "") {
        // Provisional #55 policy (§6.13): first photo not lazy, every later photo lazy,
        // at most one high-priority photo.
        const photos = html.match(/<img [^>]*>/g) ?? []
        if (photos.length && /loading="lazy"/.test(photos[0])) errors.push(`${route}: first photo must not be lazy`)
        if (photos.slice(1).some((img) => !/loading="lazy"/.test(img))) errors.push(`${route}: later photos must be lazy`)
        if (photos.filter((img) => /fetchpriority="high"/.test(img)).length > 1) errors.push(`${route}: more than one high-priority photo`)
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

  // Root redirect fallback and global 404 (validate-mvp contracts the compositions must keep).
  const rootHtml = fs.readFileSync(path.join(dist, "root/index.html"), "utf8")
  const notFoundHtml = fs.readFileSync(path.join(dist, "404.html"), "utf8")
  const ja = dictionaries.ja
  for (const [label, html, expected] of [
    ["root", rootHtml, [ja.site.title, ja.site.description, ja.pages.homeLink]],
    ["404", notFoundHtml, [ja.notFound.title, ja.notFound.description, ja.notFound.backHome]],
  ]) {
    if (!html.includes('<html lang="ja">')) errors.push(`${label}: html lang must be ja`)
    if ((html.match(/<h1\b/g) ?? []).length !== 1) errors.push(`${label}: exactly one h1 required`)
    if (!html.includes('class="skip-link" href="#main-content"')) errors.push(`${label}: skip link`)
    if (!/noindex/.test(html)) errors.push(`${label}: noindex`)
    for (const text of expected) if (!html.includes(escapeHtml(text))) errors.push(`${label}: missing "${text}"`)
    for (const target of locales) {
      if (!new RegExp(`class="locale-link" lang="${target}" hreflang="${target}" href="[^"]*${target}/index.html"`).test(html)) {
        errors.push(`${label}: locale link to the ${target} home`)
      }
    }
    if (/aria-current/.test(html)) errors.push(`${label}: no locale is the current page here`)
  }
}

// 5. Evidence is bound to the current inputs.
const evidenceFile = path.join(designRoot, "renders/evidence.json")
if (!fs.existsSync(evidenceFile)) {
  errors.push("renders/evidence.json missing: run capture-renders.mjs")
} else {
  const evidence = readJson(evidenceFile)
  for (const [file, hash] of Object.entries(evidence.inputs ?? {})) {
    const current = fs.existsSync(path.join(repoRoot, file)) ? sha256(fs.readFileSync(path.join(repoRoot, file))) : null
    if (current !== hash) errors.push(`evidence is stale: ${file} changed since capture; rerun capture-renders.mjs`)
  }
  if (!evidence.inputs || Object.keys(evidence.inputs).length < 10) errors.push("evidence.json does not record its inputs")
  if (evidence.checks?.failures?.length) errors.push(`evidence.json recorded ${evidence.checks.failures.length} capture failure(s)`)
  for (const render of evidence.renders ?? []) {
    const file = path.join(designRoot, "renders", render.file)
    if (!fs.existsSync(file) || sha256(fs.readFileSync(file)) !== render.sha256) errors.push(`render ${render.file} missing or altered since capture`)
  }
  notes.push(`Evidence: ${evidence.renders?.length ?? 0} renders and ${Object.keys(evidence.inputs ?? {}).length} inputs hash-bound, captured ${evidence.capturedAt}`)
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
