import test from "node:test"
import assert from "node:assert/strict"
import fs from "node:fs"
import { createHash } from "node:crypto"
import { socialPreview, validateSocialPreview } from "../src/content/social-preview.mjs"
const png = fs.readFileSync(new URL(`../public${socialPreview.path}`, import.meta.url))
const headers = { "content-type": "image/png" }

test("social card is a stable, source-controlled 1200 × 630 PNG", () => {
  assert.deepEqual(validateSocialPreview({ status: 200, headers, body: png }), [])
  const integrity = JSON.parse(fs.readFileSync(new URL("../src/content/social-preview-integrity.json", import.meta.url), "utf8"))
  const hash = (value) => createHash("sha256").update(value).digest("hex")
  assert.equal(hash(png), integrity.imageSha256)
  assert.equal(png.length, integrity.imageBytes)
  assert.ok(png.length < 100_000)
  const svg = fs.readFileSync(new URL("../public/images/social/snie-social-card.svg", import.meta.url))
  assert.equal(hash(svg), integrity.sourceSha256)
  assert.doesNotMatch(svg.toString(), /<image\b|https?:\/\/(?!www\.w3\.org\/2000\/svg)/i)
})

test("rejects missing images, HTML fallbacks, non-PNG bodies and wrong dimensions", () => {
  assert.ok(validateSocialPreview({ status: 404, headers, body: png }).length)
  assert.ok(validateSocialPreview({ status: 200, headers: { "content-type": "text/html" }, body: png }).length)
  assert.ok(validateSocialPreview({ status: 200, headers, body: Buffer.from("<html>fallback</html>") }).length)
  const wrongSize = Buffer.from(png)
  wrongSize.writeUInt32BE(600, 16)
  assert.ok(validateSocialPreview({ status: 200, headers, body: wrongSize }).length)
})
