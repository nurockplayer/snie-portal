import type { Locale } from "@/i18n/config"
import { localizeKnownPath } from "./routes.mjs"

export function getLocalizedPath(pathname: string, locale: Locale) {
  return localizeKnownPath(pathname, locale)
}
