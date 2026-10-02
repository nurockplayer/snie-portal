import Link from "next/link"
import type { Dictionary } from "@/i18n/dictionaries"
import type { Locale } from "@/i18n/config"

export default function FeaturesSection({ dict, locale }: { dict: Dictionary; locale: Locale }) {
  return (
    <section className="editorial-home-paths" aria-labelledby="features-heading">
      <div className="container editorial-home-paths__layout">
        <div className="editorial-home-paths__intro">
          <p className="eyebrow">{dict.site.name}</p>
          <h2 id="features-heading">{dict.features.title}</h2>
          <Link href={`/${locale}/join`} className="editorial-home-paths__all">{dict.nav.join}<span aria-hidden="true"> ↗</span></Link>
        </div>
        <ol className="editorial-home-paths__list">
          {dict.features.items.map((item, index) => (
            <li key={item.href} className="editorial-home-path">
              <span className="editorial-home-path__number" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
              <div className="editorial-home-path__content">
                <h3><Link href={`/${locale}${item.href}`}>{item.title}<span aria-hidden="true"> ↗</span></Link></h3>
                <p>{item.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
