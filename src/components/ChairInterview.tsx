import type { Dictionary } from "@/i18n/dictionaries"
import PresentationPhoto from "@/components/PresentationPhoto"

export default function ChairInterview({ dict }: { dict: Dictionary }) {
  return <section className="section chair-section" aria-labelledby="chair-heading"><div className="container">
    <div className="editorial-section-heading"><h2 id="chair-heading">{dict.leadership.title}</h2><p>{dict.leadership.note}</p></div>
    <div className="chair-section__grid"><PresentationPhoto name="chair" label={dict.presentation.portraitAlt} dict={dict} /><dl className="leadership-interview">{dict.leadership.items.map((item) => <div key={item.question}><dt>{item.question}</dt><dd>{item.answer}</dd></div>)}</dl></div>
  </div></section>
}
