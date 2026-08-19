"use client"

import { useEffect, useRef, useState } from "react"

/* eslint-disable @next/next/no-img-element -- Original URLs must bypass Next's runtime optimizer. */

export default function RemoteMediaImage({
  src,
  srcSet,
  sizes,
  alt,
  unavailableLabel,
}: {
  src: string
  srcSet?: string
  sizes?: string
  alt: string
  unavailableLabel: string
}) {
  const [failed, setFailed] = useState(false)
  const imageRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    const image = imageRef.current

    if (image?.complete && image.naturalWidth === 0) {
      setFailed(true)
    }
  }, [src])

  if (failed) {
    return (
      <div
        className="flex aspect-[4/3] items-center justify-center bg-surface px-6 text-center text-sm text-text-secondary"
        role="img"
        aria-label={unavailableLabel}
      >
        {unavailableLabel}
      </div>
    )
  }

  return (
    <img
      ref={imageRef}
      src={src}
      srcSet={srcSet}
      sizes={sizes}
      alt={alt}
      loading="lazy"
      decoding="async"
      className="aspect-[4/3] w-full bg-surface object-contain"
      onError={() => setFailed(true)}
    />
  )
}
