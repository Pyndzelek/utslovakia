import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { Media } from '@/payload-types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export type MediaSize = 'thumbnail' | 'card' | 'gallery' | 'og'

/** Media fields are a bare id until populated (`depth` ≥ 1) — only a populated doc has URLs. */
type MediaField = number | string | Media | null | undefined

/**
 * Returns a Media doc's URL, preferring a named responsive variant when
 * requested — falls back to the original if that variant wasn't generated
 * (e.g. a source image too small to produce a larger size).
 */
export function getMediaUrl(imageField: MediaField, size?: MediaSize): string | null {
  if (typeof imageField !== 'object' || imageField === null) return null
  return (size && imageField.sizes?.[size]?.url) || imageField.url || null
}

/** `+421 2 5478 9630` → `tel:+421254789630` */
export const telHref = (number: string) => `tel:${number.replace(/[^\d+]/g, '')}`
