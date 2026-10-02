import type { Dictionary } from "@/i18n/dictionaries"
import PresentationPhoto from "@/components/PresentationPhoto"

export default function CommunityIntroduction({ dict }: { dict: Dictionary }) {
  return <section className="section community-introduction" aria-labelledby="community-heading"><div className="container community-introduction__grid">
    <div><p className="eyebrow">SNIE</p><h2 id="community-heading">{dict.presentation.aboutTitle}</h2><p className="community-introduction__lead">{dict.presentation.aboutBody}</p><p className="source-context-note">{dict.presentation.sourceNote}</p></div>
    <PresentationPhoto name="about" label={dict.nav.about} dict={dict} />
  </div></section>
}
