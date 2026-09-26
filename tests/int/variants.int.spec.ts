import { describe, expect, it } from 'vitest'
import { variantStockStatus } from '@/lib/variants'

describe('variantStockStatus', () => {
  it("inherits the product's status when the variant says so or has none", () => {
    expect(variantStockStatus({ stockStatus: 'inherit' }, 'preorder')).toBe('preorder')
    expect(variantStockStatus({ stockStatus: null }, 'in_stock')).toBe('in_stock')
    expect(variantStockStatus({}, 'out_of_stock')).toBe('out_of_stock')
  })

  it('falls back to the product when there is no variant', () => {
    expect(variantStockStatus(undefined, 'in_stock')).toBe('in_stock')
  })

  it("uses the variant's own status when it overrides", () => {
    expect(variantStockStatus({ stockStatus: 'out_of_stock' }, 'in_stock')).toBe('out_of_stock')
    expect(variantStockStatus({ stockStatus: 'in_stock' }, 'preorder')).toBe('in_stock')
  })
})
