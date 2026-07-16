import React from 'react'
import Image from 'next/image'
import { ShoppingCart } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import { ProductBadgeTag } from '@/components/ui/badge'
import { Price } from '@/components/ui/price'
import type { Product } from '@/lib/mock-data'
import { discountPercent } from '@/lib/format'
import { cn } from '@/lib/utils'

export function ProductCard({ product, className }: { product: Product; className?: string }) {
  return (
    <article
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift',
        className,
      )}
    >
      {/* Image */}
      <div className="relative m-3 mb-0 aspect-square overflow-hidden rounded-xl bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="absolute top-3 left-3 z-10 flex flex-col items-start gap-1.5">
          {product.badge && <ProductBadgeTag badge={product.badge} />}
          {product.oldPrice && (
            <span className="rounded-full bg-white/90 px-2 py-0.5 text-[11px] font-bold text-rose-600 shadow-sm">
              −{discountPercent(product.price, product.oldPrice)}%
            </span>
          )}
        </div>
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 60vw, (max-width: 1024px) 33vw, 280px"
          className="object-contain p-6 transition-transform duration-500 group-hover:scale-105"
        />
        {/* Quick add — visual only */}
        <button
          type="button"
          tabIndex={-1}
          aria-label="Add to cart"
          className="absolute right-3 bottom-3 z-10 flex size-10 cursor-pointer items-center justify-center rounded-full bg-navy-900 text-white opacity-0 shadow-lift transition-all duration-300 group-hover:opacity-100 hover:bg-brand-600"
        >
          <ShoppingCart className="size-4" aria-hidden />
        </button>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-4">
        <p className="text-[11px] font-semibold tracking-[0.12em] text-slate-400 uppercase">
          {product.brand}
        </p>
        <h3 className="mt-1.5 text-sm leading-snug font-semibold text-navy-900">
          <Link
            href={{ pathname: '/products/[slug]', params: { slug: product.slug } }}
            className="transition-colors after:absolute after:inset-0 hover:text-brand-700"
          >
            {product.name}
          </Link>
        </h3>
        <div className="mt-auto pt-3">
          <Price price={product.price} oldPrice={product.oldPrice} lowestPriceNote={product.lowestPriceNote} size="sm" />
          <p className={cn('mt-1.5 text-xs', product.inStock ? 'text-emerald-600' : 'text-amber-600')}>
            {product.leadTime}
          </p>
        </div>
      </div>
    </article>
  )
}
