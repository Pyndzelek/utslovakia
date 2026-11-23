import React from 'react'
import { getTranslations } from 'next-intl/server'
import { ArrowLeft, ArrowRight, Compass } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import { Container } from '@/components/ui/container'
import { StatusHero } from '@/components/layout/status-hero'
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
      <StatusHero
        icon={<Compass className="size-3.5" aria-hidden />}
        eyebrow={t('code', { code })}
        title={title}
        description={description}
      >
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
      </StatusHero>

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
