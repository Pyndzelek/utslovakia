import type { RowLabelComponent } from 'payload'

/**
 * `admin.components.RowLabel` for an array field: titles each row with the value of its
 * `field` sub-field (falling back to "<fallback> 01"), via src/components/admin/row-label.tsx.
 */
export const rowLabel = (field: string, fallback: string): RowLabelComponent => ({
  path: '/components/admin/row-label#RowLabel',
  clientProps: { field, fallback },
})
