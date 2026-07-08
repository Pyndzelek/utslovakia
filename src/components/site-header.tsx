import Link from 'next/link'
import { Search, User, ShoppingCart, ChevronDown } from 'lucide-react'

const navLinks = [
  { label: 'Home', href: '#' },
  { label: 'Products', href: '#' },
  { label: 'About us', href: '#' },
  { label: 'Contact us', href: '#' },
]

const categories = [
  'Category 1',
  'Category 2',
  'Category 3',
  'Category 4',
  'Category 5',
  'Category 6',
]

export function SiteHeader() {
  return (
    <header className="w-full">
      {/* Top bar */}
      <div className="bg-background">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <div className="w-24" aria-hidden="true" />
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
              type="button"
              aria-label="Search"
              className="text-foreground transition-colors hover:text-primary"
            >
              <Search className="size-4" />
            </button>
            <button
              type="button"
              aria-label="Account"
              className="text-foreground transition-colors hover:text-primary"
            >
              <User className="size-4" />
            </button>
            <button
              type="button"
              aria-label="Cart"
              className="text-foreground transition-colors hover:text-primary"
            >
              <ShoppingCart className="size-4" />
            </button>
            <button
              type="button"
              className="flex items-center gap-1 text-xs font-medium text-foreground transition-colors hover:text-primary"
            >
              EN
              <ChevronDown className="size-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Category bar */}
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
    </header>
  )
}
