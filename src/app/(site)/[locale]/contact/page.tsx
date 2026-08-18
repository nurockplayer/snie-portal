import ContentSection from "@/components/ContentSection"
import StaticPageFrame, { EmptyState } from "@/components/StaticPageFrame"
import { getLocaleDictionary } from "@/i18n/get-locale-dictionary"

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { dict } = await getLocaleDictionary((await params).locale)

  return (
    <>
      <StaticPageFrame title={dict.nav.contact} intro={dict.pages.contact.intro} />
      <ContentSection id="contact-status" title={dict.pages.contact.statusTitle}>
        <EmptyState title={dict.pages.contact.emptyTitle} body={dict.pages.contact.emptyBody} />
      </ContentSection>
    </>
  )
}
