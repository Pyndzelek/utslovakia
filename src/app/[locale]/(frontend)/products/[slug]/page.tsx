import { getPayload } from 'payload'
import config from '@payload-config'
import { notFound } from 'next/navigation'
import Image from 'next/image'

export const revalidate = 3600 // ISR: refresh hourly, or use on-demand revalidation

export async function generateStaticParams() {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'products',
    limit: 1000,
    select: { slug: true },
  })
  const locales = ['pl', 'en']
  return locales.flatMap((locale) => docs.map((doc) => ({ locale, slug: doc.slug })))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'products',
    where: { slug: { equals: slug } },
    limit: 1,
  })
  const product = docs[0]
  if (!product) return {}

  return {
    title: product.meta?.title,
    description: product.meta?.description,
  }
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'products',
    where: { slug: { equals: slug } },
    locale,
    depth: 1,
    limit: 1,
  })
  const product = docs[0]
  if (!product) return notFound()

  return (
    <main>
      <h1>{product.title}</h1>
      <Image src={product.images[0].url} alt={product.title} width={100} height={100} />
      <p>{product.description}</p>
      <ul>
        {product.specifications.map((specification) => (
          <li key={specification.label}>
            {specification.label}: {specification.value}
          </li>
        ))}
      </ul>
    </main>
  )
}
