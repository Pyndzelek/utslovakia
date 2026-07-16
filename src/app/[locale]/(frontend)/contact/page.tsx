import React from 'react'
import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { ChevronDown, Clock, Mail, MapPin, Phone } from 'lucide-react'
import type { Locale } from '@/i18n/routing'
import { Container } from '@/components/ui/container'
import { Breadcrumbs } from '@/components/ui/breadcrumbs'
import { Logo } from '@/components/layout/logo'

interface PageProps {
  params: Promise<{ locale: Locale }>
}

const contactCardKeys = ['visit', 'call', 'write', 'hours'] as const
const contactCardIcons = {
  visit: MapPin,
  call: Phone,
  write: Mail,
  hours: Clock,
} as const

const faqKeys = ['1', '2', '3', '4'] as const

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'contact.meta' })

  return {
    title: t('title'),
    description: t('description'),
  }
}

export default async function ContactPage({ params }: PageProps) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('contact')

  return (
    <>
      {/* Page header */}
      <div className="border-b border-line bg-white">
        <Container className="py-8 lg:py-10">
          <Breadcrumbs items={[{ label: t('breadcrumb') }]} />
          <h1 className="font-display mt-4 text-3xl font-semibold tracking-tight text-navy-900 sm:text-4xl">
            {t('title')}
          </h1>
          <p className="mt-2 max-w-2xl text-[15px] text-slate-500">{t('description')}</p>
        </Container>
      </div>

      <Container className="py-10 lg:py-14">
        {/* Contact cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
          {contactCardKeys.map((key) => {
            const Icon = contactCardIcons[key]
            const lines =
              key === 'visit' || key === 'write'
                ? [t(`cards.${key}.line1`), t(`cards.${key}.line2`)]
                : [t(`cards.${key}.line1`)]

            return (
              <div key={key} className="rounded-2xl border border-line bg-white p-6 shadow-card">
                <span className="flex size-11 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
                  <Icon className="size-5" aria-hidden />
                </span>
                <h2 className="font-display mt-4 text-base font-semibold text-navy-900">
                  {t(`cards.${key}.title`)}
                </h2>
                <div className="mt-2 space-y-0.5">
                  {lines.map((line) => (
                    <p key={line} className="text-sm text-slate-500">
                      {line}
                    </p>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-20 flex flex-col items-center gap-3 justify-center">
          <Logo className="w-md border border-white rounded-4xl p-5 bg-white shadow-card" />
          <p className="text-sm text-slate-500">{t('vatNumber', { number: 'SK 2120871324' })}</p>
        </div>

        {/* FAQ */}
        <div className="mt-16 lg:mt-10">
          <h2 className="font-display text-center text-2xl font-semibold tracking-tight text-navy-900 sm:text-3xl">
            {t('faqTitle')}
          </h2>
          <div className="mx-auto mt-8 max-w-3xl space-y-3">
            {faqKeys.map((key) => (
              <details
                key={key}
                className="group rounded-2xl border border-line bg-white px-6 py-4 shadow-card"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[15px] font-semibold text-navy-900 [&::-webkit-details-marker]:hidden">
                  {t(`faqs.${key}.question`)}
                  <ChevronDown
                    className="size-4 shrink-0 text-slate-400 transition-transform group-open:rotate-180"
                    aria-hidden
                  />
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-slate-500">
                  {t(`faqs.${key}.answer`)}
                </p>
              </details>
            ))}
          </div>
        </div>
      </Container>
    </>
  )
}
