import type { Metadata } from "next"
import ContentSection from "@/components/ContentSection"
import StaticPageFrame, { EmptyState } from "@/components/StaticPageFrame"
import { getLocaleDictionary } from "@/i18n/get-locale-dictionary"
import { createPageMetadata } from "@/i18n/metadata"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale, dict } = await getLocaleDictionary((await params).locale)

  return createPageMetadata(dict, locale, "contact")
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale, dict } = await getLocaleDictionary((await params).locale)

  return (
    <>
      <StaticPageFrame title={dict.nav.contact} intro={dict.pages.contact.intro} />
      <ContentSection id="contact-status" title={dict.pages.contact.statusTitle}>
        <EmptyState
          title={dict.pages.contact.emptyTitle}
          body={dict.pages.contact.emptyBody}
          link={{ href: `/${locale}`, label: dict.pages.homeLink }}
        />
      </ContentSection>
    </>
  )
}
