'use client'

import React, { useEffect, useRef, useState, useCallback, useSyncExternalStore } from 'react'
import { createPortal } from 'react-dom'
import { useTranslations } from 'next-intl'
import { Mail, Menu, Phone, Search, X } from 'lucide-react'
import { Link, usePathname, useRouter } from '@/i18n/navigation'
import { LocaleSwitcher } from '@/components/layout/locale-switcher'
import type { NavItem } from '@/components/layout/nav-link'
import { cn, telHref } from '@/lib/utils'

interface MobileMenuProps {
  items: NavItem[]
  phone?: string
  email?: string
}

const noopSubscribe = () => () => {}

export function MobileMenu({ items, phone, email }: MobileMenuProps) {
  const t = useTranslations('a11y')
  const tSearch = useTranslations('products.toolbar')
  const tHeader = useTranslations('header')
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  // True on the client only, so the portal never renders during SSR.
  const mounted = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  )
  const pathname = usePathname()
  const [lastPathname, setLastPathname] = useState(pathname)

  const closeMenu = useCallback(() => setOpen(false), [])

  // Close automatically on route navigation
  if (pathname !== lastPathname) {
    setLastPathname(pathname)
    setOpen(false)
  }

  // Keyboard: Escape closes; Tab cycles between the toggle button and the panel.
  useEffect(() => {
    if (!open) return
    const trigger = triggerRef.current
    const focusables = () =>
      Array.from(panelRef.current?.querySelectorAll<HTMLElement>('a[href], button, input') ?? [])
    // The panel's `visibility` is transitioned, so it can't take focus in this same frame.
    const focusTimer = window.setTimeout(() => focusables()[0]?.focus(), 50)

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeMenu()
        return
      }
      if (event.key !== 'Tab') return
      const cycle = [trigger, ...focusables()].filter((el): el is HTMLElement => Boolean(el))
      const index = cycle.indexOf(document.activeElement as HTMLElement)
      const next = event.shiftKey
        ? cycle[(index - 1 + cycle.length) % cycle.length]
        : cycle[(index + 1) % cycle.length]
      event.preventDefault()
      next.focus()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.clearTimeout(focusTimer)
      window.removeEventListener('keydown', handleKeyDown)
      trigger?.focus()
    }
  }, [open, closeMenu])

  function submitSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const q = new FormData(event.currentTarget).get('q')?.toString().trim()
    router.push(q ? { pathname: '/products', query: { q } } : '/products')
    closeMenu()
  }

  // Lock body scroll while the drawer is open
  useEffect(() => {
    if (open) {
      const originalOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = originalOverflow
      }
    }
  }, [open])

  return (
    <div className="lg:hidden">
      {/* Trigger Button inside Sticky Header */}
      <button
        ref={triggerRef}
        type="button"
        aria-label={open ? t('closeMenu') : t('openMenu')}
        aria-expanded={open}
        aria-controls="mobile-navigation-menu"
        onClick={() => setOpen((prev) => !prev)}
        className="flex size-10 cursor-pointer items-center justify-center rounded-full text-navy-800 transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
      >
        {open ? (
          <X className="size-5 animate-in fade-in zoom-in-75 duration-150" aria-hidden />
        ) : (
          <Menu className="size-5 animate-in fade-in zoom-in-75 duration-150" aria-hidden />
        )}
      </button>

      {/* Portal: Renders Backdrop & Dropdown Panel directly in document.body to bypass header backdrop-blur */}
      {mounted &&
        createPortal(
          <div className="lg:hidden">
            {/* Backdrop Overlay - Starts below the 72px header so the header remains clear & clickable */}
            <div
              onClick={closeMenu}
              aria-hidden
              className={cn(
                'fixed inset-x-0 bottom-0 top-[72px] z-[998] bg-navy-950/60 backdrop-blur-xs transition-opacity duration-300 ease-in-out',
                open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
              )}
            />

            {/* Top-Expanding Content Panel (Takes ONLY as much height as content requires) */}
            <div
              id="mobile-navigation-menu"
              ref={panelRef}
              role="dialog"
              aria-modal="true"
              aria-label={t('mobileNav')}
              className={cn(
                'fixed inset-x-0 top-[72px] z-999 flex flex-col border-b border-line bg-white shadow-2xl transition-all duration-200 ease-out origin-top',
                'max-h-[calc(100vh-72px)] overflow-y-auto',
                open
                  ? 'translate-y-0 scale-100 opacity-100 pointer-events-auto visible'
                  : '-translate-y-3 scale-98 opacity-0 pointer-events-none invisible',
              )}
            >
              {/* Content Body */}
              <div className="p-5">
                <form role="search" onSubmit={submitSearch} className="relative mb-4">
                  <label htmlFor="mobile-search" className="sr-only">
                    {tSearch('searchLabel')}
                  </label>
                  <Search
                    className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-slate-500"
                    aria-hidden
                  />
                  <input
                    id="mobile-search"
                    type="search"
                    name="q"
                    maxLength={100}
                    placeholder={tHeader('searchPlaceholder')}
                    className="h-11 w-full rounded-xl border border-transparent bg-slate-100 pr-4 pl-10 text-[15px] text-navy-900 placeholder:text-slate-500 focus:border-brand-400 focus:bg-white focus:outline-none"
                  />
                </form>

                {/* Navigation Links */}
                <nav aria-label={t('mainNav')} className="flex flex-col gap-1">
                  {items.map((item) => {
                    const active =
                      item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        aria-current={active ? 'page' : undefined}
                        onClick={closeMenu}
                        className={cn(
                          'rounded-xl px-4 py-3 text-[15px] font-medium transition-all duration-150',
                          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500',
                          active
                            ? 'bg-brand-50 text-brand-700 shadow-xs'
                            : 'text-slate-700 hover:bg-slate-50 hover:pl-5 hover:text-navy-900',
                        )}
                      >
                        {item.label}
                      </Link>
                    )
                  })}
                </nav>
              </div>

              {/* Footer with Contact info & Inline Locale Switcher */}
              <div className="border-t border-line bg-slate-50/60 px-5 py-4.5">
                <div className="mb-4 flex flex-col gap-2.5 text-sm text-slate-600">
                  {phone && (
                    <a
                      href={telHref(phone)}
                      className="flex items-center gap-2.5 rounded-lg py-1 font-medium transition-colors hover:text-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                    >
                      <Phone className="size-4 text-brand-600" aria-hidden />
                      <span>{phone}</span>
                    </a>
                  )}
                  {email && (
                    <a
                      href={`mailto:${email}`}
                      className="flex items-center gap-2.5 rounded-lg py-1 font-medium transition-colors hover:text-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                    >
                      <Mail className="size-4 text-brand-600" aria-hidden />
                      <span>{email}</span>
                    </a>
                  )}
                </div>

                <LocaleSwitcher variant="inline" />
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  )
}
