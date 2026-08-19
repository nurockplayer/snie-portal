import type { Metadata } from "next"
import ContentSection from "@/components/ContentSection"
import PublicIssuesLink from "@/components/PublicIssuesLink"
import StaticPageFrame, { EmptyState } from "@/components/StaticPageFrame"
import { getLocaleDictionary } from "@/i18n/get-locale-dictionary"
import { createPageMetadata } from "@/i18n/metadata"

export const dynamicParams = false

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale, dict } = await getLocaleDictionary((await params).locale, { allowInvalid: true })

  return createPageMetadata(dict, locale, "privacy")
}

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { dict } = await getLocaleDictionary((await params).locale)

  return (
    <>
      <StaticPageFrame title={dict.nav.privacy} intro={dict.pages.privacy.intro} />
      <ContentSection id="privacy-status" title={dict.pages.privacy.statusTitle}>
        <EmptyState title={dict.pages.privacy.emptyTitle} body={dict.pages.privacy.emptyBody} headingLevel="h3" />
      </ContentSection>
      <ContentSection id="privacy-review" title={dict.pages.privacy.reviewTitle}>
        <ul className="grid max-w-3xl gap-3 text-text-secondary">
          {dict.pages.privacy.reviewItems.map((item) => (
            <li key={item} className="border-l-2 border-border pl-4 leading-relaxed">
              {item}
            </li>
          ))}
        </ul>
      </ContentSection>
      <ContentSection id="privacy-contact" title={dict.pages.privacy.contactTitle}>
        <p className="max-w-3xl leading-relaxed text-text-secondary">{dict.pages.privacy.contactBody}</p>
        <div className="mt-6">
          <PublicIssuesLink href={dict.pages.privacy.publicIssuesUrl} label={dict.pages.privacy.contactLink} />
        </div>
      </ContentSection>
    </>
  )
}
