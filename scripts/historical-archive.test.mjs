import assert from "node:assert/strict"
import { access, mkdir, mkdtemp, readFile, readdir, rm } from "node:fs/promises"
import { tmpdir } from "node:os"
import path from "node:path"
import test from "node:test"

import {
  ArchiveBoundaryError,
  canonicalizeUrl,
  crawlRegistry,
  derivePublishable,
  extractHtmlReferences,
  fetchBounded,
  fetchRobots,
  groupResourcesByDigest,
  parseCliArguments,
  parseRobotsTxt,
  rawCapturePath,
  serializeManifest,
  summarizeManifest,
  validateRegistry,
} from "./historical-archive.mjs"

function registrySource(overrides = {}) {
  return {
    id: "example-history",
    label: "Example historical site",
    canonicalUrl: "https://history.example.org/",
    sourceClass: "first-party-candidate",
    states: {
      discovery: "discovered",
      archive: "not-captured",
      structure: "metadata-only",
      verification: "self-identified-official",
      publication: { status: "not-reviewed" },
    },
    rights: { status: "unknown" },
    evidence: [{ url: "https://history.example.org/", note: "Source self-identification" }],
    crawl: {
      allowedOrigins: ["https://history.example.org"],
      pages: [
        {
          id: "home",
          url: "https://history.example.org/",
          expectedContentTypes: ["text/html"],
          capture: "raw",
          fileExtension: "html",
        },
      ],
    },
    ...overrides,
  }
}

test("validates independent archive states and leaves unknown material unpublished", () => {
  const registry = { schemaVersion: 1, sources: [registrySource()] }

  assert.doesNotThrow(() => validateRegistry(registry))
  assert.equal(derivePublishable(registry.sources[0]), false)
})

test("rejects publication approval without a complete explicit decision", () => {
  const source = registrySource()
  source.states.publication = { status: "approved" }

  assert.throws(
    () => validateRegistry({ schemaVersion: 1, sources: [source] }),
    /approved publication requires reviewedBy, reviewedAt, and decisionRef/,
  )
})

test("only an explicit, complete publication review can become publishable", () => {
  const source = registrySource()
  source.states.publication = {
    status: "approved",
    reviewedBy: "SNIE content owner",
    reviewedAt: "2026-08-23T00:00:00.000Z",
    decisionRef: "https://github.com/nurockplayer/snie-portal/issues/22",
  }

  assert.doesNotThrow(() => validateRegistry({ schemaVersion: 1, sources: [source] }))
  assert.equal(derivePublishable(source), true)
})

test("canonicalizes tracking variants while rejecting credentials and scope escapes", () => {
  const boundary = {
    allowedOrigins: ["https://history.example.org"],
    dropQueryParameters: ["fbclid", "utm_*"],
  }

  assert.equal(
    canonicalizeUrl("/event?id=7&utm_source=test&fbclid=abc#photos", "https://history.example.org/", boundary),
    "https://history.example.org/event?id=7",
  )
  assert.equal(canonicalizeUrl("https://elsewhere.example/event", "https://history.example.org/", boundary), null)
  assert.equal(canonicalizeUrl("https://user:secret@history.example.org/", undefined, boundary), null)
})

test("extracts lazy media and links without treating mail or scripts as crawlable URLs", () => {
  const references = extractHtmlReferences(
    `
      <base href="/archive/">
      <a href="event.html?utm_source=legacy#details">Event</a>
      <a href="mailto:person@example.org">Mail</a>
      <img src="thumb.jpg" data-original="https://media.example.org/full.jpg">
      <source srcset="small.jpg 320w, large.jpg 1280w">
      <script src="https://tracker.example.org/pixel.js"></script>
    `,
    "https://history.example.org/index.html",
  )

  assert.deepEqual(references.links, ["https://history.example.org/archive/event.html?utm_source=legacy#details"])
  assert.deepEqual(references.media, [
    "https://history.example.org/archive/large.jpg",
    "https://history.example.org/archive/small.jpg",
    "https://history.example.org/archive/thumb.jpg",
    "https://media.example.org/full.jpg",
  ])
})

