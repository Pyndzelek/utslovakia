/**
 * Writes the Excel workbook customers fill in to add many products at once (English only).
 *
 *   pnpm payload run scripts/product-sheet/template.ts -- [out.xlsx] [--offline]
 *
 * Category and brand dropdowns are filled from the database, so run it against the database
 * the sheet will be imported into. `--offline` skips the database (category/brand cells are
 * then free text). Read it back with `import.ts`.
 */
import ExcelJS from 'exceljs'
import {
  BADGE,
  EXAMPLE_SKU_PREFIX,
  FIRST_DATA_ROW,
  HEADER_ROW,
  IMAGE_COLUMNS,
  PRODUCT_COLUMNS,
  SHEET,
  STATUS,
  STOCK,
  TEMPLATE_ROWS,
  VARIANT_COLUMNS,
  VARIANT_STOCK,
  type Column,
  type ListName,
} from './columns'

const args = process.argv.slice(2).filter((a) => a !== '--')
const offline = args.includes('--offline')
const out = args.find((a) => !a.startsWith('--')) ?? 'product-import-template.xlsx'

async function loadLists(): Promise<{ categories: string[]; brands: string[] }> {
  if (offline) return { categories: [], brands: [] }
  // Imported lazily: the config reads DATABASE_URL etc. at import time.
  const [{ getPayload }, { default: config }] = await Promise.all([
    import('payload'),
    import('@payload-config'),
  ])
  const payload = await getPayload({ config })
  const [categories, brands] = await Promise.all([
    payload.find({
      collection: 'categories',
      where: { status: { equals: 'active' } },
      locale: 'en',
      sort: 'order',
      limit: 0,
      depth: 0,
    }),
    payload.find({ collection: 'brands', sort: 'name', limit: 0, depth: 0 }),
  ])
  return {
    categories: categories.docs.map((c) => c.name).filter(Boolean),
    brands: brands.docs.map((b) => b.name),
  }
}

const { categories, brands } = await loadLists()

const lists: Record<ListName, string[]> = {
  status: Object.keys(STATUS),
  badge: Object.keys(BADGE),
  stock: Object.keys(STOCK),
  variantStock: Object.keys(VARIANT_STOCK),
  categories,
  brands,
}

const wb = new ExcelJS.Workbook()
wb.creator = 'UTSlovakia'

const COLOR = {
  required: 'FFF4B183',
  optional: 'FFD9E1F2',
  hint: 'FF7F7F7F',
  example: 'FFF2F2F2',
}

// ---- Instructions ----
const intro = wb.addWorksheet(SHEET.instructions, {
  properties: { tabColor: { argb: 'FF2F5597' } },
})
intro.getColumn(1).width = 110
const lines: [string, 'title' | 'heading' | 'text'][] = [
  ['UTSlovakia — product import sheet', 'title'],
  ['Please fill in all texts in English.', 'text'],
  ['', 'text'],
  ['How to fill it in', 'heading'],
  [
    '1. "Products" sheet — one row per product. Orange columns are required, blue ones optional.',
    'text',
  ],
  [
    '2. "Images" sheet — one row per photo. The first photo listed for a product is its main photo.',
    'text',
  ],
  [
    '3. "Variants" sheet — one row per variant (model / colour / size), only for products that have them.',
    'text',
  ],
  [
    '4. Rows starting with SKU "EXAMPLE-…" show how to fill a row and are ignored — overwrite or delete them.',
    'text',
  ],
  [
    '5. Hover over a column header to see a detailed explanation. Row 2 under each header is a short hint.',
    'text',
  ],
  ['', 'text'],
  ['Photos', 'heading'],
  ['• Put all photos in one folder, zip it and send it back together with this sheet.', 'text'],
  ['• On the "Images" sheet, write each photo’s exact file name (e.g. uba10-front.jpg).', 'text'],
  [
    '• Alternatively, paste a direct https:// link to the image file (not a Google Drive / Dropbox page).',
    'text',
  ],
  ['• JPG, PNG or WEBP. Any size is fine — photos are resized automatically.', 'text'],
  ['', 'text'],
  ['Good to know', 'heading'],
  [
    '• Prices: numbers only, no currency sign (1299.99). PLN is required; EUR, USD and BRL are optional.',
    'text',
  ],
  [
    '• Variant prices: fill only the currencies where a variant costs something different from the product.',
    'text',
  ],
  [
    '• Categories: pick from the dropdown. Need a new category? Tell us in the "Notes" column.',
    'text',
  ],
  ['• Brand: pick from the dropdown or type a new brand name.', 'text'],
  ['• New line inside a cell: Alt+Enter (Windows) or Option+Enter (Mac).', 'text'],
  ['• Please do not rename, delete or reorder the sheets or the header rows.', 'text'],
]
for (const [text, kind] of lines) {
  const row = intro.addRow([text])
  row.font =
    kind === 'title' ? { size: 16, bold: true } : kind === 'heading' ? { size: 12, bold: true } : {}
}

