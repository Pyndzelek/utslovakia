import { notFound } from 'next/navigation'

/** Any unmatched URL under a locale renders the localized `not-found.tsx`, not Next's default 404. */
export default function CatchAllPage() {
  notFound()
}