test("honors the longest matching robots rule", () => {
  const canFetch = parseRobotsTxt(`
    User-agent: *
    Disallow: /private
    Allow: /private/public.pdf
  `)

  assert.equal(canFetch("/private/public.pdf"), true)
  assert.equal(canFetch("/private/notes"), false)
  assert.equal(canFetch("/history"), true)
})

test("matches a robots product token exactly instead of by substring", () => {
  const canFetch = parseRobotsTxt(
    `
      User-agent: archive
      Disallow: /substring-only

      User-agent: snie-portal-historical-archive
      Disallow: /exact
    `,
    "snie-portal-historical-archive/2.0 (+https://example.org)",
  )

  assert.equal(canFetch("/substring-only"), true)
  assert.equal(canFetch("/exact"), false)
})

test("treats a provider custom 404 as an absent robots file without trusting its body", async () => {
  const response = new Response("provider error page", { status: 404, headers: { "content-type": "text/html" } })
  Object.defineProperty(response, "url", { value: "https://errors.example.net/not-found" })

  const robots = await fetchRobots("http://history.example.org", {
    fetchImpl: async () => response,
    userAgent: "archive-test/1.0",
  })

  assert.equal(robots.present, false)
  assert.equal(robots.availability, "unavailable")
  assert.equal(robots.status, 404)
  assert.equal(robots.finalUrl, "https://errors.example.net/not-found")
  assert.equal(robots.canFetch("/history"), true)
})

test("records any robots 4xx as unavailable but fails closed on server errors", async () => {
  const responseFor = (status) => async () => {
    const response = new Response("provider response", { status, headers: { "content-type": "text/html" } })
    Object.defineProperty(response, "url", { value: "https://media.example.org/robots.txt" })
    return response
  }

  const unavailable = await fetchRobots("https://media.example.org", {
    fetchImpl: responseFor(403),
    userAgent: "archive-test/1.0",
  })
  assert.equal(unavailable.present, false)
  assert.equal(unavailable.availability, "unavailable")
  assert.equal(unavailable.canFetch("/photo.jpg"), true)

  await assert.rejects(
    fetchRobots("https://media.example.org", {
      fetchImpl: responseFor(503),
      userAgent: "archive-test/1.0",
    }),
    /HTTP 503/,
  )
  await assert.rejects(
    fetchRobots("https://media.example.org", {
      fetchImpl: responseFor(429),
      userAgent: "archive-test/1.0",
    }),
    /HTTP 429/,
  )
})

test("checks media-origin robots rules before probing discovered media", async () => {
  const source = registrySource({
    crawl: {
      allowedOrigins: ["https://history.example.org"],
      pages: [
        {
          id: "home",
          url: "https://history.example.org/",
          expectedContentTypes: ["text/html"],
          capture: "metadata-only",
        },
      ],
      media: {
        allowedOrigins: ["https://media.example.org"],
        fromPageIds: ["home"],
        maxResources: 5,
        maxBytesPerResource: 1_000,
        expectedContentTypes: ["image/*"],
      },
    },
  })
  const fakeFetch = async (url) => {
    let response
    if (url === "https://history.example.org/robots.txt") {
      response = new Response("", { status: 404 })
    } else if (url === "https://media.example.org/robots.txt") {
      response = new Response("User-agent: *\nDisallow: /private", {
        status: 200,
        headers: { "content-type": "text/plain" },
      })
    } else if (url === "https://history.example.org/") {
      response = new Response('<img src="https://media.example.org/private/photo.jpg">', {
        status: 200,
        headers: { "content-type": "text/html" },
      })
    } else {
      throw new Error(`Unexpected fetch: ${url}`)
    }
    Object.defineProperty(response, "url", { value: url })
    return response
  }

  await assert.rejects(
    crawlRegistry(
      { schemaVersion: 1, sources: [source] },
      {
        capturedAt: "2026-08-23T00:00:00.000Z",
        delayMs: 0,
        fetchImpl: fakeFetch,
        writeRaw: false,
      },
    ),
    /robots.txt disallows declared media/,
  )
})

