import type { Dictionary } from "@/i18n/dictionaries"
import SourceLink from "@/components/SourceLink"

export default function SchoolsSection({ dict }: { dict: Dictionary }) {
  return <section id="schools" className="section schools-section" aria-labelledby="schools-heading"><div className="container">
    <div className="editorial-section-heading"><h2 id="schools-heading">{dict.archive.schoolsTitle}</h2><p>{dict.archive.schoolsIntro}</p></div>
    <ul className="schools-list">{dict.schools.items.map((school) => <li key={school.name}><h3>{school.name}</h3><p>{dict.archive.clubLabel} · {school.club}</p></li>)}</ul>
    <SourceLink href={dict.schools.sourceUrl} label={dict.archive.viewSource} />
  </div></section>
}
