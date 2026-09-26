import React from 'react'
import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { ChevronDown, Clock, Mail, MapPin, Phone } from 'lucide-react'
import type { Locale } from '@/i18n/routing'
import { getPathname } from '@/i18n/navigation'
import { Container } from '@/components/ui/container'
import { Logo } from '@/components/layout/logo'
import PageHeader from '@/components/layout/page-header'
import { buildStaticLanguageAlternates } from '@/lib/seo/alternates'
import { faqJsonLd } from '@/lib/seo/json-ld'
import { addressLines, getSiteSettings } from '@/lib/data/site-settings'
import { telHref } from '@/lib/utils'

interface PageProps {
  params: Promise<{ locale: Locale }>
}

type CardLine = { text: string; href?: string }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'contact.meta' })
  const canonicalPath = getPathname({ locale, href: '/contact' })

  return {
    title: t('title'),
    description: t('description'),
    alternates: {
      canonical: canonicalPath,
      languages: buildStaticLanguageAlternates('/contact'),
    },
  }
}

export default async function ContactPage({ params }: PageProps) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('contact')
  const settings = await getSiteSettings(locale)
  const faqs = settings.faq ?? []

  const withLabel = (value: string, label?: string | null) =>
    label ? `${value} (${label})` : value
  const cards: { key: string; title: string; Icon: typeof MapPin; lines: CardLine[] }[] = [
    {
      key: 'visit',
      title: t('cards.visit.title'),
      Icon: MapPin,
      lines: addressLines(settings.address).map((text) => ({ text })),
    },
    {
      key: 'call',
      title: t('cards.call.title'),
      Icon: Phone,
      lines: (settings.phones ?? []).map(({ number, label }) => ({
        text: withLabel(number, label),
        href: telHref(number),
      })),
    },
    {
      key: 'write',
      title: t('cards.write.title'),
      Icon: Mail,
      lines: (settings.emails ?? []).map(({ email, label }) => ({
        text: withLabel(email, label),
        href: `mailto:${email}`,
      })),
    },
    {
      key: 'hours',
      title: t('cards.hours.title'),
      Icon: Clock,
      lines: settings.openingHours ? [{ text: settings.openingHours }] : [],
    },
  ].filter((card) => card.lines.length > 0)

  return (
    <>
      {faqs.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(faqs)) }}
        />
      )}

      {/* Page header */}
      <PageHeader
        title={t('title')}
        description={t('description')}
        breadcrumbs={[{ label: t('breadcrumb'), href: '/contact' }]}
      />

      <Container className="py-10 lg:py-14">
        {/* Contact cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
          {cards.map(({ key, title, Icon, lines }) => (
            <div key={key} className="rounded-2xl border border-line bg-white p-6 shadow-card">
              <span className="flex size-11 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
                <Icon className="size-5" aria-hidden />
              </span>
              <h2 className="font-display mt-4 text-base font-semibold text-navy-900">{title}</h2>
              <div className="mt-2 space-y-0.5">
                {lines.map(({ text, href }) => (
                  <p key={text} className="text-sm text-slate-600">
                    {href ? (
                      <a href={href} className="transition-colors hover:text-brand-700">
                        {text}
                      </a>
                    ) : (
                      text
                    )}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-20 flex flex-col items-center gap-3 justify-center">
          <Logo className="w-md border border-white rounded-4xl p-5 bg-white shadow-card" />
          <p className="text-center text-sm text-slate-600">
            {settings.companyName}
            {settings.vatId && (
              <>
                <br />
                {t('vatNumber', { number: settings.vatId })}
              </>
            )}
          </p>
        </div>

        {/* FAQ — hidden until the client adds questions in Site Settings */}
        {faqs.length > 0 && (
          <div className="mt-16 lg:mt-10">
            <h2 className="font-display text-center text-2xl font-semibold tracking-tight text-navy-900 sm:text-3xl">
              {t('faqTitle')}
            </h2>
            <div className="mx-auto mt-8 max-w-3xl space-y-3">
              {faqs.map(({ id, question, answer }) => (
                <details
                  key={id ?? question}
                  className="group rounded-2xl border border-line bg-white px-6 py-4 shadow-card"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[15px] font-semibold text-navy-900 [&::-webkit-details-marker]:hidden">
                    {question}
                    <ChevronDown
                      className="size-4 shrink-0 text-slate-400 transition-transform group-open:rotate-180"
                      aria-hidden
                    />
                  </summary>
                  <p className="mt-3 text-sm leading-relaxed text-slate-500">{answer}</p>
                </details>
              ))}
            </div>
          </div>
        )}
      </Container>
    </>
  )
}
