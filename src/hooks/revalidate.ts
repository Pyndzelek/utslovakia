import { revalidateTag } from 'next/cache'
import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  GlobalAfterChangeHook,
} from 'payload'

/**
 * Evicts the `unstable_cache` tags used by `src/lib/data/*` whenever a document changes,
 * so CMS edits show on the site immediately. Skipped when `context.disableRevalidate` is
 * set (CLI scripts have no Next.js request context).
 */
function revalidate(tags: string[], context: Record<string, unknown>) {
  if (context.disableRevalidate) return
  for (const tag of tags) revalidateTag(tag, 'max')
}

export const revalidateCollection = (
  ...tags: string[]
): { afterChange: CollectionAfterChangeHook[]; afterDelete: CollectionAfterDeleteHook[] } => ({
  afterChange: [({ context }) => revalidate(tags, context)],
  afterDelete: [({ context }) => revalidate(tags, context)],
})

export const revalidateGlobal =
  (...tags: string[]): GlobalAfterChangeHook =>
  ({ context }) =>
    revalidate(tags, context)
