import type { Product } from '@/payload-types'

export type ProductVariant = NonNullable<Product['variants']>[number]

/** A variant's availability: its own status, or the product's when it inherits (or has none set). */
export function variantStockStatus(
  variant: Pick<ProductVariant, 'stockStatus'> | null | undefined,
  fallback: Product['stockStatus'],
): Product['stockStatus'] {
  const status = variant?.stockStatus
  return !status || status === 'inherit' ? fallback : status
}