// ---- Lists (dropdown sources) ----
const listSheet = wb.addWorksheet(SHEET.lists, { state: 'hidden' })
const listRefs = {} as Record<ListName, string | undefined>
;(Object.keys(lists) as ListName[]).forEach((name, i) => {
  const col = listSheet.getColumn(i + 1)
  col.width = 30
  listSheet.getCell(1, i + 1).value = name
  lists[name].forEach((v, j) => (listSheet.getCell(j + 2, i + 1).value = v))
  const letter = col.letter
  listRefs[name] = lists[name].length
    ? `${SHEET.lists}!$${letter}$2:$${letter}$${lists[name].length + 1}`
    : undefined
})

// ---- Data sheets ----
// Present at runtime but missing from ExcelJS's typings.
type WithValidations = {
  dataValidations: { add: (range: string, rule: ExcelJS.DataValidation) => void }
}

function dataSheet(name: string, columns: Column[], tabColor: string) {
  const ws = wb.addWorksheet(name, {
    properties: { tabColor: { argb: tabColor } },
    views: [{ state: 'frozen', xSplit: 1, ySplit: FIRST_DATA_ROW - 1 }],
  })
  columns.forEach((c, i) => {
    const n = i + 1
    ws.getColumn(n).width = c.width
    ws.getColumn(n).alignment = { vertical: 'top', wrapText: c.multiline }

    const header = ws.getCell(HEADER_ROW, n)
    header.value = c.header
    header.font = { bold: true }
    header.alignment = { vertical: 'middle', wrapText: true }
    header.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: c.required ? COLOR.required : COLOR.optional },
    }
    header.note = `${c.required ? 'REQUIRED. ' : ''}${c.note}`

    const hint = ws.getCell(HEADER_ROW + 1, n)
    hint.value = c.required ? `Required — ${c.hint}` : c.hint
    hint.font = { italic: true, size: 9, color: { argb: COLOR.hint } }
    hint.alignment = { vertical: 'top', wrapText: true }

    if (c.example !== undefined && c.example !== '') {
      const cell = ws.getCell(FIRST_DATA_ROW, n)
      cell.value = c.example
      cell.font = { italic: true, color: { argb: COLOR.hint } }
    }

    const ref = c.list && listRefs[c.list]
    if (c.list && ref) {
      // Brands accept new names; categories warn (unknown ones fail the import); enums are strict.
      const errorStyle =
        c.list === 'brands' ? 'information' : c.list === 'categories' ? 'warning' : 'stop'
      // One range-wide rule: ExcelJS's per-cell merging emits overlapping ranges Excel rejects.
      const letter = ws.getColumn(n).letter
      const range = `${letter}${FIRST_DATA_ROW}:${letter}${FIRST_DATA_ROW + TEMPLATE_ROWS - 1}`
      ;(ws as unknown as WithValidations).dataValidations.add(range, {
        type: 'list',
        allowBlank: true,
        formulae: [ref],
        showErrorMessage: true,
        errorStyle,
        errorTitle: c.header,
        error:
          c.list === 'brands'
            ? 'This brand is new — it will be created.'
            : c.list === 'categories'
              ? 'Unknown category. Pick one from the list, or tell us about it in "Notes".'
              : 'Please pick a value from the list.',
      })
    }
  })
  ws.getRow(HEADER_ROW).height = 32
  ws.getRow(HEADER_ROW + 1).height = 26
  ws.getRow(FIRST_DATA_ROW).eachCell((cell) => {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR.example } }
  })
  ws.autoFilter = {
    from: { row: HEADER_ROW, column: 1 },
    to: { row: HEADER_ROW, column: columns.length },
  }
  return ws
}

dataSheet(SHEET.products, PRODUCT_COLUMNS, 'FFC55A11')
const images = dataSheet(SHEET.images, IMAGE_COLUMNS, 'FF548235')
// A second example photo, to show that one product gets several rows.
images.addRow([`${EXAMPLE_SKU_PREFIX}001`, 'uba10-side.jpg', 'UBA-10-SS validator, side view'])
images.getRow(FIRST_DATA_ROW + 1).eachCell((cell) => {
  cell.font = { italic: true, color: { argb: COLOR.hint } }
  cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR.example } }
})
dataSheet(SHEET.variants, VARIANT_COLUMNS, 'FF7030A0')

// Open on the Instructions tab.
wb.views = [
  { x: 0, y: 0, width: 20000, height: 12000, firstSheet: 0, activeTab: 0, visibility: 'visible' },
]
await wb.xlsx.writeFile(out)
console.log(
  `Wrote ${out}` +
    (offline
      ? ' (offline: no category/brand dropdowns)'
      : ` — ${categories.length} categories, ${brands.length} brands in dropdowns`),
)
process.exit(0)
