import React from 'react'
import Image from 'next/image'
import { getTranslations } from 'next-intl/server'
import { ArrowRight } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import { Container } from '@/components/ui/container'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import type { Locale } from '@/i18n/routing'
import { getHeroSlides } from '@/lib/data/site-settings'
import { HERO_IMAGE } from '@/lib/site'
import { HeroShowcase } from './hero-showcase'

export async function Hero({ locale }: { locale: Locale }) {
  const t = await getTranslations('home.hero')
  const slides = await getHeroSlides(locale)

  return (
    <section className="relative flex flex-col overflow-hidden bg-brand-50 lg:min-h-[calc(100svh-4rem)]">
      {/* Background blobs */}
      <svg
        viewBox="0 0 900 640"
        aria-hidden
        className="pointer-events-none absolute -top-[30%] -left-[18%] h-auto w-[64%] min-w-[560px] fill-brand-100"
      >
        <path d="M84 40C220-40 470 10 640 70s250 190 210 320-170 160-330 170-260 70-380 10S-20 400 10 250 -10 100 84 40Z" />
      </svg>
      <svg
        viewBox="0 0 600 600"
        aria-hidden
        className="pointer-events-none absolute top-[4%] -right-[10%] h-auto w-[min(64vw,920px)] min-w-[460px] fill-white"
      >
        <path d="M330 20c120 10 240 110 260 240s-40 270-170 320S120 600 50 480 -10 230 60 130 210 10 330 20Z" />
      </svg>

      <div className="relative z-10 flex flex-1 flex-col justify-center pt-[clamp(28px,5svh,56px)] pb-[clamp(110px,12vw,170px)]">
        <Container>
          <HeroShowcase
            slides={slides}
            badge={<Badge variant="brand">{t('badge')}</Badge>}
            intro={
              <>
                <h1
                  className={`font-display text-navy-900 ${slides.length ? 'mt-2.5 text-[clamp(1.375rem,2.2vw,1.875rem)] leading-[1.15] font-semibold tracking-[-0.02em]' : 'mt-6 text-[2.125rem] leading-[1.08] font-bold tracking-tight sm:text-5xl xl:text-6xl'} text-balance`}
                >
                  {t.rich('title', {
                    highlight: (chunks) => (
                      <span className="whitespace-nowrap text-brand-600">{chunks}</span>
                    ),
                  })}
                </h1>
                <p className="mt-3 max-w-[440px] text-[15px] leading-relaxed text-pretty text-slate-600">
                  {t('description')}
                </p>
              </>
            }
            actions={
              <div className="grid gap-2.5 sm:flex sm:flex-wrap">
                <Link
                  href="/products"
                  className={buttonVariants({ size: 'lg', className: 'w-full sm:w-auto' })}
                >
                  {t('ctaProducts')}
                  <ArrowRight aria-hidden />
                </Link>
                <Link
                  href="/contact"
                  className={buttonVariants({
                    variant: 'outline',
                    size: 'lg',
                    className: 'w-full sm:w-auto',
                  })}
                >
                  {t('ctaContact')}
                </Link>
              </div>
            }
            fallbackVisual={
              <div className="relative aspect-square w-[min(100%,clamp(280px,60svh,560px))]">
                <Image
                  src={HERO_IMAGE}
                  alt={t('imageAlt')}
                  fill
                  priority
                  sizes="(max-width: 1024px) 90vw, 560px"
                  className="object-contain p-10"
                />
              </div>
            }
          />
        </Container>
      </div>

      {/* Wave into the white section below */}
      <svg
        viewBox="0 0 1440 160"
        preserveAspectRatio="none"
        aria-hidden
        className="pointer-events-none absolute -bottom-px left-0 z-[5] block h-[clamp(60px,9vw,150px)] w-full fill-white"
      >
        <path d="M0 160V96C240 150 520 160 820 110S1240 10 1440 40V160Z" />
      </svg>
    </section>
  )
}
