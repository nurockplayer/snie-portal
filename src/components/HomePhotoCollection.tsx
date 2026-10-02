import Link from "next/link"
import type { Dictionary } from "@/i18n/dictionaries"
import type { Locale } from "@/i18n/config"
import { archivePhotos, getPhotoPosition } from "@/content/gallery"
import ArchivePhoto from "@/components/ArchivePhoto"

const selection = ["f217e4ca729ddbfe", "0dbdf798ad90308a", "a7b1a5a28bd2168c", "a9de816e82c25076", "e837e7873e395f51", "fb5e563512f94851"].map((id) => archivePhotos.find((photo) => photo.id === id)!)

export default function HomePhotoCollection({ dict, locale }: { dict: Dictionary; locale: Locale }) {
  return <section className="section home-photo-collection" aria-labelledby="home-photos-heading"><div className="container">
    <div className="editorial-section-heading"><h2 id="home-photos-heading">{dict.archive.gallery}</h2><p>{dict.archive.galleryIntro}</p></div>
    <div className="archive-photo-grid">{selection.map((photo) => <ArchivePhoto key={photo.id} photo={photo} dict={dict} album={photo.sourceUrl.endsWith("snie-com") ? dict.archive.canvaCom : dict.archive.canvaRoot} number={getPhotoPosition(photo)} />)}</div>
    <div className="section-source"><p>{dict.archive.archiveNote}</p><Link href={`/${locale}/activities#photo-archive-heading`}>{dict.archive.allPhotos}<span aria-hidden="true"> ↗</span></Link></div>
  </div></section>
}
