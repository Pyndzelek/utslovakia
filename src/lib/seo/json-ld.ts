import { SITE_URL } from '@/lib/site'
import type { Product } from '@/payload-types'

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

/** Picks the display currency the rest of the app already uses: EUR when set, PLN otherwise. */
function resolveBasePrice(prices: Product['prices']): { amount: number; currency: 'EUR' | 'PLN' } {
  if (typeof prices.EUR === 'number') return { amount: prices.EUR, currency: 'EUR' }
  return { amount: prices.PLN, currency: 'PLN' }
}

type PriceOverrides = NonNullable<NonNullable<Product['variants']>[number]['priceOverrides']>

function resolveVariantAmount(
  base: { amount: number; currency: 'EUR' | 'PLN' },
  override?: PriceOverrides,
): number {
  const overrideAmount = override?.[base.currency]
  return typeof overrideAmount === 'number' ? overrideAmount : base.amount
}

export function productJsonLd(params: { product: Product; canonicalPath: string; imageUrl?: string | null }) {
  const { product, canonicalPath, imageUrl } = params
  const brand = typeof product.brand === 'object' ? product.brand : null

  const base = resolveBasePrice(product.prices)
  const variantAmounts = (product.variants ?? []).map((variant) =>
    resolveVariantAmount(base, variant.priceOverrides),
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
