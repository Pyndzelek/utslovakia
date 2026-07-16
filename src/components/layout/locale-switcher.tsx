'use client'

import React, { useEffect, useRef, useState } from 'react'
import { useParams } from 'next/navigation'
import { useLocale } from 'next-intl'
import { Check, ChevronDown, Globe } from 'lucide-react'
import { Link, usePathname } from '@/i18n/navigation'
import { routing, type Locale } from '@/i18n/routing'
import { cn } from '@/lib/utils'

const localeNames: Record<Locale, string> = {
  pl: 'Polski',
  en: 'English',
  sk: 'Slovenčina',
  'pt-br': 'Português (BR)',
}

interface LocaleSwitcherProps {
  onDark?: boolean
  variant?: 'dropdown' | 'inline'
}

export function LocaleSwitcher({ onDark = false, variant = 'dropdown' }: LocaleSwitcherProps) {
  const locale = useLocale()
  const pathname = usePathname()
  const params = useParams()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: PointerEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [open])

  const isInline = variant === 'inline'

  return (
    <div ref={ref} className={cn('relative', isInline && 'w-full')}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className={cn(
          'flex cursor-pointer items-center transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500',
          isInline
            ? 'w-full gap-2 text-sm font-medium text-slate-600'
            : cn(
                'gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-semibold uppercase',
                onDark
                  ? 'text-slate-300 hover:bg-white/10 hover:text-white'
                  : 'text-slate-500 hover:bg-slate-100 hover:text-navy-900',
              ),
        )}
      >
        <span className="flex items-center gap-2.5">
          <Globe className={cn(isInline ? 'text-brand-600 size-4' : 'size-3.5')} aria-hidden />
          <span>{isInline ? localeNames[locale as Locale] || locale : locale}</span>
        </span>
        <ChevronDown
          className={cn(
            'transition-transform duration-200 ease-in-out',
            isInline ? 'size-4 text-slate-400' : 'size-3',
            open && 'rotate-180',
          )}
          aria-hidden
        />
      </button>

      {open && (
        <div
          className={cn(
            'overflow-hidden rounded-xl border border-line bg-white py-1.5 transition-all',
            isInline
              ? 'mt-2 w-full shadow-xs animate-in fade-in slide-in-from-top-1 duration-200'
              : 'absolute right-0 z-50 mt-2 w-44 shadow-lift animate-in fade-in zoom-in-95 duration-150',
          )}
        >
          {routing.locales.map((l) => (
            <Link
              key={l}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              href={{ pathname, params } as any}
              locale={l}
              onClick={() => setOpen(false)}
              className={cn(
                'flex items-center justify-between px-3.5 py-2 text-sm transition-colors hover:bg-brand-50',
                l === locale ? 'font-semibold text-brand-700' : 'text-slate-600',
              )}
            >
              {localeNames[l]}
              {l === locale && <Check className="size-3.5 text-brand-600" aria-hidden />}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
