import type { Metadata } from "next"
import type { Dictionary } from "@/i18n/dictionaries"
import { defaultLocale, locales, type Locale } from "@/i18n/config"
import { socialPreview } from "@/content/social-preview.mjs"
import { activityById, activityRecordPath } from "@/content/activity-records.mjs"

export type PageKey = "home" | "about" | "activities" | "news" | "join" | "contact" | "privacy" | "history"

const pageSegments: Record<PageKey, string> = {
  home: "",
  about: "about",
  activities: "activities",
  news: "news",
  join: "join",
  contact: "contact",
  privacy: "privacy",
  history: "history",
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
  const image = { url: new URL(socialPreview.path, siteUrl).href, width: socialPreview.width, height: socialPreview.height, type: socialPreview.type, alt: dict.socialPreview.alt }

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
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title: content.title,
      description: content.description,
      images: [{ url: image.url, alt: image.alt }],
    },
  }
}

export function createActivityMetadata(dict: Dictionary, locale: Locale, id: string): Metadata {
  const record = activityById.get(id)
  if (!record) throw new Error("Unknown activity metadata record")
  const base = createPageMetadata(dict, locale, "news")
  const title = `${record.title[locale]} | SNIE`
  const description = record.summary[locale]
  const pathname = activityRecordPath(locale, id)
  return {
    ...base,
    title,
    description,
    alternates: {
      canonical: pathname,
      languages: { ...Object.fromEntries(locales.map((target) => [target, activityRecordPath(target, id)])), "x-default": activityRecordPath(defaultLocale, id) },
    },
    openGraph: { ...base.openGraph, type: "article", title, description, url: pathname },
    twitter: { ...base.twitter, card: "summary_large_image", title, description },
  }
}
