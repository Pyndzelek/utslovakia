import { getPayload } from 'payload'
import config from '@payload-config'
import { cache } from 'react'
import { unstable_cache } from 'next/cache'

export interface BrandOption {
  id: number
  name: string
  /** Published products of this brand. */
  count: number
}

/**
 * Brands that have at least one published product, A–Z, with their product counts — the
 * catalogue's brand filter. Pass `categoryId` to count (and list) only that category's
 * products. Same caching pattern as `categories.ts`; tagged `products` because `Brand`'s
 * and `Product`'s hooks both evict that tag.
 */
export const getBrandsWithCounts = cache(
  unstable_cache(
    async (categoryId?: number): Promise<BrandOption[]> => {
      const payload = await getPayload({ config })
      const [{ docs: brands }, { docs: products }] = await Promise.all([
        payload.find({ collection: 'brands', sort: 'name', depth: 0, pagination: false }),
        payload.find({
          collection: 'products',
          where: {
            status: { equals: 'published' },
            ...(categoryId !== undefined && { categories: { equals: categoryId } }),
          },
          select: { brand: true },
          depth: 0, // brand comes back as a bare id
          pagination: false,
        }),
      ])

      const counts = new Map<number, number>()
      for (const product of products) {
        const brandId = typeof product.brand === 'object' ? product.brand?.id : product.brand
        if (brandId) counts.set(brandId, (counts.get(brandId) ?? 0) + 1)
      }

      return brands
        .map((brand) => ({ id: brand.id, name: brand.name, count: counts.get(brand.id) ?? 0 }))
        .filter((brand) => brand.count > 0)
    },
    ['brands-with-counts'],
    { tags: ['products'], revalidate: 3600 },
  ),
)
