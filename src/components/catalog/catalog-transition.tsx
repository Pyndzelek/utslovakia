'use client'

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useOptimistic,
  useTransition,
} from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { cn } from '@/lib/utils'

interface CatalogNavigation {
  /** True from a filter/sort change until the server has re-rendered the listing. */
  pending: boolean
  /**
   * The listing's query string, already including a change that is still loading. Controls
   * read it so they react at once, and so a second quick change builds on the first instead
   * of undoing it.
   */
  search: string
  /** Soft-navigates to an already-localized listing URL without scrolling to the top. */
  navigate: (href: string) => void
}

const CatalogNavigationContext = createContext<CatalogNavigation | null>(null)

/**
 * Wraps a product listing so its filter, sort and chip controls navigate inside one
 * transition: the current results stay on screen (dimmed, see `CatalogResults`) until the
 * new ones arrive, instead of the page looking frozen.
 */
export function CatalogTransition({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [search, setSearch] = useOptimistic(useSearchParams().toString())
  const navigate = useCallback(
    (href: string) =>
      startTransition(() => {
        setSearch(href.split('?')[1] ?? '')
        router.push(href, { scroll: false })
      }),
    [router, setSearch],
  )
  const value = useMemo(() => ({ pending, search, navigate }), [pending, search, navigate])

  return (
    <CatalogNavigationContext.Provider value={value}>{children}</CatalogNavigationContext.Provider>
  )
}

export function useCatalogNavigation(): CatalogNavigation {
  const context = useContext(CatalogNavigationContext)
  if (!context) throw new Error('useCatalogNavigation must be used inside <CatalogTransition>')
  return context
}

/** The listing's results area; dims while a filter change is loading. */
export function CatalogResults({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  const { pending } = useCatalogNavigation()
  return (
    <div
      aria-busy={pending}
      className={cn(
        'transition-opacity duration-200 motion-reduce:transition-none',
        pending && 'pointer-events-none opacity-50',
        className,
      )}
    >
      {children}
    </div>
  )
}
