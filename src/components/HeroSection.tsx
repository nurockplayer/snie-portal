import Link from "next/link"
import EditorialPhoto from "@/components/EditorialPhoto"
import type { Dictionary } from "@/i18n/dictionaries"
import type { Locale } from "@/i18n/config"

export default function HeroSection({ dict, locale }: { dict: Dictionary; locale: Locale }) {
  return (
    <section className="editorial-home-hero" aria-labelledby="hero-heading">
      <div className="container editorial-home-hero__layout">
        <div className="editorial-home-hero__copy">
          <p className="eyebrow">{dict.hero.subtitle}</p>
          <h1 id="hero-heading" className="editorial-home-hero__title">{dict.hero.title}</h1>
          <p className="editorial-home-hero__lead">{dict.hero.description}</p>
          <div className="editorial-home-hero__actions">
            <Link href={`/${locale}/join`} className="editorial-home-hero__primary-link">{dict.hero.cta}<span aria-hidden="true"> ↗</span></Link>
            <Link href={`/${locale}/about`} className="editorial-home-hero__about-link">{dict.nav.about}</Link>
          </div>
        </div>
        <div className="editorial-home-hero__visual">
          <EditorialPhoto dict={dict} photo="tokyoSignGroup" priority />
          <p className="editorial-home-hero__caption">{dict.media.description}</p>
        </div>
      </div>
    </section>
  )
}
