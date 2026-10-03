import test from "node:test"
import assert from "node:assert/strict"
import fs from "node:fs"
import { recordLocales, activityRecords } from "../src/content/activity-records.mjs"
import { localizeKnownPath } from "../src/i18n/routes.mjs"
import { expectedLocalizedRoutes } from "./smoke-production.mjs"

const locales = ["ja", "en", "zh-TW", "ko"]
const dictionaries = Object.fromEntries(locales.map((locale) => [locale, JSON.parse(fs.readFileSync(new URL(`../src/i18n/dictionaries/${locale}.json`, import.meta.url), "utf8"))]))
const leaves = (value, path = "") => Object.entries(value).flatMap(([key, item]) => typeof item === "object" && item !== null ? leaves(item, `${path}.${key}`) : [[`${path}.${key}`, item]])

test("all four dictionaries have identical keys, arrays and nonempty content", () => {
  const reference = leaves(dictionaries.ja)
  for (const locale of locales) {
    const entries = leaves(dictionaries[locale])
    assert.deepEqual(entries.map(([key]) => key).sort(), reference.map(([key]) => key).sort(), locale)
    for (const [key, value] of entries) {
      assert.equal(typeof value, "string", `${locale}${key}`)
      assert.ok(value.trim(), `${locale}${key}`)
    }
    for (const [key, value] of reference.filter(([key, value]) => key.endsWith(".id") || /^https?:/.test(value))) {
      assert.equal(new Map(entries).get(key), value, `${locale}${key} must preserve shared IDs and destinations`)
    }
  }
})

test("Korean content is translated while SNIE identity and Japanese default stay intact", () => {
  const ko = dictionaries.ko
  assert.equal(ko.site.name, "SNIE")
  assert.equal(ko.site.fullName, dictionaries.ja.site.fullName)
  for (const [key, value] of Object.entries(ko.nav)) assert.match(value, /[가-힣]/, key)
  for (const [key, value] of Object.entries(ko.metadata)) {
    if (key === "home") assert.equal(value.title, ko.site.title)
    else assert.match(value.title, /[가-힣]/, `${key} title`)
    assert.match(value.description, /[가-힣]/, `${key} description`)
  }
  for (const record of activityRecords) {
    assert.match(record.title.ko, /[가-힣]/)
    assert.match(record.summary.ko, /[가-힣]/)
  }
  const config = fs.readFileSync(new URL("../src/i18n/config.ts", import.meta.url), "utf8")
  assert.match(config, /defaultLocale: Locale = "ja"/)
  assert.match(config, /ko: "한국어"/)
  assert.equal(fs.readFileSync(new URL("../public/_redirects", import.meta.url), "utf8").trim(), "/ /ja/ 301")
})

test("all public paths switch in every locale without dropping their page or record slug", () => {
  assert.deepEqual(recordLocales, locales)
  assert.equal(expectedLocalizedRoutes.length, 60)
  for (const locale of locales) assert.equal(expectedLocalizedRoutes.filter((route) => route.startsWith(`/${locale}/`)).length, 15)
  for (const route of expectedLocalizedRoutes) {
    const suffix = route.split("/").slice(2).join("/")
    for (const locale of locales) assert.equal(localizeKnownPath(route, locale), `/${locale}/${suffix}`)
  }
  assert.equal(localizeKnownPath("/ko/not-a-page/", "ja"), "/ja/")
  assert.equal(localizeKnownPath("/ja/not-a-page/", "ko"), "/ko/")
})
