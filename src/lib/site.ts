/**
 * Public site origin. Needed as `metadataBase` (see the frontend root layout)
 * so relative OG/canonical URLs generated in page metadata resolve to real
 * absolute URLs, and for JSON-LD, which always requires absolute URLs.
 */
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.utslovakia.sk'
