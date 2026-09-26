import { SITE_URL } from '@/lib/site'
import { resolvePrice } from '@/lib/currency'
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

export function productJsonLd(params: {
  product: Product
  locale: string
  canonicalPath: string
  imageUrl?: string | null
}) {
  const { product, locale, canonicalPath, imageUrl } = params
  const brand = typeof product.brand === 'object' ? product.brand : null

  // Same currency the page displays for this locale (PLN when that currency isn't set).
  const base = resolvePrice(product.prices, locale)
  const variantAmounts = (product.variants ?? []).map(
    (variant) => resolvePrice(product.prices, locale, variant.priceOverrides).amount,
  )
  const allAmounts = [base.amount, ...variantAmounts]
  const lowPrice = Math.min(...allAmounts)
  const highPrice = Math.max(...allAmounts)
  const availability = availabilityMap[product.stockStatus]

  const offers =
    lowPrice === highPrice
      ? {
          '@type': 'Offer',
          priceCurrency: base.currency,
          price: base.amount,
          availability,
          url: toAbsoluteUrl(canonicalPath),
        }
      : {
          '@type': 'AggregateOffer',
          priceCurrency: base.currency,
          lowPrice,
          highPrice,
          offerCount: allAmounts.length,
          availability,
          url: toAbsoluteUrl(canonicalPath),
        }

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.description,
    sku: product.sku ?? undefined,
    image: imageUrl ? [toAbsoluteUrl(imageUrl)] : undefined,
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
    taxID: settings.companyId || undefined,
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
