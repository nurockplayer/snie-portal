import assert from "node:assert/strict"
import test from "node:test"

import {
  applyReviewOverrides,
  deduplicateAssets,
  extractImageReferences,
  normalizeUrl,
  parseCliArguments,
  parseRobotsTxt,
  serializeManifest,
} from "./legacy-media-crawler.mjs"

const sourcePage = "https://snie.my.canva.site/snie-com"
const crawlOptions = {
  allowedOrigin: "https://snie.my.canva.site",
  allowedPathPrefix: "/snie-com",
}

test("normalizes relative image URLs and rejects unrelated origins", () => {
  assert.equal(
    normalizeUrl("images/hero.jpg#mobile", "https://snie.my.canva.site/snie-com/", crawlOptions),
    "https://snie.my.canva.site/snie-com/images/hero.jpg",
  )
  assert.equal(
    normalizeUrl("https://snie.my.canva.site/snie-com/images/hero.jpg?x=1#fragment", sourcePage, crawlOptions),
    "https://snie.my.canva.site/snie-com/images/hero.jpg?x=1",
  )
  assert.equal(normalizeUrl("https://cdn.example.com/photo.jpg", sourcePage, crawlOptions), null)
})

test("extracts image src, responsive variants, source metadata, and context", () => {
  const html = `
    <base href="/snie-com/">
    <section>
      <h2>Legacy events</h2>
      <figure>
        <picture>
          <source srcset="images/hero-wide.jpg 1024w, images/hero-medium.jpg 640w">
          <img src="images/hero.jpg#source" srcset="images/hero-small.jpg 320w, images/hero.jpg 640w" alt="Source-provided alt">
        </picture>
        <figcaption>Source-provided caption</figcaption>
      </figure>
    </section>
  `

  const references = extractImageReferences(html, sourcePage, crawlOptions)

  assert.equal(references.length, 1)
  assert.deepEqual(references[0], {
    primaryUrl: "https://snie.my.canva.site/snie-com/images/hero.jpg",
    primaryWidth: 640,
    variants: [
      { url: "https://snie.my.canva.site/snie-com/images/hero-medium.jpg", width: 640 },
      { url: "https://snie.my.canva.site/snie-com/images/hero-small.jpg", width: 320 },
      { url: "https://snie.my.canva.site/snie-com/images/hero-wide.jpg", width: 1024 },
    ],
    alt: "Source-provided alt",
    caption: "Source-provided caption",
    context: "Legacy events",
    dimensions: { width: null, height: null },
  })
})

test("preserves bounded visible section text when no semantic heading exists", () => {
  const references = extractImageReferences(
    '<base href="/snie-com/"><section><p>Visible source context</p><div><img src="images/context.jpg"></div></section>',
    sourcePage,
    crawlOptions,
  )

  assert.equal(references[0].context, "Visible source context")
})

test("preserves explicit image dimensions when the source provides them", () => {
  const references = extractImageReferences(
    '<base href="/snie-com/"><img width="1200" height="800" src="images/dimensions.jpg">',
    sourcePage,
    crawlOptions,
  )

  assert.deepEqual(references[0].dimensions, { width: 1200, height: 800 })
})

test("deduplicates primary assets and merges responsive variants deterministically", () => {
  const references = [
    {
      primaryUrl: "https://snie.my.canva.site/snie-com/images/b.jpg",
      primaryWidth: null,
      variants: [{ url: "https://snie.my.canva.site/snie-com/images/b-small.jpg", width: 320 }],
      alt: null,
      caption: null,
      context: "Second page",
      sourcePageUrl: "https://snie.my.canva.site/snie-com#page-2",
    },
    {
      primaryUrl: "https://snie.my.canva.site/snie-com/images/a.jpg",
      primaryWidth: null,
      variants: [{ url: "https://snie.my.canva.site/snie-com/images/a-large.jpg", width: 1024 }],
      alt: "A",
      caption: null,
      context: "First page",
      sourcePageUrl: "https://snie.my.canva.site/snie-com",
    },
    {
      primaryUrl: "https://snie.my.canva.site/snie-com/images/b.jpg",
      primaryWidth: null,
      variants: [{ url: "https://snie.my.canva.site/snie-com/images/b-large.jpg", width: 1024 }],
      alt: "B",
      caption: "Caption B",
      context: "First page",
      sourcePageUrl: "https://snie.my.canva.site/snie-com",
    },
  ]

  const assets = deduplicateAssets(references, "2026-08-19T00:00:00.000Z")

  assert.equal(assets.length, 2)
  assert.deepEqual(assets.map(({ originalUrl, sourcePages, variants }) => ({ originalUrl, sourcePages, variants })), [
    {
      originalUrl: "https://snie.my.canva.site/snie-com/images/a.jpg",
      sourcePages: ["https://snie.my.canva.site/snie-com"],
      variants: [{ url: "https://snie.my.canva.site/snie-com/images/a-large.jpg", width: 1024 }],
    },
    {
      originalUrl: "https://snie.my.canva.site/snie-com/images/b.jpg",
      sourcePages: ["https://snie.my.canva.site/snie-com", "https://snie.my.canva.site/snie-com#page-2"],
      variants: [
        { url: "https://snie.my.canva.site/snie-com/images/b-large.jpg", width: 1024 },
        { url: "https://snie.my.canva.site/snie-com/images/b-small.jpg", width: 320 },
      ],
    },
  ])
  assert.equal(assets[1].sourceMetadata.alt, "B")
  assert.equal(assets[1].sourceMetadata.caption, "Caption B")
  assert.equal(assets[0].originalWidth, null)
})

