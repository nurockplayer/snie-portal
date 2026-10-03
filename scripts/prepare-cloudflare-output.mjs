import fs from "node:fs/promises"
import path from "node:path"
import { renderLocalized404 } from "./localized-404.mjs"
const root = process.cwd()
const dictionaries = {}
for (const locale of ["ja", "en", "zh-TW", "ko"]) dictionaries[locale] = JSON.parse(await fs.readFile(path.join(root, `src/i18n/dictionaries/${locale}.json`), "utf8"))
const template = await fs.readFile(path.join(root, "out/404.html"), "utf8")
for (const locale of Object.keys(dictionaries)) {
  const html = renderLocalized404(template, dictionaries.ja, dictionaries[locale], locale)
  await fs.writeFile(path.join(root, `out/${locale}/404.html`), html)
}
console.log("Prepared four static locale-specific Cloudflare 404 documents.")
