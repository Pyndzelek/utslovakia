import React from 'react'
import { getTranslations } from 'next-intl/server'
import { ArrowRight, Boxes, Lightbulb, Wrench, type LucideIcon } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import { buttonVariants } from '@/components/ui/button'
import { AboutPhotoGallery, type AboutPhoto } from '@/components/about/about-photo-gallery'

// Portrait clip (576×1024), muted — its sound track was dropped at encode time.
const video = {
  src: '/about/workshop.mp4',
  poster: '/about/workshop-poster.jpg',
  width: 576,
  height: 1024,
}

// Files live in public/about/; copy for each is under `about.mediaAlt.<key>`.
const photos: {
  key: 'workbench' | 'printLab' | 'validators' | 'cabinets'
  src: string
  width: number
  height: number
}[] = [
  { key: 'workbench', src: '/about/workbench.jpg', width: 896, height: 1200 },
  { key: 'printLab', src: '/about/print-lab.jpg', width: 1536, height: 2048 },
  { key: 'validators', src: '/about/bill-validators.jpg', width: 1536, height: 2048 },
  { key: 'cabinets', src: '/about/cabinets.jpg', width: 1536, height: 2048 },
]

const audiences: { key: 'makers' | 'wholesale' | 'vision'; Icon: LucideIcon }[] = [
  { key: 'makers', Icon: Wrench },
  { key: 'wholesale', Icon: Boxes },
  { key: 'vision', Icon: Lightbulb },
]

interface AboutSectionProps {
  /** Shows the "Get in touch" button — off on the contact page itself. */
  showCta?: boolean
}

/** Two columns: the story on the left, the workshop video and photo strip on the right. */
export async function AboutSection({ showCta = true }: AboutSectionProps) {
  const t = await getTranslations('about')

  const galleryPhotos: AboutPhoto[] = photos.map(({ key, ...photo }) => ({
    ...photo,
    alt: t(`mediaAlt.${key}`),
  }))

  return (
    <div className="grid items-start gap-10 lg:grid-cols-2 lg:gap-14">
      {/* Text */}
      <div>
        <p className="mb-2 text-xs font-semibold tracking-[0.18em] text-brand-600 uppercase">
          {t('eyebrow')}
        </p>
        <h2 className="font-display text-3xl font-semibold tracking-tight text-balance text-navy-900 sm:text-4xl">
          {t('title')}
        </h2>
        <div className="mt-4 h-px w-24 bg-brand-600" aria-hidden />

        <p className="mt-6 text-base leading-relaxed text-slate-600">{t('intro')}</p>

        <h3 className="font-display mt-8 text-xl font-semibold tracking-tight text-navy-900">
          {t('crew.title')}
        </h3>
        <p className="mt-2 text-[15px] leading-relaxed text-slate-600">{t('crew.body')}</p>

        <h3 className="font-display mt-8 text-xl font-semibold tracking-tight text-navy-900">
          {t('scale.title')}
        </h3>
        <ul className="mt-4 space-y-4">
          {audiences.map(({ key, Icon }) => (
            <li key={key} className="flex gap-4">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <Icon className="size-5" aria-hidden />
              </span>
              <div>
                <h4 className="text-[15px] font-semibold text-navy-900">
                  {t(`scale.items.${key}.title`)}
                </h4>
                <p className="mt-1 text-sm leading-relaxed text-slate-600">
                  {t(`scale.items.${key}.body`)}
                </p>
              </div>
            </li>
          ))}
        </ul>

        <p className="font-display mt-8 text-lg font-semibold text-balance text-navy-900">
          {t('closing')}
        </p>
        {showCta && (
          <Link
            href="/contact"
            className={buttonVariants({ variant: 'primary', size: 'md', className: 'mt-5' })}
          >
            {t('cta')}
            <ArrowRight aria-hidden />
          </Link>
        )}
      </div>

      {/* Media */}
      <div className="lg:sticky lg:top-28">
        <AboutPhotoGallery
          video={{ ...video, alt: t('mediaAlt.video') }}
          photos={galleryPhotos}
          label={t('photosLabel')}
        />
      </div>
    </div>
  )
}
