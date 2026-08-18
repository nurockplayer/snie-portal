import type { Metadata } from "next"
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
      <section className="py-14 sm:py-18" aria-labelledby="empty-state-heading">
        <div className="page-container">
          <EmptyState
            title={dict.pages.news.emptyTitle}
            body={dict.pages.news.emptyBody}
            link={{ href: `/${locale}`, label: dict.pages.homeLink }}
          />
        </div>
      </section>
    </StaticPageFrame>
  )
}
