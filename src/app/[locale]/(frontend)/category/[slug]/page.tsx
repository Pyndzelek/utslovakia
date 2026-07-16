import React from 'react'
import type { Metadata } from 'next'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { setRequestLocale } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { routing, type Locale } from '@/i18n/routing'
import { Container } from '@/components/ui/container'
import { Breadcrumbs } from '@/components/ui/breadcrumbs'
import { CatalogToolbar } from '@/components/catalog/catalog-toolbar'
import { FilterSidebar } from '@/components/catalog/filter-sidebar'
import { Pagination } from '@/components/catalog/pagination'
import { ProductGrid } from '@/components/product/product-grid'
import { categories, getCategory, getProductsByCategory } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

interface PageProps {
  params: Promise<{ locale: Locale; slug: string }>
}

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    categories.map((category) => ({ locale, slug: category.slug })),
  )
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const category = getCategory(slug)
  if (!category) return {}
  return { title: category.name, description: category.description }
}

export default async function CategoryPage({ params }: PageProps) {
  const { locale, slug } = await params
  setRequestLocale(locale)

  const category = getCategory(slug)
  if (!category) notFound()

  const categoryProducts = getProductsByCategory(slug)

  return (
    <>
      {/* Category hero band */}
      <div className="relative overflow-hidden bg-navy-950">
        <div className="pattern-chevron-dark absolute inset-0" aria-hidden />
        <div
          className="absolute top-0 right-0 size-96 translate-x-1/3 -translate-y-1/3 rounded-full bg-brand-600/25 blur-3xl"
          aria-hidden
        />
        <Container className="relative grid items-center gap-8 py-12 lg:grid-cols-[1fr_300px] lg:py-16">
          <div>
            <Breadcrumbs
              items={[{ label: 'Categories', href: '/category' }, { label: category.name }]}
              className="[&_a]:text-slate-400 [&_a:hover]:text-white [&_span]:text-white"
            />
            <h1 className="font-display mt-5 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              {category.name}
            </h1>
            <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-slate-300">
              {category.description}
            </p>
          </div>
          <div className="relative hidden h-52 lg:block">
            <Image
              src={category.image}
              alt=""
              fill
              sizes="300px"
              className="object-contain drop-shadow-[0_24px_32px_rgba(0,0,0,0.5)]"
            />
          </div>
        </Container>
      </div>

      {/* Sibling category chips */}
      <div className="border-b border-line bg-white">
        <Container className="no-scrollbar flex gap-2 overflow-x-auto py-4">
          {categories.map((c) => (
            <Link
              key={c.slug}
              href={{ pathname: '/category/[slug]', params: { slug: c.slug } }}
              className={cn(
                'shrink-0 rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors',
                c.slug === slug
                  ? 'bg-navy-900 text-white'
                  : 'border border-line text-slate-600 hover:border-brand-400 hover:text-brand-700',
              )}
            >
              {c.name}
            </Link>
          ))}
        </Container>
      </div>

      <Container className="py-8 lg:py-12">
        <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
          <FilterSidebar activeCategorySlug={slug} className="hidden self-start lg:block" />

          <div>
            <CatalogToolbar resultCount={category.productCount} />
            <ProductGrid products={categoryProducts} className="mt-6" />
            <div className="mt-10">
              <Pagination pages={3} />
            </div>
          </div>
        </div>
      </Container>
    </>
  )
}
