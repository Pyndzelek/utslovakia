'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ProductBadgeTag } from '@/components/product/product-badge'
import { cn } from '@/lib/utils'
import { Product } from '@/payload-types'

interface ProductGalleryProps {
  images: Product['images']
  title: string
  badge?: Product['badge']
}

export function ProductGallery({ images, title, badge }: ProductGalleryProps) {
  const [active, setActive] = useState(0)

  // Fallback if the product has no images assigned
  if (!images || images.length === 0) {
    return (
      <div className="flex aspect-square items-center justify-center rounded-3xl border border-line bg-slate-50 text-slate-400">
        Brak zdjęcia
      </div>
    )
  }

  // Safely get the active image URL
  const activeImageField = images[active]?.image
  const activeImageUrl = getMediaUrl(activeImageField)

  return (
    <div>
      {/* Main Active Image */}
      <div className="relative aspect-square overflow-hidden rounded-3xl border border-line bg-linear-to-br from-slate-50 to-slate-100">
        {badge && <ProductBadgeTag badge={badge} className="absolute top-4 left-4 z-10" />}

        {activeImageUrl ? (
          <Image
            key={activeImageUrl} // React key triggers animation on change
            src={activeImageUrl}
            alt={`${title} — zdjęcie ${active + 1}`}
            fill
            priority
            sizes="(max-width: 1024px) 90vw, 560px"
            className="object-contain p-10 animate-in fade-in zoom-in-95 duration-300 sm:p-14"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-slate-400">
            Błąd ładowania zdjęcia
          </div>
        )}
      </div>

      {/* Thumbnails Grid */}
      {images.length > 1 && (
        <div className="mt-3 grid grid-cols-4 gap-3">
          {images.map((item, index) => {
            const thumbnailUrl = getMediaUrl(item.image)
            const altText = item.alt || `${title} thumbnail ${index + 1}`

            // Skip rendering if thumbnail URL is missing
            if (!thumbnailUrl) return null

            return (
              <button
                key={item.id || index}
                type="button"
                onClick={() => setActive(index)}
                aria-label={`Zobacz zdjęcie ${index + 1}`}
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

function getMediaUrl(imageField: any): string | null {
  if (typeof imageField === 'object' && imageField !== null && 'url' in imageField) {
    return imageField.url
  }
  return null
}
