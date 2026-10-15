/**
 * Layout of the product import workbook — shared by `template.ts` (writes it) and `import.ts`
 * (reads it), so the two can't drift. The importer finds columns by their header text, so
 * reordering columns in Excel is harmless; renaming a header is not.
 */
import type { Product } from '@/payload-types'

export const SHEET = {
  instructions: 'Instructions',
  products: 'Products',
  images: 'Images',
  variants: 'Variants',
  lists: 'Lists',
} as const

/** Row 1 = headers, row 2 = short hints, data starts on row 3. */
export const HEADER_ROW = 1
export const FIRST_DATA_ROW = 3
/** Rows the template pre-formats with dropdowns. */
export const TEMPLATE_ROWS = 1000

/** Example rows ship in the template; the importer skips any SKU starting with this. */
export const EXAMPLE_SKU_PREFIX = 'EXAMPLE-'

// Dropdown label (what the customer sees) → stored value.
export const STATUS: Record<string, Product['status']> = {
  Published: 'published',
  Draft: 'draft',
  Archived: 'archived',
}
export const BADGE: Record<string, NonNullable<Product['badge']>> = {
  New: 'new',
  Bestseller: 'bestseller',
}
export const STOCK: Record<string, Product['stockStatus']> = {
  'In stock': 'in_stock',
  'Out of stock': 'out_of_stock',
  'Pre-order': 'preorder',
}
type VariantStock = NonNullable<NonNullable<Product['variants']>[number]['stockStatus']>
export const VARIANT_STOCK: Record<string, VariantStock> = {
  'Same as product': 'inherit',
  ...STOCK,
}

export const CURRENCIES = ['PLN', 'EUR', 'USD', 'BRL'] as const
export const KEY_FEATURE_COUNT = 10
export const CATEGORY_COUNT = 3

/** Columns of the hidden Lists sheet that dropdowns point at. */
export type ListName = 'status' | 'badge' | 'stock' | 'variantStock' | 'categories' | 'brands'

export type Column = {
  key: string
  header: string
  hint: string
  /** Longer explanation, shown as a cell note on the header. */
  note: string
  width: number
  required?: boolean
  multiline?: boolean
  list?: ListName
  example?: string | number
}

export const PRODUCT_COLUMNS: Column[] = [
  {
    key: 'sku',
    header: 'SKU',
    hint: 'Unique product code',
    note: 'Unique catalogue number. Used to match the product on re-import — never reuse one SKU for two products.',
    width: 18,
    required: true,
    example: 'EXAMPLE-001',
  },
  {
    key: 'title',
    header: 'Product name',
    hint: 'Name shown on the website',
    note: 'Product name in English, as it should appear on the website.',
    width: 36,
    required: true,
    example: 'JCM UBA-10-SS Banknote Validator',
  },
  {
    key: 'brand',
    header: 'Brand',
    hint: 'Pick or type a new one',
    note: 'Manufacturer. Pick from the list, or type a new brand name — it will be created.',
    width: 22,
    list: 'brands',
    example: 'JCM Global',
  },
  ...Array.from({ length: CATEGORY_COUNT }, (_, i): Column => ({
    key: `category${i + 1}`,
    header: `Category ${i + 1}`,
    hint: i === 0 ? 'Pick from the list' : 'Optional extra category',
    note: 'Pick an existing category from the list. New categories must be created on the website first.',
    width: 24,
    required: i === 0,
    list: 'categories',
  })),
  {
    key: 'description',
    header: 'Description',
    hint: 'Full description (Alt+Enter = new line)',
    note: 'Full product description in English. Use Alt+Enter (Mac: Option+Enter) for a new line. Put bullet-point features in the "Key feature" columns instead.',
    width: 60,
    required: true,
    multiline: true,
    example:
      'Compact bill validator for gaming and vending machines.\nAccepts up to 4 orientations of banknotes.',
  },
  ...Array.from({ length: KEY_FEATURE_COUNT }, (_, i): Column => ({
    key: `feature${i + 1}`,
    header: `Key feature ${i + 1}`,
    hint: 'One short bullet point',
    note: 'One short bullet point per column, shown as a list on the product page. Leave unused columns empty.',
    width: 30,
    example: ['Speed: 2.5 s per note', 'Stacker: 500 notes'][i],
  })),
  ...CURRENCIES.map((c): Column => ({
    key: `price${c}`,
    header: `Price ${c}`,
    hint: c === 'PLN' ? 'Required, number only' : 'Optional, number only',
    note: `Base price in ${c}, number only (e.g. 1299.99), no currency sign.${c === 'PLN' ? ' Required.' : ' Leave empty if not sold in this currency.'}`,
    width: 12,
    required: c === 'PLN',
    example: { PLN: 1299, EUR: 299, USD: 329, BRL: '' }[c],
  })),
  {
    key: 'warranty',
    header: 'Warranty (months)',
    hint: 'Whole number, e.g. 12',
    note: 'Warranty in months (whole number). Leave empty or 0 to hide warranty on the website.',
    width: 12,
    example: 12,
  },
  {
    key: 'stockStatus',
    header: 'Availability',
    hint: 'Empty = In stock',
    note: 'In stock / Out of stock / Pre-order. Empty means "In stock".',
    width: 14,
    list: 'stock',
    example: 'In stock',
  },
  {
    key: 'badge',
    header: 'Badge',
    hint: 'Optional label',
    note: 'Optional label on the product card: New or Bestseller.',
    width: 12,
    list: 'badge',
    example: 'New',
  },
  {
    key: 'link',
    header: 'Buy link (eBay)',
    hint: 'Full https:// link, optional',
    note: 'Full link to the eBay listing, starting with https://. Without a link the page shows an "Ask for an offer" button.',
    width: 30,
  },
  {
    key: 'status',
    header: 'Status',
    hint: 'Empty = Published',
    note: 'Published = visible on the website, Draft = hidden until ready, Archived = discontinued. Empty means "Published".',
    width: 12,
    list: 'status',
    example: 'Published',
  },
  {
    key: 'slug',
    header: 'URL slug',
    hint: 'Optional — auto from name',
    note: 'Part of the product web address (/products/<slug>). Leave empty to generate it from the product name.',
    width: 24,
  },
  {
    key: 'seoTitle',
    header: 'SEO title',
    hint: 'Optional, ~50–60 chars',
    note: 'Title shown in Google results (about 50–60 characters). Empty = product name.',
    width: 30,
  },
  {
    key: 'seoDescription',
    header: 'SEO description',
    hint: 'Optional, ~120–155 chars',
    note: 'Description shown in Google results (about 120–155 characters). Empty = start of the description.',
    width: 40,
    multiline: true,
  },
  {
    key: 'seoImage',
    header: 'SEO share image',
    hint: 'Optional file name or link',
    note: 'Image shown when the link is shared on Facebook/WhatsApp — a file name from the photos folder or a direct https:// link. Empty = first product photo.',
    width: 24,
  },
  {
    key: 'notes',
    header: 'Notes (not imported)',
    hint: 'Anything for us',
    note: 'Free-text notes for the website team. Not imported.',
    width: 30,
  },
]

