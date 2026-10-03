import type { MetadataRoute } from "next"
import { locales, type Locale } from "@/i18n/config"
import { getSiteUrl, localizedPagePath, type PageKey } from "@/i18n/metadata"
import { activityRecords, activityRecordPath } from "@/content/activity-records.mjs"

export const dynamic = "force-static"

const pages: PageKey[] = ["home", "about", "activities", "news", "join", "contact", "privacy", "history"]

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl()

  return locales.flatMap((locale) =>
    [...pages.map((page) => {
      const pathname = localizedPagePath(locale as Locale, page)

      return {
        url: new URL(pathname, siteUrl).toString(),
      }
    }), ...activityRecords.map((record) => ({ url: new URL(activityRecordPath(locale, record.id), siteUrl).toString() }))],
  )
}
