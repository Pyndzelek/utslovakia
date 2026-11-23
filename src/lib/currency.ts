import type { Locale } from '@/i18n/routing'
import type { Product } from '@/payload-types'

export type Currency = 'PLN' | 'EUR' | 'USD' | 'BRL'

/** The currency each site language displays prices in. */
export const LOCALE_CURRENCY: Record<Locale, Currency> = {
  pl: 'PLN',
  sk: 'EUR',
  en: 'USD',
  'pt-br': 'BRL',
}

/** `Intl` locale tag per site language, for number/currency formatting. */
const INTL_LOCALE: Record<Locale, string> = {
  pl: 'pl-PL',
  sk: 'sk-SK',
  en: 'en-US',
  'pt-br': 'pt-BR',
}

type Prices = Partial<Record<Currency, number | null>>

export function currencyForLocale(locale: string): Currency {
  return LOCALE_CURRENCY[locale as Locale] ?? 'PLN'
}

/**
 * The price to display for `locale`: the locale's currency when the product
 * has it set, otherwise the required PLN base price (shown as PLN). A variant's
 * `priceOverrides` apply to whichever currency was resolved.
 */
export function resolvePrice(
  prices: Product['prices'],
  locale: string,
  overrides?: Prices | null,
): { amount: number; currency: Currency } {
  const preferred = currencyForLocale(locale)
  const currency = typeof prices[preferred] === 'number' ? preferred : 'PLN'
  const override = overrides?.[currency]
  return {
    amount: typeof override === 'number' ? override : (prices[currency] as number),
    currency,
  }
}

/** Whether there is a real price to show: 0 (or nothing) means "price on request". */
export function hasDisplayPrice(
  prices: Product['prices'] | null | undefined,
  locale: string,
  overrides?: Prices | null,
): boolean {
  if (!prices) return false
  const { amount } = resolvePrice(prices, locale, overrides)
  return typeof amount === 'number' && amount > 0
}

/**
 * Lowest and highest price a product can be bought at in `locale`'s currency. With variants,
 * those are the variants' prices (each falling back to the base price where it has no
 * override); without, the base price. `null` when nothing has a price ("price on request").
 */
export function priceRange(
  product: Pick<Product, 'prices' | 'variants'>,
  locale: string,
): { low: number; high: number; currency: Currency } | null {
  const { currency } = resolvePrice(product.prices, locale)
  const candidates = product.variants?.length
    ? product.variants.map(
        (variant) => resolvePrice(product.prices, locale, variant.priceOverrides).amount,
      )
    : [resolvePrice(product.prices, locale).amount]
  const amounts = candidates.filter((amount) => typeof amount === 'number' && amount > 0)
  if (amounts.length === 0) return null
  return { low: Math.min(...amounts), high: Math.max(...amounts), currency }
}

/**
 * Sorts by the price a product card shows in `locale` (its lowest variant price), in place.
 * Whichever the direction, products without a price in the locale's currency — shown in PLN
 * instead, so not comparable — come after those that have one, and "price on request" last.
 * Equal prices keep their order.
 */
export function sortByDisplayPrice<T extends Pick<Product, 'prices' | 'variants'>>(
  products: T[],
  locale: string,
  direction: 'asc' | 'desc',
): T[] {
  const local = currencyForLocale(locale)
  const keyed = new Map(
    products.map((product) => {
      const range = priceRange(product, locale)
      const group = !range ? 2 : range.currency === local ? 0 : 1
      return [product, { group, amount: range?.low ?? 0 }]
    }),
  )
  return products.sort((a, b) => {
    const [x, y] = [keyed.get(a)!, keyed.get(b)!]
    if (x.group !== y.group) return x.group - y.group
    return direction === 'asc' ? x.amount - y.amount : y.amount - x.amount
  })
}

const formatters = new Map<string, Intl.NumberFormat>()

export function formatPrice(amount: number, currency: Currency, locale: string): string {
  const key = `${locale}:${currency}`
  let formatter = formatters.get(key)
  if (!formatter) {
    formatter = new Intl.NumberFormat(INTL_LOCALE[locale as Locale] ?? 'pl-PL', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
    })
    formatters.set(key, formatter)
  }
  return formatter.format(amount)
}
