import type { Metadata } from "next"
import StaticPageFrame from "@/components/StaticPageFrame"
import ContentSection from "@/components/ContentSection"
import SourceLink from "@/components/SourceLink"
import history from "@/content/history.json"
import { getLocaleDictionary } from "@/i18n/get-locale-dictionary"
import { createPageMetadata } from "@/i18n/metadata"

export const dynamicParams = false

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale, dict } = await getLocaleDictionary((await params).locale, { allowInvalid: true })
  return createPageMetadata(dict, locale, "history")
}

export default async function HistoryPage({ params }: { params: Promise<{ locale: string }> }) {
  const { dict } = await getLocaleDictionary((await params).locale)
  return (
    <StaticPageFrame title={dict.history.title} intro={dict.history.intro}>
      <ContentSection id="historical-sources" title={dict.history.heading}>
        <p className="prose">{dict.history.body}</p>
        <nav className="album-jump-list mt-5" aria-label={dict.history.heading}>
          <ul>{dict.history.groups.map((group) => <li key={group.id}><a href={`#${group.id}`}>{group.label}</a></li>)}</ul>
        </nav>
        {dict.history.groups.map((group) => (
          <section className="history-group" id={group.id} key={group.id} aria-labelledby={`${group.id}-heading`}>
            <h3 id={`${group.id}-heading`}>{group.label}</h3>
            {history.records.filter((record) => record.sourceGroup === group.id).map((record) => (
              <article className="history-record" id={record.id} key={record.id}>
                <div className="history-record__heading">
                  <h4>{record.title}</h4>
                  <p>{record.documentYear ? `${record.documentYear} · ` : ""}{record.format} · {dict.history.captured} <time dateTime={record.capturedAt}>{record.capturedAt.slice(0, 10)}</time></p>
                </div>
                <div className="history-record__links">
                  <SourceLink href={record.sourceUrl} label={dict.archive.viewSource} />
                  {record.documentUrl ? <a href={record.documentUrl} target="_blank" rel="noreferrer" className="text-link">{dict.history.pdf}<span aria-hidden="true"> ↗</span></a> : null}
                </div>
                <details className="history-text">
                  <summary>{dict.history.read}</summary>
                  <p className="history-text__notice">{dict.history.original}</p>
                  <div lang="ja" className="history-text__body">
                    {record.blocks.map((block, index) => <p key={index}>{block}</p>)}
                  </div>
                </details>
              </article>
            ))}
          </section>
        ))}
      </ContentSection>
    </StaticPageFrame>
  )
}
