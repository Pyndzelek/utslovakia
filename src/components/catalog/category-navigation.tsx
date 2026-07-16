import React from 'react'
import { Link } from '@/i18n/navigation'
import { Container } from '@/components/ui/container'
import type { Category } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

interface CategoryNavigationProps {
  categories: Category[]
  currentSlug: string
}

export function CategoryNavigation({ categories, currentSlug }: CategoryNavigationProps) {
  return (
    <nav aria-label="Catalog Categories" className="border-b border-line bg-white">
      <Container className="py-4">
        {/* 
          Mobile/Tablet: flex-nowrap + overflow-x-auto for smooth touch swiping.
          Desktop (lg+): flex-wrap + overflow-visible so EVERY category is visible without scrolling.
        */}
        <div className="no-scrollbar flex flex-nowrap gap-2 overflow-x-auto lg:flex-wrap lg:overflow-visible lg:py-1">
          {categories.map((c) => {
            const isActive = c.slug === currentSlug
            return (
              <Link
                key={c.slug}
                href={{ pathname: '/category/[slug]', params: { slug: c.slug } }}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'shrink-0 rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap transition-all duration-150',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2',
                  isActive
                    ? 'bg-navy-900 text-white shadow-sm'
                    : 'border border-line bg-slate-50/50 text-slate-600 hover:border-brand-400 hover:bg-brand-50/50 hover:text-brand-700 lg:bg-white',
                )}
              >
                {c.name}
              </Link>
            )
          })}
        </div>
      </Container>
    </nav>
  )
}
