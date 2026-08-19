import type { Metadata } from "next"
import Link from "next/link"
import { defaultLocale } from "@/i18n/config"
import { getDictionary } from "@/i18n/dictionaries"
import { getSiteUrl } from "@/i18n/metadata"

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary(defaultLocale)

  return {
    metadataBase: getSiteUrl(),
    title: dict.site.title,
    description: dict.site.description,
    alternates: {
      canonical: `/${defaultLocale}/`,
    },
    robots: {
      index: false,
      follow: true,
    },
  }
}

export default async function RootPage() {
  const dict = await getDictionary(defaultLocale)
  const homePath = `/${defaultLocale}/`

  return (
    <main className="min-h-screen bg-page-bg text-text-primary" aria-labelledby="root-page-heading">
      <meta httpEquiv="refresh" content={`0;url=${homePath}`} />
      <section className="page-container py-16 sm:py-20">
        <h1 id="root-page-heading" className="max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">
          {dict.site.title}
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-text-secondary">{dict.site.description}</p>
        <Link
          href={homePath}
          className="mt-8 inline-flex min-h-11 items-center rounded-md bg-brand-primary px-6 py-3 text-sm font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus hover:bg-brand-primary-hover"
        >
          {dict.pages.homeLink}
        </Link>
      </section>
    </main>
  )
}
