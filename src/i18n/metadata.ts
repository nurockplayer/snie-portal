import type { Metadata } from "next"
import type { Dictionary } from "@/i18n/dictionaries"
import { defaultLocale, locales, type Locale } from "@/i18n/config"

export type PageKey = "home" | "about" | "activities" | "news" | "join" | "contact" | "privacy"

const pageSegments: Record<PageKey, string> = {
  home: "",
  about: "about",
  activities: "activities",
  news: "news",
  join: "join",
  contact: "contact",
  privacy: "privacy",
}

const openGraphLocales: Record<Locale, string> = {
  ja: "ja_JP",
  en: "en_US",
  "zh-TW": "zh_TW",
}

export const defaultSiteUrl = "https://snie-portal.pages.dev"

export function localizedPagePath(locale: Locale, page: PageKey) {
  const segment = pageSegments[page]
  return segment ? `/${locale}/${segment}/` : `/${locale}/`
}

export function getSiteUrl() {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim()

  if (!configuredUrl) {
    return new URL(defaultSiteUrl)
  }

  try {
    const url = new URL(configuredUrl)

    if (url.protocol !== "https:") {
      return new URL(defaultSiteUrl)
    }

    return url
  } catch {
    return new URL(defaultSiteUrl)
  }
}

export function createPageMetadata(dict: Dictionary, locale: Locale, page: PageKey): Metadata {
  const content = dict.metadata[page]
  const pathname = localizedPagePath(locale, page)
  const languages = Object.fromEntries(
    locales.map((targetLocale) => [targetLocale, localizedPagePath(targetLocale, page)]),
  )
  const siteUrl = getSiteUrl()

  return {
    metadataBase: siteUrl,
    title: content.title,
    description: content.description,
    icons: {
      icon: "/favicon.ico",
    },
    alternates: {
      canonical: pathname,
      languages: {
        ...languages,
        "x-default": localizedPagePath(defaultLocale, page),
      },
    },
    openGraph: {
      type: "website",
      siteName: dict.site.fullName,
      title: content.title,
      description: content.description,
      url: pathname,
      locale: openGraphLocales[locale],
    },
    twitter: {
      card: "summary",
      title: content.title,
      description: content.description,
    },
  }
}
