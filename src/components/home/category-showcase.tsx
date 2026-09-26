import React from 'react'
import Image from 'next/image'
import { getTranslations } from 'next-intl/server'
import { ArrowUpRight } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import { buttonVariants } from '@/components/ui/button'
import type { Locale } from '@/i18n/routing'
import type { Category } from '@/payload-types'
import { getCategories } from '@/lib/data/categories'
import { getProductCountsByCategory } from '@/lib/data/products'
import { cn, getMediaUrl } from '@/lib/utils'

type Tone = 'navy' | 'light' | 'brand'

interface TileProps {
  category: Category
  productCount: number
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

async function CategoryTile({ category, productCount, tone, className, large = false }: TileProps) {
  const imageUrl = getMediaUrl(category.image, large ? 'gallery' : 'card')
  const styles = toneStyles[tone]
  const t = await getTranslations('home.categoryShowcase')

  return (
    <Link
      href={{ pathname: '/category/[slug]', params: { slug: category.slug } }}
      className={cn(
        'group relative flex flex-col justify-between overflow-hidden rounded-3xl p-6 shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift sm:p-8',
        styles.tile,
        className,
      )}
    >
      <div className="relative z-10 max-w-[65%]">
        <p className={cn('text-xs font-medium', styles.tagline)}>
          {t('productCount', { count: productCount })}
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
        {large && category.description && (
          <p
            className={cn('mt-3 hidden max-w-xs text-sm leading-relaxed sm:block', styles.tagline)}
          >
            {category.description}
          </p>
        )}
      </div>

      {imageUrl && (
        <Image
          src={imageUrl}
          alt=""
          width={large ? 420 : 220}
          height={large ? 420 : 220}
          sizes={large ? '(max-width: 1024px) 55vw, 330px' : '(max-width: 1024px) 45vw, 130px'}
          className={cn(
            'pointer-events-none absolute object-contain drop-shadow-2xl transition-transform duration-500 group-hover:scale-105',
            // Single-column (below lg): vertically centred on the right. Bento (lg): tucked into
            // the bottom-right corner, inset so the product isn't cropped by the tile edge.
            'top-1/2 max-h-[85%] -translate-y-1/2 lg:top-auto lg:max-h-none lg:translate-y-0',
            large
              ? 'right-2 w-[55%] lg:right-4 lg:bottom-6'
              : 'right-2 w-[45%] lg:right-3 lg:bottom-3',
          )}
        />
      )}

      <span
        className={cn(
          'relative z-10 mt-8 inline-flex w-fit items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold transition-colors',
          styles.link,
        )}
      >
        {t('view')}
        <ArrowUpRight className="size-3.5" aria-hidden />
      </span>
    </Link>
  )
}

/** Bento layout: the first (lowest `order`) category is the large tile, the next four follow. */
const smallTileTones: Tone[] = ['light', 'navy', 'light', 'navy']

export async function CategoryShowcase({ locale }: { locale: Locale }) {
  const t = await getTranslations('home.categoryShowcase')
  const [categories, productCounts] = await Promise.all([
    getCategories(locale),
    getProductCountsByCategory(locale),
  ])
  if (categories.length === 0) return null
  const [featured, ...rest] = categories.slice(0, 1 + smallTileTones.length)

  return (
    <div>
      <div className="grid gap-4 lg:grid-cols-4 lg:gap-5">
        <CategoryTile
          category={featured}
          productCount={productCounts[featured.id] ?? 0}
          tone="navy"
          large
          className="min-h-72 lg:col-span-2 lg:row-span-2 lg:min-h-[520px]"
        />
        {rest.map((category, index) => (
          <CategoryTile
            key={category.id}
            category={category}
            productCount={productCounts[category.id] ?? 0}
            tone={smallTileTones[index]}
            className="min-h-60"
          />
        ))}
      </div>

      <div className="mt-8 text-center">
        <Link href="/category" className={buttonVariants({ variant: 'outline', size: 'md' })}>
          {t('viewAllCategories')}
          <ArrowUpRight aria-hidden />
        </Link>
      </div>
    </div>
  )
}
