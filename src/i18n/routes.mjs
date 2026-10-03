const locales = ["ja", "en", "zh-TW"]
const supportedPagePaths = new Set(["", "about", "activities", "news", "join", "contact", "privacy", "history"])
// Preserve safe detail paths without shipping all translated record content in navigation JS.
const activityPathPattern = /^news\/\d{4}-\d{2}-\d{2}-[a-z0-9]+(?:-[a-z0-9]+)*$/

export function localizeKnownPath(pathname, locale) {
  if (!locales.includes(locale)) throw new Error("Unsupported navigation locale")
  const segments = pathname.split("/").filter(Boolean)
  const path = (locales.includes(segments[0]) ? segments.slice(1) : segments).join("/")
  const safePath = supportedPagePaths.has(path) || (path.length <= 133 && activityPathPattern.test(path)) ? path : ""
  return safePath ? `/${locale}/${safePath}/` : `/${locale}/`
}
