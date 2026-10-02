import type { ArchivePhoto as Photo } from "@/content/gallery"
import type { Dictionary } from "@/i18n/dictionaries"

export default function ArchivePhoto({ photo, dict, album, number = 1 }: { photo: Photo; dict: Dictionary; album: string; number?: number }) {
  const alt = dict.archive.photoAlt.replace("{album}", album).replace("{number}", String(number))
  return <figure className="archive-photo">
    <div className="archive-photo__frame">
      {/* Local source bytes preserve the archive; static export needs no image-optimization server. */}
      <a href={photo.src} target="_blank" rel="noreferrer" aria-label={alt}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={photo.src} width={photo.width} height={photo.height} alt={alt} loading="lazy" decoding="async" />
      </a>
    </div>
    <figcaption className="archive-photo__caption">
      <span>{album} · {String(number).padStart(2, "0")}</span>
      <a href={photo.sourceUrl} target="_blank" rel="noreferrer">{dict.archive.source}<span aria-hidden="true"> ↗</span></a>
    </figcaption>
  </figure>
}
