import React from 'react'
import Image from 'next/image'
import { setRequestLocale } from 'next-intl/server'
import { ArrowRight } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import type { Locale } from '@/i18n/routing'
import { Container } from '@/components/ui/container'
import { Breadcrumbs } from '@/components/ui/breadcrumbs'
import { CtaBanner } from '@/components/home/cta-banner'
import { categories } from '@/lib/mock-data'
import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'category.meta' })

  return {
    title: t('title'),
    description: t('description'),
  }
}

interface PageProps {
  params: Promise<{ locale: Locale }>
}

export default async function CategoryIndexPage({ params }: PageProps) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('category')
  return (
    <>
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
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={{ pathname: '/category/[slug]', params: { slug: category.slug } }}
              className="group relative flex flex-col overflow-hidden rounded-3xl border border-line bg-white p-6 shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-lift sm:p-7"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-medium text-slate-400">
                    {category.productCount} products
                  </p>
                  <h2 className="font-display mt-1.5 text-xl font-semibold tracking-tight text-navy-900 transition-colors group-hover:text-brand-700">
                    {category.name}
                  </h2>
                </div>
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-line text-navy-900 transition-all group-hover:border-brand-600 group-hover:bg-brand-600 group-hover:text-white">
                  <ArrowRight className="size-4" aria-hidden />
                </span>
              </div>

              <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-slate-500">
                {category.description}
              </p>

              <div className="relative mt-6 h-40 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100">
                <Image
                  src={category.image}
                  alt=""
                  fill
                  sizes="(max-width: 640px) 90vw, 380px"
                  className="object-contain p-5 transition-transform duration-500 group-hover:scale-105"
                />
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-14">
          <CtaBanner />
        </div>
      </Container>
    </>
  )
}
