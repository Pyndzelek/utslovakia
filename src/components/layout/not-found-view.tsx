import React from 'react'
import { ArrowLeft, ArrowRight, Compass } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import { Container } from '@/components/ui/container'
import { buttonVariants } from '@/components/ui/button'
import { ProductRail } from '@/components/product/product-rail'
import { bestsellers } from '@/lib/mock-data'

interface NotFoundViewProps {
  code?: string
  title: string
  description: string
  /** Show a rail of bestsellers as a recovery path */
  showSuggestions?: boolean
}

export function NotFoundView({
  code = '404',
  title,
  description,
  showSuggestions = true,
}: NotFoundViewProps) {
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
            Error {code}
          </span>
          <h1 className="font-display mt-6 max-w-2xl text-4xl font-bold tracking-tight text-balance text-white sm:text-5xl">
            {title}
          </h1>
          <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-slate-300">{description}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/" className={buttonVariants({ variant: 'inverse', size: 'md' })}>
              <ArrowLeft aria-hidden />
              Back to homepage
            </Link>
            <Link href="/products" className={buttonVariants({ variant: 'outline-inverse', size: 'md' })}>
              Browse all products
            </Link>
          </div>
        </Container>
      </section>

      {showSuggestions && (
        <section className="py-16">
          <Container>
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
              <h2 className="font-display text-2xl font-semibold tracking-tight text-navy-900">
                Perhaps you were looking for one of these
              </h2>
              <Link href="/products" className={buttonVariants({ variant: 'ghost', size: 'sm' })}>
                View all
                <ArrowRight aria-hidden />
              </Link>
            </div>
            <ProductRail products={bestsellers} />
          </Container>
        </section>
      )}
    </>
  )
}
