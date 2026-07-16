import React from 'react'
import { getTranslations } from 'next-intl/server'
import { Clock, Mail, MapPin, Phone } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import { Container } from '@/components/ui/container'
import { Logo } from '@/components/layout/logo'
import { categories } from '@/lib/mock-data'

/* lucide-react no longer ships brand icons, so these are inlined */
function FacebookIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M13.5 21v-7h2.4l.4-3h-2.8V9.1c0-.9.2-1.5 1.5-1.5h1.4V4.9c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4V11H7.8v3h2.4v7h3.3Z" />
    </svg>
  )
}

function InstagramIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden {...props}>
      <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" />
      <circle cx="12" cy="12" r="3.8" />
      <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
    </svg>
  )
}

function LinkedInIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M6.4 8.6H3.7V20h2.7V8.6ZM5 7.4a1.6 1.6 0 1 0 0-3.2 1.6 1.6 0 0 0 0 3.2ZM20.3 13.7c0-3-1.6-4.4-3.8-4.4-1.7 0-2.5 1-2.9 1.6V8.6H11V20h2.7v-6c0-1.2.8-2.1 2-2.1s1.9.8 1.9 2.1v6h2.7v-6.3Z" />
    </svg>
  )
}

export async function Footer() {
  const t = await getTranslations()
  const year = new Date().getFullYear()

  const pages = [
    { href: '/products', label: t('nav.products') },
    { href: '/category', label: t('nav.category') },
    { href: '/about', label: t('nav.about') },
    { href: '/contact', label: t('nav.contact') },
  ] as const

  return (
    <footer className="bg-navy-950 text-slate-400">
      <Container className="grid gap-12 py-14 lg:grid-cols-12 lg:gap-8">
        {/* Brand + contact */}
        <div className="lg:col-span-5">
          <Logo onDark />
          <p className="mt-5 max-w-sm text-sm leading-relaxed">{t('footer.tagline')}</p>
          <ul className="mt-6 space-y-3 text-sm">
            <li className="flex items-start gap-3">
              <MapPin className="mt-0.5 size-4 shrink-0 text-brand-400" aria-hidden />
              <span>
                Kopčianska 92/D
                <br />
                851 01 Bratislava, Slovakia
              </span>
            </li>
            <li>
              <a
                href="tel:+421254789630"
                className="flex items-center gap-3 transition-colors hover:text-white"
              >
                <Phone className="size-4 shrink-0 text-brand-400" aria-hidden />
                +421 2 5478 9630
              </a>
            </li>
            <li>
              <a
                href="mailto:sales@utslovakia.sk"
                className="flex items-center gap-3 transition-colors hover:text-white"
              >
                <Mail className="size-4 shrink-0 text-brand-400" aria-hidden />
                sales@utslovakia.sk
              </a>
            </li>
            <li className="flex items-center gap-3">
              <Clock className="size-4 shrink-0 text-brand-400" aria-hidden />
              {t('footer.hours')}
            </li>
          </ul>
        </div>

        {/* Categories */}
        <div className="lg:col-span-4">
          <h3 className="font-display text-sm font-semibold tracking-wide text-white uppercase">
            {t('footer.categories')}
          </h3>
          <ul className="mt-5 grid grid-cols-1 gap-x-6 gap-y-2.5 text-sm sm:grid-cols-2">
            {categories.map((category) => (
              <li key={category.slug}>
                <Link
                  href={{ pathname: '/category/[slug]', params: { slug: category.slug } }}
                  className="transition-colors hover:text-white"
                >
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Pages */}
        <div className="lg:col-span-3">
          <h3 className="font-display text-sm font-semibold tracking-wide text-white uppercase">
            {t('footer.pages')}
          </h3>
          <ul className="mt-5 space-y-2.5 text-sm">
            {pages.map((page) => (
              <li key={page.href}>
                <Link href={page.href} className="transition-colors hover:text-white">
                  {page.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </Container>

      <div className="border-t border-white/10">
        <Container className="flex flex-col items-center justify-between gap-4 py-6 sm:flex-row">
          <p className="text-xs">
            © {year} UT Slovakia s.r.o. {t('footer.rights')}
          </p>
          <div className="flex items-center gap-2">
            {[
              { label: 'Facebook', Icon: FacebookIcon },
              { label: 'Instagram', Icon: InstagramIcon },
              { label: 'LinkedIn', Icon: LinkedInIcon },
            ].map(({ label, Icon }) => (
              <a
                key={label}
                href="#"
                aria-label={label}
                className="flex size-9 items-center justify-center rounded-full border border-white/10 text-slate-400 transition-colors hover:border-white/30 hover:text-white"
              >
                <Icon className="size-4" aria-hidden />
              </a>
            ))}
          </div>
        </Container>
      </div>
    </footer>
  )
}
