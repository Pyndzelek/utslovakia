import type { CollectionConfig } from 'payload'
import { authenticated } from '@/access'
import { revalidateCollection } from '@/hooks/revalidate'

export const Brand: CollectionConfig = {
  slug: 'brands',
  labels: { singular: 'Marka', plural: 'Marki' },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'updatedAt'],
    description:
      'Marki / producenci. Marka jest pokazywana przy produkcie i jako filtr w katalogu (tylko marki, które mają opublikowane produkty).',
    group: 'Katalog',
  },
  access: {
    read: () => true,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  // Brand names are shown on product cards/pages and in the brand filter.
  hooks: revalidateCollection('products'),
  fields: [
    {
      name: 'name',
      label: 'Nazwa',
      type: 'text',
      required: true,
      unique: true,
    },
  ],
}
