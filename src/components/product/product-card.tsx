import Image from 'next/image'
import { Link } from '@/i18n/navigation'
import { Price } from '@/components/ui/price'
import type { Product } from '@/payload-types'
import { cn, getMediaUrl } from '@/lib/utils'
import { InStock } from '@/components/product/in-stock'
import { ProductBadgeTag } from './product-badge'

export function ProductCard({ product, className }: { product: Product; className?: string }) {
  const inStock = product.stockStatus === 'in_stock'
  const brand = typeof product.brand === 'object' ? product.brand : null
  const image = typeof product.images?.[0] === 'object' ? product.images?.[0] : null
  const imageUrl = getMediaUrl(image?.image, 'card')

  return (
    <article
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift',
        className,
      )}
    >
      {/* Image */}
      <div className="relative m-3 mb-0 aspect-square overflow-hidden rounded-xl bg-linear-to-br from-slate-50 to-slate-100">
        <div className="absolute top-3 left-3 z-10 flex flex-col items-start gap-1.5">
          {product.badge && <ProductBadgeTag badge={product.badge} />}
        </div>
        {imageUrl && (
          <Image
            src={imageUrl}
            alt={image?.alt ?? product.title}
            fill
            sizes="(max-width: 640px) 60vw, (max-width: 1024px) 33vw, 280px"
            className="object-contain p-6 transition-transform duration-500 group-hover:scale-105"
          />
        )}
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-4">
        <p className="text-[11px] font-semibold tracking-[0.12em] text-slate-400 uppercase">
          {brand?.name || ''}
        </p>
        <h3 className="mt-1.5 text-sm leading-snug font-semibold text-navy-900">
          <Link
            href={{ pathname: '/products/[slug]', params: { slug: product.slug } }}
            className="transition-colors after:absolute after:inset-0 hover:text-brand-700"
          >
            {product.title}
          </Link>
        </h3>
        <div className="mt-auto pt-3">
          <Price prices={product.prices} size="sm" />
          <InStock inStock={inStock} />
        </div>
      </div>
    </article>
  )
}
