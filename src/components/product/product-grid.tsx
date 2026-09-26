import React from 'react'
import { ProductCard } from '@/components/product/product-card'
import { RevealOnScroll } from '@/components/ui/reveal'
import type { Product } from '@/payload-types'
import { cn } from '@/lib/utils'

export function ProductGrid({ products, className }: { products: Product[]; className?: string }) {
  return (
    <div className={cn('grid grid-cols-2 gap-4 md:grid-cols-3 lg:gap-5', className)}>
      {products.map((product, index) => (
        <RevealOnScroll key={product.id} index={index} className="h-full">
          <ProductCard product={product} className="h-full" />
        </RevealOnScroll>
      ))}
    </div>
  )
}
