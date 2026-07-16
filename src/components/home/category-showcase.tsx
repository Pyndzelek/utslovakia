import React from 'react'
import Image from 'next/image'
import { ArrowUpRight } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import { buttonVariants } from '@/components/ui/button'
import { getCategory } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

type Tone = 'navy' | 'light' | 'brand'

interface TileProps {
  slug: string
  tone: Tone
  className?: string
  large?: boolean
}

const toneStyles: Record<Tone, { tile: string; name: string; tagline: string; link: string }> = {
  navy: {
    tile: 'bg-navy-900 pattern-chevron-dark',
    name: 'text-white',
    tagline: 'text-slate-400',
    link: 'bg-white text-navy-900 group-hover:bg-brand-600 group-hover:text-white',
  },
  light: {
    tile: 'bg-brand-50 pattern-chevron-light',
    name: 'text-navy-900',
    tagline: 'text-slate-500',
    link: 'bg-navy-900 text-white group-hover:bg-brand-600',
  },
  brand: {
    tile: 'bg-gradient-to-br from-brand-600 to-brand-800 pattern-chevron-dark',
    name: 'text-white',
    tagline: 'text-brand-100',
    link: 'bg-white text-navy-900 group-hover:bg-navy-900 group-hover:text-white',
  },
}

function CategoryTile({ slug, tone, className, large = false }: TileProps) {
  const category = getCategory(slug)
  if (!category) return null
  const styles = toneStyles[tone]

  return (
    <Link
      href={{ pathname: '/category/[slug]', params: { slug } }}
      className={cn(
        'group relative flex flex-col justify-between overflow-hidden rounded-3xl p-6 shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift sm:p-8',
        styles.tile,
        className,
      )}
    >
      <div className="relative z-10 max-w-[65%]">
        <p className={cn('text-xs font-medium', styles.tagline)}>
          {category.productCount} products
        </p>
        <h3
          className={cn(
            'font-display mt-2 font-semibold tracking-tight',
            styles.name,
            large ? 'text-2xl sm:text-3xl' : 'text-xl',
          )}
        >
          {category.name}
        </h3>
        {large && (
          <p
            className={cn('mt-3 hidden max-w-xs text-sm leading-relaxed sm:block', styles.tagline)}
          >
            {category.tagline}
          </p>
        )}
      </div>

      <Image
        src={category.image}
        alt=""
        width={large ? 420 : 220}
        height={large ? 420 : 220}
        className={cn(
          'pointer-events-none absolute object-contain drop-shadow-2xl transition-transform duration-500 group-hover:scale-105',
          large ? '-right-8 bottom-0 w-[55%]' : '-right-4 -bottom-3 w-[45%]',
        )}
      />

      <span
        className={cn(
          'relative z-10 mt-8 inline-flex w-fit items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold transition-colors',
          styles.link,
        )}
      >
        Zobacz
        <ArrowUpRight className="size-3.5" aria-hidden />
      </span>
    </Link>
  )
}

export function CategoryShowcase() {
  return (
    <div>
      <div className="grid gap-4 lg:grid-cols-4 lg:gap-5">
        <CategoryTile
          slug="bill-acceptors"
          tone="navy"
          large
          className="min-h-72 lg:col-span-2 lg:row-span-2 lg:min-h-[520px]"
        />
        <CategoryTile slug="coin-acceptors" tone="light" className="min-h-60" />
        <CategoryTile slug="monitors" tone="navy" className="min-h-60" />
        <CategoryTile slug="cabinets" tone="light" className="min-h-60" />
        <CategoryTile slug="printers" tone="navy" className="min-h-60" />
      </div>

      <div className="mt-8 text-center">
        <Link href="/category" className={buttonVariants({ variant: 'outline', size: 'md' })}>
          Zobacz wszystkie kategorie
          <ArrowUpRight aria-hidden />
        </Link>
      </div>
    </div>
  )
}
