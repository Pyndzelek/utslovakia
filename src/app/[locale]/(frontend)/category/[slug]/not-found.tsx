import React from 'react'
import { NotFoundView } from '@/components/layout/not-found-view'

export default function CategoryNotFound() {
  return (
    <NotFoundView
      title="This category doesn't exist"
      description="The category you're looking for may have been renamed or removed. Browse the full catalog or jump back to the homepage."
    />
  )
}
