import manifest from "./media-manifest.json"

export type LegacyMediaAsset = (typeof manifest.assets)[number]

export function getPublishableLegacyMedia(): LegacyMediaAsset[] {
  return manifest.assets.filter((asset) => asset.review.status === "reviewed" && asset.review.publishable)
}

export function getLegacyMediaAltText(asset: LegacyMediaAsset): string {
  return asset.sourceMetadata.alt ?? asset.review.altText ?? ""
}

export function getLegacyMediaCaption(asset: LegacyMediaAsset, fallback: string): string {
  return asset.sourceMetadata.caption ?? asset.sourceMetadata.context ?? fallback
}
