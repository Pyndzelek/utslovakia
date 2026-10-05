'use client'

import React, { useEffect, useId, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import { AnimatePresence, motion } from 'motion/react'
import { useLocale, useTranslations } from 'next-intl'
import { ArrowRight, Loader2, Package, Search, X } from 'lucide-react'
import { Link, usePathname, useRouter } from '@/i18n/navigation'
import type { ProductSuggestion, ProductSuggestionsResult } from '@/lib/data/products'
import { highlightMatches, searchWords } from '@/lib/search'
import { cn } from '@/lib/utils'

/** Matches the API route: shorter queries never open the dropdown. */
const MIN_QUERY_LENGTH = 2
const DEBOUNCE_MS = 250

interface SearchResponse extends ProductSuggestionsResult {
  /** The query these results are for — the input may already hold a newer one. */
  query: string
  failed: boolean
}

function useDebouncedValue<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delay)
    return () => window.clearTimeout(timer)
  }, [value, delay])
  return debounced
}

interface HeaderSearchProps {
  /**
   * `bar`: compact field in the header, results float below it.
   * `drawer`: full-width field in the mobile menu, results push the content below down.
   */
  variant?: 'bar' | 'drawer'
  /** Called after the search sends the visitor to another page (e.g. to close the drawer). */
  onNavigate?: () => void
  className?: string
}

