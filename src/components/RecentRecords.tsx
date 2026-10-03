import Link from "next/link"
import type { Dictionary } from "@/i18n/dictionaries"
import type { Locale } from "@/i18n/config"
import { activityRecords as records, activityRecordPath } from "@/content/activity-records.mjs"

export default function RecentRecords({ dict, locale, limit }: { dict: Dictionary; locale: Locale; limit?: number }) {
  return <section className="section recent-records" aria-labelledby="recent-records-heading"><div className="container">
    <div className="editorial-section-heading"><div><p className="eyebrow">SNIE</p><h2 id="recent-records-heading">{dict.nav.news}</h2></div><p>{dict.pages.news.intro}</p></div>
    <ol className="news-register">{records.slice(0, limit).map((record) => <li key={record.id}>
      <time dateTime={record.eventDate ?? record.publishedAt}>{record.eventDate ?? record.publishedAt}</time>
      <div><h3><Link href={activityRecordPath(locale, record.id)}>{record.title[locale]}</Link></h3>
        <p>{record.summary[locale]}</p><p className="news-register__source">{dict.activityRecord.pastLabel} · {dict.archive.source}: <a href={record.sourceUrl} target="_blank" rel="noreferrer" lang="ja">{record.sourceName}<span aria-hidden="true"> ↗</span></a> · {dict.archive.publishedLabel} {record.publishedAt}</p>
      </div>
    </li>)}</ol>
    {limit ? <Link className="text-link" href={`/${locale}/news/`}>{dict.archive.allRecords}<span aria-hidden="true"> →</span></Link> : null}
  </div></section>
}
