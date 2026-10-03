import test from "node:test"
import assert from "node:assert/strict"
import fs from "node:fs"
import records from "../src/content/recent-records.json" with { type: "json" }
import { activityRecords, activityRecordPath, activityPageSegments, isCalendarDate, validateActivityRecords } from "../src/content/activity-records.mjs"
import { localizeKnownPath } from "../src/i18n/routes.mjs"

const baselineIds = ["2025-09-07-sencha-yoyogi", "2025-08-19-snacks-party", "2025-08-14-jet-summer-exchange", "2025-08-07-summer-cruise", "2025-07-31-jet-speech-contest", "2025-07-12-tokyo-orien", "2025-06-15-short-homestay"]
const clone = () => structuredClone(records)
function rejects(mutate, pattern) { const data = clone(); mutate(data); assert.throws(() => validateActivityRecords(data, "2026-10-03"), pattern) }

test("publishes only the existing seven source-backed activity reports", () => {
  assert.deepEqual(activityRecords.map((record) => record.id), baselineIds)
  assert.deepEqual(validateActivityRecords(records, "2026-10-03"), records)
  assert.equal(new Set(activityPageSegments).size, 7)
  assert.ok(activityRecords.every((record) => record.eventState === "past" && record.publication === "published" && record.type === "activity-report"))
})

test("validates real Gregorian dates and distinguishes event from source-publication dates", () => {
  for (const value of ["2024-02-29", "2025-09-07"]) assert.equal(isCalendarDate(value), true)
  for (const value of ["2025-02-29", "2025-04-31", "2025-13-01", "2025-00-01", "2025-9-7", "2025-09-07T00:00:00Z", ""]) assert.equal(isCalendarDate(value), false)
  rejects((r) => r[0].eventDate = "2025-02-30", /calendar date/)
  rejects((r) => r[0].publishedAt = "2025-09-06", /contradictory/)
  rejects((r) => r[0].sourceReviewedAt = "2099-01-01", /future/)
  rejects((r) => r[0].id = "2025-09-08-sencha-yoyogi", /contradictory/)
})

test("rejects drafts, upcoming/cancelled states and unsupported timed/registration claims", () => {
  for (const field of ["draft", "unreviewed", "scheduled"]) rejects((r) => r[0].publication = field, /only published/)
  for (const state of ["upcoming", "cancelled", "current"]) rejects((r) => r[0].eventState = state, /only published/)
  rejects((r) => r[0].type = "announcement", /only published/)
  rejects((r) => r[0].registrationUrl = "https://example.org/register", /date-only/)
  rejects((r) => r[0].startTime = "09:00", /date-only/)
  rejects((r) => r[0].timeZone = "Asia/Tokyo", /date-only/)
})

test("requires exact locale parity, complete provenance and the existing publication decision", () => {
  rejects((r) => delete r[0].title.en, /four-locale/)
  rejects((r) => delete r[0].title.ko, /four-locale/)
  rejects((r) => r[0].summary.ko = " ", /missing or invalid/)
  rejects((r) => r[0].summary.fr = "Autre", /four-locale/)
  rejects((r) => r[0].summary["zh-TW"] = " ", /missing or invalid/)
  rejects((r) => r[0].sourceName = "", /provenance/)
  rejects((r) => delete r[0].sourceLocator, /provenance/)
  rejects((r) => r[0].publicationDecision = "inferred-from-archive", /publication decision/)
  rejects((r) => r.push(r[0]), /duplicate/)
})

test("source URLs reject insecure, credential-bearing and unreviewed destinations", () => {
  for (const url of ["javascript:alert(1)", "http://jet.ac.jp/page", "https://u:p@jet.ac.jp/page", "https://jet.ac.jp:8443/page", "https://jet.ac.jp/page?token=value", "https://jet.ac.jp/page#value", "https://unreviewed.example/page"]) rejects((r) => r[0].sourceUrl = url, /source URL/)
})

test("all 28 detail paths are stable and language switches preserve the record slug", () => {
  const paths = new Set()
  for (const record of records) for (const from of ["ja", "en", "zh-TW", "ko"]) {
    const current = activityRecordPath(from, record.id); paths.add(current)
    for (const target of ["ja", "en", "zh-TW", "ko"]) assert.equal(localizeKnownPath(current, target), activityRecordPath(target, record.id))
  }
  assert.equal(paths.size, 28)
  assert.throws(() => activityRecordPath("fr", records[0].id), /Unknown/)
  assert.throws(() => activityRecordPath("ja", "unknown"), /Unknown/)
  assert.throws(() => localizeKnownPath("/ja/", "fr"), /Unsupported/)
  for (const path of ["/ja/unknown/", "/ja/news/../../evil/", "/ja/news/not-a-record/", "https://outside.example/"]) assert.equal(localizeKnownPath(path, "en"), "/en/")
  assert.equal(localizeKnownPath("/ja/about/", "zh-TW"), "/zh-TW/about/")
})

test("UI copy distinguishes historical records in all locales", () => {
  const keys = ["pastLabel", "pastNotice", "eventDate", "sourcePublished", "source", "readSource", "backToNews", "dateNote", "summaryHeading", "sourceLocator"]
  for (const locale of ["ja", "en", "zh-TW", "ko"]) {
    const copy = JSON.parse(fs.readFileSync(new URL(`../src/i18n/dictionaries/${locale}.json`, import.meta.url), "utf8")).activityRecord
    assert.deepEqual(Object.keys(copy).sort(), [...keys].sort())
    assert.ok(Object.values(copy).every((value) => typeof value === "string" && value.trim()))
  }
})
