import assert from "node:assert/strict"
import test from "node:test"
import {
  expectedLocalizedRoutes,
  fetchText,
  validateHtmlRoute,
  validateRobots,
  validateSitemap,
} from "./smoke-production.mjs"

const origin = "https://snie-portal.pages.dev"

test("defines the complete 21-route production surface", () => {
  assert.equal(expectedLocalizedRoutes.length, 21)
  assert.deepEqual(expectedLocalizedRoutes.slice(0, 3), ["/ja/", "/ja/about/", "/ja/activities/"])
})

test("accepts localized metadata and locale navigation", () => {
  const html = `
    <html lang="ja"><head>
      <title>SNIE</title>
      <meta name="description" content="Portal">
      <link rel="canonical" href="${origin}/ja/">
      <meta property="og:url" content="${origin}/ja/">
      <link rel="alternate" hrefLang="ja" href="${origin}/ja/">
      <link rel="alternate" hrefLang="en" href="${origin}/en/">
      <link rel="alternate" hrefLang="zh-TW" href="${origin}/zh-TW/">
      <link rel="alternate" hrefLang="x-default" href="${origin}/ja/">
    </head><body>
      <a href="/ja/">日本語</a><a href="/en/">English</a><a href="/zh-TW/">繁體中文</a>
    </body></html>`

  assert.deepEqual(validateHtmlRoute({ origin, route: "/ja/", locale: "ja", status: 200, html }), [])
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
