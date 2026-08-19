import Link from "next/link"
import type { Dictionary } from "@/i18n/dictionaries"
import type { Locale } from "@/i18n/config"

export default function NotFoundContent({ dict, locale }: { dict: Dictionary; locale: Locale }) {
  return (
    <section className="py-16 sm:py-20" aria-labelledby="not-found-heading">
      <div className="page-container">
        <p className="text-sm font-medium uppercase tracking-[0.14em] text-brand-primary">404</p>
        <h1 id="not-found-heading" className="mt-4 max-w-3xl text-4xl font-bold tracking-tight text-text-primary sm:text-5xl">
          {dict.notFound.title}
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-text-secondary">{dict.notFound.description}</p>
        <Link
          href={`/${locale}`}
          className="mt-8 inline-flex min-h-11 items-center rounded-md bg-brand-primary px-6 py-3 text-sm font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus hover:bg-brand-primary-hover"
        >
          {dict.notFound.backHome}
        </Link>
      </div>
    </section>
  )
}
