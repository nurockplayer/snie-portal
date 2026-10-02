import type { Metadata } from "next"
import { Inter } from "next/font/google"
import type { ReactNode } from "react"
import SiteFooter from "@/components/SiteFooter"
import SiteHeader from "@/components/SiteHeader"
import { defaultLocale, locales, type Locale } from "@/i18n/config"
import { getDictionary } from "@/i18n/dictionaries"
import { getLocaleDictionary } from "@/i18n/get-locale-dictionary"
import { createPageMetadata } from "@/i18n/metadata"
import "../../globals.css"

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
})

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale, dict } = await getLocaleDictionary((await params).locale, { allowInvalid: true })

  return createPageMetadata(dict, locale, "home")
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  const typedLocale = locales.includes(locale as Locale) ? (locale as Locale) : defaultLocale
  const dict = await getDictionary(typedLocale)

  return (
    <html lang={typedLocale} className={`${inter.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-page-bg text-text-primary">
        <a className="skip-link" href="#main-content">
          {dict.accessibility.skipToContent}
        </a>
        <SiteHeader dict={dict} locale={typedLocale} />
        <main id="main-content" tabIndex={-1} className="flex-1">
          {children}
        </main>
        <SiteFooter dict={dict} locale={typedLocale} />
      </body>
    </html>
  )
}
