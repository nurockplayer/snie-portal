import type { Dictionary } from "@/i18n/dictionaries"
import PresentationPhoto from "@/components/PresentationPhoto"
import SourceLink from "@/components/SourceLink"

export default function LanguageSchools({ dict }: { dict: Dictionary }) {
  return (
    <section className="section section--chrome" aria-labelledby="language-schools-heading">
      <div className="container">
        <div className="editorial-section-heading">
          <h2 id="language-schools-heading">{dict.languageSchools.title}</h2>
          <p>{dict.languageSchools.intro}</p>
        </div>
        <div className="language-school-photos">{(["language-school-1", "language-school-2", "language-school-3"] as const).map((name) => <PresentationPhoto key={name} name={name} label={dict.languageSchools.title} dict={dict} />)}</div>
        <div className="grid gap-8 md:grid-cols-2">
          {dict.languageSchools.items.map((item) => (
            <article key={item.title} className="border-t border-border pt-5">

              <h3 className="event-title">{item.title}</h3>
              <p className="event-description">{item.description}</p>
            </article>
          ))}
        </div>
        <div className="mt-6"><SourceLink href={dict.languageSchools.sourceUrl} label={dict.archive.viewSource} /></div>
      </div>
    </section>
  )
}
