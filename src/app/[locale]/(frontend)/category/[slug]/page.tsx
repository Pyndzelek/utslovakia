import React from 'react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { setRequestLocale } from 'next-intl/server'
import { routing, type Locale } from '@/i18n/routing'
import { Container } from '@/components/ui/container'
import { CatalogToolbar } from '@/components/catalog/catalog-toolbar'
import { Pagination } from '@/components/catalog/pagination'
import { ProductGrid } from '@/components/product/product-grid'
import { CategoryHero } from '@/components/catalog/category-hero'
import { CategoryNavigation } from '@/components/catalog/category-navigation'
import { categories, getCategory, getProductsByCategory } from '@/lib/mock-data'

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
    <main>
      {/* 1. Hero Section */}
      <CategoryHero category={category} />

      {/* 2. Responsive Sibling Categories Navigation */}
      <CategoryNavigation categories={categories} currentSlug={slug} />

      {/* 3. Products & Toolbar */}
      <Container className="py-6 lg:py-12">
        <CatalogToolbar resultCount={category.productCount} />
        <ProductGrid products={categoryProducts} className="mt-6 md:grid-cols-4" />
        <div className="mt-10">
          <Pagination pages={3} />
        </div>
      </Container>
    </main>
  )
}
