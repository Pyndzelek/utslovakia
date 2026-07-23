import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getMediaUrl(imageField: any): string | null {
  if (typeof imageField === 'object' && imageField !== null && 'url' in imageField) {
    return imageField.url
  }
  return null
}
