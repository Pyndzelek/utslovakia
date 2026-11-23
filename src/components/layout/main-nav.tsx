'use client'

import React from 'react'
import { NavigationMenu } from '@base-ui/react/navigation-menu'
import { ArrowRight, ChevronDown } from 'lucide-react'
import { Link, usePathname } from '@/i18n/navigation'
import { cn } from '@/lib/utils'

export interface NavItem {
  href: '/' | '/products' | '/category' | '/contact'
  label: string
}

export interface NavCategory {
  name: string
  slug: string
}

/** Whether `href` is the section the visitor is in (`pathname` is the unlocalized route). */
export const isActiveNavItem = (href: NavItem['href'], pathname: string) =>
  href === '/' ? pathname === '/' : pathname.startsWith(href)

const pill = (active: boolean) =>
  cn(
    'flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors',
    active
      ? 'bg-brand-50 text-brand-700'
      : 'text-slate-600 hover:bg-slate-50 hover:text-navy-900 data-popup-open:bg-slate-50 data-popup-open:text-navy-900',
  )

interface MainNavProps {
  items: NavItem[]
  /** Listed in the "Categories" item's dropdown; without any, it's a plain link. */
  categories: NavCategory[]
  label: string
  allCategoriesLabel: string
  className?: string
}

/**
 * Desktop primary navigation. "Categories" opens a panel with every category (on hover,
 * click or keyboard), so a category is one step away from any page instead of two.
 */
export function MainNav({ items, categories, label, allCategoriesLabel, className }: MainNavProps) {
  const pathname = usePathname()

  return (
    <NavigationMenu.Root aria-label={label} className={className}>
      <NavigationMenu.List className="flex items-center gap-0.5">
        {items.map((item) => {
          const active = isActiveNavItem(item.href, pathname)

          if (item.href === '/category' && categories.length > 0) {
            return (
              <NavigationMenu.Item key={item.href}>
                <NavigationMenu.Trigger className={cn(pill(active), 'cursor-pointer')}>
                  {item.label}
                  <NavigationMenu.Icon className="transition-transform duration-200 data-popup-open:rotate-180">
                    <ChevronDown className="size-3.5" aria-hidden />
                  </NavigationMenu.Icon>
                </NavigationMenu.Trigger>

                <NavigationMenu.Content className="w-[min(34rem,calc(100vw-2.5rem))] p-3">
                  <ul className="grid grid-cols-2 gap-x-2 gap-y-0.5">
                    {categories.map((category) => (
                      <li key={category.slug}>
                        <NavigationMenu.Link
                          closeOnClick
                          render={
                            <Link
                              href={{
                                pathname: '/category/[slug]',
                                params: { slug: category.slug },
                              }}
                            />
                          }
                          className="block rounded-xl px-3 py-2.5 text-sm font-medium text-navy-900 transition-colors hover:bg-brand-50 hover:text-brand-700"
                        >
                          {category.name}
                        </NavigationMenu.Link>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-2 border-t border-line pt-2">
                    <NavigationMenu.Link
                      closeOnClick
                      active={pathname === '/category'}
                      render={<Link href="/category" />}
                      className="group flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-semibold text-brand-700 transition-colors hover:bg-brand-50"
                    >
                      {allCategoriesLabel}
                      <ArrowRight
                        className="size-4 transition-transform group-hover:translate-x-0.5"
                        aria-hidden
                      />
                    </NavigationMenu.Link>
                  </div>
                </NavigationMenu.Content>
              </NavigationMenu.Item>
            )
          }

          return (
            <NavigationMenu.Item key={item.href}>
              <NavigationMenu.Link
                active={active}
                render={<Link href={item.href} />}
                className={pill(active)}
              >
                {item.label}
              </NavigationMenu.Link>
            </NavigationMenu.Item>
          )
        })}
      </NavigationMenu.List>

      <NavigationMenu.Portal>
        <NavigationMenu.Positioner
          sideOffset={14}
          collisionPadding={20}
          // Above the sticky header (z-40) it drops from.
          className="z-50 h-[var(--positioner-height)] w-[var(--positioner-width)] max-w-[var(--available-width)]"
        >
          <NavigationMenu.Popup className="relative h-[var(--popup-height)] w-[var(--popup-width)] origin-[var(--transform-origin)] rounded-2xl border border-line bg-white shadow-lift outline-none transition-[opacity,scale] duration-200 ease-out data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0 motion-reduce:transition-none">
            <NavigationMenu.Viewport className="relative h-full w-full overflow-hidden rounded-2xl" />
          </NavigationMenu.Popup>
        </NavigationMenu.Positioner>
      </NavigationMenu.Portal>
    </NavigationMenu.Root>
  )
}
