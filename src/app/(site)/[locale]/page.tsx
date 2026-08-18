import type { Metadata } from "next"
import { notFound } from "next/navigation"
import FeaturesSection from "@/components/FeaturesSection"
import HeroSection from "@/components/HeroSection"
import { locales, type Locale } from "@/i18n/config"
import { getDictionary } from "@/i18n/dictionaries"
import { createPageMetadata } from "@/i18n/metadata"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params

  if (!locales.includes(locale as Locale)) {
    notFound()
  }

  const typedLocale = locale as Locale
  const dict = await getDictionary(typedLocale)

  return createPageMetadata(dict, typedLocale, "home")
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
