import { APIError, type CollectionConfig } from 'payload'
import { authenticated } from '@/access'
import { revalidateCollection } from '@/hooks/revalidate'

/** Vercel rejects request bodies over ~4.5 MB, so stop larger files with a readable message. */
const MAX_UPLOAD_BYTES = 4 * 1024 * 1024

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
  hooks: {
    ...revalidateCollection('products', 'categories', 'site-settings'),
    beforeOperation: [
      ({ operation, req }) => {
        if ((operation === 'create' || operation === 'update') && req.file) {
          if (req.file.size > MAX_UPLOAD_BYTES) {
            const sizeMb = (req.file.size / 1024 / 1024).toFixed(1)
            throw new APIError(
              `Plik ma ${sizeMb} MB — maksymalnie 4 MB. Zmniejsz zdjęcie (np. zapisz jako JPG w mniejszej rozdzielczości) i spróbuj ponownie.`,
              413,
              undefined,
              true, // show this message to the editor instead of a generic error
            )
          }
        }
      },
    ],
  },
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
