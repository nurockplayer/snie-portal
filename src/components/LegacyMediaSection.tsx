import type { Dictionary } from "@/i18n/dictionaries"
import {
  getLegacyMediaAltText,
  getPublishableLegacyMedia,
} from "@/content/legacy-media"
import RemoteMediaImage from "@/components/RemoteMediaImage"

export default function LegacyMediaSection({ dict }: { dict: Dictionary }) {
  const media = getPublishableLegacyMedia()

  if (!media.length) {
    return null
  }

  return (
    <section className="border-b border-border py-16 sm:py-20" aria-labelledby="legacy-media-heading">
      <div className="page-container">
        <h2 id="legacy-media-heading" className="max-w-2xl text-2xl font-bold text-text-primary sm:text-3xl">
          {dict.media.title}
        </h2>
        <p className="mt-4 max-w-2xl text-text-secondary">{dict.media.description}</p>
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {media.map((asset) => {
            const sourcePage = asset.sourcePages[0] ?? asset.originalUrl
            const altTextKey = "altTextKey" in asset.review ? asset.review.altTextKey : null
            const localizedAltText =
              typeof altTextKey === "string" && altTextKey in dict.media.altTexts
                ? dict.media.altTexts[altTextKey as keyof typeof dict.media.altTexts]
                : dict.media.captionFallback
            const responsiveVariants = asset.variants
              .filter((variant) => variant.width !== null)
            const srcSet = [
              ...(asset.originalWidth !== null ? [`${asset.originalUrl} ${asset.originalWidth}w`] : []),
              ...responsiveVariants.map((variant) => `${variant.url} ${variant.width}w`),
            ]
              .join(", ")

            return (
              <figure key={asset.id} className="border border-border bg-surface-elevated p-3">
                <RemoteMediaImage
                  src={asset.originalUrl}
                  srcSet={srcSet || undefined}
                  sizes="(min-width: 64rem) 33vw, (min-width: 48rem) 50vw, 100vw"
                  alt={getLegacyMediaAltText(asset, localizedAltText)}
                  unavailableLabel={dict.media.unavailable}
                />
                <figcaption className="px-1 pb-1 pt-4 text-sm leading-relaxed text-text-secondary">
                  <span className="block">{dict.media.captionFallback}</span>
                  <span className="mt-2 block">
                    {dict.media.sourceLabel}: {" "}
                    <a
                      href={sourcePage}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex min-h-11 items-center font-semibold text-brand-primary underline underline-offset-4 hover:text-brand-primary-hover"
                    >
                      {dict.media.sourceLink}
                    </a>
                  </span>
                </figcaption>
              </figure>
            )
          })}
        </div>
      </div>
    </section>
  )
}
