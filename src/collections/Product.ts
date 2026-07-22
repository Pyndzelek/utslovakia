import type { CollectionConfig } from 'payload'

export const Product: CollectionConfig = {
  slug: 'products',
  labels: {
    singular: 'produkt',
    plural: 'Produkty',
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'sku', 'brand', 'category', 'status', 'updatedAt'],
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
      name: 'sku',
      type: 'text',
      label: 'SKU (numer katalogowy)',
      localized: false,
      unique: true,
      admin: {
        position: 'sidebar',
        description:
          'Stabilny identyfikator produktu, niezależny od nazwy i slugu. Potrzebny gdy pojawią się zamówienia, magazyn i integracje.',
      },
    },
    {
      name: 'status',
      type: 'select',
      label: 'Status',
      defaultValue: 'published',
      required: true,
      options: [
        { label: 'Opublikowany', value: 'published' },
        { label: 'Szkic', value: 'draft' },
        { label: 'Wycofany', value: 'archived' },
      ],
      admin: {
        position: 'sidebar',
        description: 'Wycofaj produkt zmieniając status na "Wycofany" zamiast go usuwać.',
      },
    },
    {
      name: 'badge',
      type: 'select',
      label: 'Etykieta',
      options: [
        { label: 'Nowość', value: 'new' },
        { label: 'Bestseller', value: 'bestseller' },
      ],
      admin: {
        position: 'sidebar',
        description: 'Opcjonalna plakietka wyświetlana na zdjęciu produktu (np. "NEW").',
      },
    },
    {
      name: 'brand',
      type: 'relationship',
      label: 'Marka',
      relationTo: 'brands',
      hasMany: false,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'category',
      type: 'relationship',
      label: 'Kategorie',
      relationTo: 'categories',
      required: true,
      hasMany: true,
      minRows: 1,
      admin: {
        description: 'Produkt może należeć do kilku kategorii (np. własna kategoria + "Promocje").',
      },
    },
    {
      name: 'images',
      type: 'array',
      label: 'Zdjęcia',
      required: true,
      minRows: 1,
      labels: { singular: 'Zdjęcie', plural: 'Zdjęcia' },
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
        {
          name: 'alt',
          type: 'text',
          label: 'Opis zdjęcia (niewidoczny dla użytkownika, informacja dla Google)',
          localized: true,
        },
      ],
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Opis',
      localized: true,
    },
    {
      name: 'keyFeatures',
      type: 'array',
      label: 'Kluczowe cechy',
      labels: { singular: 'Cecha', plural: 'Cechy' },
      admin: {
        description: 'Lista wyświetlana jako checklista ("Key features") na stronie produktu.',
      },
      fields: [
        {
          name: 'text',
          type: 'text',
          label: 'Treść',
          localized: true,
          required: true,
        },
      ],
    },
    {
      name: 'warranty',
      type: 'group',
      label: 'Gwarancja',
      fields: [
        {
          name: 'length',
          type: 'number',
          label: 'Okres gwarancji (miesiące)',
          min: 0,
        },
      ],
    },
    {
      name: 'price',
      type: 'group',
      label: 'Cena',
      fields: [
        {
          name: 'amount',
          type: 'number',
          label: 'Kwota',
          min: 0,
        },
        {
          name: 'currency',
          type: 'select',
          label: 'Waluta',
          defaultValue: 'PLN',
          options: ['PLN', 'EUR', 'USD', 'BRL'],
        },
      ],
    },
    {
      name: 'stockStatus',
      type: 'select',
      label: 'Dostępność',
      defaultValue: 'in_stock',
      options: [
        { label: 'Dostępny', value: 'in_stock' },
        { label: 'Niedostępny', value: 'out_of_stock' },
        { label: 'Na zamówienie', value: 'preorder' },
      ],
      admin: {
        position: 'sidebar',
      },
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
