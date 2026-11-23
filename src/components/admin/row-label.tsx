'use client'

import React from 'react'
import { useRowLabel } from '@payloadcms/ui'

/**
 * Header of a collapsed array row in the admin: the value of one of the row's own fields
 * (e.g. a variant's model name) instead of Payload's generic "Model 01", so editors can find
 * a row without opening each one. Wired up per array field via
 * `admin.components.RowLabel` with `clientProps: { field, fallback }`.
 */
export function RowLabel({ field, fallback }: { field: string; fallback: string }) {
  const { data, rowNumber } = useRowLabel<Record<string, unknown>>()
  const value = data?.[field]
  const number = String((rowNumber ?? 0) + 1).padStart(2, '0')

  return (
    <span>
      {typeof value === 'string' && value.trim() ? value.trim() : `${fallback} ${number}`}
    </span>
  )
}