test("fails closed when a response redirects outside its declared boundary", async () => {
  const fakeFetch = async () =>
    new Response("unexpected", {
      status: 200,
      headers: { "content-type": "text/html" },
    })
  Object.defineProperty(fakeFetch, "finalUrl", { value: "unused" })

  await assert.rejects(
    fetchBounded("https://history.example.org/", {
      fetchImpl: async (...args) => {
        const response = await fakeFetch(...args)
        Object.defineProperty(response, "url", { value: "https://elsewhere.example/" })
        return response
      },
      allowedOrigins: ["https://history.example.org"],
      expectedContentTypes: ["text/html"],
      maxBytes: 1_000,
    }),
    (error) => error instanceof ArchiveBoundaryError && /redirected outside/.test(error.message),
  )
})

test("fails closed on unexpected content type and response-size overruns", async () => {
  const responseFor = (body, contentType) => async () => {
    const response = new Response(body, { headers: { "content-type": contentType } })
    Object.defineProperty(response, "url", { value: "https://history.example.org/file" })
    return response
  }

  await assert.rejects(
    fetchBounded("https://history.example.org/file", {
      fetchImpl: responseFor("<html></html>", "text/html"),
      allowedOrigins: ["https://history.example.org"],
      expectedContentTypes: ["application/pdf"],
      maxBytes: 1_000,
    }),
    /unexpected content type/,
  )

  await assert.rejects(
    fetchBounded("https://history.example.org/file", {
      fetchImpl: responseFor("0123456789", "text/plain"),
      allowedOrigins: ["https://history.example.org"],
      expectedContentTypes: ["text/plain"],
      maxBytes: 5,
    }),
    /exceeded 5 bytes/,
  )
})

test("groups exact duplicate bytes by digest without guessing from filenames", () => {
  const resources = [
    { url: "https://a.example/photo.jpg", sha256: "same" },
    { url: "https://b.example/unrelated-name.png", sha256: "same" },
    { url: "https://a.example/photo-copy.jpg", sha256: "different" },
    { url: "https://a.example/unavailable.jpg", sha256: null },
  ]

  assert.deepEqual(groupResourcesByDigest(resources), [
    {
      sha256: "same",
      urls: ["https://a.example/photo.jpg", "https://b.example/unrelated-name.png"],
    },
  ])
})

test("serializes equivalent manifests byte-for-byte deterministically", () => {
  const first = serializeManifest({ z: 2, sources: [{ z: true, a: "source" }], a: 1 })
  const second = serializeManifest({ a: 1, sources: [{ a: "source", z: true }], z: 2 })

  assert.equal(first, second)
  assert.equal(first, '{\n  "a": 1,\n  "sources": [\n    {\n      "a": "source",\n      "z": true\n    }\n  ],\n  "z": 2\n}\n')
})

test("uses the full capture timestamp in raw paths so same-day captures cannot overwrite each other", () => {
  assert.equal(
    rawCapturePath("archive/raw", "2026-08-23T13:31:48.000Z", "example-history", {
      id: "home",
      fileExtension: "html",
    }),
    "archive/raw/2026-08-23T13-31-48-000Z/example-history/home.html",
  )
})

test("accepts pnpm's standalone argument separator", () => {
  assert.deepEqual(
    parseCliArguments(["--", "--captured-at", "2026-08-23T13:42:45.000Z", "--no-raw"]),
    {
      registryPath: "archive/source-registry.json",
      outputPath: "archive/archive-manifest.json",
      rawRoot: "archive/raw",
      capturedAt: "2026-08-23T13:42:45.000Z",
      delayMs: 250,
      writeRaw: false,
    },
  )
})

