import type { CollectionConfig } from 'payload'
import { authenticated, isAdmin, isAdminField, isAdminOrSelf } from '@/access'

export const Users: CollectionConfig = {
  slug: 'users',
  labels: { singular: 'Użytkownik', plural: 'Użytkownicy' },
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'name', 'role', 'updatedAt'],
    group: 'System',
  },
  auth: {
    // Brute-force protection for /admin login: lock the account for 10 min after 5 misses.
    maxLoginAttempts: 5,
    lockTime: 10 * 60 * 1000,
  },
  access: {
    admin: ({ req }) => Boolean(req.user),
    read: authenticated,
    create: isAdmin,
    update: isAdminOrSelf,
    delete: isAdmin,
  },
  hooks: {
    beforeChange: [
      // The account made on the "create first user" screen must be able to manage users.
      async ({ data, operation, req }) => {
        if (operation !== 'create') return data
        const { totalDocs } = await req.payload.count({ collection: 'users', req })
        if (totalDocs === 0) data.role = 'admin'
        return data
      },
    ],
  },
  fields: [
    // Email and password are added by `auth`.
    {
      name: 'name',
      type: 'text',
      label: 'Imię i nazwisko',
    },
    {
      name: 'role',
      type: 'select',
      label: 'Rola',
      required: true,
      defaultValue: 'editor',
      saveToJWT: true,
      options: [
        { label: 'Administrator', value: 'admin' },
        { label: 'Redaktor', value: 'editor' },
      ],
      access: {
        // Editors can't promote themselves.
        update: isAdminField,
      },
      admin: {
        position: 'sidebar',
        description:
          'Administrator może zarządzać kontami użytkowników. Redaktor edytuje produkty, kategorie i treści.',
      },
    },
  ],
}
