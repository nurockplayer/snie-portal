import type { Metadata } from "next"
import { notFound } from "next/navigation"
import HomePhotoCollection from "@/components/HomePhotoCollection"
import RecentRecords from "@/components/RecentRecords"
import SignatureEvents from "@/components/SignatureEvents"
import OtherEvents from "@/components/OtherEvents"
import SchoolsSection from "@/components/SchoolsSection"
import FeaturesSection from "@/components/FeaturesSection"
import HeroSection from "@/components/HeroSection"
import LegacyMediaSection from "@/components/LegacyMediaSection"
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
      <SignatureEvents dict={dict} locale={typedLocale} />
      <HomePhotoCollection dict={dict} locale={typedLocale} />
      <OtherEvents dict={dict} />
      <SchoolsSection dict={dict} />
      <RecentRecords dict={dict} locale={typedLocale} limit={3} />
      <FeaturesSection dict={dict} locale={typedLocale} />
      <LegacyMediaSection dict={dict} />
    </>
  )
}
