import React from 'react'
import { NotFoundView } from '@/components/layout/not-found-view'

export default function ProductNotFound() {
  return (
    <NotFoundView
      title="This product is no longer available"
      description="It may have been discontinued or replaced by a newer model. Our bestsellers below cover the same jobs — or ask our engineers for the direct successor."
    />
  )
}
