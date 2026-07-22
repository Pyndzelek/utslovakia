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
      admin: {
        position: 'sidebar',
        description: 'Używane w adresie URL kategorii, np. /categories/twoj-slug',
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
          'Ukryj kategorię zmieniając status zamiast ją usuwać — usunięcie mogłoby zerwać powiązania z istniejącymi produktami.',
      },
    },
    {
      name: 'description',
      label: 'Opis',
      type: 'textarea',
      localized: true,
    },
  ],
}
