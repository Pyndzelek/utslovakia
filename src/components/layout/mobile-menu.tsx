'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { createPortal } from 'react-dom'
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
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()

  const closeMenu = useCallback(() => setOpen(false), [])

  useEffect(() => {
    setMounted(true)
  }, [])

  // Close automatically on route navigation
  useEffect(() => {
    closeMenu()
  }, [pathname, closeMenu])

  // Handle Escape key press for accessibility
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && open) {
        closeMenu()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
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
        type="button"
        aria-label={open ? 'Close navigation menu' : 'Open navigation menu'}
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
              role="dialog"
              aria-modal="true"
              aria-label="Mobile Navigation"
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
                <nav aria-label="Mobile links" className="flex flex-col gap-1">
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
                  <a
                    href="tel:+421254789630"
                    className="flex items-center gap-2.5 rounded-lg py-1 font-medium transition-colors hover:text-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                  >
                    <Phone className="size-4 text-brand-600" aria-hidden />
                    <span>+421 2 5478 9630</span>
                  </a>
                  <a
                    href="mailto:sales@utslovakia.sk"
                    className="flex items-center gap-2.5 rounded-lg py-1 font-medium transition-colors hover:text-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                  >
                    <Mail className="size-4 text-brand-600" aria-hidden />
                    <span>sales@utslovakia.sk</span>
                  </a>
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
