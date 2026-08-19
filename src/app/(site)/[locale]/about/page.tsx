import Link from "next/link"
import type { Metadata } from "next"
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
      <ContentSection id="about-status" title={dict.pages.about.statusTitle}>
        <p className="max-w-3xl text-base leading-relaxed text-text-secondary">{dict.pages.about.statusBody}</p>
        <Link
          href={`/${locale}/join`}
          className="mt-6 inline-flex min-h-11 items-center rounded-sm text-sm font-semibold text-brand-primary underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus hover:text-brand-primary-hover"
        >
          {dict.pages.about.joinLink}
        </Link>
      </ContentSection>
    </>
  )
}
