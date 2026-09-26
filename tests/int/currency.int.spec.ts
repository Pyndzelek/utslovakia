import { describe, expect, it } from 'vitest'
import { currencyForLocale, formatPrice, resolvePrice } from '@/lib/currency'
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
