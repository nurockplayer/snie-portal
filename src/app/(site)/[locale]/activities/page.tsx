import type { Metadata } from "next"
import StaticPageFrame from "@/components/StaticPageFrame"
import ContentSection from "@/components/ContentSection"
import PhotoArchive from "@/components/PhotoArchive"
import OtherEvents from "@/components/OtherEvents"
import SourceLink from "@/components/SourceLink"
import { getLocaleDictionary } from "@/i18n/get-locale-dictionary"
import { createPageMetadata } from "@/i18n/metadata"

export const dynamicParams = false

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale, dict } = await getLocaleDictionary((await params).locale, { allowInvalid: true })

  return createPageMetadata(dict, locale, "activities")
}

export default async function ActivitiesPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { dict } = await getLocaleDictionary((await params).locale)

  return (
    <StaticPageFrame title={dict.nav.activities} intro={dict.pages.activities.intro}>
      <ContentSection id="signature-events" title={dict.archive.bigEvents}>
        <div className="other-events-list">{dict.events.signature.map((event) => <article key={event.id} id={event.id} className="py-6 border-t border-border">
          <h3 className="event-title">{event.title}</h3><p className="event-description">{event.description}</p>
          <a href={`#album-${event.id}`} className="text-link">{dict.archive.allPhotos}<span aria-hidden="true"> ↗</span></a>
        </article>)}</div>
        <p className="prose">{dict.events.note}</p><SourceLink href={dict.events.sourceUrl} label={dict.archive.viewSource} />
      </ContentSection>
      <PhotoArchive dict={dict} />
      <OtherEvents dict={dict} />
    </StaticPageFrame>
  )
}
