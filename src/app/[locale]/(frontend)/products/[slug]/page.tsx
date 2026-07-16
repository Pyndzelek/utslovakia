// src/app/[locale]/(frontend)/products/[slug]/page.tsx
import type { Metadata } from 'next'
import { getPayload } from 'payload'
import config from '@payload-config'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { routing, type Locale } from '@/i18n/routing'

export const revalidate = 3600 // ISR: refresh hourly, or use on-demand revalidation

interface PageProps {
  params: Promise<{
    locale: Locale
    slug: string
  }>
}

// Map localized folder paths for your alternate SEO tags
const pathPrefixes: Record<Locale, string> = {
  pl: '/produkty',
  sk: '/produkty',
  'pt-br': '/produtos',
}

// 1. Generate static routes for ALL locales and their unique translated slugs
export async function generateStaticParams() {
  const payload = await getPayload({ config })

  // Fetch slugs across all languages simultaneously
  const { docs } = await payload.find({
    collection: 'products',
    limit: 1000,
    locale: 'all',
    select: { slug: true },
  })

  return routing.locales.flatMap(
    (locale) =>
      docs
        .map((doc) => {
          // Safely extract the translated slug string for the current locale loop
          const slug = typeof doc.slug === 'object' ? doc.slug[locale] : doc.slug
          return slug ? { locale, slug } : null
        })
        .filter(Boolean) as Array<{ locale: string; slug: string }>,
  )
}

// 2. Generate dynamic metadata with exact hreflang alternate links
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params
  const payload = await getPayload({ config })

  // Query with locale: 'all' so we can link Polish, Slovak, and Brazilian URLs together
  const { docs } = await payload.find({
    collection: 'products',
    locale: 'all',
    where: {
      [`slug.${locale}`]: { equals: slug },
    },
    limit: 1,
  })

  const product = docs[0]
  if (!product) return {}

  // Extract metadata for the active locale
  const metaTitle =
    typeof product.meta?.title === 'object' ? product.meta.title[locale] : product.meta?.title
  const title =
    metaTitle || (typeof product.title === 'object' ? product.title[locale] : product.title)
  const description =
    typeof product.meta?.description === 'object'
      ? product.meta.description[locale]
      : product.meta?.description

  // Extract unique translated slugs for alternate tags
  const plSlug = typeof product.slug === 'object' ? product.slug.pl : slug
  const skSlug = typeof product.slug === 'object' ? product.slug.sk : slug
  const ptSlug = typeof product.slug === 'object' ? product.slug['pt-br'] : slug

  const baseUrl = 'https://uts.pl'
  const canonicalPath = `${locale === 'pl' ? '' : `/${locale}`}${pathPrefixes[locale]}/${slug}`

  return {
    title: title,
    description: description,
    alternates: {
      canonical: `${baseUrl}${canonicalPath}`,
      languages: {
        pl: `${baseUrl}${pathPrefixes.pl}/${plSlug}`,
        sk: `${baseUrl}/sk${pathPrefixes.sk}/${skSlug}`,
        'pt-br': `${baseUrl}/pt-br${pathPrefixes['pt-br']}/${ptSlug}`,
        'x-default': `${baseUrl}${pathPrefixes.pl}/${plSlug}`,
      },
    },
  }
}

// 3. Render the localized product page
export default async function ProductPage({ params }: PageProps) {
  const { locale, slug } = await params
  const payload = await getPayload({ config })

  // Query strictly for the active locale
  const { docs } = await payload.find({
    collection: 'products',
    where: { slug: { equals: slug } },
    locale: locale,
    depth: 1,
    limit: 1,
  })

  const product = docs[0]
  if (!product) return notFound()

  // Safely resolve media URL if images are stored as a relationship or array
  const firstImage = product.images?.[0]
  const imageUrl =
    typeof firstImage === 'object' && firstImage !== null && 'url' in firstImage
      ? (firstImage as { url: string }).url
      : typeof firstImage === 'string'
        ? firstImage
        : null

  return (
    <main>
      <h1>{product.title}</h1>

      {imageUrl && (
        <Image
          src={imageUrl}
          alt={product.title || 'Product image'}
          width={600}
          height={600}
          priority
        />
      )}

      <p>{product.description}</p>

      {product.specifications && product.specifications.length > 0 && (
        <ul>
          {product.specifications.map(
            (specification: { label: string; value: string }, index: number) => (
              <li key={specification.label || index}>
                <strong>{specification.label}:</strong> {specification.value}
              </li>
            ),
          )}
        </ul>
      )}
    </main>
  )
}
