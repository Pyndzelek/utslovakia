import React from 'react'
import { ProductCard } from '@/components/product/product-card'
import type { Product } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

export function ProductGrid({ products, className }: { products: Product[]; className?: string }) {
  return (
    <div className={cn('grid grid-cols-2 gap-4 md:grid-cols-3 lg:gap-5', className)}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
