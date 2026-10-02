import Link from "next/link"
import type { Metadata } from "next"
import LanguageSchools from "@/components/LanguageSchools"
import SchoolsSection from "@/components/SchoolsSection"
import SourceLink from "@/components/SourceLink"
import ContentSection from "@/components/ContentSection"
import StaticPageFrame from "@/components/StaticPageFrame"
import { getLocaleDictionary } from "@/i18n/get-locale-dictionary"
import { createPageMetadata } from "@/i18n/metadata"

export const dynamicParams = false

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale, dict } = await getLocaleDictionary((await params).locale, { allowInvalid: true })

  return createPageMetadata(dict, locale, "about")
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale, dict } = await getLocaleDictionary((await params).locale)

  return (
    <>
      <StaticPageFrame title={dict.nav.about} intro={dict.pages.about.intro} />
      <SchoolsSection dict={dict} />
      <LanguageSchools dict={dict} />
      <ContentSection id="leadership" title={dict.leadership.title}>
        <p className="prose">{dict.leadership.note}</p>
        <dl className="leadership-interview">{dict.leadership.items.map((item) => <div key={item.question}><dt>{item.question}</dt><dd>{item.answer}</dd></div>)}</dl>
        <SourceLink href={dict.leadership.sourceUrl} label={dict.archive.viewSource} />
        <div><Link href={`/${locale}/join`} className="text-link">{dict.pages.about.joinLink}<span aria-hidden="true"> ↗</span></Link></div>
      </ContentSection>
      <ContentSection id="history-intro" title={dict.history.title}>
        <p className="prose">{dict.history.summary}</p>
        <Link className="text-link mt-5" href={`/${locale}/history`}>{dict.history.link}<span aria-hidden="true"> ↗</span></Link>
      </ContentSection>
    </>
  )
}
