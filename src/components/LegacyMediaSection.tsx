import type { Dictionary } from "@/i18n/dictionaries"
import EditorialPhoto from "@/components/EditorialPhoto"

export default function LegacyMediaSection({ dict }: { dict: Dictionary }) {
  return (
    <section className="editorial-home-archive" aria-labelledby="legacy-media-heading">
      <div className="container">
        <header className="editorial-home-archive__intro">
          <p className="eyebrow">{dict.site.name}</p>
          <h2 id="legacy-media-heading">{dict.media.title}</h2>
          <p>{dict.media.description}</p>
        </header>
        <div className="editorial-home-archive__grid">
          <EditorialPhoto dict={dict} photo="costumeFieldGroup" variant="editorial-photo--field" />
          <EditorialPhoto dict={dict} photo="indoorGroup" variant="editorial-photo--indoor" />
        </div>
      </div>
    </section>
  )
}
