import { describe, expect, it } from 'vitest'
import { slugify } from '@/fields/slug'

describe('slugify', () => {
  it.each([
    ['Akceptor Banknotów – ICT A7', 'akceptor-banknotow-ict-a7'],
    ['Žilinský kraj: mincovník', 'zilinsky-kraj-mincovnik'],
    ['Łódź & Gdańsk', 'lodz-gdansk'],
    ['Aceitador de cédulas (BRL)', 'aceitador-de-cedulas-brl'],
    ['  --Already-slugged--  ', 'already-slugged'],
    ['Straße', 'strasse'],
  ])('%s → %s', (input, expected) => {
    expect(slugify(input)).toBe(expected)
  })
})
