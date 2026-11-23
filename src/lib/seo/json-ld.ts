import { SITE_URL } from '@/lib/site'
import { priceRange } from '@/lib/currency'
import { variantStockStatus } from '@/lib/variants'
import type { Product, SiteSetting } from '@/payload-types'

export interface BreadcrumbItem {
  name: string
  /** Localized pathname, e.g. from `getPathname(...)` — absolute or site-relative. */
  path: string
}

function toAbsoluteUrl(path: string): string {
  return path.startsWith('http') ? path : `${SITE_URL}${path}`
}

export function breadcrumbJsonLd(items: BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: toAbsoluteUrl(item.path),
    })),
  }
}

export interface ItemListEntry {
  name: string
  /** Localized pathname, e.g. from `getPathname(...)` — absolute or site-relative. */
  path: string
}

export function itemListJsonLd(params: { items: ItemListEntry[] }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: params.items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      url: toAbsoluteUrl(item.path),
    })),
  }
}

export interface FaqEntry {
  question: string
  answer: string
}

export function faqJsonLd(items: FaqEntry[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  }
}

const availabilityMap: Record<Product['stockStatus'], string> = {
  in_stock: 'https://schema.org/InStock',
  out_of_stock: 'https://schema.org/OutOfStock',
  preorder: 'https://schema.org/PreOrder',
}

/** Best availability first: a product is buyable if any of its variants is. */
const AVAILABILITY_ORDER: Product['stockStatus'][] = ['in_stock', 'preorder', 'out_of_stock']

function productAvailability(product: Product): Product['stockStatus'] {
  if (!product.variants?.length) return product.stockStatus
  const statuses = product.variants.map((variant) =>
    variantStockStatus(variant, product.stockStatus),
  )
  return AVAILABILITY_ORDER.find((status) => statuses.includes(status)) ?? product.stockStatus
}

export function productJsonLd(params: {
  product: Product
  locale: string
  canonicalPath: string
  /** Every product image, main one first. */
  imageUrls?: (string | null | undefined)[]
}) {
  const { product, locale, canonicalPath, imageUrls } = params
  const brand = typeof product.brand === 'object' ? product.brand : null
  const firstCategory = typeof product.categories?.[0] === 'object' ? product.categories[0] : null
  const url = toAbsoluteUrl(canonicalPath)
  const images = (imageUrls ?? []).filter((image): image is string => Boolean(image))

  // Same currency and amounts the page displays for this locale. "Price on request"
  // products (no price, or 0) get no offer at all rather than one claiming a price of 0.
  const range = priceRange(product, locale)
  const availability = availabilityMap[productAvailability(product)]
  const offers = !range
    ? undefined
    : range.low === range.high
      ? {
          '@type': 'Offer',
          priceCurrency: range.currency,
          price: range.low,
          availability,
          url,
        }
      : {
          '@type': 'AggregateOffer',
          priceCurrency: range.currency,
          lowPrice: range.low,
          highPrice: range.high,
          offerCount: product.variants?.length ?? 1,
          availability,
          url,
        }

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.description,
    url,
    sku: product.sku ?? undefined,
    category: firstCategory?.name,
    image: images.length > 0 ? images.map(toAbsoluteUrl) : undefined,
    brand: brand ? { '@type': 'Brand', name: brand.name } : undefined,
    offers,
  }
}

/** Site-wide Organization data from the `site-settings` global (rendered in the layout). */
export function organizationJsonLd(settings: SiteSetting) {
  const { address, social } = settings
  const street = address?.street
  const sameAs = [social?.facebook, social?.instagram, social?.linkedin].filter(
    (url): url is string => Boolean(url),
  )

  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: settings.companyName,
    url: SITE_URL,
    logo: `${SITE_URL}/icon-512.png`,
    vatID: settings.vatId || undefined,
    telephone: settings.phones?.[0]?.number,
    email: settings.emails?.[0]?.email,
    address: street
      ? {
          '@type': 'PostalAddress',
          streetAddress: street,
          postalCode: address.postalCode,
          addressLocality: address.city,
          addressRegion: address.region || undefined,
          addressCountry: address.country || undefined,
        }
      : undefined,
    sameAs: sameAs.length > 0 ? sameAs : undefined,
  }
}
