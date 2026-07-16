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

export function LocaleSwitcher({ onDark = false }: { onDark?: boolean }) {
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

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className={cn(
          'flex cursor-pointer items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-semibold uppercase transition-colors',
          onDark ? 'text-slate-300 hover:bg-white/10 hover:text-white' : 'text-slate-500 hover:bg-slate-100 hover:text-navy-900',
        )}
      >
        <Globe className="size-3.5" aria-hidden />
        {locale}
        <ChevronDown className={cn('size-3 transition-transform', open && 'rotate-180')} aria-hidden />
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-44 overflow-hidden rounded-xl border border-line bg-white py-1.5 shadow-lift">
          {routing.locales.map((l) => (
            <Link
              key={l}
              // Re-resolve the current route in the target locale
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
              {l === locale && <Check className="size-3.5" aria-hidden />}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
