'use client'

import { motion } from 'motion/react'
import type { ReactNode } from 'react'

/**
 * Thin client wrapper that fades/slides a server-rendered item into view on
 * scroll, with an index-based stagger. Keeps the parent list and its items
 * as server components — only this leaf carries the `'use client'` boundary
 * and the `motion` import.
 */
export function RevealOnScroll({ index = 0, children }: { index?: number; children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.35, delay: Math.min(index, 8) * 0.04, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  )
}
