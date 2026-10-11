'use client'

import { useEffect, useRef } from 'react'

/**
 * Muted, looping workshop clip. Plays only while on screen, and never for users who
 * ask for reduced motion (they keep the poster frame). Decorative — the copy beside
 * it carries the meaning.
 */
export function AboutVideo({ src, poster }: { src: string; poster: string }) {
  const ref = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = ref.current
    if (!video) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          // Autoplay can still be refused (e.g. low-power mode); the poster stays up then.
          video.play().catch(() => {})
        } else {
          video.pause()
        }
      },
      { threshold: 0.25 },
    )
    observer.observe(video)
    return () => observer.disconnect()
  }, [])

  return (
    <video
      ref={ref}
      src={src}
      poster={poster}
      muted
      loop
      playsInline
      preload="metadata"
      aria-hidden
      tabIndex={-1}
      className="pointer-events-none absolute inset-0 size-full object-contain"
    />
  )
}
