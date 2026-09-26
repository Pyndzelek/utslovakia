import React from 'react'
import Image from 'next/image'
import { getTranslations } from 'next-intl/server'
import { ArrowRight, BadgeCheck, ShieldCheck, Truck } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import { Container } from '@/components/ui/container'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import type { Locale } from '@/i18n/routing'
import { getSiteSettings } from '@/lib/data/site-settings'
import { HERO_IMAGE } from '@/lib/site'

/** Staggered entrance for hero content (tw-animate-css; the global reduced-motion rule neutralises it). */
const enter = 'animate-in fade-in fill-mode-both duration-700 ease-out'

export async function Hero({ locale }: { locale: Locale }) {
  const t = await getTranslations('home.hero')
  const { heroStats } = await getSiteSettings(locale)
  const stats = [
    { label: t('statYears'), value: heroStats?.years },
    { label: t('statDevices'), value: heroStats?.devicesSold },
  ].filter((stat): stat is { label: string; value: string } => Boolean(stat.value))

  return (
    <section className="relative overflow-hidden bg-navy-950">
      <div className="pattern-chevron-dark absolute inset-0" aria-hidden />

      <Container className="relative grid items-center gap-10 py-12 sm:py-16 lg:grid-cols-2 lg:gap-x-12 lg:py-24">
        <div className="lg:col-start-1 lg:row-start-1 lg:self-end">
          <Badge variant="on-dark" className={`${enter} slide-in-from-bottom-2`}>
            <BadgeCheck className="size-3.5" aria-hidden />
            {t('badge')}
          </Badge>

          <h1
            className={`${enter} slide-in-from-bottom-4 font-display mt-5 text-[2.125rem] leading-[1.08] font-bold tracking-tight text-balance text-white delay-100 sm:mt-6 sm:text-5xl sm:leading-[1.02] xl:text-6xl`}
          >
            {t.rich('title', {
              highlight: (chunks) => (
                <span className="bg-linear-to-r from-brand-300 to-brand-500 bg-clip-text text-transparent">
                  {chunks}
                </span>
              ),
            })}
          </h1>

          <p
            className={`${enter} slide-in-from-bottom-4 mt-5 max-w-xl text-[15px] leading-relaxed text-pretty text-slate-300 delay-200 sm:mt-6 sm:text-lg`}
          >
            {t('description')}
          </p>

          <div
            className={`${enter} slide-in-from-bottom-4 mt-8 grid gap-3 delay-300 sm:flex sm:flex-wrap sm:items-center`}
          >
            <Link
              href="/products"
              className={buttonVariants({
                variant: 'primary',
                size: 'lg',
                className: 'w-full sm:w-auto',
              })}
            >
              {t('ctaProducts')}
              <ArrowRight aria-hidden />
            </Link>
            <Link
              href="/contact"
              className={buttonVariants({
                variant: 'outline-inverse',
                size: 'lg',
                className: 'w-full sm:w-auto',
              })}
            >
              {t('ctaContact')}
            </Link>
          </div>
        </div>

        {/* Product visual */}
        <div
          className={`${enter} zoom-in-95 relative mx-auto w-full max-w-sm delay-300 duration-1000 sm:max-w-md lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:max-w-none`}
        >
          <div className="relative aspect-square">
            <div
              className="absolute inset-6 rounded-[2.5rem] border border-white/10 bg-linear-to-br from-white/10 to-white/2 backdrop-blur-sm"
              aria-hidden
            />
            <Image
              src={HERO_IMAGE}
              alt={t('imageAlt')}
              fill
              priority
              sizes="(max-width: 1024px) 90vw, 560px"
              className="object-contain p-14 drop-shadow-[0_32px_48px_rgba(0,0,0,0.55)]"
            />

            {/* Floating spec chips */}
            <div
              className={`${enter} slide-in-from-left-6 absolute top-8 left-0 flex items-center gap-2 rounded-2xl border border-white/10 bg-navy-900/80 px-4 py-3 shadow-lift backdrop-blur-md delay-700 sm:top-10 sm:left-2`}
            >
              <ShieldCheck className="size-5 text-brand-400" aria-hidden />
              <div>
                <p className="text-xs font-semibold text-white">{t('warrantyTitle')}</p>
                <p className="text-[11px] text-slate-400">{t('warrantySubtitle')}</p>
              </div>
            </div>
            <div
              className={`${enter} slide-in-from-right-6 absolute right-0 bottom-10 flex items-center gap-2 rounded-2xl border border-white/10 bg-navy-900/80 px-4 py-3 shadow-lift backdrop-blur-md delay-[850ms] sm:right-2 sm:bottom-12`}
            >
              <Truck className="size-5 text-brand-400" aria-hidden />
              <div>
                <p className="text-xs font-semibold text-white">{t('shippingTitle')}</p>
                <p className="text-[11px] text-slate-400">{t('shippingSubtitle')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Below the image on mobile; back under the CTAs in the left column on desktop */}
        {stats.length > 0 && (
          <dl
            className={`${enter} slide-in-from-bottom-4 -mt-4 grid w-full max-w-md grid-cols-2 gap-3 delay-400 sm:mx-auto lg:col-start-1 lg:mt-0 lg:row-start-2 lg:mx-0 lg:self-start`}
          >
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="flex flex-col rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm"
              >
                <dt className="order-2 mt-0.5 text-[13px] leading-snug text-slate-300">
                  {stat.label}
                </dt>
                <dd className="font-display order-1 text-2xl font-bold text-white sm:text-3xl">
                  {stat.value}
                </dd>
              </div>
            ))}
          </dl>
        )}
      </Container>
    </section>
  )
}
