import type { CollectionConfig } from 'payload'
import { revalidateTag } from 'next/cache'

export const Product: CollectionConfig = {
  slug: 'products',
  labels: {
    singular: 'produkt',
    plural: 'Produkty',
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'sku', 'brand', 'categories', 'status', 'updatedAt'],
    description: 'Zarządzaj katalogiem produktów',
  },
  access: {
    read: () => true,
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  hooks: {
    beforeValidate: [
      ({ data }) => {
        if (data?.sku === '') {
          data.sku = undefined
        }
        return data
      },
    ],
    afterChange: [
      () => {
        revalidateTag('products', 'max')
      },
    ],
    afterDelete: [
      () => {
        revalidateTag('products', 'max')
      },
    ],
  },
  fields: [
    // ---- Sidebar: identifiers, status, merchandising metadata ----
    {
      name: 'slug',
      type: 'text',
      label: 'Slug (adres URL)',
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
      unique: true,
      admin: {
        position: 'sidebar',
        description: 'Identyfikator produktu, niezależny od nazwy i slugu.',
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
      admin: { position: 'sidebar' },
    },
    {
      name: 'badge',
      type: 'select',
      label: 'Etykieta',
      options: [
        { label: 'Nowość', value: 'new' },
        { label: 'Bestseller', value: 'bestseller' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'stockStatus',
      type: 'select',
      label: 'Dostępność',
      defaultValue: 'in_stock',
      required: true,
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
      name: 'brand',
      type: 'relationship',
      label: 'Marka',
      relationTo: 'brands',
      hasMany: false,
      admin: { position: 'sidebar' },
    },
    {
      name: 'link',
      type: 'text',
      label: 'Link zewnętrzny do zakupy (ebay)',
      admin: { position: 'sidebar' },
    },

    // ---- Main column: tabs ----
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Treść',
          fields: [
            {
              name: 'title',
              type: 'text',
              label: 'Nazwa',
              localized: true,
              required: true,
            },
            {
              name: 'categories',
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
              label: 'Gwarancja w miesiącach',
              min: 0,
            },
            {
              name: 'prices',
              type: 'group',
              label: 'Cena bazowa',
              admin: {
                description: 'PLN jest wymagane. Pozostałe waluty opcjonalnie.',
              },
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'PLN',
                      type: 'number',
                      label: 'PLN',
                      min: 0,
                      required: true,
                    },
                    {
                      name: 'EUR',
                      type: 'number',
                      label: 'EUR',
                      min: 0,
                    },
                    {
                      name: 'USD',
                      type: 'number',
                      label: 'USD',
                      min: 0,
                    },
                    {
                      name: 'BRL',
                      type: 'number',
                      label: 'BRL',
                      min: 0,
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: 'Warianty',
          fields: [
            {
              name: 'variants',
              type: 'array',
              label: 'Modele / Warianty',
              labels: { singular: 'Model', plural: 'Modele' },
              admin: {
                description: 'Dodaj różne wersje tego produktu.',
              },
              fields: [
                {
                  name: 'modelName',
                  type: 'text',
                  label: 'Nazwa modelu (np. kolor, rozmiar, itp.)',
                  required: true,
                  localized: true,
                },
                {
                  name: 'sku',
                  type: 'text',
                  label: 'SKU (opcjonalne)',
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
                {
                  name: 'priceOverrides',
                  type: 'group',
                  label: 'Nadpisane ceny (opcjonalnie)',
                  admin: {
                    description:
                      'Wypełnij tylko te waluty, które różnią się od ceny głównej. Pozostaw puste, aby dziedziczyć.',
                  },
                  fields: [
                    {
                      type: 'row',
                      fields: [
                        {
                          name: 'PLN',
                          type: 'number',
                          label: 'PLN',
                          min: 0,
                        },
                        {
                          name: 'EUR',
                          type: 'number',
                          label: 'EUR',
                          min: 0,
                        },
                        {
                          name: 'USD',
                          type: 'number',
                          label: 'USD',
                          min: 0,
                        },
                        {
                          name: 'BRL',
                          type: 'number',
                          label: 'BRL',
                          min: 0,
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}
