import React from 'react'
import { getTranslations } from 'next-intl/server'
import { Mail, Phone, Search, ShoppingCart } from 'lucide-react'
import { Logo } from '@/components/layout/logo'
import { NavLink, type NavItem } from '@/components/layout/nav-link'
import { LocaleSwitcher } from '@/components/layout/locale-switcher'
import { MobileMenu } from '@/components/layout/mobile-menu'

export async function Header() {
  const t = await getTranslations()

  const navItems: NavItem[] = [
    { href: '/', label: t('nav.home') },
    { href: '/products', label: t('nav.products') },
    { href: '/category', label: t('nav.category') },
    { href: '/about', label: t('nav.about') },
    { href: '/contact', label: t('nav.contact') },
  ]

  return (
    <header className="sticky top-0 z-40">
      {/* Utility bar */}
      {/* <div className="bg-navy-950 text-slate-300">
        <div className="mx-auto flex h-9 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <div className="hidden items-center gap-5 md:flex">
            <a
              href="tel:+421254789630"
              className="flex items-center gap-1.5 text-xs transition-colors hover:text-white"
            >
              <Phone className="size-3" aria-hidden />
              +421 2 5478 9630
            </a>
            <a
              href="mailto:sales@utslovakia.sk"
              className="flex items-center gap-1.5 text-xs transition-colors hover:text-white"
            >
              <Mail className="size-3" aria-hidden />
              sales@utslovakia.sk
            </a>
          </div>
          <p className="truncate text-xs font-medium text-brand-200">{t('header.announcement')}</p>
          <div className="hidden shrink-0 md:block">
            <LocaleSwitcher onDark />
          </div>
        </div>
      </div> */}

      {/* Main bar */}
      <div className="border-b border-line bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex h-[72px] w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Logo className="w-20 sm:w-24 md:w-28 lg:w-36 xl:w-36 " />

          <nav aria-label="Main" className="hidden items-center gap-0.5 lg:flex">
            {navItems.map((item) => (
              <NavLink key={item.href} {...item} />
            ))}
          </nav>

          <div className="flex items-center">
            {/* Search (visual only) */}
            {/* <div className="relative hidden md:block">
              <Search
                className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-slate-400"
                aria-hidden
              />
              <input
                type="search"
                placeholder={t('header.searchPlaceholder')}
                className="h-10 w-44 rounded-full border border-transparent bg-slate-100 pr-4 pl-10 text-sm text-navy-900 transition-all placeholder:text-slate-400 focus:w-64 focus:border-brand-400 focus:bg-white focus:outline-none xl:w-56"
              />
            </div> */}

            {/* Cart (visual only) */}
            <div className="hidden shrink-0 md:block">
              <LocaleSwitcher />
            </div>

            <MobileMenu items={navItems} searchPlaceholder={t('header.searchPlaceholder')} />
          </div>
        </div>
      </div>
    </header>
  )
}
