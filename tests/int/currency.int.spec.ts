import { describe, expect, it } from 'vitest'
import {
  currencyForLocale,
  formatPrice,
  hasDisplayPrice,
  priceRange,
  resolvePrice,
  sortByDisplayPrice,
} from '@/lib/currency'
import type { Product } from '@/payload-types'

const prices = (p: Partial<Product['prices']>) => ({ PLN: 100, ...p }) as Product['prices']

describe('resolvePrice', () => {
  it("uses the locale's currency when the product has it", () => {
    expect(resolvePrice(prices({ EUR: 25 }), 'sk')).toEqual({ amount: 25, currency: 'EUR' })
  })

  it('falls back to the PLN base price when the currency is missing', () => {
    expect(resolvePrice(prices({ EUR: null }), 'sk')).toEqual({ amount: 100, currency: 'PLN' })
    expect(resolvePrice(prices({}), 'en')).toEqual({ amount: 100, currency: 'PLN' })
  })

  it('applies a variant override for the resolved currency only', () => {
    expect(resolvePrice(prices({ USD: 30 }), 'en', { USD: 35, PLN: 150 })).toEqual({
      amount: 35,
      currency: 'USD',
    })
    expect(resolvePrice(prices({}), 'en', { USD: 35, PLN: 150 })).toEqual({
      amount: 150,
      currency: 'PLN',
    })
  })

  it('treats unknown locales as PLN', () => {
    expect(currencyForLocale('de')).toBe('PLN')
  })
})

describe('formatPrice', () => {
  it('formats with the locale conventions', () => {
    // Intl uses narrow no-break spaces; normalise them for the comparison.
    const plain = (s: string) => s.replace(/\s/g, ' ')
    // Polish only groups thousands from five digits up.
    expect(plain(formatPrice(12345.5, 'PLN', 'pl'))).toBe('12 345,50 zł')
    expect(plain(formatPrice(1234.5, 'USD', 'en'))).toBe('$1,234.50')
  })
})

describe('hasDisplayPrice', () => {
  it('treats 0 and missing prices as "price on request"', () => {
    expect(hasDisplayPrice(prices({}), 'pl')).toBe(true)
    expect(hasDisplayPrice(prices({ PLN: 0 }), 'pl')).toBe(false)
    expect(hasDisplayPrice(undefined, 'pl')).toBe(false)
  })

  it("looks at the variant's price when it overrides", () => {
    expect(hasDisplayPrice(prices({ PLN: 0 }), 'pl', { PLN: 80 })).toBe(true)
  })
})

describe('priceRange', () => {
  const variant = (priceOverrides?: Partial<Product['prices']>) =>
    ({ modelName: 'v', priceOverrides }) as NonNullable<Product['variants']>[number]

  it('is the base price for a product without variants', () => {
    expect(priceRange({ prices: prices({ EUR: 25 }), variants: [] }, 'sk')).toEqual({
      low: 25,
      high: 25,
      currency: 'EUR',
    })
  })

  it("spans the variants' prices, each falling back to the base price", () => {
    const product = {
      prices: prices({}),
      variants: [variant(), variant({ PLN: 80 }), variant({ PLN: 140 })],
    }
    expect(priceRange(product, 'pl')).toEqual({ low: 80, high: 140, currency: 'PLN' })
  })

  it('is null when nothing has a price', () => {
    expect(priceRange({ prices: prices({ PLN: 0 }), variants: null }, 'pl')).toBeNull()
  })
})

describe('sortByDisplayPrice', () => {
  const product = (id: string, p: Partial<Product['prices']>, variantUsd?: number[]) => ({
    id,
    prices: prices(p),
    variants: variantUsd?.map((USD) => ({ modelName: 'v', priceOverrides: { USD } })),
  })
  const order = (locale: string, direction: 'asc' | 'desc', items: ReturnType<typeof product>[]) =>
    sortByDisplayPrice([...items], locale, direction).map((item) => item.id)

  it("follows the locale's currency, not the PLN base price", () => {
    const items = [product('a', { PLN: 420, USD: 120 }), product('b', { PLN: 430, USD: 110 })]
    expect(order('pl', 'asc', items)).toEqual(['a', 'b'])
    expect(order('en', 'asc', items)).toEqual(['b', 'a'])
    expect(order('en', 'desc', items)).toEqual(['a', 'b'])
  })

  it('uses the lowest variant price, like the card', () => {
    const items = [product('a', { USD: 100 }), product('b', { USD: 200 }, [90, 300])]
    expect(order('en', 'asc', items)).toEqual(['b', 'a'])
  })

  it('puts PLN fallbacks after local prices and "on request" last, both ways', () => {
    const items = [
      product('onRequest', { PLN: 0, USD: 0 }),
      product('plnOnly', { PLN: 50 }),
      product('local', { USD: 60 }),
    ]
    expect(order('en', 'asc', items)).toEqual(['local', 'plnOnly', 'onRequest'])
    expect(order('en', 'desc', items)).toEqual(['local', 'plnOnly', 'onRequest'])
  })
})
