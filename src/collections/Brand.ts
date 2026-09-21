import type { CollectionConfig } from 'payload'

export const Brand: CollectionConfig = {
  slug: 'brands',
  labels: { singular: 'Marka', plural: 'Marki' },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'updatedAt'],
    description: 'Marki / producenci — używane jako opcja filtrowania na stronie /products',
  },
  access: {
    read: () => true,
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
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
