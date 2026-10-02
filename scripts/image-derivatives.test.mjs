import test from "node:test"
import assert from "node:assert/strict"
import fs from "node:fs/promises"
import { createHash } from "node:crypto"
import { createRequire } from "node:module"
const require = createRequire(import.meta.url)
const sharp = createRequire(require.resolve("next/package.json"))("sharp")
const manifest = JSON.parse(await fs.readFile(new URL("../src/content/image-derivatives.json", import.meta.url), "utf8"))
const asset = (src) => new URL(`../public${src}`, import.meta.url)
const digest = (data) => createHash("sha256").update(data).digest("hex")

test("delivery variants keep originals intact and reduce image bytes", async () => {
  let originalBytes = 0, largestBytes = 0
  for (const record of manifest.records) {
    const original = await fs.readFile(asset(record.originalSrc))
    assert.equal(digest(original), record.originalSha256)
    assert.equal(original.length, record.originalByteLength)
    originalBytes += original.length
    largestBytes += record.variants.find((variant) => variant.width === record.width)?.byteLength ?? original.length
    for (const variant of record.variants) {
      const data = await fs.readFile(asset(variant.src))
      const meta = await sharp(data).metadata()
      assert.equal(digest(data), variant.sha256)
      assert.equal(data.length, variant.byteLength)
      assert.ok(data.length < original.length * .95)
      assert.equal(meta.format, "webp")
      assert.equal(meta.width, variant.width)
      assert.equal(meta.height, variant.height)
      assert.ok(variant.width <= record.width)
      assert.ok(Math.abs(variant.height - record.height * variant.width / record.width) <= 1)
    }
  }
  assert.ok(largestBytes < originalBytes * .6, "full-size candidates should save at least 40% overall")
})

test("delivery variants preserve any original embedded metadata", async () => {
  assert.equal(manifest.encoding.preserveMetadata, true)
  for (const record of manifest.records) {
    const original = await sharp(asset(record.originalSrc).pathname).metadata()
    for (const variant of record.variants) {
      const output = await sharp(asset(variant.src).pathname).metadata()
      for (const key of ["exif", "icc", "xmp", "iptc"]) {
        if (original[key]) assert.deepEqual(output[key], original[key], `${record.originalSrc}: ${key}`)
      }
    }
  }
})
