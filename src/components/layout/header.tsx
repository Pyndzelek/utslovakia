import React from 'react'
import { getLocale, getTranslations } from 'next-intl/server'
import type { Locale } from '@/i18n/routing'
import { getSiteSettings } from '@/lib/data/site-settings'
import { Logo } from '@/components/layout/logo'
import { NavLink, type NavItem } from '@/components/layout/nav-link'
import { LocaleSwitcher } from '@/components/layout/locale-switcher'
import { MobileMenu } from '@/components/layout/mobile-menu'
import { HeaderSearch } from '@/components/layout/header-search'

export async function Header() {
  const t = await getTranslations()
  const settings = await getSiteSettings((await getLocale()) as Locale)

  const navItems: NavItem[] = [
    { href: '/', label: t('nav.home') },
    { href: '/products', label: t('nav.products') },
    { href: '/category', label: t('nav.category') },
    { href: '/contact', label: t('nav.contact') },
  ]

  return (
    <header className="sticky top-0 z-40">
      {/* Main bar */}
      <div className="border-b border-line bg-white/90 backdrop-blur-md">
        <div className="group/header mx-auto flex h-[72px] w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          {/* Below `md` the logo collapses while the search is focused, so the field takes the bar. */}
          <Logo className="w-20 overflow-hidden transition-[width,opacity,margin] duration-300 ease-out motion-reduce:transition-none sm:w-24 md:w-28 lg:w-36 max-md:group-has-[input:focus]/header:-mr-4 max-md:group-has-[input:focus]/header:w-0 max-md:group-has-[input:focus]/header:opacity-0" />

          <nav aria-label={t('a11y.mainNav')} className="hidden items-center gap-0.5 lg:flex">
            {navItems.map((item) => (
              <NavLink key={item.href} {...item} />
            ))}
          </nav>

          <div className="flex min-w-0 flex-1 items-center justify-end gap-2 md:flex-none">
            {/* Below `md` it fills the bar and its results drop below the whole header; above, it widens on focus. */}
            <HeaderSearch className="min-w-0 flex-1 transition-[width] duration-300 ease-out motion-reduce:transition-none max-md:static md:w-60 md:flex-none md:has-[input:focus]:w-96 lg:has-[input:focus]:w-72 xl:w-72 xl:has-[input:focus]:w-96" />

            <div className="hidden shrink-0 md:block">
              <LocaleSwitcher />
            </div>

            <MobileMenu
              items={navItems}
              phone={settings.phones?.[0]?.number}
              email={settings.emails?.[0]?.email}
            />
          </div>
        </div>
      </div>
    </header>
  )
}