test("parses wildcard robots rules and honors the longest matching rule", () => {
  const canFetch = parseRobotsTxt(`
    User-agent: *
    Disallow: /snie-com/private
    Allow: /snie-com/private/public.jpg
  `)

  assert.equal(canFetch("/snie-com/private/public.jpg"), true)
  assert.equal(canFetch("/snie-com/private/notes"), false)
  assert.equal(canFetch("/snie-com/images/photo.jpg"), true)
})

test("keeps consecutive robots user-agent directives in one group", () => {
  const canFetch = parseRobotsTxt(`
    User-agent: *
    User-agent: ExampleBot
    Disallow: /snie-com/shared
  `)

  assert.equal(canFetch("/snie-com/shared/photo.jpg"), false)
})

test("serializes equivalent manifests byte-for-byte deterministically", () => {
  const manifest = { b: 2, assets: [{ z: true, a: "asset" }], a: 1 }
  const first = serializeManifest(manifest)
  const second = serializeManifest({ a: 1, assets: [{ a: "asset", z: true }], b: 2 })

  assert.equal(first, second)
  assert.equal(first, '{\n  "a": 1,\n  "assets": [\n    {\n      "a": "asset",\n      "z": true\n    }\n  ],\n  "b": 2\n}\n')
})

test("merges explicit review overrides without changing source provenance", () => {
  const manifest = {
    assets: [
      {
        id: "asset-1",
        originalUrl: "https://snie.my.canva.site/snie-com/images/a.jpg",
        sourcePages: ["https://snie.my.canva.site/snie-com"],
        sourceMetadata: { alt: null, caption: null, context: "Source context" },
        review: { status: "inventory-only", publishable: false },
      },
    ],
  }

  const reviewed = applyReviewOverrides(manifest, {
    "asset-1": {
      status: "reviewed",
      reuse: "selected-for-publication",
      consent: "confirmed",
      publishable: true,
      altText: "Photo from the source",
    },
  })

  assert.deepEqual(reviewed.assets[0].sourcePages, manifest.assets[0].sourcePages)
  assert.deepEqual(reviewed.assets[0].sourceMetadata, manifest.assets[0].sourceMetadata)
  assert.deepEqual(reviewed.assets[0].review, {
    status: "reviewed",
    reuse: "selected-for-publication",
    consent: "confirmed",
    publishable: true,
    altText: "Photo from the source",
  })
})

test("keeps the longest available source context deterministically", () => {
  const assets = deduplicateAssets(
    [
      {
        primaryUrl: "https://snie.my.canva.site/snie-com/images/context.jpg",
        primaryWidth: null,
        variants: [],
        alt: null,
        caption: null,
        context: "Alpha",
        sourcePageUrl: sourcePage,
      },
      {
        primaryUrl: "https://snie.my.canva.site/snie-com/images/context.jpg",
        primaryWidth: null,
        variants: [],
        alt: null,
        caption: null,
        context: "Longer source context",
        sourcePageUrl: sourcePage,
      },
    ],
    "2026-08-19T00:00:00.000Z",
  )

  assert.equal(assets[0].sourceMetadata.context, "Longer source context")
})

test("allows an explicitly selected public-source asset without claiming consent verification", () => {
  const manifest = {
    assets: [
      {
        id: "asset-1",
        originalUrl: "https://snie.my.canva.site/snie-com/images/a.jpg",
        sourcePages: [],
        sourceMetadata: { alt: "Source alt", caption: null, context: null },
        review: { status: "inventory-only", reuse: "not-reviewed", consent: "not-reviewed", publishable: false },
      },
    ],
  }

  const reviewed = applyReviewOverrides(manifest, {
    "asset-1": {
      status: "reviewed",
      reuse: "selected-for-publication",
      consent: "unknown-public-source",
      publishable: true,
      altTextKey: "costumeFieldGroup",
    },
  })

  assert.deepEqual(reviewed.assets[0].review, {
    status: "reviewed",
    reuse: "selected-for-publication",
    consent: "unknown-public-source",
    publishable: true,
    altTextKey: "costumeFieldGroup",
  })
})

test("parses forwarded CLI arguments after the package-manager separator", () => {
  assert.deepEqual(parseCliArguments(["--", "--captured-at", "2026-08-19T00:00:00.000Z", "--delay-ms=0"]), {
    "captured-at": "2026-08-19T00:00:00.000Z",
    "delay-ms": "0",
  })
})
