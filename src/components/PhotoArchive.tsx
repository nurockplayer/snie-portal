import type { Dictionary } from "@/i18n/dictionaries"
import { getAlbums } from "@/content/gallery"
import ArchivePhoto from "@/components/ArchivePhoto"
import SourceLink from "@/components/SourceLink"

export default function PhotoArchive({ dict }: { dict: Dictionary }) {
  const albums = getAlbums(dict)
  return <section className="section" aria-labelledby="photo-archive-heading"><div className="container">
    <div className="editorial-section-heading"><h2 id="photo-archive-heading">{dict.archive.gallery}</h2><p>{dict.archive.archiveNote}</p></div>
    <nav className="album-jump-list" aria-label={dict.archive.gallery}><ul>{albums.map((album) => <li key={album.id}><a href={`#album-${album.id}`}>{album.title}<span>{album.photos.length}</span></a></li>)}</ul></nav>
    <div className="album-list">{albums.map((album) => <section key={album.id} id={`album-${album.id}`} className="archive-album" aria-labelledby={`album-${album.id}-heading`}>
      <header className="album-heading"><div><p className="eyebrow">{album.date ?? dict.archive.unknownDate}</p><h3 id={`album-${album.id}-heading`}>{album.title}</h3></div>
        <span>{album.photos.length} {dict.archive.photos}</span></header>
      <div className="archive-photo-grid">{album.photos.slice(0, 3).map((photo, index) => <ArchivePhoto key={photo.id} photo={photo} dict={dict} album={album.title} number={index + 1} />)}</div>
      {album.photos.length > 3 ? <details className="album-more"><summary>{dict.archive.allPhotos} ({album.photos.length})</summary><div className="archive-photo-grid">{album.photos.slice(3).map((photo,index) => <ArchivePhoto key={photo.id} photo={photo} dict={dict} album={album.title} number={index + 4} />)}</div></details> : null}
      <SourceLink href={album.url} label={dict.archive.viewSource} />
    </section>)}</div>
  </div></section>
}
