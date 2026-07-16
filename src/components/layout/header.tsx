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
    { href: '/contact', label: t('nav.contact') },
  ]

  return (
    <header className="sticky top-0 z-40">
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
