import type { Metadata } from "next"
import ContactAccounts from "@/components/ContactAccounts"
import ContentSection from "@/components/ContentSection"
import SourceLink from "@/components/SourceLink"
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

  return createPageMetadata(dict, locale, "contact")
}

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
        <p className="contact-status-note">{dict.pages.contact.emptyBody}</p>
        <ContactAccounts copy={dict.pages.contact} />
        <p className="contact-account-help">{dict.pages.contact.accountHelp}</p>
        <div className="mt-6">
          <SourceLink href="https://snie.my.canva.site/snie-com" label={dict.pages.contact.linkLabel} />
        </div>
      </ContentSection>
    </>
  )
}