/** Search-as-you-type over the catalogue, with a dropdown of matching products. */
export function HeaderSearch({ variant = 'bar', onNavigate, className }: HeaderSearchProps) {
  const t = useTranslations('header.search')
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  const id = useId()
  const listId = `${id}-results`
  const optionId = (index: number) => `${id}-option-${index}`

  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState('')
  const [response, setResponse] = useState<SearchResponse | null>(null)
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const [lastPathname, setLastPathname] = useState(pathname)

  const term = query.trim()
  const debouncedTerm = useDebouncedValue(term, DEBOUNCE_MS)

  // Close on route navigation
  if (pathname !== lastPathname) {
    setLastPathname(pathname)
    setOpen(false)
  }

  useEffect(() => {
    if (debouncedTerm.length < MIN_QUERY_LENGTH) return
    // Aborted when the term changes, so a slow stale response never replaces a newer one.
    const controller = new AbortController()
    const params = new URLSearchParams({ q: debouncedTerm, locale })
    fetch(`/api/product-search?${params}`, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(`Search failed with ${res.status}`)
        return res.json() as Promise<ProductSuggestionsResult>
      })
      .then((data) => {
        if (controller.signal.aborted) return
        setResponse({ ...data, query: debouncedTerm, failed: false })
        setActiveIndex(-1)
      })
      .catch(() => {
        if (controller.signal.aborted) return
        setResponse({ results: [], total: 0, query: debouncedTerm, failed: true })
        setActiveIndex(-1)
      })
    return () => controller.abort()
  }, [debouncedTerm, locale])

  // Close when clicking anywhere outside the field and its dropdown
  useEffect(() => {
    if (!open) return
    const handlePointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [open])

  const searching = term.length >= MIN_QUERY_LENGTH
  // Covers the debounce wait too, so the spinner shows as soon as the visitor types.
  const pending = searching && response?.query !== term
  const panelOpen = open && searching && response !== null
  const results = response?.results ?? []
  const words = useMemo(() => searchWords(response?.query), [response?.query])

  function finish() {
    setOpen(false)
    setQuery('')
    setResponse(null)
    setActiveIndex(-1)
    inputRef.current?.blur()
    onNavigate?.()
  }

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const value = event.target.value
    setQuery(value)
    setOpen(true)
    setActiveIndex(-1)
    // Don't flash the previous search's results when typing starts over.
    if (value.trim().length < MIN_QUERY_LENGTH) setResponse(null)
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    router.push(term ? { pathname: '/products', query: { q: term } } : '/products')
    finish()
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowUp': {
        if (results.length === 0) return
        event.preventDefault()
        setOpen(true)
        const step = event.key === 'ArrowDown' ? 1 : -1
        setActiveIndex((index) =>
          index === -1 && step === -1
            ? results.length - 1
            : (index + step + results.length) % results.length,
        )
        return
      }
      case 'Enter': {
        const active = panelOpen ? results[activeIndex] : undefined
        if (!active) return // the form submits to the full results page
        event.preventDefault()
        router.push({ pathname: '/products/[slug]', params: { slug: active.slug } })
        finish()
        return
      }
      case 'Escape':
        // First press closes the dropdown, the next clears the field. Kept from bubbling so
        // the mobile drawer (which also closes on Escape) stays open meanwhile.
        if (panelOpen) {
          event.stopPropagation()
          setOpen(false)
          setActiveIndex(-1)
        } else if (query) {
          event.stopPropagation()
          setQuery('')
          setResponse(null)
        }
        return
    }
  }

  const isBar = variant === 'bar'

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <form role="search" onSubmit={handleSubmit} className="relative">
        <label htmlFor={`${id}-input`} className="sr-only">
          {t('label')}
        </label>
        <span className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-slate-500">
          {pending ? (
            <Loader2 className="size-4 animate-spin text-brand-600" aria-hidden />
          ) : (
            <Search className="size-4" aria-hidden />
          )}
        </span>
        <input
          ref={inputRef}
          id={`${id}-input`}
          type="search"
          name="q"
          autoComplete="off"
          maxLength={100}
          value={query}
          onChange={handleChange}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={t('placeholder')}
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={panelOpen}
          aria-controls={listId}
          aria-activedescendant={panelOpen && activeIndex >= 0 ? optionId(activeIndex) : undefined}
          className={cn(
            'w-full rounded-xl border border-transparent bg-slate-100 pr-9 pl-10 text-navy-900 transition-colors placeholder:text-slate-500 focus:border-brand-400 focus:bg-white focus:outline-none [&::-webkit-search-cancel-button]:appearance-none',
            isBar ? 'h-10 text-sm' : 'h-11 text-base',
          )}
        />
        <AnimatePresence>
          {query && (
            <motion.button
              type="button"
              aria-label={t('clear')}
              onClick={() => {
                setQuery('')
                setResponse(null)
                inputRef.current?.focus()
              }}
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.6 }}
              transition={{ duration: 0.15 }}
              className="absolute top-1/2 right-2 flex size-6 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-200 hover:text-navy-900 focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:outline-none"
            >
              <X className="size-3.5" aria-hidden />
            </motion.button>
          )}
        </AnimatePresence>
      </form>

      <AnimatePresence>
        {panelOpen && response && (
          <motion.div
            key="panel"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className={cn(
              'overflow-hidden rounded-2xl border border-line bg-white',
              isBar
                ? 'absolute top-full right-0 z-50 mt-2 w-[min(26rem,calc(100vw-2rem))] shadow-lift'
                : 'mt-2 shadow-card',
            )}
          >
            <AutoHeight>
              {response.failed ? (
                <p className="px-4 py-5 text-sm text-slate-600">{t('error')}</p>
              ) : results.length === 0 ? (
                <p className="px-4 py-5 text-sm text-slate-600">
                  {t('noResults', { query: response.query })}
                </p>
              ) : (
                <>
                  <ul
                    id={listId}
                    role="listbox"
                    aria-label={t('resultsLabel')}
                    className="relative max-h-[min(24rem,60vh)] overflow-y-auto p-1.5"
                  >
                    <AnimatePresence mode="popLayout" initial>
                      {results.map((product, index) => (
                        <SuggestionRow
                          key={product.id}
                          product={product}
                          index={index}
                          id={optionId(index)}
                          words={words}
                          active={index === activeIndex}
                          onHover={() => setActiveIndex(index)}
                          onSelect={finish}
                        />
                      ))}
                    </AnimatePresence>
                  </ul>
                  <Link
                    href={{ pathname: '/products', query: { q: response.query } }}
                    onClick={finish}
                    className="group flex items-center justify-between border-t border-line bg-slate-50/70 px-4 py-2.5 text-sm font-medium text-brand-700 transition-colors hover:bg-slate-100 focus-visible:bg-slate-100 focus-visible:outline-none"
                  >
                    {t('viewAll', { count: response.total })}
                    <ArrowRight
                      className="size-4 transition-transform group-hover:translate-x-0.5"
                      aria-hidden
                    />
                  </Link>
                </>
              )}
            </AutoHeight>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/** Animates its height to fit the content as results come and go. */
function AutoHeight({ children }: { children: React.ReactNode }) {
  const innerRef = useRef<HTMLDivElement>(null)
  const [height, setHeight] = useState<number | 'auto'>('auto')

  useEffect(() => {
    const inner = innerRef.current
    if (!inner) return
    const observer = new ResizeObserver(([entry]) => setHeight(entry.borderBoxSize[0].blockSize))
    observer.observe(inner)
    return () => observer.disconnect()
  }, [])

  return (
    <motion.div
      initial={false}
      animate={{ height }}
      transition={{ duration: 0.22, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <div ref={innerRef}>{children}</div>
    </motion.div>
  )
}

interface SuggestionRowProps {
  product: ProductSuggestion
  index: number
  id: string
  words: string[]
  active: boolean
  onHover: () => void
  onSelect: () => void
  /** Set by `AnimatePresence mode="popLayout"` to measure the row as it leaves. */
  ref?: React.Ref<HTMLLIElement>
}

function SuggestionRow({
  product,
  index,
  id,
  words,
  active,
  onHover,
  onSelect,
  ref,
}: SuggestionRowProps) {
  return (
    <motion.li
      ref={ref}
      role="presentation"
      layout="position"
      initial={{ opacity: 0, y: 8 }}
      animate={{
        opacity: 1,
        y: 0,
        transition: { duration: 0.22, delay: index * 0.035, ease: 'easeOut' },
      }}
      exit={{ opacity: 0, transition: { duration: 0.12 } }}
      transition={{ layout: { duration: 0.22, ease: 'easeOut' } }}
    >
      <Link
        id={id}
        role="option"
        aria-selected={active}
        tabIndex={-1}
        href={{ pathname: '/products/[slug]', params: { slug: product.slug } }}
        onClick={onSelect}
        onMouseMove={active ? undefined : onHover}
        className={cn(
          'flex items-center gap-3 rounded-xl px-2.5 py-2 transition-colors',
          active ? 'bg-slate-100' : 'hover:bg-slate-50',
        )}
      >
        <span className="relative flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-line bg-slate-50">
          {product.imageUrl ? (
            <Image src={product.imageUrl} alt="" fill sizes="40px" className="object-contain p-1" />
          ) : (
            <Package className="size-4 text-slate-400" aria-hidden />
          )}
        </span>
        <span className="min-w-0 flex-1">
          <span className="line-clamp-2 text-sm leading-snug font-medium text-navy-900">
            <Highlighted text={product.title} words={words} />
          </span>
          {(product.brand || product.sku) && (
            <span className="mt-0.5 block truncate text-xs text-slate-500">
              {product.brand}
              {product.brand && product.sku && ' · '}
              {product.sku && <Highlighted text={product.sku} words={words} />}
            </span>
          )}
        </span>
      </Link>
    </motion.li>
  )
}

function Highlighted({ text, words }: { text: string; words: string[] }) {
  return highlightMatches(text, words).map((segment, index) =>
    segment.match ? (
      <mark key={index} className="rounded-[3px] bg-brand-100 px-px text-brand-800">
        {segment.text}
      </mark>
    ) : (
      <React.Fragment key={index}>{segment.text}</React.Fragment>
    ),
  )
}
