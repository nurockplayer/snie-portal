import test from "node:test"
import assert from "node:assert/strict"
import ja from "../src/i18n/dictionaries/ja.json" with { type: "json" }
import en from "../src/i18n/dictionaries/en.json" with { type: "json" }
import zhTW from "../src/i18n/dictionaries/zh-TW.json" with { type: "json" }
import ko from "../src/i18n/dictionaries/ko.json" with { type: "json" }
import { renderLocalized404 } from "./localized-404.mjs"
const template = `<html lang="ja"><head><link rel="stylesheet" href="/_next/static/test.css"><link rel="preload" as="script" href="/test.js"><script>ignore()</script><title>${ja.notFound.title} | SNIE</title><meta name="robots" content="noindex, nofollow"></head><body><h1>${ja.notFound.title}</h1><p>${ja.notFound.description}</p><a href="/ja/">${ja.notFound.backHome}</a><nav aria-label="${ja.accessibility.languageSwitcher}"><a href="/ja/" lang="ja">日本語</a><a href="/en/" lang="en">English</a></nav></body></html>`
for (const [locale, dictionary] of Object.entries({ ja, en, "zh-TW": zhTW, ko })) {
  test(`builds a static, locale-correct ${locale} error document`, () => {
    const html = renderLocalized404(template, ja, dictionary, locale)
    assert.ok(html.includes(`<html lang="${locale}"`))
    assert.ok(html.includes(dictionary.notFound.title))
    assert.ok(html.includes(`<a href="/${locale}/">${dictionary.notFound.backHome}</a>`))
    assert.ok(html.includes('href="/ja/" lang="ja"'), "language-switch links remain independently correct")
    assert.ok(html.includes('rel="stylesheet"'))
    assert.ok(html.includes("noindex"))
    assert.ok(!html.includes("<script") && !html.includes('as="script"'))
  })
}
test("fails closed when the built template contract changes", () => {
  assert.throws(() => renderLocalized404('<html lang="en"></html>', ja, en, "en"), /template/)
  assert.throws(() => renderLocalized404(template, ja, en, "fr"), /Unsupported/)
})
