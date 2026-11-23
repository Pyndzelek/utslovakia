import React from 'react'
import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { ArrowUpRight, Check, ChevronDown, Clock, Mail, MapPin, Phone } from 'lucide-react'
import type { Locale } from '@/i18n/routing'
import { getPathname } from '@/i18n/navigation'
import { Container } from '@/components/ui/container'
import { Logo } from '@/components/layout/logo'
import PageHeader from '@/components/layout/page-header'
import { AboutSection } from '@/components/about/about-section'
import { InquiryForm, type InquiryProduct } from '@/components/contact/inquiry-form'
import { getProductBySlug } from '@/lib/data/products'
import { createFormToken } from '@/lib/form-token'
import { buildStaticLanguageAlternates } from '@/lib/seo/alternates'
import { faqJsonLd } from '@/lib/seo/json-ld'
import { addressLines, getSiteSettings } from '@/lib/data/site-settings'
import { getMediaUrl, telHref } from '@/lib/utils'

interface PageProps {
  params: Promise<{ locale: Locale }>
  /** `?product=<slug>&variant=<id>` — set by a product page's "Ask for a quote" button. */
  searchParams: Promise<{ product?: string | string[]; variant?: string | string[] }>
}

type CardLine = { text: string; href?: string }
type CardAction = { label: string; href: string }

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

export default async function ContactPage({ params, searchParams }: PageProps) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('contact')
  const settings = await getSiteSettings(locale)
  const faqs = settings.faq ?? []
  const inquiryProduct = await resolveInquiryProduct(await searchParams, locale)

  const withLabel = (value: string, label?: string | null) =>
    label ? `${value} (${label})` : value
  const address = addressLines(settings.address)
  const cards: {
    key: string
    title: string
    Icon: typeof MapPin
    lines: CardLine[]
    action?: CardAction
  }[] = [
    {
      key: 'visit',
      title: t('cards.visit.title'),
      Icon: MapPin,
      lines: address.map((text) => ({ text })),
      // A search link needs no API key and opens the visitor's own maps app on phones.
      action: {
        label: t('cards.visit.openMap'),
        href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          [settings.companyName, ...address].join(', '),
        )}`,
      },
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
          {cards.map(({ key, title, Icon, lines, action }) => (
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
              {action && (
                <a
                  href={action.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-1 rounded-sm text-sm font-semibold text-brand-700 underline-offset-2 hover:underline"
                >
                  {action.label}
                  <ArrowUpRight className="size-3.5" aria-hidden />
                </a>
              )}
            </div>
          ))}
        </div>

        {/* Inquiry form */}
        <section
          id="inquiry"
          aria-labelledby="inquiry-title"
          className="mt-14 grid scroll-mt-24 grid-cols-1 gap-8 lg:mt-20 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-14"
        >
          <div>
            <p className="mb-2 text-xs font-semibold tracking-[0.18em] text-brand-600 uppercase">
              {t('form.eyebrow')}
            </p>
            <h2
              id="inquiry-title"
              className="font-display text-3xl font-semibold tracking-tight text-balance text-navy-900 sm:text-4xl"
            >
              {t('form.title')}
            </h2>
            <div className="mt-4 h-px w-24 bg-brand-600" aria-hidden />
            <p className="mt-6 text-base leading-relaxed text-slate-600">{t('form.description')}</p>
            <ul className="mt-6 space-y-3 text-sm text-slate-600">
              {(['reply', 'advice', 'bulk'] as const).map((key) => (
                <li key={key} className="flex items-start gap-2.5">
                  <Check className="mt-0.5 size-4 shrink-0 text-emerald-600" aria-hidden />
                  {t(`form.points.${key}`)}
                </li>
              ))}
            </ul>
          </div>
          {/* Rendered per request, so the token is fresh for every visitor. */}
          <InquiryForm token={createFormToken()} product={inquiryProduct} />
        </section>

        {/* About us */}
        <section
          id="about"
          className="mt-16 scroll-mt-24 border-t border-line pt-16 lg:mt-20 lg:pt-20"
        >
          <AboutSection showCta={false} />
        </section>

        <div className="mt-20 flex flex-col items-center gap-3 justify-center">
          <Logo className="w-full max-w-md border border-white rounded-4xl p-5 bg-white shadow-card" />
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

/** The published product (and variant) named in the URL, reduced to what the form shows. */
async function resolveInquiryProduct(
  query: Awaited<PageProps['searchParams']>,
  locale: Locale,
): Promise<InquiryProduct | undefined> {
  const slug = Array.isArray(query.product) ? query.product[0] : query.product
  if (!slug || slug.length > 200) return undefined
  const product = await getProductBySlug(slug, locale)
  if (!product) return undefined

  const variantId = Array.isArray(query.variant) ? query.variant[0] : query.variant
  const variant = variantId
    ? product.variants?.find((option) => option.id === variantId)
    : undefined

  return {
    slug: product.slug,
    title: product.title,
    sku: variant?.sku || product.sku,
    imageUrl: getMediaUrl(product.images?.[0]?.image, 'thumbnail'),
    variantId: variant?.id ?? undefined,
    variantName: variant?.modelName,
  }
}
