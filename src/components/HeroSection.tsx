import Link from "next/link"
import type { Dictionary } from "@/i18n/dictionaries"
import type { Locale } from "@/i18n/config"

export default function HeroSection({ dict, locale }: { dict: Dictionary; locale: Locale }) {
  return (
    <section className="border-b border-border bg-surface py-16 sm:py-20" aria-labelledby="hero-heading">
      <div className="page-container grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.14em] text-brand-primary">{dict.hero.subtitle}</p>
          <h1 id="hero-heading" className="mt-4 max-w-3xl text-4xl font-bold tracking-tight text-text-primary sm:text-5xl">
            {dict.hero.title}
          </h1>
        </div>
        <div className="max-w-xl lg:justify-self-end">
          <p className="text-lg leading-relaxed text-text-secondary">{dict.hero.description}</p>
          <Link
            href={`/${locale}/join`}
            className="mt-8 inline-flex min-h-11 items-center rounded-md bg-brand-primary px-6 py-3 text-sm font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus hover:bg-brand-primary-hover"
          >
            {dict.hero.cta}
          </Link>
        </div>
      </div>
    </section>
  )
}
