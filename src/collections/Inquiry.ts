import type { CollectionConfig } from 'payload'
import { authenticated } from '@/access'

/** Shown in the admin as-is: what the visitor typed isn't meant to be edited. */
const readOnly = { readOnly: true } as const

/**
 * Messages sent through the contact page's inquiry form. Written only by the
 * `submitInquiry` server action (Local API) — the public REST/GraphQL API can't create,
 * read or change them. Editors track each one with `status` and `notes`.
 */
export const Inquiry: CollectionConfig = {
  slug: 'inquiries',
  labels: { singular: 'Zapytanie', plural: 'Zapytania' },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'email', 'product', 'status', 'createdAt'],
    listSearchableFields: ['name', 'email', 'company', 'message'],
    description:
      'Wiadomości wysłane przez formularz na stronie Kontakt. Po odpowiedzi zmień status na „Załatwione”.',
    group: 'Zapytania',
  },
  defaultSort: '-createdAt',
  access: {
    // Only the site's own form (server action, Local API) creates inquiries.
    create: () => false,
    read: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  fields: [
    {
      name: 'status',
      type: 'select',
      label: 'Status',
      required: true,
      defaultValue: 'new',
      options: [
        { label: 'Nowe', value: 'new' },
        { label: 'W trakcie', value: 'in_progress' },
        { label: 'Załatwione', value: 'done' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'notes',
      type: 'textarea',
      label: 'Notatki wewnętrzne',
      admin: {
        position: 'sidebar',
        description: 'Widoczne tylko w panelu, np. co ustalono z klientem.',
      },
    },
    {
      type: 'row',
      fields: [
        { name: 'name', type: 'text', label: 'Imię i nazwisko', required: true, admin: readOnly },
        { name: 'email', type: 'email', label: 'E-mail', required: true, admin: readOnly },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'phone', type: 'text', label: 'Telefon', admin: readOnly },
        { name: 'company', type: 'text', label: 'Firma', admin: readOnly },
      ],
    },
    { name: 'message', type: 'textarea', label: 'Wiadomość', required: true, admin: readOnly },
    {
      type: 'row',
      fields: [
        {
          name: 'product',
          type: 'relationship',
          label: 'Produkt, którego dotyczy',
          relationTo: 'products',
          admin: readOnly,
        },
        { name: 'variant', type: 'text', label: 'Wariant', admin: readOnly },
      ],
    },
    {
      name: 'locale',
      type: 'select',
      label: 'Wersja językowa strony',
      options: [
        { label: 'Polski', value: 'pl' },
        { label: 'English', value: 'en' },
        { label: 'Slovenčina', value: 'sk' },
        { label: 'Português (Brasil)', value: 'pt-br' },
      ],
      admin: { ...readOnly, description: 'W tym języku klient przeglądał stronę.' },
    },
  ],
}
