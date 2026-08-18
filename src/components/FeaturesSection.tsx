import Link from "next/link"
import type { Dictionary } from "@/i18n/dictionaries"
import type { Locale } from "@/i18n/config"

interface FeatureItemProps {
  title: string
  description: string
  href: string
}

function FeatureCard({ title, description, href }: FeatureItemProps) {
  return (
    <article className="border-t-2 border-brand-primary bg-page-bg p-6">
      <h3 className="text-lg font-semibold text-text-primary">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-text-secondary">{description}</p>
      <Link
        href={href}
        className="mt-5 inline-flex min-h-11 items-center rounded-sm text-sm font-semibold text-brand-primary underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus hover:text-brand-primary-hover"
      >
        {title}
      </Link>
    </article>
  )
}

export default function FeaturesSection({ dict, locale }: { dict: Dictionary; locale: Locale }) {
  return (
    <section className="py-16 sm:py-20" aria-labelledby="features-heading">
      <div className="page-container">
        <h2 id="features-heading" className="max-w-2xl text-2xl font-bold text-text-primary sm:text-3xl">
          {dict.features.title}
        </h2>
        <div className="mt-10 grid gap-x-6 gap-y-10 md:grid-cols-3">
          {dict.features.items.map((item, index) => (
            <FeatureCard
              key={index}
              title={item.title}
              description={item.description}
              href={`/${locale}${item.href}`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
