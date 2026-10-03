import assert from "node:assert/strict"
import test from "node:test"
import ja from "../src/i18n/dictionaries/ja.json" with { type: "json" }
import { socialPreview } from "../src/content/social-preview.mjs"
import { activityRecords, activityRecordPath } from "../src/content/activity-records.mjs"
import {
  expectedLocalizedRoutes,
  fetchText,
  validateHtmlRoute,
  validateRobots,
  validateRoot,
  validateNotFound,
  validateAssetCache,
  validateHtmlCache,
  extractHashedAssets,
  validateSitemap,
} from "./smoke-production.mjs"

const origin = "https://snie-portal.pages.dev"

test("defines the complete 45-route production surface", () => {
  assert.equal(expectedLocalizedRoutes.length, 45)
  assert.deepEqual(expectedLocalizedRoutes.slice(0, 3), ["/ja/", "/ja/about/", "/ja/activities/"])
})

test("accepts localized metadata and locale navigation", () => {
  const html = `
    <html lang="ja"><head>
      <title>SNIE</title>
      <meta name="description" content="Portal">
      <link rel="canonical" href="${origin}/ja/">
      <meta property="og:url" content="${origin}/ja/">
      <meta property="og:image" content="${origin}${socialPreview.path}">
      <meta property="og:image:width" content="1200">
      <meta property="og:image:height" content="630">
      <meta property="og:image:type" content="image/png">
      <meta property="og:image:alt" content="${ja.socialPreview.alt}">
      <meta name="twitter:card" content="summary_large_image">
      <meta name="twitter:image" content="${origin}${socialPreview.path}">
      <meta name="twitter:image:alt" content="${ja.socialPreview.alt}">
      <link rel="alternate" hrefLang="ja" href="${origin}/ja/">
      <link rel="alternate" hrefLang="en" href="${origin}/en/">
      <link rel="alternate" hrefLang="zh-TW" href="${origin}/zh-TW/">
      <link rel="alternate" hrefLang="x-default" href="${origin}/ja/">
    </head><body>
      <a href="/ja/">日本語</a><a href="/en/">English</a><a href="/zh-TW/">繁體中文</a>
    </body></html>`

  assert.deepEqual(validateHtmlRoute({ origin, route: "/ja/", locale: "ja", status: 200, html }), [])
  for (const attribute of ["og:image", "og:image:alt", "twitter:image", "twitter:card"]) {
    assert.ok(validateHtmlRoute({ origin, route: "/ja/", locale: "ja", status: 200, html: html.replace(`="${attribute}"`, '="omitted"') }).some((error) => error.includes(attribute)))
  }
})

test("fetches binary image bytes without UTF-8 conversion", async () => {
  const bytes = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10])
  const result = await fetchText(origin, socialPreview.path, { binary: true, includeHeaders: true, fetchImpl: async () => new Response(bytes, { headers: { "content-type": "image/png" } }) })
  assert.deepEqual(result.body, bytes)
  assert.equal(result.headers["content-type"], "image/png")
})

test("rejects broken status, metadata, placeholders, and wrong locale", () => {
  const errors = validateHtmlRoute({
    origin,
    route: "/en/about/",
    locale: "en",
    status: 500,
    html: '<html lang="ja"><title>Coming soon</title></html>',
  })

  assert.ok(errors.some((error) => error.includes("expected HTTP 200")))
  assert.ok(errors.some((error) => error.includes("html lang")))
  assert.ok(errors.some((error) => error.includes("canonical")))
  assert.ok(errors.some((error) => error.includes("placeholder")))
})

test("requires the exact absolute sitemap route set", () => {
  const complete = `<?xml version="1.0"?><urlset>${expectedLocalizedRoutes
    .map((route) => `<url><loc>${origin}${route}</loc></url>`)
    .join("")}</urlset>`

  assert.deepEqual(validateSitemap({ origin, status: 200, xml: complete }), [])
  assert.ok(validateSitemap({ origin, status: 200, xml: complete.replace(`${origin}/en/`, "/en/") }).length > 0)
})

test("detail smoke requires past-record content, direct sources and slug-preserving locale links", () => {
  const record = activityRecords[0], route = activityRecordPath("ja", record.id)
  const html = `<html lang="ja"><title>${record.title.ja} | SNIE</title><meta name="description" content="${record.summary.ja}">
    <link rel="canonical" href="${origin}${route}"><meta property="og:url" content="${origin}${route}"><meta property="og:type" content="article">
    <meta property="og:image" content="${origin}${socialPreview.path}"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta property="og:image:type" content="image/png"><meta property="og:image:alt" content="${ja.socialPreview.alt}">
    <meta name="twitter:card" content="summary_large_image"><meta name="twitter:image" content="${origin}${socialPreview.path}"><meta name="twitter:image:alt" content="${ja.socialPreview.alt}">
    ${["ja", "en", "zh-TW"].map((locale) => `<link rel="alternate" hrefLang="${locale}" href="${origin}${activityRecordPath(locale, record.id)}"><a href="${activityRecordPath(locale, record.id)}">${locale}</a>`).join("")}
    <link rel="alternate" hrefLang="x-default" href="${origin}${route}">
    <p>${ja.activityRecord.pastNotice}</p><p>${record.summary.ja}</p><time>${record.eventDate}</time><time>${record.publishedAt}</time><a href="${record.sourceUrl}">Source</a><a href="/ja/news/">Back</a></html>`
  assert.deepEqual(validateHtmlRoute({ origin, route, locale: "ja", status: 200, html }), [])
  assert.ok(validateHtmlRoute({ origin, route, locale: "ja", status: 200, html: html.replace(ja.activityRecord.pastNotice, "") }).some((error) => error.includes("record text")))
  assert.ok(validateHtmlRoute({ origin, route, locale: "ja", status: 200, html: html.replace(`href="${record.sourceUrl}"`, 'href="/ja/"') }).some((error) => error.includes("source or return")))
  assert.ok(validateHtmlRoute({ origin, route, locale: "ja", status: 200, html: html.replace(`href="${activityRecordPath("en", record.id)}"`, 'href="/en/"') }).some((error) => error.includes("language switch")))
})

