'use client'

import React from 'react'
import { Link, usePathname } from '@/i18n/navigation'
import { cn } from '@/lib/utils'

export interface NavItem {
  href: '/' | '/products' | '/category' | '/about' | '/contact'
  label: string
}

export function NavLink({ href, label }: NavItem) {
  const pathname = usePathname()
  const active = href === '/' ? pathname === '/' : pathname.startsWith(href)

  return (
    <Link
      href={href}
      className={cn(
        'relative rounded-full px-4 py-2 text-sm font-medium transition-colors',
        active ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-50 hover:text-navy-900',
      )}
    >
      {label}
    </Link>
  )
}
