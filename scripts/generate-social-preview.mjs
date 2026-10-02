import fs from "node:fs/promises"
import { createHash } from "node:crypto"
import { createRequire } from "node:module"
const require = createRequire(import.meta.url)
const sharp = createRequire(require.resolve("next/package.json"))("sharp")
const source = new URL("../public/images/social/snie-social-card.svg", import.meta.url)
const output = new URL("../public/images/social/snie-social-card.png", import.meta.url)
const svg = await fs.readFile(source)
const png = await sharp(svg).flatten({ background: "#f8f8fc" }).png({ compressionLevel: 9 }).toBuffer()
await fs.writeFile(output, png)
const sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex")
await fs.writeFile(new URL("../src/content/social-preview-integrity.json", import.meta.url), JSON.stringify({ sourceSha256: sha256(svg), imageSha256: sha256(png), imageBytes: png.length }, null, 2) + "\n")
console.log(`Generated the source-controlled SNIE social card (${png.length} bytes).`)
