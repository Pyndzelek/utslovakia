import type { CollectionConfig } from 'payload'
import { authenticated, publicWhenStatus } from '@/access'
import { slugField } from '@/fields/slug'
import { revalidateCollection } from '@/hooks/revalidate'

// Product listings embed category names/slugs, so both tags go stale on a category change.
const { afterChange, afterDelete } = revalidateCollection('categories', 'products')

export const Category: CollectionConfig = {
  slug: 'categories',
  labels: { singular: 'Kategoria', plural: 'Kategorie' },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'order', 'status', 'updatedAt'],
    description: 'Kategorie produktów',
    group: 'Katalog',
  },
  access: {
    read: publicWhenStatus('active'),
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  hooks: { afterChange, afterDelete },
  fields: [
    {
      name: 'name',
      label: 'Nazwa',
      type: 'text',
      localized: true,
      required: true,
    },
    slugField({
      from: 'name',
      localized: true,
      description: 'Używane w adresie URL kategorii, osobno dla każdego języka.',
    }),
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