test("commits a successful raw capture through one timestamp directory", async () => {
  const temporaryRoot = await mkdtemp(path.join(tmpdir(), "snie-archive-success-"))
  const rawRoot = path.join(temporaryRoot, "raw")
  const capturedAt = "2026-08-23T13:43:35.000Z"
  const fakeFetch = async (url) => {
    const response = url.endsWith("/robots.txt")
      ? new Response("", { status: 404 })
      : new Response("<html><title>Archived</title></html>", {
          status: 200,
          headers: { "content-type": "text/html" },
        })
    Object.defineProperty(response, "url", { value: url })
    return response
  }

  try {
    const manifest = await crawlRegistry(
      { schemaVersion: 1, sources: [registrySource()] },
      { capturedAt, delayMs: 0, fetchImpl: fakeFetch, rawRoot },
    )
    const target = rawCapturePath(rawRoot, capturedAt, "example-history", {
      id: "home",
      fileExtension: "html",
    })

    assert.equal(await readFile(target, "utf8"), "<html><title>Archived</title></html>")
    assert.equal(manifest.sources[0].pages[0].status, "archived")
    assert.deepEqual((await readdir(rawRoot)).sort(), ["2026-08-23T13-43-35-000Z"])
  } finally {
    await rm(temporaryRoot, { recursive: true, force: true })
  }
})

test("leaves no raw capture when a later declared page fails", async () => {
  const temporaryRoot = await mkdtemp(path.join(tmpdir(), "snie-archive-failure-"))
  const rawRoot = path.join(temporaryRoot, "raw")
  const source = registrySource()
  source.crawl.pages.push({
    id: "missing",
    url: "https://history.example.org/missing",
    expectedContentTypes: ["text/html"],
    capture: "raw",
    fileExtension: "html",
  })
  const fakeFetch = async (url) => {
    const response = url.endsWith("/robots.txt")
      ? new Response("", { status: 404 })
      : new Response(url.endsWith("/missing") ? "missing" : "<html></html>", {
          status: url.endsWith("/missing") ? 500 : 200,
          headers: { "content-type": "text/html" },
        })
    Object.defineProperty(response, "url", { value: url })
    return response
  }

  try {
    await assert.rejects(
      crawlRegistry(
        { schemaVersion: 1, sources: [source] },
        {
          capturedAt: "2026-08-23T13:43:35.000Z",
          delayMs: 0,
          fetchImpl: fakeFetch,
          rawRoot,
        },
      ),
      /HTTP 500/,
    )
    await assert.rejects(access(rawRoot))
  } finally {
    await rm(temporaryRoot, { recursive: true, force: true })
  }
})

test("refuses to overwrite an existing timestamp before making a network request", async () => {
  const temporaryRoot = await mkdtemp(path.join(tmpdir(), "snie-archive-existing-"))
  const rawRoot = path.join(temporaryRoot, "raw")
  const capturedAt = "2026-08-23T13:43:35.000Z"
  await mkdir(path.join(rawRoot, "2026-08-23T13-43-35-000Z"), { recursive: true })
  let requests = 0

  try {
    await assert.rejects(
      crawlRegistry(
        { schemaVersion: 1, sources: [registrySource()] },
        {
          capturedAt,
          delayMs: 0,
          fetchImpl: async () => {
            requests += 1
            throw new Error("Network should not be called")
          },
          rawRoot,
        },
      ),
      /capture timestamp already exists/,
    )
    assert.equal(requests, 0)
  } finally {
    await rm(temporaryRoot, { recursive: true, force: true })
  }
})

test("reports discovery, archival, structure, verification, and publication separately", () => {
  const summary = summarizeManifest({
    sources: [
      {
        states: {
          discovery: "discovered",
          archive: "raw-capture",
          structure: "metadata-only",
          verification: "self-identified-official",
          publication: { status: "not-reviewed" },
        },
        pages: [{ status: "archived" }, { status: "unavailable" }],
        resources: [{ status: "available" }, { status: "unavailable" }],
      },
    ],
  })

  assert.deepEqual(summary, {
    sourcesDiscovered: 1,
    sourcesWithRawCaptures: 0,
    sourcesWithStructuredContent: 0,
    sourcesVerifiedByExplicitReview: 0,
    sourcesPublishable: 0,
    pagesArchived: 1,
    pagesUnavailable: 1,
    resourcesAvailable: 1,
    resourcesUnavailable: 1,
  })
})
