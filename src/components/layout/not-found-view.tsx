import React from 'react'
import { getTranslations } from 'next-intl/server'
import { ArrowLeft, ArrowRight, Compass } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import { Container } from '@/components/ui/container'
import { buttonVariants } from '@/components/ui/button'
import { ProductRail } from '@/components/product/product-rail'
import type { Product } from '@/payload-types'

interface NotFoundViewProps {
  code?: string
  title: string
  description: string
  /** Bestsellers to show as a recovery path; omit to hide the section. */
  suggestions?: Product[]
}

export async function NotFoundView({
  code = '404',
  title,
  description,
  suggestions,
}: NotFoundViewProps) {
  const t = await getTranslations('notFound')
  const showSuggestions = Boolean(suggestions && suggestions.length > 0)
  return (
    <>
      <section className="relative overflow-hidden bg-navy-950">
        <div className="pattern-chevron-dark absolute inset-0" aria-hidden />
        <div
          className="absolute top-1/2 left-1/2 size-[480px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-600/20 blur-3xl"
          aria-hidden
        />
        <Container className="relative flex flex-col items-center py-20 text-center lg:py-28">
          <span className="flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-semibold tracking-[0.18em] text-brand-300 uppercase">
            <Compass className="size-3.5" aria-hidden />
            {t('code', { code })}
          </span>
          <h1 className="font-display mt-6 max-w-2xl text-4xl font-bold tracking-tight text-balance text-white sm:text-5xl">
            {title}
          </h1>
          <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-slate-300">{description}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/" className={buttonVariants({ variant: 'inverse', size: 'md' })}>
              <ArrowLeft aria-hidden />
              {t('backHome')}
            </Link>
            <Link
              href="/products"
              className={buttonVariants({ variant: 'outline-inverse', size: 'md' })}
            >
              {t('browseProducts')}
            </Link>
          </div>
        </Container>
      </section>

      {showSuggestions && (
        <section className="py-16">
          <Container>
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
              <h2 className="font-display text-2xl font-semibold tracking-tight text-navy-900">
                {t('suggestionsTitle')}
              </h2>
              <Link href="/products" className={buttonVariants({ variant: 'ghost', size: 'sm' })}>
                {t('viewAll')}
                <ArrowRight aria-hidden />
              </Link>
            </div>
            <ProductRail products={suggestions ?? []} />
          </Container>
        </section>
      )}
    </>
  )
}
