import React from 'react'
import { NotFoundView } from '@/components/layout/not-found-view'

export default function FrontendNotFound() {
  return (
    <NotFoundView
      title="We couldn't find that page"
      description="The address may be mistyped, or the page has moved. Use the navigation above, or start from one of the links below."
    />
  )
}
