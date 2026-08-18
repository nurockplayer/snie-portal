import type { Metadata } from "next"
import NotFoundContent from "@/components/NotFoundContent"
import { defaultLocale } from "@/i18n/config"
import { getDictionary } from "@/i18n/dictionaries"
import "./globals.css"

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary(defaultLocale)

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
  const dict = await getDictionary(defaultLocale)

  return (
    <html lang={defaultLocale}>
      <body className="min-h-screen bg-page-bg text-text-primary">
        <main>
          <NotFoundContent dict={dict} locale={defaultLocale} />
        </main>
      </body>
    </html>
  )
}
