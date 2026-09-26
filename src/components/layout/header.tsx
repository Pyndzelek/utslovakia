import React from 'react'
import { getLocale, getTranslations } from 'next-intl/server'
import type { Locale } from '@/i18n/routing'
import { getSiteSettings } from '@/lib/data/site-settings'
import { Logo } from '@/components/layout/logo'
import { NavLink, type NavItem } from '@/components/layout/nav-link'
import { LocaleSwitcher } from '@/components/layout/locale-switcher'
import { MobileMenu } from '@/components/layout/mobile-menu'

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
        <div className="mx-auto flex h-[72px] w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Logo className="w-20 sm:w-24 md:w-28 lg:w-36 xl:w-36 " />

          <nav aria-label={t('a11y.mainNav')} className="hidden items-center gap-0.5 lg:flex">
            {navItems.map((item) => (
              <NavLink key={item.href} {...item} />
            ))}
          </nav>

          <div className="flex items-center">
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
