import Image from 'next/image'
import { ShoppingCart } from 'lucide-react'
import type { Product } from '@/lib/products'

export function ProductCard({ product }: { product: Product }) {
  return (
    <article className="group relative flex w-full flex-col rounded-lg p-3 transition-all duration-300 hover:scale-105 hover:shadow-md hover:border-gray-200">
      <div className="relative mx-auto h-24 w-24">
        <Image
          src={product.image || '/placeholder.svg'}
          alt={product.name}
          fill
          className="object-contain"
          sizes="96px"
        />
      </div>
      <h3 className="mt-3 text-xs font-medium text-foreground">{product.name}</h3>
      <div className="mt-1 flex items-center justify-between">
        <p className="text-xs text-foreground">{product.price}</p>

        <button
          type="button"
          aria-label={`Add ${product.name} to cart`}
          className="rounded border border-border p-1 text-primary transition-colors hover:bg-accent"
        >
          <ShoppingCart className="size-3.5" />
        </button>
      </div>
      {product.priceNote && (
        <p className="mt-2 text-[10px] leading-snug text-muted-foreground">{product.priceNote}</p>
      )}
    </article>
  )
}
