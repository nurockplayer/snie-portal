import StaticPageFrame, { EmptyState } from "@/components/StaticPageFrame"
import { getLocaleDictionary } from "@/i18n/get-locale-dictionary"

export default async function NewsPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { dict } = await getLocaleDictionary((await params).locale)

  return (
    <StaticPageFrame title={dict.nav.news} intro={dict.pages.news.intro}>
      <section className="py-14 sm:py-18" aria-labelledby="empty-state-heading">
        <div className="page-container">
          <EmptyState title={dict.pages.news.emptyTitle} body={dict.pages.news.emptyBody} />
        </div>
      </section>
    </StaticPageFrame>
  )
}
