'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { ProductBadgeTag } from '@/components/product/product-badge'
import { cn, getMediaUrl } from '@/lib/utils'
import { Product } from '@/payload-types'

interface ProductGalleryProps {
  images: Product['images']
  title: string
  badge?: Product['badge']
}

export function ProductGallery({ images, title, badge }: ProductGalleryProps) {
  const [active, setActive] = useState(0)
  const t = useTranslations('gallery')

  // Fallback if the product has no images assigned
  if (!images || images.length === 0) {
    return (
      <div className="flex aspect-square items-center justify-center rounded-3xl border border-line bg-slate-50 text-slate-500">
        {t('noImage')}
      </div>
    )
  }

  // Per-product alt override → the media library's alt → a generic "title — image n".
  const altFor = (index: number) => {
    const item = images[index]
    const media = typeof item?.image === 'object' ? item.image : null
    return item?.alt || media?.alt || t('imageAlt', { title, index: index + 1 })
  }

  // Safely get the active image URL
  const activeImageField = images[active]?.image
  const activeImageUrl = getMediaUrl(activeImageField, 'gallery')

  return (
    <div>
      {/* Main Active Image */}
      <div className="relative aspect-square overflow-hidden rounded-3xl border border-line bg-linear-to-br from-slate-50 to-slate-100">
        {badge && <ProductBadgeTag badge={badge} className="absolute top-4 left-4 z-10" />}

        {activeImageUrl ? (
          <Image
            key={activeImageUrl} // React key triggers animation on change
            src={activeImageUrl}
            alt={altFor(active)}
            fill
            priority
            sizes="(max-width: 1024px) 90vw, 560px"
            className="object-contain p-10 animate-in fade-in zoom-in-95 duration-300 sm:p-14"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-slate-500">
            {t('loadError')}
          </div>
        )}
      </div>

      {/* Thumbnails Grid */}
      {images.length > 1 && (
        <div className="mt-3 grid grid-cols-4 gap-3">
          {images.map((item, index) => {
            const thumbnailUrl = getMediaUrl(item.image, 'thumbnail')
            const altText = altFor(index)

            // Skip rendering if thumbnail URL is missing
            if (!thumbnailUrl) return null

            return (
              <button
                key={item.id || index}
                type="button"
                onClick={() => setActive(index)}
                aria-label={t('viewImage', { index: index + 1 })}
                aria-pressed={active === index}
                className={cn(
                  'relative aspect-square cursor-pointer overflow-hidden rounded-xl border bg-linear-to-br from-slate-50 to-slate-100 transition-all',
                  active === index
                    ? 'border-brand-600 ring-2 ring-brand-600/20'
                    : 'border-line hover:border-brand-300',
                )}
              >
                <Image
                  src={thumbnailUrl}
                  alt={altText}
                  fill
                  sizes="120px"
                  className="object-contain p-3"
                />
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
