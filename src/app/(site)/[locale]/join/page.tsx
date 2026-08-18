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
      <StaticPageFrame title={dict.nav.join} />
      <section className="pb-16 sm:pb-20" aria-labelledby="participation-paths-heading">
        <div className="page-container">
          <h2 id="participation-paths-heading" className="sr-only">
            {dict.features.title}
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            {dict.features.items.map((item) => (
              <article
                key={item.href}
                id={item.href.split("#")[1]}
                className="border-t-2 border-brand-primary bg-surface p-6"
              >
                <h3 className="text-lg font-semibold text-text-primary">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-text-secondary">{item.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
