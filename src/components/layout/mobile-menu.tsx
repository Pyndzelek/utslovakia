'use client'

import React, { useEffect, useState } from 'react'
import { Mail, Menu, Phone, Search, X } from 'lucide-react'
import { Link, usePathname } from '@/i18n/navigation'
import { LocaleSwitcher } from '@/components/layout/locale-switcher'
import type { NavItem } from '@/components/layout/nav-link'
import { cn } from '@/lib/utils'

interface MobileMenuProps {
  items: NavItem[]
  searchPlaceholder: string
}

export function MobileMenu({ items, searchPlaceholder }: MobileMenuProps) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  // Close on navigation
  useEffect(() => {
    setOpen(false)
  }, [pathname])

  // Lock body scroll while the panel is open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <div className="lg:hidden">
      <button
        type="button"
        aria-label="Menu"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className="flex size-10 cursor-pointer items-center justify-center rounded-full text-navy-800 transition-colors hover:bg-slate-100"
      >
        <Menu className="size-5" aria-hidden />
      </button>

      {open && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-navy-950/50 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <div className="absolute inset-y-0 right-0 flex w-full max-w-sm flex-col bg-white shadow-lift animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <span className="font-display text-base font-semibold text-navy-900">Menu</span>
              <button
                type="button"
                aria-label="Close menu"
                onClick={() => setOpen(false)}
                className="flex size-9 cursor-pointer items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 hover:text-navy-900"
              >
                <X className="size-5" aria-hidden />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-5">
              {/* Search (visual only) */}
              <div className="relative mb-5">
                <Search
                  className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-slate-400"
                  aria-hidden
                />
                <input
                  type="search"
                  placeholder={searchPlaceholder}
                  className="h-11 w-full rounded-full border border-transparent bg-slate-100 pr-4 pl-10 text-sm text-navy-900 placeholder:text-slate-400 focus:border-brand-400 focus:bg-white focus:outline-none"
                />
              </div>

              <nav aria-label="Mobile" className="flex flex-col gap-1">
                {items.map((item) => {
                  const active = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        'rounded-xl px-4 py-3 text-[15px] font-medium transition-colors',
                        active
                          ? 'bg-brand-50 text-brand-700'
                          : 'text-slate-700 hover:bg-slate-50 hover:text-navy-900',
                      )}
                    >
                      {item.label}
                    </Link>
                  )
                })}
              </nav>
            </div>

            <div className="border-t border-line px-5 py-4">
              <div className="mb-3 flex flex-col gap-2 text-sm text-slate-600">
                <a href="tel:+421254789630" className="flex items-center gap-2 hover:text-brand-700">
                  <Phone className="size-4 text-brand-600" aria-hidden />
                  +421 2 5478 9630
                </a>
                <a href="mailto:sales@utslovakia.sk" className="flex items-center gap-2 hover:text-brand-700">
                  <Mail className="size-4 text-brand-600" aria-hidden />
                  sales@utslovakia.sk
                </a>
              </div>
              <LocaleSwitcher />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
