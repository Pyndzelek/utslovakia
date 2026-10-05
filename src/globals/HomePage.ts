import type { GlobalConfig } from 'payload'
import { authenticated } from '@/access'
import { revalidateGlobal } from '@/hooks/revalidate'

export const HOME_PAGE_TAG = 'home-page'

/**
 * Home page content (hero slides). Read on the frontend via `getHeroSlides`
 * (src/lib/data/home-page.ts).
 */
export const HomePage: GlobalConfig = {
  slug: 'home-page',
  label: 'Strona główna',
  admin: {
    group: 'Treści',
    description:
      'Treść sekcji powitalnej na stronie głównej. Zmiany są widoczne na stronie od razu po zapisaniu.',
  },
  access: {
    read: () => true,
    update: authenticated,
  },
  hooks: {
    afterChange: [revalidateGlobal(HOME_PAGE_TAG)],
  },
  fields: [
    {
      name: 'heroSlides',
      type: 'array',
      label: 'Slajdy w sekcji powitalnej',
      labels: { singular: 'Slajd', plural: 'Slajdy' },
      maxRows: 5,
      admin: {
        description:
          'Rotują co 5 sekund. Zdjęcie, marka i kategoria pochodzą z wybranego produktu. Bez slajdów sekcja pokazuje samo hasło i przyciski.',
      },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'word',
              type: 'text',
              label: 'Duże hasło',
              required: true,
              localized: true,
              maxLength: 10,
              admin: {
                placeholder: 'ACCEPT',
                description:
                  'Jedno krótkie słowo (do 10 znaków), osobne dla każdego języka.',
              },
            },
            {
              name: 'product',
              type: 'relationship',
              label: 'Produkt',
              relationTo: 'products',
              // Optional so deleting the product doesn't fail; slides without one are skipped.
              admin: { description: 'Slajd bez produktu jest pomijany.' },
            },
          ],
        },
        {
          name: 'image',
          type: 'upload',
          label: 'Zdjęcie (opcjonalnie)',
          relationTo: 'media',
          admin: {
            description:
              'Najlepiej wycięte zdjęcie produktu (PNG z przezroczystym tłem). Puste pole = pierwsze zdjęcie produktu.',
          },
        },
      ],
    },
  ],
}
