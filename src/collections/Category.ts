import type { CollectionConfig } from 'payload'

export const Category: CollectionConfig = {
  slug: 'categories',
  labels: { singular: 'Kategoria', plural: 'Kategorie' },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'parent', 'order', 'status', 'updatedAt'],
    description: 'Kategorie produktów',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'name',
      label: 'Nazwa',
      type: 'text',
      localized: true,
      required: true,
    },
    {
      name: 'slug',
      label: 'Slug (adres URL)',
      type: 'text',
      required: true,
      unique: true,
      localized: true,
      admin: {
        description: 'Używane w adresie URL kategorii, np. /kategoria/slug-kategorii',
      },
    },
    {
      name: 'description',
      label: 'Opis',
      type: 'textarea',
      localized: true,
    },
    {
      name: 'image',
      label: 'Zdjęcie',
      type: 'upload',
      relationTo: 'media',
      required: true,
      admin: {
        description: 'Zdjęcie kategorii wyświetlane na karcie kategorii w katalogu.',
      },
    },
    {
      name: 'order',
      label: 'Kolejność wyświetlania',
      type: 'number',
      defaultValue: 0,
      admin: {
        position: 'sidebar',
        description: 'Mniejsze liczby wyświetlają się jako pierwsze.',
      },
    },
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      defaultValue: 'active',
      required: true,
      options: [
        { label: 'Aktywna', value: 'active' },
        { label: 'Ukryta', value: 'hidden' },
      ],
      admin: {
        position: 'sidebar',
        description:
          'Ukryj kategorię zmieniając status zamiast ją usuwać (może to zerwać powiązania z istniejącymi produktami)',
      },
    },
  ],
}
