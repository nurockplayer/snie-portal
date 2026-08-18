import ContentSection from "@/components/ContentSection"
import StaticPageFrame from "@/components/StaticPageFrame"
import { getLocaleDictionary } from "@/i18n/get-locale-dictionary"

export default async function JoinPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { dict } = await getLocaleDictionary((await params).locale)

  return (
    <>
      <StaticPageFrame title={dict.nav.join} intro={dict.pages.join.intro} />
      <ContentSection id="participation-paths" title={dict.pages.join.pathsTitle}>
        <div className="grid gap-6 md:grid-cols-3">
          {dict.pages.join.paths.map((item) => (
            <article key={item.id} id={item.id} className="border-t-2 border-brand-primary bg-surface p-6">
              <h3 className="text-lg font-semibold text-text-primary">{item.title}</h3>
              <p className="mt-2 leading-relaxed text-text-secondary">{item.description}</p>
              <p className="mt-5 border-t border-border pt-4 text-sm font-medium text-brand-primary">{item.status}</p>
            </article>
          ))}
        </div>
      </ContentSection>
      <ContentSection id="join-destination" title={dict.pages.join.destinationTitle}>
        <p className="max-w-3xl leading-relaxed text-text-secondary">{dict.pages.join.destinationBody}</p>
      </ContentSection>
      <ContentSection id="join-faq" title={dict.pages.join.faqTitle}>
        <div className="grid max-w-3xl gap-4">
          {dict.pages.join.faqItems.map((item) => (
            <details key={item.question} className="border-b border-border py-4">
              <summary className="cursor-pointer list-none pr-8 font-semibold text-text-primary">{item.question}</summary>
              <p className="mt-3 leading-relaxed text-text-secondary">{item.answer}</p>
            </details>
          ))}
        </div>
      </ContentSection>
    </>
  )
}
