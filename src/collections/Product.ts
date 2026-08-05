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
      required: true,
    },
    {
      name: 'keyFeatures',
      type: 'array',
      label: 'Kluczowe cechy',
      labels: { singular: 'Cecha', plural: 'Cechy' },
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
      type: 'number',
      label: 'Gwarancja (miesiące)',
      localized: false,
      min: 0,
    },
    {
      name: 'prices',
      type: 'array',
      label: 'Cena',
      labels: { singular: 'Cena', plural: 'Ceny' },
      admin: {
        description: 'Dodaj ceny dla różnych walut.',
      },
      fields: [
        {
          type: 'row', // Places currency and amount side-by-side in Payload UI
          fields: [
            {
              name: 'currency',
              type: 'select',
              label: 'Waluta',
              required: true,
              options: ['PLN', 'EUR', 'USD', 'BRL'],
              admin: { width: '50%' },
            },
            {
              name: 'amount',
              type: 'number',
              label: 'Kwota',
              required: true,
              min: 0,
              admin: { width: '50%' },
            },
          ],
        },
      ],
    },
    {
      name: 'stockStatus',
      type: 'select',
      label: 'Domyślna Dostępność',
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
    },
    {
      name: 'variants',
      type: 'array',
      label: 'Modele / Warianty',
      labels: { singular: 'Model', plural: 'Modele' },
      admin: {
        description: 'Dodaj różne wersje tego produktu (np. inne parametry, kolory).',
      },
      fields: [
        {
          name: 'modelName',
          type: 'text',
          label: 'Nazwa modelu (np. 16GB RAM, Kolor Czerwony)',
          required: true,
          localized: true,
        },
        {
          name: 'sku',
          type: 'text',
          label: 'SKU (opcjonalne)',
        },
        {
          name: 'priceOverrides',
          type: 'array',
          label: 'Nadpisane Ceny (opcjonalnie)',
          labels: { singular: 'Nadpisana Cena', plural: 'Nadpisane Ceny' },
          admin: {
            description:
              'Jeśli ten wariant ma inną cenę w danej walucie, dodaj ją tutaj. W przeciwnym razie użyje ceny głównej.',
          },
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'currency',
                  type: 'select',
                  label: 'Waluta',
                  required: true,
                  options: ['PLN', 'EUR', 'USD', 'BRL'],
                  admin: { width: '50%' },
                },
                {
                  name: 'amount',
                  type: 'number',
                  label: 'Kwota',
                  required: true,
                  min: 0,
                  admin: { width: '50%' },
                },
              ],
            },
          ],
        },
        {
          name: 'stockStatus',
          type: 'select',
          label: 'Dostępność modelu',
          defaultValue: 'inherit',
          options: [
            { label: 'Dziedzicz z głównego statusu', value: 'inherit' },
            { label: 'Dostępny', value: 'in_stock' },
            { label: 'Niedostępny', value: 'out_of_stock' },
            { label: 'Na zamówienie', value: 'preorder' },
          ],
        },
      ],
    },
  ],
}
