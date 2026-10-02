import type { Dictionary } from "@/i18n/dictionaries"
import schoolImages from "@/content/school-images.json"
import SourceLink from "@/components/SourceLink"

export default function SchoolsSection({ dict }: { dict: Dictionary }) {
  return <section id="schools" className="section schools-section" aria-labelledby="schools-heading"><div className="container">
    <div className="editorial-section-heading"><h2 id="schools-heading">{dict.archive.schoolsTitle}</h2><p>{dict.archive.schoolsIntro}</p></div>
    <ul className="schools-list">{dict.schools.items.map((school) => { const image = schoolImages.find((item) => item.school === school.name); return <li key={school.name}>
      {image ? <figure className="school-image">
        <a href={image.src} target="_blank" rel="noreferrer" aria-label={dict.archive.clubImageAlt.replace("{club}", school.club)}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={image.src} width={image.width} height={image.height} alt={dict.archive.clubImageAlt.replace("{club}", school.club)} loading="lazy" decoding="async" />
        </a>
        <figcaption>{dict.archive.clubImageAlt.replace("{club}", school.club)}</figcaption>
      </figure> : null}
      <h3 lang="ja">{school.name}</h3><p>{dict.archive.clubLabel} · <span lang="ja">{school.club}</span></p></li> })}</ul>
    <SourceLink href={dict.schools.sourceUrl} label={dict.archive.viewSource} />
  </div></section>
}
