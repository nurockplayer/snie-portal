import Link from "next/link"
import ContentSection from "@/components/ContentSection"
import StaticPageFrame, { EmptyState } from "@/components/StaticPageFrame"
import { getLocaleDictionary } from "@/i18n/get-locale-dictionary"

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale, dict } = await getLocaleDictionary((await params).locale)

  return (
    <>
      <StaticPageFrame title={dict.nav.privacy} intro={dict.pages.privacy.intro} />
      <ContentSection id="privacy-status" title={dict.pages.privacy.statusTitle}>
        <EmptyState title={dict.pages.privacy.emptyTitle} body={dict.pages.privacy.emptyBody} />
      </ContentSection>
      <ContentSection id="privacy-contact" title={dict.pages.privacy.contactTitle}>
        <p className="max-w-3xl leading-relaxed text-text-secondary">{dict.pages.privacy.contactBody}</p>
        <Link
          href={`/${locale}/contact`}
          className="mt-6 inline-flex min-h-11 items-center rounded-sm text-sm font-semibold text-brand-primary underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus hover:text-brand-primary-hover"
        >
          {dict.pages.privacy.contactLink}
        </Link>
      </ContentSection>
    </>
  )
}
