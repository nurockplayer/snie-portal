import type { Metadata } from "next"
import StaticPageFrame from "@/components/StaticPageFrame"
import RecentRecords from "@/components/RecentRecords"
import { getLocaleDictionary } from "@/i18n/get-locale-dictionary"
import { createPageMetadata } from "@/i18n/metadata"

export const dynamicParams = false

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale, dict } = await getLocaleDictionary((await params).locale, { allowInvalid: true })

  return createPageMetadata(dict, locale, "news")
}

export default async function NewsPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale, dict } = await getLocaleDictionary((await params).locale)

  return (
    <StaticPageFrame title={dict.nav.news} intro={dict.pages.news.intro}>
      <RecentRecords dict={dict} locale={locale} />
    </StaticPageFrame>
  )
}
