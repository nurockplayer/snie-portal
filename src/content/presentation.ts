import mappings from "./presentation-images.json"
import { archivePhotos } from "./gallery"

export type PresentationKey = keyof typeof mappings
export const presentationImages = mappings
export function getPresentationPhoto(key: PresentationKey) {
  const mapping = mappings[key]
  const photo = archivePhotos.find((item) => item.id === mapping.photoId)
  if (!photo) throw new Error(`Missing source-matched presentation photo: ${key}`)
  return photo
}
