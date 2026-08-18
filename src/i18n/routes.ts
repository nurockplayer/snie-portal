import { locales, type Locale } from "@/i18n/config"

const supportedPagePaths = new Set(["", "about", "activities", "news", "join", "contact", "privacy"])

export function getLocalizedPath(pathname: string, locale: Locale) {
  const segments = pathname.split("/").filter(Boolean)
  const pathSegments = segments[0] && locales.includes(segments[0] as Locale) ? segments.slice(1) : segments
  const path = pathSegments.join("/")
  const safePath = supportedPagePaths.has(path) ? path : ""

  return safePath ? `/${locale}/${safePath}` : `/${locale}`
}
