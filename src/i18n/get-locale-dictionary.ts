import { notFound } from "next/navigation"
import { defaultLocale, locales, type Locale } from "@/i18n/config"
import { getDictionary } from "@/i18n/dictionaries"

export async function getLocaleDictionary(locale: string, options?: { allowInvalid?: boolean }) {
  const isValidLocale = locales.includes(locale as Locale)

  if (!isValidLocale && !options?.allowInvalid) {
    notFound()
  }

  const typedLocale = isValidLocale ? (locale as Locale) : defaultLocale

  return {
    locale: typedLocale,
    dict: await getDictionary(typedLocale),
  }
}
