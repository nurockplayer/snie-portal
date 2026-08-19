import type { Metadata } from "next"
import Link from "next/link"
import NotFoundContent from "@/components/NotFoundContent"
import { defaultLocale, localeLabels, locales } from "@/i18n/config"
import en from "@/i18n/dictionaries/en.json"
import ja from "@/i18n/dictionaries/ja.json"
import zhTW from "@/i18n/dictionaries/zh-TW.json"
import "./globals.css"

const dictionaries = { ja, en, "zh-TW": zhTW }

export async function generateMetadata(): Promise<Metadata> {
  const dict = dictionaries[defaultLocale]

  return {
    title: `${dict.notFound.title} | ${dict.site.name}`,
    description: dict.notFound.description,
    robots: {
      index: false,
      follow: false,
    },
  }
}

export default async function GlobalNotFound() {
  const dict = dictionaries[defaultLocale]

  return (
    <html lang={defaultLocale}>
      <body className="min-h-screen bg-page-bg text-text-primary">
        <main>
          <NotFoundContent dict={dict} locale={defaultLocale} />
          <nav className="page-container pb-16" aria-label={dict.accessibility.languageSwitcher}>
            <ul className="flex flex-wrap gap-3">
              {locales.map((locale) => (
                <li key={locale}>
                  <Link
                    href={`/${locale}/`}
                    className="inline-flex min-h-11 items-center rounded-sm border border-border px-4 py-2 text-sm font-semibold text-brand-primary underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus hover:text-brand-primary-hover"
                  >
                    {localeLabels[locale]}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </main>
      </body>
    </html>
  )
}
