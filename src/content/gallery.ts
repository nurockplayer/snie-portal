import gallery from "./gallery.json"
import type { Dictionary } from "@/i18n/dictionaries"

export type ArchivePhoto = (typeof gallery.photos)[number]
export const archivePhotos = gallery.photos
export const galleryCoverage = gallery
const albums = [
  { id: "tokyo-orienteering", url: "https://snie.grupo.jp/album/372981", title: "東京オリエン 6/30", date: null },
  { id: "sop", url: "https://snie.grupo.jp/album/426859", title: "SOP 10/27", date: null },
  { id: "christmas-party", url: "https://snie.grupo.jp/album/493158", title: "SNIE Xmas Party2013", date: "2013" },
  { id: "bbq", url: "https://snie.grupo.jp/album/378615", title: "SNIE BBQ 2013 9/28", date: "2013-09-28" },
  { id: "halloween", url: "https://snie.grupo.jp/album/426860", title: "SNIE ハロウィンパーティー", date: null },
  { id: "cherry-blossoms", url: "https://snie.grupo.jp/album/4732", title: "お花見 4/8", date: null },
  { id: "canva-activities", url: "https://snie.my.canva.site/snie-com", title: null, date: null },
  { id: "canva-exchanges", url: "https://snie.my.canva.site/", title: null, date: null },
] as const

export function getAlbums(dict: Dictionary) {
  return albums.map((album) => ({ ...album,
    title: album.title ?? (album.id === "canva-activities" ? dict.archive.canvaCom : dict.archive.canvaRoot),
    photos: archivePhotos.filter((photo) => photo.sourceUrl === album.url),
  })).filter((album) => album.photos.length)
}

export function getEventPhoto(sourceUrl: string) {
  const preferred: Record<string, number> = {
    "https://snie.grupo.jp/album/372981": 27,
    "https://snie.grupo.jp/album/426859": 3,
    "https://snie.grupo.jp/album/493158": 16,
  }
  return archivePhotos.find((photo) => photo.sourceUrl === sourceUrl && photo.sourcePhotoIndex === preferred[sourceUrl]) ?? archivePhotos.find((photo) => photo.sourceUrl === sourceUrl)
}
