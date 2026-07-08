'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Search, User, ShoppingCart, ChevronDown, Menu, X } from 'lucide-react'

const navLinks = [
  { label: 'Home', href: '#' },
  { label: 'Products', href: '#' },
  { label: 'About us', href: '#' },
  { label: 'Contact us', href: '#' },
]

const categories = [
  'Bill acceptors',
  'Printers',
  'Monitors',
  'PC',
  'Coins acceptors',
  'Scanners',
  'Buttons',
  'Touchscreens',
  'Cabinet Parts',
  'Locks',
  'Power supplies',
  'Cabinets',
]

export function SiteHeader() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <header className="w-full">
      {/* ========================================== */}
      {/* DESKTOP NAVIGATION (Hidden on mobile)      */}
      {/* ========================================== */}
      <div className="hidden md:block">
        <div className="bg-background">
          <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
            <div className="w-24 bg-muted/20 h-6 rounded" aria-hidden="true" />
            <nav aria-label="Main navigation">
              <ul className="flex items-center gap-6">
                {navLinks.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-xs font-medium text-foreground transition-colors hover:text-primary"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            <div className="flex items-center gap-4">
              <button
                aria-label="Search"
                className="text-foreground transition-colors hover:text-primary"
              >
                <Search className="size-4" />
              </button>
              <button
                aria-label="Account"
                className="text-foreground transition-colors hover:text-primary"
              >
                <User className="size-4" />
              </button>
              <button
                aria-label="Cart"
                className="text-foreground transition-colors hover:text-primary"
              >
                <ShoppingCart className="size-4" />
              </button>
              <button className="flex items-center gap-1 text-xs font-medium text-foreground transition-colors hover:text-primary">
                EN
                <ChevronDown className="size-3" />
              </button>
            </div>
          </div>
        </div>

        <nav aria-label="Product categories" className="bg-navy-light">
          <ul className="mx-auto flex max-w-6xl items-stretch overflow-x-auto">
            {categories.map((category, i) => (
              <li key={category} className="flex flex-1 items-stretch">
                <Link
                  href="#"
                  className={`flex w-full items-center justify-center whitespace-nowrap px-4 py-2 text-xs text-primary-foreground transition-colors hover:bg-navy ${
                    i > 0 ? 'border-l border-primary-foreground/15' : ''
                  }`}
                >
                  {category}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* ========================================== */}
      {/* MOBILE NAVIGATION (Floating Pill)          */}
      {/* ========================================== */}
      <div className="md:hidden relative">
        {/* Document flow spacer & Logo placeholder (Keeps page layout intact) */}

        {/* Floating Controls Pill */}
        <div className="fixed right-4 top-3 z-50 flex items-center gap-3.5 rounded-full border border-border bg-background/95 backdrop-blur px-4 py-2 shadow-lg">
          <button
            aria-label="Search"
            className="text-foreground transition-colors hover:text-primary"
          >
            <Search className="size-4" />
          </button>

          <div className="h-4 w-px bg-border" aria-hidden="true" />

          <button
            type="button"
            aria-label="Toggle mobile menu"
            className="text-foreground transition-colors hover:text-primary"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>

        {/* Full-Screen Animated Mobile Menu */}
        <div
          className={`fixed inset-0 z-40 bg-background/95 backdrop-blur-sm transition-all duration-300 ease-in-out ${
            isMobileMenuOpen
              ? 'opacity-100 pointer-events-auto translate-y-0'
              : 'opacity-0 pointer-events-none -translate-y-4'
          }`}
        >
          <div className="flex h-[100dvh] flex-col overflow-y-auto px-6 pb-6 pt-24">
            {/* Nav Links */}
            <ul className="flex flex-col gap-6 border-b border-border pb-6">
              {navLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-lg font-semibold text-foreground transition-colors hover:text-primary"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Categories */}
            <h3 className="mt-6 mb-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Categories
            </h3>
            <ul className="grid grid-cols-2 gap-4 pb-6">
              {categories.map((category) => (
                <li key={category}>
                  <Link
                    href="#"
                    className="text-sm text-foreground transition-colors hover:text-primary"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {category}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Utilities */}
            <div className="mt-auto flex items-center justify-between border-t border-border pt-6">
              <button
                type="button"
                className="flex items-center gap-1 text-sm font-medium text-foreground hover:text-primary"
              >
                EN <ChevronDown className="size-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
