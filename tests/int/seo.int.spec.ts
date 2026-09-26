import { describe, expect, it } from 'vitest'
import { metaDescription } from '@/lib/seo/meta'
import { buildDynamicLanguageAlternates, buildStaticLanguageAlternates } from '@/lib/seo/alternates'

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
