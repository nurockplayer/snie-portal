import { notFound } from "next/navigation"
import { locales, type Locale } from "@/i18n/config"
import { getDictionary } from "@/i18n/dictionaries"

export async function getLocaleDictionary(locale: string) {
  if (!locales.includes(locale as Locale)) {
    notFound()
  }

  const typedLocale = locale as Locale

  return {
    locale: typedLocale,
    dict: await getDictionary(typedLocale),
  }
}
