import Link from "next/link"
import type { Dictionary } from "@/i18n/dictionaries"
import type { Locale } from "@/i18n/config"
import { getEventPhoto, getPhotoPosition } from "@/content/gallery"
import ArchivePhoto from "@/components/ArchivePhoto"
import SourceLink from "@/components/SourceLink"

export default function SignatureEvents({ dict, locale }: { dict: Dictionary; locale: Locale }) {
  return <section className="section signature-events" aria-labelledby="signature-heading">
    <div className="container">
      <div className="editorial-section-heading">
        <div><p className="eyebrow">SNIE</p><h2 id="signature-heading">{dict.archive.bigEvents}</h2></div>
        <p>{dict.archive.bigEventsIntro}</p>
      </div>
      <div className="grid gap-x-8 gap-y-12 md:grid-cols-3">
        {dict.events.signature.map((event, index) => {
          const photo = getEventPhoto(event.albumUrl)
          return <article key={event.id}>
            {photo ? <ArchivePhoto photo={photo} dict={dict} album={event.archiveLabel} number={getPhotoPosition(photo)} /> : null}
            <p className="event-number" aria-hidden="true">0{index + 1}</p>
            <h3 className="event-title"><Link href={`/${locale}/activities#${event.id}`}>{event.title}<span aria-hidden="true"> ↗</span></Link></h3>
            <p className="event-description">{event.description}</p>
          </article>
        })}
      </div>
      <div className="section-source"><p>{dict.events.note}</p><SourceLink href={dict.events.sourceUrl} label={dict.archive.viewSource} /></div>
    </div>
  </section>
}
