import { photoSizes, responsiveImageProps } from "@/content/responsive-images"
import Link from "next/link"
import { getPresentationPhoto } from "@/content/presentation"
import type { Dictionary } from "@/i18n/dictionaries"
import type { Locale } from "@/i18n/config"

export default function HeroSection({ dict, locale }: { dict: Dictionary; locale: Locale }) {
  const cover = getPresentationPhoto("hero")
  return <section className="community-hero" aria-labelledby="hero-heading">
    <div className="community-hero__stage">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="community-hero__image" src={cover.src} {...responsiveImageProps(cover.src, photoSizes.full)} width={cover.width} height={cover.height} alt={dict.presentation.photoAlt.replace("{label}", dict.events.signature[1].title)} fetchPriority="high" loading="eager" decoding="async" />
      <div className="community-hero__shade" aria-hidden="true" />
      <div className="container community-hero__copy">
        <p>{dict.hero.subtitle}</p><h1 id="hero-heading">SNIE</h1>
        <p className="community-hero__lead">{dict.presentation.heroLines.map((line) => <span key={line}>{line}</span>)}</p>
        <div className="community-hero__actions"><Link href={`/${locale}/activities`}>{dict.archive.viewActivities}<span aria-hidden="true"> ↗</span></Link><Link href={`/${locale}/join`}>{dict.hero.cta}<span aria-hidden="true"> ↗</span></Link></div>
      </div>
    </div>
    <div className="container community-hero__source"><span className="block">{dict.media.captionFallback}</span><a href="https://snie.my.canva.site/snie-com" target="_blank" rel="noreferrer">{dict.archive.viewSource}<span aria-hidden="true"> ↗</span></a></div>
  </section>
}
