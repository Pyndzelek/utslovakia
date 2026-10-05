import type { GlobalConfig } from 'payload'
import { authenticated } from '@/access'
import { revalidateGlobal } from '@/hooks/revalidate'

export const SITE_SETTINGS_TAG = 'site-settings'

/**
 * Company/contact data shown in the footer, mobile menu, contact page and
 * Organization JSON-LD — editable by the client instead of hardcoded in components.
 * Read on the frontend via `getSiteSettings` (src/lib/data/site-settings.ts).
 */
export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Dane firmy i kontakt',
  admin: {
    group: 'Treści',
    description:
      'Dane widoczne w stopce, na stronie Kontakt i w menu mobilnym. Zmiany są widoczne na stronie od razu po zapisaniu.',
  },
  access: {
    read: () => true,
    update: authenticated,
  },
  hooks: {
    afterChange: [revalidateGlobal(SITE_SETTINGS_TAG)],
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Firma',
          fields: [
            {
              name: 'companyName',
              type: 'text',
              label: 'Pełna nazwa firmy',
              required: true,
            },
            { name: 'vatId', type: 'text', label: 'IČ DPH (VAT ID)' },
            {
              name: 'address',
              type: 'group',
              label: 'Adres',
              fields: [
                { name: 'street', type: 'text', label: 'Ulica i numer', required: true },
                {
                  type: 'row',
                  fields: [
                    { name: 'postalCode', type: 'text', label: 'Kod pocztowy', required: true },
                    { name: 'city', type: 'text', label: 'Miasto', required: true },
                  ],
                },
                {
                  type: 'row',
                  fields: [
                    { name: 'region', type: 'text', label: 'Region / kraj', localized: true },
                    { name: 'country', type: 'text', label: 'Państwo', localized: true },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: 'Kontakt',
          fields: [
            {
              name: 'phones',
              type: 'array',
              label: 'Telefony',
              labels: { singular: 'Telefon', plural: 'Telefony' },
              admin: { description: 'Pierwszy numer jest pokazywany w stopce i menu mobilnym.' },
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'number',
                      type: 'text',
                      label: 'Numer (z kierunkowym)',
                      required: true,
                      admin: { placeholder: '+421 2 5478 9630' },
                      validate: (value: string | null | undefined) =>
                        !value ||
                        /^\+?[\d\s()-]{6,}$/.test(value) ||
                        'Nieprawidłowy numer telefonu',
                    },
                    {
                      name: 'label',
                      type: 'text',
                      label: 'Opis (opcjonalnie)',
                      localized: true,
                      admin: { placeholder: 'np. biuro, komórka' },
                    },
                  ],
                },
              ],
            },
            {
              name: 'emails',
              type: 'array',
              label: 'Adresy e-mail',
              labels: { singular: 'E-mail', plural: 'E-maile' },
              admin: { description: 'Pierwszy adres jest pokazywany w stopce i menu mobilnym.' },
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'email', type: 'email', label: 'E-mail', required: true },
                    { name: 'label', type: 'text', label: 'Opis (opcjonalnie)', localized: true },
                  ],
                },
              ],
            },
            {
              name: 'openingHours',
              type: 'text',
              label: 'Godziny otwarcia',
              localized: true,
              admin: { placeholder: 'pon.–pt.: 8:00 – 16:00' },
            },
            {
              name: 'social',
              type: 'group',
              label: 'Media społecznościowe',
              admin: { description: 'Puste pola są ukrywane na stronie.' },
              fields: [
                { name: 'facebook', type: 'text', label: 'Facebook (URL)' },
                { name: 'instagram', type: 'text', label: 'Instagram (URL)' },
                { name: 'linkedin', type: 'text', label: 'LinkedIn (URL)' },
              ],
            },
          ],
        },
        {
          label: 'FAQ',
          fields: [
            {
              name: 'faq',
              type: 'array',
              label: 'Najczęściej zadawane pytania (strona Kontakt)',
              labels: { singular: 'Pytanie', plural: 'Pytania' },
              localized: true,
              admin: {
                description:
                  'Osobna lista dla każdego języka (przełącz język u góry strony). Sekcja jest ukryta, gdy lista jest pusta.',
              },
              fields: [
                { name: 'question', type: 'text', label: 'Pytanie', required: true },
                { name: 'answer', type: 'textarea', label: 'Odpowiedź', required: true },
              ],
            },
          ],
        },
      ],
    },
  ],
}
