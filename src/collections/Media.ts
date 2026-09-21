import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
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
