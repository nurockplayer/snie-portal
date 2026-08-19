import type { MetadataRoute } from "next"
import { locales, type Locale } from "@/i18n/config"
import { getSiteUrl, localizedPagePath, type PageKey } from "@/i18n/metadata"

export const dynamic = "force-static"

const pages: PageKey[] = ["home", "about", "activities", "news", "join", "contact", "privacy"]

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl()

  return locales.flatMap((locale) =>
    pages.map((page) => {
      const pathname = localizedPagePath(locale as Locale, page)

      return {
        url: new URL(pathname, siteUrl).toString(),
      }
    }),
  )
}
