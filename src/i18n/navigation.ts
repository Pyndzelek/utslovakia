import { createNavigation } from 'next-intl/navigation'
import { routing } from './routing'

// Use these instead of importing from 'next/link' / 'next/navigation'
// anywhere inside app/[locale]/(frontend). They automatically prefix
// the current locale and translate pathnames per the routing config
// above, e.g. <Link href="/products/foo" /> renders as /produkty/foo
// on the pl locale and /en/products/foo on en.
export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing)
