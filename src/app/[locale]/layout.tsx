import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { locales, type Locale } from "@/i18n/config"
import { getDictionary } from "@/i18n/dictionaries"
import LanguageSwitcher from "@/components/LanguageSwitcher"
import SiteFooter from "@/components/SiteFooter"

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params

  if (!locales.includes(locale as Locale)) {
    notFound()
  }

  const dict = await getDictionary(locale)

  return {
    title: dict.site.title,
    description: dict.site.description,
    alternates: {
      canonical: `/${locale}`,
    },
  }
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  if (!locales.includes(locale as Locale)) {
    notFound()
  }

  const dict = await getDictionary(locale)

  return (
    <>
      <header className="border-b border-gray-200">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <a href={`/${locale}`} className="text-lg font-bold text-gray-900">
            SNIE
          </a>
          <nav aria-label="Main navigation">
            <ul className="flex items-center gap-6">
              <li><a href={`/${locale}`} className="text-sm text-gray-600 hover:text-gray-900">{dict.nav.home}</a></li>
              <li><a href={`/${locale}/about`} className="text-sm text-gray-600 hover:text-gray-900">{dict.nav.about}</a></li>
              <li><a href={`/${locale}/programs`} className="text-sm text-gray-600 hover:text-gray-900">{dict.nav.programs}</a></li>
              <li><a href={`/${locale}/contact`} className="text-sm text-gray-600 hover:text-gray-900">{dict.nav.contact}</a></li>
              <li><LanguageSwitcher currentLocale={locale} /></li>
            </ul>
          </nav>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <SiteFooter dict={dict} />
    </>
  )
}
