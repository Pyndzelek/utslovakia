import type { CollectionConfig } from 'payload'
import { authenticated } from '@/access'
import { revalidateCollection } from '@/hooks/revalidate'

export const Media: CollectionConfig = {
  slug: 'media',
  labels: { singular: 'Zdjęcie', plural: 'Media' },
  admin: {
    useAsTitle: 'alt',
    defaultColumns: ['filename', 'alt', 'updatedAt'],
    description:
      'Maksymalny rozmiar pliku ok. 4 MB (większe zdjęcia z telefonu najpierw zmniejsz). Zdjęcia są automatycznie konwertowane do WebP i zmniejszane.',
    group: 'Treści',
  },
  access: {
    read: () => true,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  // Images and their alt text are embedded in product/category pages.
  hooks: revalidateCollection('products', 'categories', 'site-settings'),
  fields: [
    {
      name: 'alt',
      type: 'text',
      label: 'Opis zdjęcia (alt)',
      required: true,
      admin: {
        description:
          'Krótko opisz, co jest na zdjęciu, np. „Akceptor banknotów ICT A7 – widok z przodu”. Czytają to Google i czytniki ekranu.',
      },
    },
  ],
  upload: {
    mimeTypes: ['image/*'],
    // Cap the stored "original" so a full camera/DSLR export doesn't burn
    // through the free storage tier; sharp is already wired into
    // payload.config.ts, this is what activates it.
    resizeOptions: {
      width: 2400,
      height: 2400,
      fit: 'inside',
      withoutEnlargement: true,
    },
    formatOptions: {
      format: 'webp',
      options: { quality: 80 },
    },
    imageSizes: [
      { name: 'thumbnail', width: 200, height: undefined, formatOptions: { format: 'webp' } },
      { name: 'card', width: 480, height: undefined, formatOptions: { format: 'webp' } },
      { name: 'gallery', width: 960, height: undefined, formatOptions: { format: 'webp' } },
      { name: 'og', width: 1200, height: 630, fit: 'cover', formatOptions: { format: 'jpeg' } },
    ],
  },
}
