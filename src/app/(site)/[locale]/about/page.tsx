import ContentSection from "@/components/ContentSection"
import StaticPageFrame from "@/components/StaticPageFrame"
import { getLocaleDictionary } from "@/i18n/get-locale-dictionary"

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { dict } = await getLocaleDictionary((await params).locale)

  return (
    <>
      <StaticPageFrame title={dict.nav.about} intro={dict.pages.about.intro} />
      <ContentSection id="about-status" title={dict.pages.about.statusTitle}>
        <p className="max-w-3xl text-base leading-relaxed text-text-secondary">{dict.pages.about.statusBody}</p>
      </ContentSection>
    </>
  )
}
