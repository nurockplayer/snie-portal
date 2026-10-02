// Reproducible delivery variants. Never overwrite archived originals or their provenance.
import fs from "node:fs/promises"
import path from "node:path"
import { createHash } from "node:crypto"
import { createRequire } from "node:module"
const require = createRequire(import.meta.url)
const sharp = createRequire(require.resolve("next/package.json"))("sharp")
const root = process.cwd()
const read = async (file) => JSON.parse(await fs.readFile(path.join(root, file), "utf8"))
const gallery = (await read("src/content/gallery.json")).photos
const presentation = await read("src/content/presentation-images.json")
const ids = new Set(Object.values(presentation).map((entry) => entry.photoId))
const photos = [...gallery.filter((photo) => ids.has(photo.id)), ...await read("src/content/portfolio.json"), ...await read("src/content/school-images.json")]
const unique = [...new Map(photos.map((photo) => [photo.src, photo])).values()]
const digest = (data) => createHash("sha256").update(data).digest("hex")
await fs.mkdir(path.join(root, "public/images/responsive"), { recursive: true })
const records = []
for (const photo of unique) {
  const original = await fs.readFile(path.join(root, "public", photo.src))
  if (digest(original) !== photo.sha256) throw new Error(`Source digest mismatch: ${photo.src}`)
  const metadata = await sharp(original).metadata()
  if (metadata.orientation && metadata.orientation !== 1) throw new Error(`Review oriented source before resizing: ${photo.src}`)
  const variants = []
  for (const width of [...new Set([480, 960, photo.width].filter((width) => width <= photo.width))]) {
    const { data, info } = await sharp(original).resize({ width, withoutEnlargement: true }).keepMetadata().webp({ quality: 84, effort: 5 }).toBuffer({ resolveWithObject: true })
    // A larger re-encoding is not an optimization; retain the original as the full-width candidate.
    if (data.length >= original.length * .95) continue
    const outputMetadata = await sharp(data).metadata()
    for (const key of ["icc", "xmp", "iptc"]) {
      if (metadata[key] && !metadata[key].equals(outputMetadata[key])) throw new Error(`Metadata preservation failed: ${photo.src}/${key}`)
    }
    const src = `/images/responsive/${photo.sha256.slice(0, 16)}-${info.width}.webp`
    await fs.writeFile(path.join(root, "public", src), data)
    variants.push({ src, width: info.width, height: info.height, byteLength: data.length, sha256: digest(data) })
  }
  if (variants.length) records.push({ originalSrc: photo.src, originalSha256: photo.sha256, originalByteLength: original.length, width: photo.width, height: photo.height, variants })
}
const manifest = { schemaVersion: 1, generator: `sharp ${sharp.versions.sharp}`, encoding: { format: "webp", quality: 84, effort: 5, preserveMetadata: true, withoutEnlargement: true }, records }
await fs.writeFile(path.join(root, "src/content/image-derivatives.json"), JSON.stringify(manifest, null, 2) + "\n")
const originalBytes = records.reduce((sum, entry) => sum + entry.originalByteLength, 0)
const fullSizeBytes = records.reduce((sum, entry) => sum + (entry.variants.find((variant) => variant.width === entry.width)?.byteLength ?? entry.originalByteLength), 0)
console.log(JSON.stringify({ records: records.length, variants: records.reduce((sum, entry) => sum + entry.variants.length, 0), originalBytes, fullSizeBytes, fullSizeSavingsPercent: Math.round((1 - fullSizeBytes / originalBytes) * 100) }))
