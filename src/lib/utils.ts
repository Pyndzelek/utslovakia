import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export type MediaSize = 'thumbnail' | 'card' | 'gallery' | 'og'

/**
 * Returns a Media doc's URL, preferring a named responsive variant when
 * requested — falls back to the original if that variant wasn't generated
 * (e.g. a source image too small to produce a larger size).
 */
export function getMediaUrl(imageField: any, size?: MediaSize): string | null {
  if (typeof imageField !== 'object' || imageField === null) return null
  if (size && imageField.sizes?.[size]?.url) return imageField.sizes[size].url
  if ('url' in imageField) return imageField.url
  return null
}
