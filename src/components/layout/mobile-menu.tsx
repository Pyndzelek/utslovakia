'use client'

import React, { useEffect, useRef, useState, useCallback, useSyncExternalStore } from 'react'
import { createPortal } from 'react-dom'
import { useTranslations } from 'next-intl'
import { ChevronDown, Mail, Menu, Phone, X } from 'lucide-react'
import { Link, usePathname } from '@/i18n/navigation'
import { LocaleSwitcher } from '@/components/layout/locale-switcher'
import { isActiveNavItem, type NavCategory, type NavItem } from '@/components/layout/main-nav'
import { cn, telHref } from '@/lib/utils'

interface MobileMenuProps {
  items: NavItem[]
  /** Listed under the "Categories" item, behind an expand toggle. */
  categories?: NavCategory[]
  phone?: string
  email?: string
}

const noopSubscribe = () => () => {}

export function MobileMenu({ items, categories = [], phone, email }: MobileMenuProps) {
  const t = useTranslations('a11y')
  const [open, setOpen] = useState(false)
  const [categoriesOpen, setCategoriesOpen] = useState(false)
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
    // Skips elements hidden at this width.
    const focusables = () =>
      Array.from(
        panelRef.current?.querySelectorAll<HTMLElement>('a[href], button, input') ?? [],
      ).filter((el) => el.getClientRects().length > 0)
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
                {/* Navigation Links */}
                <nav aria-label={t('mainNav')} className="flex flex-col gap-1">
                  {items.map((item) => {
                    const active = isActiveNavItem(item.href, pathname)
                    const link = (
                      <Link
                        href={item.href}
                        aria-current={active ? 'page' : undefined}
                        onClick={closeMenu}
                        className={cn(
                          'min-w-0 flex-1 rounded-xl px-4 py-3 text-[15px] font-medium transition-all duration-150',
                          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500',
                          active
                            ? 'bg-brand-50 text-brand-700 shadow-xs'
                            : 'text-slate-700 hover:bg-slate-50 hover:pl-5 hover:text-navy-900',
                        )}
                      >
                        {item.label}
                      </Link>
                    )

                    if (item.href !== '/category' || categories.length === 0) {
                      return (
                        <div key={item.href} className="flex">
                          {link}
                        </div>
                      )
                    }

                    // "Categories" opens the index; the toggle beside it lists them in place.
                    return (
                      <div key={item.href}>
                        <div className="flex items-center gap-1">
                          {link}
                          <button
                            type="button"
                            aria-expanded={categoriesOpen}
                            aria-controls="mobile-navigation-categories"
                            aria-label={categoriesOpen ? t('hideCategories') : t('showCategories')}
                            onClick={() => setCategoriesOpen((value) => !value)}
                            className="flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-xl text-slate-600 transition-colors hover:bg-slate-50 hover:text-navy-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                          >
                            <ChevronDown
                              className={cn(
                                'size-4 transition-transform duration-200',
                                categoriesOpen && 'rotate-180',
                              )}
                              aria-hidden
                            />
                          </button>
                        </div>
                        <ul
                          id="mobile-navigation-categories"
                          hidden={!categoriesOpen}
                          className="mt-1 mb-1 ml-4 border-l border-line pl-2"
                        >
                          {categories.map((category) => (
                            <li key={category.slug}>
                              <Link
                                href={{
                                  pathname: '/category/[slug]',
                                  params: { slug: category.slug },
                                }}
                                onClick={closeMenu}
                                className="block rounded-lg px-3 py-2.5 text-sm text-slate-600 transition-colors hover:bg-slate-50 hover:text-navy-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                              >
                                {category.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
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
