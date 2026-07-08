import { AboutBanner } from '@/components/about-banner'
import { CategoryCards } from '@/components/category-cards'
import { Hero } from '@/components/hero'
import { Industries } from '@/components/industries'
import { ProductSection } from '@/components/product-section'
import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'
import { bestsellers, promotions, newProducts } from '@/lib/products'

export default async function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <Hero />
        <ProductSection title="Bestsellers" products={bestsellers} />
        <CategoryCards />
        <ProductSection title="Promotions" products={promotions} />
        <Industries />
        <ProductSection title="New products" products={newProducts} />
        <AboutBanner />
      </main>
      <SiteFooter />
    </div>
  )
}
