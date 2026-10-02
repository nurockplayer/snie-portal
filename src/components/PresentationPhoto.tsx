import { photoSizes, responsiveImageProps } from "@/content/responsive-images"
import type { Dictionary } from "@/i18n/dictionaries"
import { getPresentationPhoto, type PresentationKey } from "@/content/presentation"

export default function PresentationPhoto({ name, label, dict, priority = false }: { name: PresentationKey; label: string; dict: Dictionary; priority?: boolean }) {
  const photo = getPresentationPhoto(name)
  const sizes = name === "about" || name === "chair" ? photoSizes.half : name.startsWith("language-school") ? photoSizes.language : ["tokyo-orienteering", "sop", "christmas-party"].includes(name) ? photoSizes.signature : photoSizes.other
  const alt = name === "chair" ? dict.presentation.portraitAlt : dict.presentation.photoAlt.replace("{label}", label)
  return <figure className={`presentation-photo presentation-photo--${name}`}>
    <a className="presentation-photo__image" href={photo.src} target="_blank" rel="noreferrer" aria-label={alt}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={photo.src} {...responsiveImageProps(photo.src, sizes)} width={photo.width} height={photo.height} alt={alt} loading={priority ? "eager" : "lazy"} decoding="async" />
    </a>
    <figcaption><span>{label}</span><a href="https://snie.my.canva.site/snie-com" target="_blank" rel="noreferrer">{dict.archive.source}<span aria-hidden="true"> ↗</span></a></figcaption>
  </figure>
}
