import { describe, expect, it } from 'vitest'
import { metaDescription } from '@/lib/seo/meta'
import { buildDynamicLanguageAlternates, buildStaticLanguageAlternates } from '@/lib/seo/alternates'
import { productJsonLd } from '@/lib/seo/json-ld'
import type { Product } from '@/payload-types'

describe('metaDescription', () => {
  it('returns short text unchanged, with whitespace collapsed', () => {
    expect(metaDescription('  Bill   acceptor\n\nfor vending ')).toBe('Bill acceptor for vending')
  })

  it('cuts long text at a word boundary with an ellipsis', () => {
    const result = metaDescription('word '.repeat(60))!
    expect(result.length).toBeLessThanOrEqual(155)
    expect(result.endsWith('word…')).toBe(true)
  })

  it('returns undefined for empty input', () => {
    expect(metaDescription('')).toBeUndefined()
    expect(metaDescription(null)).toBeUndefined()
  })
})

describe('language alternates', () => {
  it('maps static routes to each localized path plus x-default', () => {
    expect(buildStaticLanguageAlternates('/products')).toEqual({
      pl: '/produkty',
      en: '/en/products',
      sk: '/sk/produkty',
      'pt-br': '/pt-br/produtos',
      'x-default': '/produkty',
    })
  })

  it('uses one shared slug for products', () => {
    const alternates = buildDynamicLanguageAlternates('/products/[slug]', 'ict-a7')
    expect(alternates.en).toBe('/en/products/ict-a7')
    expect(alternates['pt-br']).toBe('/pt-br/produtos/ict-a7')
    expect(alternates['x-default']).toBe('/produkty/ict-a7')
  })

  it('uses per-locale slugs for categories and skips missing ones', () => {
    expect(
      buildDynamicLanguageAlternates('/category/[slug]', {
        pl: 'monitory',
        en: 'monitors',
        sk: null,
      }),
    ).toEqual({
      pl: '/kategoria/monitory',
      en: '/en/category/monitors',
      'x-default': '/kategoria/monitory',
    })
  })
})

describe('productJsonLd', () => {
  const product = (overrides: Partial<Product>) =>
    ({
      title: 'ICT A7',
      description: 'Bill acceptor',
      slug: 'ict-a7',
      stockStatus: 'in_stock',
      categories: [],
      images: [],
      prices: { PLN: 100 },
      ...overrides,
    }) as Product
  const jsonLd = (overrides: Partial<Product>, locale = 'pl') =>
    productJsonLd({
      product: product(overrides),
      locale,
      canonicalPath: '/produkty/ict-a7',
      imageUrls: ['/media/a.webp', null, 'https://cdn.example.com/b.webp'],
    })

  it('describes a single-price product as one offer with absolute URLs', () => {
    const data = jsonLd({})
    expect(data.offers).toMatchObject({
      '@type': 'Offer',
      price: 100,
      priceCurrency: 'PLN',
      availability: 'https://schema.org/InStock',
    })
    expect(data.url).toMatch(/^https?:\/\/.+\/produkty\/ict-a7$/)
    expect(data.image).toHaveLength(2)
    expect(data.image?.[1]).toBe('https://cdn.example.com/b.webp')
  })

  it('leaves the offer out for "price on request" products instead of claiming a price of 0', () => {
    expect(jsonLd({ prices: { PLN: 0 } }).offers).toBeUndefined()
  })

  it("aggregates variants' prices and takes the best availability among them", () => {
    const data = jsonLd({
      stockStatus: 'out_of_stock',
      variants: [
        { modelName: 'A', stockStatus: 'inherit' },
        { modelName: 'B', stockStatus: 'in_stock', priceOverrides: { PLN: 150 } },
      ],
    })
    expect(data.offers).toMatchObject({
      '@type': 'AggregateOffer',
      lowPrice: 100,
      highPrice: 150,
      offerCount: 2,
      availability: 'https://schema.org/InStock',
    })
  })
})
