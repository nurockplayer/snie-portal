import manifest from "./image-derivatives.json"

export function responsiveImageProps(originalSrc: string, sizes: string) {
  const image = manifest.records.find((record) => record.originalSrc === originalSrc)
  if (!image) return {}
  const candidates = image.variants.map((variant) => ({ src: variant.src, width: variant.width }))
  if (!candidates.some((candidate) => candidate.width === image.width)) candidates.push({ src: originalSrc, width: image.width })
  candidates.sort((a, b) => a.width - b.width)
  return { srcSet: candidates.map((candidate) => `${candidate.src} ${candidate.width}w`).join(", "), sizes }
}

export const photoSizes = {
  full: "100vw",
  half: "(max-width: 47.99rem) calc(100vw - 2rem), (min-width: 75rem) 600px, 50vw",
  gallery: "(max-width: 39.99rem) calc(100vw - 2rem), (max-width: 63.99rem) 50vw, (min-width: 75rem) 400px, 33vw",
  portfolio: "(max-width: 47.99rem) 50vw, (max-width: 63.99rem) 33vw, (min-width: 75rem) 300px, 25vw",
  school: "(max-width: 39.99rem) calc(100vw - 2rem), (max-width: 63.99rem) 50vw, (min-width: 75rem) 300px, 25vw",
  signature: "(max-width: 47.99rem) calc(100vw - 2rem), (min-width: 75rem) 400px, 33vw",
  other: "(max-width: 34rem) calc(100vw - 2rem), (max-width: 63.99rem) 50vw, (min-width: 75rem) 400px, 33vw",
  language: "(max-width: 34rem) calc(100vw - 2rem), (min-width: 75rem) 400px, 33vw",
} as const
