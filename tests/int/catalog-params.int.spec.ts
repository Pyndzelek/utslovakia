import { describe, expect, it } from 'vitest'
import {
  activeFilterCount,
  buildListingHref,
  isNarrowed,
  parseCatalogParams,
  parseIdList,
  toQueryRecord,
} from '@/lib/catalog-params'

describe('parseIdList', () => {
  it('keeps positive integers, once each', () => {
    expect(parseIdList('1, 4,4,x,-2,0,3.5')).toEqual([1, 4])
    expect(parseIdList(undefined)).toEqual([])
    expect(parseIdList('')).toEqual([])
  })
})

describe('parseCatalogParams', () => {
  it('returns the plain listing for an empty query', () => {
    const params = parseCatalogParams({})
    expect(params).toEqual({
      page: 1,
      q: undefined,
      categoryIds: [],
      brandIds: [],
      badges: [],
      inStock: false,
      minPrice: undefined,
      maxPrice: undefined,
      sort: undefined,
    })
    expect(isNarrowed(params)).toBe(false)
    expect(activeFilterCount(params)).toBe(0)
  })

  it('parses every supported param', () => {
    const params = parseCatalogParams({
      page: '3',
      q: '  ict a7 ',
      category: '2,5',
      brand: '7',
      badge: 'new,bestseller',
      stock: 'in_stock',
      minPrice: '100',
      maxPrice: '250,5',
      sort: '-price',
    })
    expect(params).toMatchObject({
      page: 3,
      q: 'ict a7',
      categoryIds: [2, 5],
      brandIds: [7],
      badges: ['bestseller', 'new'],
      inStock: true,
      minPrice: 100,
      maxPrice: 250.5,
      sort: '-price',
    })
    // 2 categories + 1 brand + 2 badges + stock + one price range
    expect(activeFilterCount(params)).toBe(7)
  })

  it('ignores values it does not know', () => {
    const params = parseCatalogParams({
      page: 'abc',
      badge: 'sale',
      stock: 'yes',
      minPrice: '-5',
      maxPrice: 'cheap',
      sort: 'prices.PLN; DROP TABLE',
    })
    expect(params.page).toBe(1)
    expect(params.badges).toEqual([])
    expect(params.inStock).toBe(false)
    expect(params.minPrice).toBeUndefined()
    expect(params.maxPrice).toBeUndefined()
    expect(params.sort).toBeUndefined()
    expect(isNarrowed(params)).toBe(false)
  })

  it('takes the first value of a repeated param', () => {
    expect(parseCatalogParams({ page: ['2', '9'], q: ['a', 'b'] })).toMatchObject({
      page: 2,
      q: 'a',
    })
  })

  it('counts a search term or a sort order as narrowing, but not as a filter', () => {
    for (const raw of [{ q: 'hopper' }, { sort: 'title' }]) {
      const params = parseCatalogParams(raw)
      expect(isNarrowed(params)).toBe(true)
      expect(activeFilterCount(params)).toBe(0)
    }
  })
})

describe('listing links', () => {
  it('round-trips params through the query record, without the page', () => {
    const raw = { q: 'coin', category: '2,5', brand: '7', stock: 'in_stock', sort: 'title' }
    expect(toQueryRecord(parseCatalogParams({ ...raw, page: '4' }))).toEqual(raw)
  })

  it('drops empty values when building a link', () => {
    expect(buildListingHref('/en/products', { q: 'a b', brand: undefined, sort: '' })).toBe(
      '/en/products?q=a+b',
    )
    expect(buildListingHref('/produkty', {})).toBe('/produkty')
  })
})
