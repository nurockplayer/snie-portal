/* Local derivatives retain original source attribution in public/images/media-provenance.json. */
import type { Dictionary } from "@/i18n/dictionaries"

type Photo = "tokyoSignGroup" | "costumeFieldGroup" | "indoorGroup"
const photos: Record<Photo, { file: string; width: number; height: number }> = {
  tokyoSignGroup: { file: "tokyo-sign-group.jpg", width: 592, height: 444 },
  costumeFieldGroup: { file: "costume-field-group.jpg", width: 600, height: 449 },
  indoorGroup: { file: "indoor-group.jpg", width: 600, height: 450 },
}

export default function EditorialPhoto({ dict, photo, variant = "", priority = false }: {
  dict: Dictionary; photo: Photo; variant?: string; priority?: boolean
}) {
  const asset = photos[photo]
  return (
    <figure className={`editorial-photo ${variant}`}>
      <div className="editorial-photo__frame">
        {/* Static export serves locally archived source bytes without a remote image dependency. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`/images/${asset.file}`} alt={dict.media.altTexts[photo]} width={asset.width} height={asset.height}
          loading={priority ? "eager" : "lazy"} decoding="async" fetchPriority={priority ? "high" : "auto"} />
      </div>
      <figcaption className="editorial-photo__caption">
        <span className="block">{dict.media.captionFallback}</span>
        <span className="editorial-photo__source">{dict.media.sourceLabel}: {" "}
          <a href="https://snie.my.canva.site/snie-com" target="_blank" rel="noreferrer">{dict.media.sourceLink}<span aria-hidden="true"> ↗</span></a>
        </span>
      </figcaption>
    </figure>
  )
}
