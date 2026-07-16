import type { CollectionConfig } from 'payload'

export const Product: CollectionConfig = {
  slug: 'products',
  labels: {
    singular: 'produkt',
    plural: 'Produkty',
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'updatedAt'],
    description: 'Zarządzaj katalogiem produktów',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Nazwa',
      localized: true,
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      label: 'Slug (adres URL)',
      localized: false,
      required: true,
      unique: true,
      admin: {
        position: 'sidebar',
        description: 'Używane w adresie URL produktu, np. /products/twoj-slug',
      },
    },
    {
      name: 'category',
      type: 'relationship',
      label: 'Kategoria',
      relationTo: 'categories',
      required: true,
      hasMany: false,
    },
    {
      name: 'images',
      type: 'upload',
      label: 'Zdjęcia',
      relationTo: 'media',
      hasMany: true,
      required: true,
      minRows: 1,
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Opis',
      localized: true,
    },
    {
      name: 'link',
      type: 'text',
      label: 'Link do zakupu (ebay)',
      localized: false,
      required: false,
    },
  ],
}
