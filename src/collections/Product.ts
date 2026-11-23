import type { CollectionConfig } from 'payload'
import { authenticated, publicWhenStatus } from '@/access'
import { slugField } from '@/fields/slug'
import { revalidateCollection } from '@/hooks/revalidate'
import { publicUrl } from '@/lib/site-paths'
import { rowLabel } from '@/fields/row-label'

const { afterChange, afterDelete } = revalidateCollection('products')

export const Product: CollectionConfig = {
  slug: 'products',
  labels: {
    singular: 'Produkt',
    plural: 'Produkty',
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'sku', 'brand', 'categories', 'stockStatus', 'status', 'updatedAt'],
    // The list's search box matches the name, the SKU and the URL slug.
    listSearchableFields: ['title', 'sku', 'slug'],
    description: 'Zarządzaj katalogiem produktów',
    group: 'Katalog',
    // "Podgląd" button in the edit view: the product's public page in the edited language.
    preview: (doc, { locale }) =>
      typeof doc?.slug === 'string' ? publicUrl(locale, '/products/[slug]', doc.slug) : null,
  },
  // Most recently edited first — what an editor is usually looking for.
  defaultSort: '-updatedAt',
  access: {
    // Anonymous API visitors only see published products; the site's data layer filters too.
    read: publicWhenStatus('published'),
    create: authenticated,
    update: authenticated,
    delete: authenticated,
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
    afterChange,
    afterDelete,
  },
  fields: [
    // ---- Sidebar: identifiers, status, merchandising metadata ----
    slugField({
      from: 'title',
      description: 'Używane w adresie URL produktu, np. /products/twoj-slug.',
    }),
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
      label: 'Link zewnętrzny do zakupu (eBay)',
      admin: {
        position: 'sidebar',
        description:
          'Pełny adres aukcji, np. https://www.ebay.com/itm/… Bez linku na stronie pojawi się przycisk „Zapytaj o ofertę”.',
      },
      validate: (value: string | null | undefined) => {
        if (!value) return true
        try {
          return new URL(value).protocol === 'https:' || 'Link musi zaczynać się od https://'
        } catch {
          return 'Nieprawidłowy adres URL — wklej pełny link zaczynający się od https://'
        }
      },
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
                  label: 'Opis zdjęcia w tym produkcie (opcjonalnie)',
                  localized: true,
                  admin: {
                    description:
                      'Nadpisuje opis (alt) z biblioteki mediów, osobno dla każdego języka. Zostaw puste, aby użyć opisu z pliku.',
                  },
                },
              ],
            },
            {
              name: 'description',
              type: 'textarea',
              label: 'Opis',
              localized: true,
              required: true,
              admin: {
                rows: 12,
                description:
                  'Formatowanie jest automatyczne: pusta linia rozdziela akapity; krótka linia zakończona dwukropkiem (np. „Dane techniczne:”) staje się nagłówkiem; kilka linii pod rząd tworzy listę, a w linii „Napięcie: 12 V” część przed dwukropkiem jest pogrubiona.',
              },
            },
            {
              name: 'keyFeatures',
              type: 'array',
              label: 'Kluczowe cechy',
              labels: { singular: 'Cecha', plural: 'Cechy' },
              admin: {
                description:
                  'Krótkie punkty (3–6) pokazywane w karcie „Szczegóły produktu” obok opisu.',
                components: { RowLabel: rowLabel('text', 'Cecha') },
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
              type: 'number',
              label: 'Gwarancja w miesiącach',
              min: 0,
              admin: {
                description:
                  'Pozostaw puste lub wpisz 0, aby nie pokazywać gwarancji na stronie produktu.',
              },
            },
            {
              name: 'prices',
              type: 'group',
              label: 'Cena bazowa',
              admin: {
                description:
                  'PLN jest wymagane. Pozostałe waluty opcjonalnie — bez nich dana wersja językowa pokazuje cenę w PLN. Cena 0 wyświetla się jako „Cena na zapytanie”.',
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
                description:
                  'Dodaj różne wersje tego produktu. Pierwszy model z listy jest domyślnie wybrany na stronie.',
                initCollapsed: true,
                components: { RowLabel: rowLabel('modelName', 'Model') },
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
