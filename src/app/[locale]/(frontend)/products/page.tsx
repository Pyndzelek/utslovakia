import React from 'react'
import type { Metadata } from 'next'
import { setRequestLocale } from 'next-intl/server'
import type { Locale } from '@/i18n/routing'
import { Container } from '@/components/ui/container'
import { Breadcrumbs } from '@/components/ui/breadcrumbs'
import { FilterSidebar } from '@/components/catalog/filter-sidebar'
import { CatalogToolbar } from '@/components/catalog/catalog-toolbar'
import { Pagination } from '@/components/catalog/pagination'
import { ProductGrid } from '@/components/product/product-grid'
import { products } from '@/lib/mock-data'

export const metadata: Metadata = {
  title: 'Produkty',
  description:
    'Przeglądaj akceptory banknotów, walidatory monet, monitory dotykowe, hoppery i moduły płatności bezgotówkowych – w magazynie i wysyłane w ciągu 24 godzin.',
}

interface PageProps {
  params: Promise<{ locale: Locale }>
}

export default async function ProductsPage({ params }: PageProps) {
  const { locale } = await params
  setRequestLocale(locale)

  return (
    <>
      {/* Page header */}
      <div className="border-b border-line bg-white">
        <Container className="py-8 lg:py-10">
          <Breadcrumbs items={[{ label: 'Produkty' }]} />
          <h1 className="font-display mt-4 text-3xl font-semibold tracking-tight text-navy-900 sm:text-4xl">
            Wszystkie produkty
          </h1>
          <p className="mt-2 max-w-2xl text-[15px] text-slate-500">
            Pełny katalog unique Technology Solution s.r.o. — walidatory, zmieniacze, wyświetlacze i
            części zamienne z najlepszych marek.
          </p>
        </Container>
      </div>

      <Container className="py-8 lg:py-10">
        <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
          <FilterSidebar className="hidden self-start lg:block" />

          <div>
            <CatalogToolbar resultCount={products.length} />
            <ProductGrid products={products} className="mt-6" />
            <div className="mt-10">
              <Pagination />
            </div>
          </div>
        </div>
      </Container>
    </>
  )
}
