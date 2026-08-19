import manifest from "./media-manifest.json"

export type LegacyMediaAsset = (typeof manifest.assets)[number]

const publishableReuseStates = new Set(["selected-for-publication"])
const publishableConsentStates = new Set(["unknown-public-source", "confirmed", "not-applicable"])

export function getPublishableLegacyMedia(): LegacyMediaAsset[] {
  return manifest.assets.filter((asset) => {
    const altText = asset.sourceMetadata.alt ?? asset.review.altTextKey

    return (
      asset.review.status === "reviewed" &&
      asset.review.publishable &&
      publishableReuseStates.has(asset.review.reuse) &&
      publishableConsentStates.has(asset.review.consent) &&
      typeof altText === "string" &&
      altText.trim().length > 0
    )
  })
}

export function getLegacyMediaAltText(asset: LegacyMediaAsset, localizedFallback: string): string {
  return asset.sourceMetadata.alt ?? localizedFallback
}

export function getLegacyMediaCaption(asset: LegacyMediaAsset, fallback: string): string {
  return asset.sourceMetadata.caption ?? asset.sourceMetadata.context ?? fallback
}
