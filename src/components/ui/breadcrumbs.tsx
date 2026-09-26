import React from 'react'
import { useTranslations } from 'next-intl'
import { ChevronRight, Home } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import { cn } from '@/lib/utils'

type LinkHref = React.ComponentProps<typeof Link>['href']

export interface BreadcrumbItem {
  label: string
  href?: LinkHref
}
export type BreadcrumbEntry = BreadcrumbItem | null | false | undefined

export function Breadcrumbs({
  items,
  className,
}: {
  items: BreadcrumbEntry[]
  className?: string
}) {
  const t = useTranslations()
  const breadcrumbs = items?.filter(Boolean) as BreadcrumbItem[]
  return (
    <nav aria-label={t('a11y.breadcrumb')} className={cn('text-sm', className)}>
      <ol className="flex flex-wrap items-center gap-1.5">
        <li>
          <Link
            href="/"
            className="flex items-center gap-1 text-slate-400 transition-colors hover:text-brand-600"
          >
            <Home className="size-3.5" aria-hidden />
            <span className="sr-only">{t('nav.home')}</span>
          </Link>
        </li>
        {breadcrumbs.map((item, index) => {
          const isLast = index === breadcrumbs.length - 1
          return (
            <li key={item.label} className="flex items-center gap-1.5">
              <ChevronRight className="size-3.5 text-slate-300" aria-hidden />
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="text-slate-500 transition-colors hover:text-brand-600"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  aria-current={isLast ? 'page' : undefined}
                  className="font-medium text-navy-900"
                >
                  {item.label}
                </span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