test("requires the production sitemap in robots", () => {
  assert.deepEqual(
    validateRobots({ origin, status: 200, text: `User-Agent: *\nAllow: /\nSitemap: ${origin}/sitemap.xml\n` }),
    [],
  )
  assert.ok(
    validateRobots({ origin, status: 200, text: `User-Agent: *\nDisallow: /\nSitemap: ${origin}/sitemap.xml\n` }).some(
      (error) => error.includes("wildcard allow"),
    ),
  )
})

test("retries bounded transient responses and honors Retry-After", async () => {
  const responses = [
    new Response("rate limited", { status: 429, headers: { "retry-after": "0" } }),
    new Response("ok", { status: 200 }),
  ]
  const waits = []
  const result = await fetchText(origin, "/ja/", {
    fetchImpl: async () => responses.shift(),
    wait: async (duration) => waits.push(duration),
  })

  assert.deepEqual(result, { status: 200, body: "ok" })
  assert.deepEqual(waits, [0])
})

test("uses attempt backoff when a transient response has no Retry-After", async () => {
  const responses = [new Response("unavailable", { status: 503 }), new Response("ok", { status: 200 })]
  const waits = []
  const result = await fetchText(origin, "/ja/", {
    fetchImpl: async () => responses.shift(),
    wait: async (duration) => waits.push(duration),
  })

  assert.deepEqual(result, { status: 200, body: "ok" })
  assert.deepEqual(waits, [1_000])
})


test("requires a permanent HTTP root redirect and rejects old fallbacks", () => {
  assert.deepEqual(validateRoot({ origin, status: 301, headers: { location: "/ja/" } }), [])
  assert.deepEqual(validateRoot({ origin, status: 308, headers: { location: `${origin}/ja/` } }), [])
  for (const status of [200, 302, 404, 500]) assert.ok(validateRoot({ origin, status, headers: { location: "/ja/" } }).length)
  assert.ok(validateRoot({ origin, status: 301, headers: { location: "https://example.com/ja/" } }).length)
  assert.ok(validateRoot({ origin, status: 301, headers: {} }).length)
})

test("requires localized 404 copy, noindex and the correct return-home action", () => {
  const body = '<html lang="en"><meta name="robots" content="noindex"><h1>Page not found</h1><p>The page you are looking for could not be found.</p><a href="/en/">Back to Home</a></html>'
  assert.deepEqual(validateNotFound({ route: "/en/missing/", locale: "en", status: 404, body }), [])
  assert.ok(validateNotFound({ route: "/en/missing/", locale: "en", status: 200, body }).length)
  assert.ok(validateNotFound({ route: "/en/missing/", locale: "en", status: 404, body: body.replace('href="/en/"', 'href="/ja/"') }).length)
  assert.ok(validateNotFound({ route: "/en/missing/", locale: "en", status: 404, body: body.replace('lang="en"', 'lang="ja"') }).length)
  assert.ok(validateNotFound({ route: "/en/missing/", locale: "en", status: 404, body: body.replace('noindex', 'index') }).length)
})

test("separates immutable hashed assets from revalidatable HTML", () => {
  const html = '<link href="/_next/static/chunks/abc123.css"><link href="/_next/static/media/xyz.woff2"><script src="/_next/static/chunks/def456.js"></script>'
  assert.deepEqual(extractHashedAssets(html), ['/_next/static/chunks/def456.js', '/_next/static/chunks/abc123.css', '/_next/static/media/xyz.woff2'])
  assert.deepEqual(validateAssetCache({ route: '/_next/static/a.js', status: 200, headers: { 'cache-control': 'public, max-age=31536000, immutable' } }), [])
  assert.ok(validateAssetCache({ route: '/_next/static/a.js', status: 200, headers: { 'cache-control': 'public, max-age=0, must-revalidate' } }).length)
  assert.deepEqual(validateHtmlCache({ route: '/ja/', headers: { 'cache-control': 'public, max-age=0, must-revalidate' } }), [])
  assert.ok(validateHtmlCache({ route: '/ja/', headers: { 'cache-control': 'public, max-age=31536000, immutable' } }).length)
})

test("can inspect redirects and cache headers without following", async () => {
  let options
  const result = await fetchText(origin, '/', { redirect: 'manual', includeHeaders: true, fetchImpl: async (_url, init) => { options = init; return new Response('', { status: 301, headers: { location: '/ja/' } }) } })
  assert.equal(options.redirect, 'manual')
  assert.equal(result.headers.location, '/ja/')
  assert.equal(result.status, 301)
})
