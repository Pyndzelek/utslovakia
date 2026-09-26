'use client'

import { useLayoutEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { Dialog } from '@base-ui/react/dialog'
import { useTranslations } from 'next-intl'
import { ChevronLeft, ChevronRight, X, ZoomIn } from 'lucide-react'
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
  const [previewOpen, setPreviewOpen] = useState(false)
  const touchStartX = useRef<number | null>(null)
  const t = useTranslations('gallery')
  const imageCount = images?.length ?? 0

  // Arrow keys browse the preview. Listened for on window in the capture phase: Base UI's
  // popup stops arrow keys from bubbling once focus is inside it, and focus only moves in
  // after the open transition. A layout effect so it's attached before the preview paints.
  useLayoutEffect(() => {
    if (!previewOpen || imageCount < 2) return
    const onKeyDown = (event: KeyboardEvent) => {
      const direction = event.key === 'ArrowLeft' ? -1 : event.key === 'ArrowRight' ? 1 : 0
      if (direction) setActive((index) => (index + direction + imageCount) % imageCount)
    }
    window.addEventListener('keydown', onKeyDown, true)
    return () => window.removeEventListener('keydown', onKeyDown, true)
  }, [previewOpen, imageCount])

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
  // The preview shows the stored original (up to 2400px) instead of the 960px gallery size.
  const previewImageUrl = getMediaUrl(activeImageField)

  const hasMultiple = imageCount > 1
  const step = (direction: 1 | -1) =>
    setActive((index) => (index + direction + imageCount) % imageCount)

  return (
    <Dialog.Root open={previewOpen} onOpenChange={setPreviewOpen}>
      <div>
        {/* Main Active Image */}
        <div className="relative aspect-square overflow-hidden rounded-3xl border border-line bg-linear-to-br from-slate-50 to-slate-100">
          {badge && <ProductBadgeTag badge={badge} className="absolute top-4 left-4 z-10" />}

          {activeImageUrl ? (
            <Dialog.Trigger
              aria-label={t('openPreview')}
              className="group absolute inset-0 cursor-zoom-in rounded-3xl focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:outline-none focus-visible:ring-inset"
            >
              <Image
                key={activeImageUrl} // React key triggers animation on change
                src={activeImageUrl}
                alt={altFor(active)}
                fill
                priority
                sizes="(max-width: 1024px) 90vw, 560px"
                className="object-contain p-10 animate-in fade-in zoom-in-95 duration-300 sm:p-14"
              />
              <span
                className="absolute right-4 bottom-4 flex size-9 items-center justify-center rounded-full bg-white text-navy-900 shadow-card transition-opacity lg:opacity-0 lg:group-hover:opacity-100 lg:group-focus-visible:opacity-100"
                aria-hidden
              >
                <ZoomIn className="size-4" />
              </span>
            </Dialog.Trigger>
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

      {/* Full-screen preview; browsing here moves the gallery's active image too. */}
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-[998] bg-navy-950/90 transition-opacity duration-200 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0" />
        <Dialog.Popup
          // Clicks on the dark area around the image close the preview.
          onClick={(event) => event.target === event.currentTarget && setPreviewOpen(false)}
          className="fixed inset-0 z-999 flex flex-col items-center justify-center gap-4 p-4 transition-opacity duration-200 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0 sm:p-10"
        >
          <Dialog.Title className="sr-only">{title}</Dialog.Title>
          <Dialog.Close
            aria-label={t('closePreview')}
            className="absolute top-4 right-4 flex size-11 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
          >
            <X className="size-5" aria-hidden />
          </Dialog.Close>

          {previewImageUrl && (
            <div
              className="relative h-[80vh] w-full max-w-6xl"
              onTouchStart={(event) => {
                touchStartX.current = event.touches[0]?.clientX ?? null
              }}
              onTouchEnd={(event) => {
                const startX = touchStartX.current
                const endX = event.changedTouches[0]?.clientX
                touchStartX.current = null
                if (!hasMultiple || startX === null || endX === undefined) return
                if (Math.abs(endX - startX) > 50) step(endX < startX ? 1 : -1)
              }}
            >
              <Image
                key={previewImageUrl}
                src={previewImageUrl}
                alt={altFor(active)}
                fill
                sizes="92vw"
                className="object-contain animate-in fade-in duration-300"
              />
            </div>
          )}

          {hasMultiple && (
            <>
              {(['previous', 'next'] as const).map((direction) => (
                <button
                  key={direction}
                  type="button"
                  onClick={() => step(direction === 'previous' ? -1 : 1)}
                  aria-label={t(direction)}
                  className={cn(
                    'absolute top-1/2 hidden size-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none sm:flex',
                    direction === 'previous' ? 'left-4' : 'right-4',
                  )}
                >
                  {direction === 'previous' ? (
                    <ChevronLeft className="size-6" aria-hidden />
                  ) : (
                    <ChevronRight className="size-6" aria-hidden />
                  )}
                </button>
              ))}
              <p className="text-sm font-medium text-white/80 tabular-nums" aria-live="polite">
                {active + 1} / {images.length}
              </p>
            </>
          )}
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
