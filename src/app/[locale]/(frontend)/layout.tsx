import React from 'react'
import type { Metadata, Viewport } from 'next'
import { notFound } from 'next/navigation'
import { Analytics } from '@vercel/analytics/next'
import { Inter, Sora } from 'next/font/google'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server'
import { routing, type Locale } from '@/i18n/routing'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { MotionProvider } from '@/components/layout/motion-provider'
import { getSiteSettings } from '@/lib/data/site-settings'
import { organizationJsonLd } from '@/lib/seo/json-ld'
import { ogDefaults } from '@/lib/seo/meta'
import { SITE_URL } from '@/lib/site'
import './styles.css'

const inter = Inter({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-inter',
  display: 'swap',
})

const sora = Sora({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-sora',
  display: 'swap',
})

interface RootLayoutProps {
  children: React.ReactNode
  params: Promise<{
    locale: string
  }>
}

export async function generateMetadata({ params }: RootLayoutProps): Promise<Metadata> {
  const { locale } = await params
  if (!routing.locales.includes(locale as Locale)) return {}
  const t = await getTranslations({ locale, namespace: 'Metadata' })

  return {
    // Lets child pages set relative `openGraph.images`/`alternates.canonical`
    // and have them resolve to real absolute URLs.
    metadataBase: new URL(SITE_URL),
    title: {
      template: '%s | UTSlovakia',
      default: t('title'),
    },
    description: t('description'),
    openGraph: ogDefaults(locale as Locale),
  }
}

export const viewport: Viewport = {
  themeColor: '#080e21',
  colorScheme: 'light',
}

// this tells Next.js to pre-render layouts for all supported languages at build
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export default async function FrontendRootLayout({ children, params }: RootLayoutProps) {
  const { locale } = await params

  if (!routing.locales.includes(locale as Locale)) {
    notFound()
  }
  setRequestLocale(locale)
  const [messages, settings, t] = await Promise.all([
    getMessages(),
    getSiteSettings(locale as Locale),
    getTranslations('a11y'),
  ])

  return (
    <html
      lang={locale}
      className={`${inter.variable} ${sora.variable}`}
      data-scroll-behavior="smooth"
    >
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd(settings)) }}
        />
        <NextIntlClientProvider messages={messages}>
          <MotionProvider>
            {/* First tab stop on every page: jump past the header and its search. */}
            <a
              href="#main-content"
              className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[1000] focus:rounded-full focus:bg-navy-900 focus:px-5 focus:py-2.5 focus:text-sm focus:font-semibold focus:text-white focus:shadow-lift"
            >
              {t('skipToContent')}
            </a>
            <div className="flex min-h-screen flex-col">
              <Header />
              <main id="main-content" tabIndex={-1} className="flex-1">
                {children}
              </main>
              <Footer />
            </div>
          </MotionProvider>
        </NextIntlClientProvider>
        <Analytics />
      </body>
    </html>
  )
}
