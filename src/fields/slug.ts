import type { TextField } from 'payload'

// Letters NFD normalization doesn't decompose into base + combining mark.
const SPECIAL_CHARS: Record<string, string> = { ł: 'l', đ: 'd', ø: 'o', æ: 'ae', œ: 'oe', ß: 'ss' }

/** "Akceptor Banknotów – ICT" → "akceptor-banknotow-ict" */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[łđøæœß]/g, (char) => SPECIAL_CHARS[char] ?? char)
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

type SlugFieldOptions = {
  /** Sibling field the slug is generated from when left empty. */
  from: string
  localized?: boolean
  description: string
}

/**
 * URL slug that fills itself from `from` when left empty and is always normalized
 * (lowercase, no diacritics, hyphens), so editors can't produce broken URLs.
 */
export const slugField = ({ from, localized, description }: SlugFieldOptions): TextField => ({
  name: 'slug',
  type: 'text',
  label: 'Slug (adres URL)',
  required: true,
  unique: true,
  localized,
  admin: {
    position: 'sidebar',
    description: `${description} Zostaw puste, aby wygenerować automatycznie z nazwy.`,
  },
  hooks: {
    beforeValidate: [
      ({ value, siblingData }) => {
        const source = typeof value === 'string' && value.trim() ? value : siblingData?.[from]
        return typeof source === 'string' ? slugify(source) : value
      },
    ],
  },
})
