/**
 * One-off: writes the translated product/category text in `translations/<locale>.json`.
 *
 *   pnpm payload run scripts/one-off/apply-translations.ts -- [--dry]
 *
 * Products are matched by SKU, categories by ID. Descriptions are stored as arrays of lines
 * in the JSON (joined with "\n"). Array rows (images, keyFeatures, variants) aren't localized
 * themselves — only their text fields are — so every locale must have the same number of
 * key features and variants as the product has rows; the script aborts before writing if not.
 * Image alt text is set to the product title in each locale.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { getPayload } from 'payload'
import config from '@payload-config'
import type { Product } from '@/payload-types'
import { scriptContext } from './lib'

type Locale = 'pl' | 'en' | 'sk' | 'pt-br'
type ProductText = {
  title: string
  description: string[]
  keyFeatures: string[]
  variants: string[]
}
type CategoryText = { name: string; slug: string; description: string }
type Translation = {
  products: Record<string, ProductText>
  categories: Record<string, CategoryText>
}

const LOCALES: Locale[] = ['en', 'pl', 'sk', 'pt-br']
const dry = process.argv.includes('--dry')
const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), 'translations')

const translations = Object.fromEntries(
  LOCALES.map((locale) => [
    locale,
    JSON.parse(fs.readFileSync(path.join(dir, `${locale}.json`), 'utf8')) as Translation,
  ]),
) as Record<Locale, Translation>

const payload = await getPayload({ config })

// Resolve and validate everything first, so a mismatch doesn't leave a half-written catalogue.
const skus = Object.keys(translations.en.products)
const products = new Map<string, Product>()
for (const sku of skus) {
  const { docs } = await payload.find({
    collection: 'products',
    where: { sku: { equals: sku } },
    depth: 0,
    limit: 1,
    overrideAccess: true,
  })
  const doc = docs[0]
  if (!doc) throw new Error(`No product with SKU ${sku}`)
  for (const locale of LOCALES) {
    const t = translations[locale].products[sku]
    if (!t) throw new Error(`${locale}: missing ${sku}`)
    if (t.keyFeatures.length !== (doc.keyFeatures?.length ?? 0))
      throw new Error(
        `${locale}/${sku}: ${t.keyFeatures.length} key features, product has ${doc.keyFeatures?.length ?? 0}`,
      )
    if (t.variants.length !== (doc.variants?.length ?? 0))
      throw new Error(
        `${locale}/${sku}: ${t.variants.length} variants, product has ${doc.variants?.length ?? 0}`,
      )
  }
  products.set(sku, doc)
}

for (const locale of LOCALES) {
  console.log(`\n[${locale}]`)

  for (const [id, t] of Object.entries(translations[locale].categories)) {
    console.log(`  category ${id} → ${t.name} (/${t.slug})`)
    if (dry) continue
    await payload.update({
      collection: 'categories',
      id,
      locale,
      data: t,
      context: scriptContext(),
    })
  }

  for (const [sku, doc] of products) {
    const t = translations[locale].products[sku]
    console.log(`  ${sku} → ${t.title}`)
    if (dry) continue
    await payload.update({
      collection: 'products',
      id: doc.id,
      locale,
      depth: 0,
      context: scriptContext(),
      data: {
        title: t.title,
        description: t.description.join('\n'),
        // Reuse row ids so each locale writes into the same rows.
        images: doc.images.map(({ id, image }) => ({ id, image, alt: t.title })),
        keyFeatures: doc.keyFeatures?.map(({ id }, i) => ({ id, text: t.keyFeatures[i] })),
        variants: doc.variants?.map((v, i) => ({ ...v, modelName: t.variants[i] })),
      },
    })
  }
}

console.log(dry ? '\nDry run — nothing written.' : '\nDone.')
process.exit(0)
