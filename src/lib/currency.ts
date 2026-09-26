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
