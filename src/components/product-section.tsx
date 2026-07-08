import { ChevronRight } from 'lucide-react'
import type { Product } from '@/lib/products'
import { ProductCard } from '@/components/product-card' // No changes needed here

export function ProductSection({
  title,
  products,
}: {
  title: string
  products: Product[]
  highlightFirst?: boolean
}) {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-8">
      <h2 className="text-3xl font-bold tracking-tight text-foreground">{title}</h2>

      <div className="mt-6 flex items-center gap-2">
        {/* Responsive Container: flex carousel on mobile, grid on sm+ */}
        <div className="flex flex-1 gap-4 overflow-x-auto snap-x snap-mandatory pb-4 sm:grid sm:grid-cols-3 sm:overflow-visible sm:snap-none sm:pb-0 lg:grid-cols-5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {products.slice(0, 5).map((product, i) => (
            <div
              key={product.id}
              // Fixed width on mobile prevents cards from shrinking, resets to auto on larger screens
              className="w-[160px] shrink-0 snap-center sm:w-auto sm:shrink"
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>

        <button
          type="button"
          aria-label={`See more ${title.toLowerCase()}`}
          className="shrink-0 rounded-full border border-border p-2 text-foreground shadow-sm transition-colors hover:bg-accent hidden sm:flex"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>
    </section>
  )
}
