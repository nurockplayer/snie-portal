import { notFound } from "next/navigation"
import { locales, type Locale } from "@/i18n/config"
import { getDictionary } from "@/i18n/dictionaries"
import HeroSection from "@/components/HeroSection"
import FeaturesSection from "@/components/FeaturesSection"

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
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

  const dict = await getDictionary(locale)

  return (
    <>
      <HeroSection dict={dict} />
      <FeaturesSection dict={dict} />
    </>
  )
}