export const IMAGE_COLUMNS: Column[] = [
  {
    key: 'sku',
    header: 'Product SKU',
    hint: 'SKU from the Products sheet',
    note: 'SKU of the product this photo belongs to (must exist on the Products sheet).',
    width: 18,
    required: true,
    example: 'EXAMPLE-001',
  },
  {
    key: 'image',
    header: 'Photo file name or link',
    hint: 'e.g. uba10-front.jpg',
    note: 'File name of a photo in the folder you send back with this sheet (e.g. uba10-front.jpg), or a direct https:// link to the image file. One photo per row; the first row of a product is its main photo.',
    width: 36,
    required: true,
    example: 'uba10-front.jpg',
  },
  {
    key: 'alt',
    header: 'Photo description',
    hint: 'Optional — what the photo shows',
    note: 'Short description of what is in the photo (read by Google and screen readers), e.g. "UBA-10 front view". Empty = product name.',
    width: 36,
    example: 'UBA-10-SS validator, front view',
  },
]

export const VARIANT_COLUMNS: Column[] = [
  {
    key: 'sku',
    header: 'Product SKU',
    hint: 'SKU from the Products sheet',
    note: 'SKU of the parent product (must exist on the Products sheet). One row per variant, in display order.',
    width: 18,
    required: true,
    example: 'EXAMPLE-001',
  },
  {
    key: 'modelName',
    header: 'Variant name',
    hint: 'e.g. colour, size, model',
    note: 'Name of this version of the product, e.g. "EUR bezel" or "Model L".',
    width: 30,
    required: true,
    example: 'EUR version',
  },
  {
    key: 'variantSku',
    header: 'Variant SKU',
    hint: 'Optional',
    note: 'Optional catalogue number of this variant.',
    width: 18,
    example: 'EXAMPLE-001-EUR',
  },
  {
    key: 'stockStatus',
    header: 'Availability',
    hint: 'Empty = Same as product',
    note: 'Leave empty (or "Same as product") to use the product availability.',
    width: 16,
    list: 'variantStock',
    example: 'Same as product',
  },
  ...CURRENCIES.map((c): Column => ({
    key: `price${c}`,
    header: `Price ${c}`,
    hint: 'Only if different',
    note: `Fill only if this variant costs something different from the product's ${c} price. Empty = same as product.`,
    width: 12,
    example: c === 'PLN' ? 1399 : '',
  })),
]
