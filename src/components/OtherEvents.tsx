import type { Dictionary } from "@/i18n/dictionaries"
import PresentationPhoto from "@/components/PresentationPhoto"
import type { PresentationKey } from "@/content/presentation"
import SourceLink from "@/components/SourceLink"

export default function OtherEvents({ dict }: { dict: Dictionary }) {
  return <section className="section section--chrome" aria-labelledby="other-events-heading"><div className="container">
    <div className="editorial-section-heading"><h2 id="other-events-heading">{dict.archive.otherEvents}</h2><p>{dict.events.note}</p></div>
    <ul className="other-events-list">{dict.events.other.map((event, index) => <li id={event.id} key={event.id}>
      <PresentationPhoto name={event.id as PresentationKey} label={event.title} dict={dict} /><div><span className="eyebrow" aria-hidden="true">0{index + 1}</span><h3>{event.title}</h3><p>{event.description}</p></div>
    </li>)}</ul>
    <SourceLink href={dict.events.sourceUrl} label={dict.archive.viewSource} />
  </div></section>
}
