import Link from "next/link"
import type { Dictionary } from "@/i18n/dictionaries"
import type { Locale } from "@/i18n/config"
import selection from "@/content/portfolio.json"
import ArchivePhoto from "@/components/ArchivePhoto"



export default function HomePhotoCollection({ dict, locale }: { dict: Dictionary; locale: Locale }) {
  return <section className="section home-photo-collection" aria-labelledby="home-photos-heading"><div className="container">
    <div className="editorial-section-heading"><h2 id="home-photos-heading">{dict.presentation.portfolioTitle}</h2><p>{dict.presentation.portfolioIntro}</p></div>
    <div className="archive-photo-grid">{selection.map((photo, index) => <ArchivePhoto key={photo.id} photo={photo} dict={dict} album={dict.presentation.portfolioTitle} number={index + 1} />)}</div>
    <div className="section-source"><p>{dict.archive.archiveNote}</p><Link href={`/${locale}/activities#photo-archive-heading`}>{dict.archive.allPhotos}<span aria-hidden="true"> ↗</span></Link></div>
  </div></section>
}
