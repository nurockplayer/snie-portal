import manifest from "./media-manifest.json"

export type LegacyMediaAsset = (typeof manifest.assets)[number]

const publishableReuseStates = new Set(["approved", "approved-for-issue-38"])
const publishableConsentStates = new Set(["confirmed", "not-applicable"])

export function getPublishableLegacyMedia(): LegacyMediaAsset[] {
  return manifest.assets.filter((asset) => {
    const altText = asset.sourceMetadata.alt ?? asset.review.altText

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

export function getLegacyMediaAltText(asset: LegacyMediaAsset): string {
  return asset.sourceMetadata.alt ?? asset.review.altText ?? ""
}

export function getLegacyMediaCaption(asset: LegacyMediaAsset, fallback: string): string {
  return asset.sourceMetadata.caption ?? asset.sourceMetadata.context ?? fallback
}
