import assert from "node:assert/strict"
import { createHash } from "node:crypto"
import { readFile, stat } from "node:fs/promises"
import path from "node:path"
import test from "node:test"
import { fileURLToPath } from "node:url"

import {
  derivePublishable,
  groupResourcesByDigest,
  summarizeManifest,
  validateRegistry,
} from "./historical-archive.mjs"

const workspaceRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const registry = JSON.parse(await readFile(path.join(workspaceRoot, "archive/source-registry.json"), "utf8"))
const manifest = JSON.parse(await readFile(path.join(workspaceRoot, "archive/archive-manifest.json"), "utf8"))

test("committed registry and manifest retain the audited starting point and source set", () => {
  assert.doesNotThrow(() => validateRegistry(registry))
  assert.equal(registry.startingMainSha, "a7f234553fb3b590fb8cb123ebb66f8e80173a5d")
  assert.equal(manifest.startingMainSha, registry.startingMainSha)
  assert.deepEqual(
    manifest.sources.map((source) => source.id),
    registry.sources.map((source) => source.id),
  )
  assert.equal(manifest.sources.length, 13)

  for (const [index, source] of registry.sources.entries()) {
    const captured = manifest.sources[index]
    assert.equal(captured.canonicalUrl, source.canonicalUrl)
    assert.equal(captured.sourceClass, source.sourceClass)
    assert.deepEqual(captured.states, source.states)
    assert.deepEqual(captured.rights, source.rights)
    assert.deepEqual(captured.evidence, source.evidence)
    assert.deepEqual(captured.exclusions, source.exclusions ?? [])
    assert.deepEqual(captured.wayback, source.wayback ?? [])
    assert.deepEqual(captured.observations, source.observations ?? [])
    assert.equal(captured.publishable, derivePublishable(source))
  }
})

test("every archived byte matches its recorded size and SHA-256 digest", async () => {
  const archivedPages = manifest.sources.flatMap((source) => source.pages).filter((page) => page.rawPath)
  assert.equal(archivedPages.length, 24)

  for (const page of archivedPages) {
    const absolutePath = path.resolve(workspaceRoot, page.rawPath)
    assert.ok(absolutePath.startsWith(`${path.join(workspaceRoot, "archive/raw")}${path.sep}`))
    const file = await readFile(absolutePath)
    assert.equal(file.byteLength, page.byteLength, page.rawPath)
    assert.equal(createHash("sha256").update(file).digest("hex"), page.sha256, page.rawPath)
    assert.equal((await stat(absolutePath)).isFile(), true)
  }

  assert.equal(archivedPages.filter((page) => page.rawPath.endsWith(".html")).length, 22)
  assert.equal(archivedPages.filter((page) => page.rawPath.endsWith(".pdf")).length, 2)
})

test("committed pages and media remain inside their reviewed registry boundaries", () => {
  for (const [index, source] of registry.sources.entries()) {
    if (!source.crawl) continue
    const captured = manifest.sources[index]
    assert.deepEqual(
      captured.pages.map((page) => page.id),
      source.crawl.pages.map((page) => page.id),
    )

    for (const [pageIndex, page] of captured.pages.entries()) {
      const declaration = source.crawl.pages[pageIndex]
      assert.equal(page.requestedUrl, declaration.url)
      assert.equal(source.crawl.allowedOrigins.includes(new URL(page.finalUrl).origin), true)
      assert.equal(
        declaration.expectedContentTypes.some((expected) => page.contentType.toLowerCase().startsWith(expected)),
        true,
      )
    }

    if (!source.crawl.media) {
      assert.equal(captured.resources.length, 0)
      continue
    }
    assert.ok(captured.resources.length <= source.crawl.media.maxResources)
    for (const resource of captured.resources) {
      assert.equal(source.crawl.media.allowedOrigins.includes(new URL(resource.url).origin), true)
      if (resource.finalUrl) {
        assert.equal(source.crawl.media.allowedOrigins.includes(new URL(resource.finalUrl).origin), true)
      }
    }
  }
})

test("coverage is derived from the committed artifacts rather than source claims", () => {
  assert.deepEqual(manifest.coverage, summarizeManifest(manifest))
  assert.deepEqual(manifest.coverage, {
    pagesArchived: 24,
    pagesUnavailable: 0,
    resourcesAvailable: 152,
    resourcesUnavailable: 3,
    sourcesDiscovered: 13,
    sourcesPublishable: 0,
    sourcesVerifiedByExplicitReview: 0,
    sourcesWithRawCaptures: 4,
    sourcesWithStructuredContent: 0,
  })
})

test("media stays metadata-only and unavailable media retains external preservation evidence", () => {
  const resources = manifest.sources.flatMap((source) => source.resources)
  assert.equal(resources.length, 155)
  assert.equal(resources.every((resource) => resource.archive === "metadata-only"), true)
  assert.equal(resources.every((resource) => resource.publishable === false), true)

  const unavailable = resources.filter((resource) => resource.status === "unavailable")
  assert.equal(unavailable.length, 3)
  assert.equal(unavailable.every((resource) => resource.httpStatus === 404), true)
  assert.equal(unavailable.every((resource) => resource.wayback.some((snapshot) => snapshot.status === 200)), true)

  assert.deepEqual(manifest.duplicateGroups, groupResourcesByDigest(resources))
})

test("publication remains fail-closed for every discovered source", () => {
  assert.equal(manifest.sources.every((source) => derivePublishable(source) === false), true)
  assert.equal(manifest.sources.every((source) => source.publishable === false), true)
})
