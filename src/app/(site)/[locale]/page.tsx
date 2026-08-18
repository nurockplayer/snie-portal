import type { Metadata } from "next"
import { notFound } from "next/navigation"
import FeaturesSection from "@/components/FeaturesSection"
import HeroSection from "@/components/HeroSection"
import { locales, type Locale } from "@/i18n/config"
import { getDictionary } from "@/i18n/dictionaries"
import { getLocaleDictionary } from "@/i18n/get-locale-dictionary"
import { createPageMetadata } from "@/i18n/metadata"

export const dynamicParams = false

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale, dict } = await getLocaleDictionary((await params).locale, { allowInvalid: true })

  return createPageMetadata(dict, locale, "home")
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  if (!locales.includes(locale as Locale)) {
    notFound()
  }

  const typedLocale = locale as Locale
  const dict = await getDictionary(typedLocale)

  return (
    <>
      <HeroSection dict={dict} locale={typedLocale} />
      <FeaturesSection dict={dict} locale={typedLocale} />
    </>
  )
}
