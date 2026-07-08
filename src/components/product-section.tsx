import { ChevronRight } from 'lucide-react'
import type { Product } from '@/lib/products'
import { ProductCard } from '@/components/product-card'

export function ProductSection({
  title,
  products,
  highlightFirst = false,
}: {
  title: string
  products: Product[]
  highlightFirst?: boolean
}) {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-8">
      <h2 className="text-2xl font-bold tracking-tight text-foreground">{title}</h2>
      <div className="mt-6 flex items-center gap-2">
        <div className="grid flex-1 grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {products.slice(0, 5).map((product, i) => (
            <ProductCard
              key={product.id}
              product={product}
              highlighted={highlightFirst && i === 0}
            />
          ))}
        </div>
        <button
          type="button"
          aria-label={`See more ${title.toLowerCase()}`}
          className="shrink-0 rounded-full border border-border p-2 text-foreground shadow-sm transition-colors hover:bg-accent"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>
    </section>
  )
}
