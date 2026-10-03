import sourceRecords from "./recent-records.json" with { type: "json" }

export const recordLocales = ["ja", "en", "zh-TW", "ko"]
export const recordSlugPattern = /^\d{4}-\d{2}-\d{2}-[a-z0-9]+(?:-[a-z0-9]+)*$/

export function isCalendarDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const date = new Date(`${value}T00:00:00.000Z`)
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value
}

/** @template T @param {T} records @param {string} [asOf] @returns {T} */
export function validateActivityRecords(records, asOf = new Date().toISOString().slice(0, 10)) {
  if (!Array.isArray(records) || !records.length) throw new Error("Activity records must be a nonempty array")
  if (!isCalendarDate(asOf)) throw new Error("Invalid activity validation date")
  const seen = new Set()
  for (const record of records) {
    const id = record?.id ?? "(missing id)"
    const fail = (message) => { throw new Error(`Activity record ${id}: ${message}`) }
    if (typeof id !== "string" || id.length > 128 || !recordSlugPattern.test(id) || seen.has(id)) fail("invalid or duplicate stable slug")
    seen.add(id)
    if (record.type !== "activity-report" || record.publication !== "published" || record.eventState !== "past" || record.datePrecision !== "day") fail("only published, past, day-precision activity reports are supported; keep drafts on branches")
    for (const key of ["eventDate", "publishedAt", "sourceReviewedAt"]) if (!isCalendarDate(record[key])) fail(`invalid calendar date: ${key}`)
    if (!id.startsWith(`${record.eventDate}-`) || record.eventDate > record.publishedAt || record.publishedAt > record.sourceReviewedAt || record.sourceReviewedAt > asOf) fail("contradictory or future event, publication or review dates")
    if (record.timeZone || record.startTime || record.registrationUrl) fail("the approved source set supplies date-only reports, not timed events or registration")
    for (const key of ["title", "summary"]) {
      if (!record[key] || JSON.stringify(Object.keys(record[key]).sort()) !== JSON.stringify([...recordLocales].sort())) fail(`exact four-locale content required: ${key}`)
      for (const locale of recordLocales) if (typeof record[key][locale] !== "string" || !record[key][locale].trim() || record[key][locale].length > (key === "title" ? 160 : 1000)) fail(`missing or invalid ${locale} ${key}`)
    }
    let url
    try { url = new URL(record.sourceUrl) } catch { fail("invalid source URL") }
    if (url.protocol !== "https:" || url.username || url.password || url.hash || url.search || url.port || !["jet.ac.jp", "ogasawararyuu.blog.jp"].includes(url.hostname)) fail("source URL must be an approved HTTPS publisher without credentials, queries or fragments")
    for (const key of ["sourceName", "sourceLocator"]) if (typeof record[key] !== "string" || !record[key].trim()) fail(`missing provenance: ${key}`)
    if (record.publicationDecision !== "editorial-release-63") fail("record is outside the existing editorial publication decision")
  }
  return records
}

export const activityRecords = validateActivityRecords(sourceRecords)
export const activityById = new Map(activityRecords.map((record) => [record.id, record]))
export const activityPageSegments = activityRecords.map((record) => `news/${record.id}`)

export function activityRecordPath(locale, id) {
  if (!recordLocales.includes(locale) || !activityById.has(id)) throw new Error("Unknown activity record or locale")
  return `/${locale}/news/${id}/`
}
