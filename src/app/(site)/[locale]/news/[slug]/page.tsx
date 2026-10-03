import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import StaticPageFrame from "@/components/StaticPageFrame"
import { activityById, activityRecords } from "@/content/activity-records.mjs"
import { getLocaleDictionary } from "@/i18n/get-locale-dictionary"
import { createActivityMetadata } from "@/i18n/metadata"

export const dynamicParams = false

export function generateStaticParams() {
  return activityRecords.map((record) => ({ slug: record.id }))
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale: requestedLocale, slug } = await params
  if (!activityById.has(slug)) notFound()
  const { locale, dict } = await getLocaleDictionary(requestedLocale)
  return createActivityMetadata(dict, locale, slug)
}

export default async function ActivityRecordPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale: requestedLocale, slug } = await params
  const record = activityById.get(slug)
  if (!record) notFound()
  const { locale, dict } = await getLocaleDictionary(requestedLocale)
  const copy = dict.activityRecord
  return (
    <>
      <StaticPageFrame title={record.title[locale]} intro={copy.pastLabel} />
      <article className="section activity-record" aria-labelledby="page-heading">
        <div className="container activity-record__body">
          <p className="activity-record__notice">{copy.pastNotice}</p>
          <dl className="activity-record__facts">
            <div><dt>{copy.eventDate}</dt><dd><time dateTime={record.eventDate}>{record.eventDate}</time></dd></div>
            <div><dt>{copy.sourcePublished}</dt><dd><time dateTime={record.publishedAt}>{record.publishedAt}</time></dd></div>
          </dl>
          <p className="activity-record__date-note">{copy.dateNote}</p>
          <h2>{copy.summaryHeading}</h2>
          <p className="lead">{record.summary[locale]}</p>
          <section className="activity-record__source" aria-labelledby="record-source-heading">
            <h2 id="record-source-heading">{copy.source}</h2>
            <p lang="ja">{record.sourceName}</p>
            {record.sourceUrl.endsWith(".pdf") ? <p>{copy.sourceLocator}: <span lang="ja">{record.sourceLocator}</span></p> : null}
            <a className="text-link" href={record.sourceUrl} target="_blank" rel="noreferrer">{copy.readSource}<span aria-hidden="true"> ↗</span></a>
          </section>
          <Link className="text-link" href={`/${locale}/news/`}>← {copy.backToNews}</Link>
        </div>
      </article>
    </>
  )
}
