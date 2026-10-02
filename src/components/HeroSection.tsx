import Link from "next/link"
import { archivePhotos, getPhotoPosition } from "@/content/gallery"
import ArchivePhoto from "@/components/ArchivePhoto"
import EditorialPhoto from "@/components/EditorialPhoto"
import type { Dictionary } from "@/i18n/dictionaries"
import type { Locale } from "@/i18n/config"

const highlights = ["5f020582737d6de9", "47475a6053d2a5ed", "8a6d1b00ab63f7bb", "3275ab8e1038bcdd"].map((id) => archivePhotos.find((photo) => photo.id === id)!)

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
          <div className="hero-photo-strip">{highlights.map((photo) => <ArchivePhoto key={photo.id} photo={photo} dict={dict} album={dict.archive.canvaRoot} number={getPhotoPosition(photo)} />)}</div>
          <Link className="hero-gallery-link" href={`/${locale}/activities#photo-archive-heading`}>{dict.archive.allPhotos}<span aria-hidden="true"> ↗</span></Link>
        </div>
      </div>
    </section>
  )
}
