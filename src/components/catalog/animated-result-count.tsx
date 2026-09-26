'use client'

import { motion, AnimatePresence } from 'motion/react'

export function AnimatedResultCount({ text, count }: { text: string; count: number }) {
  return (
    <p className="hidden text-sm whitespace-nowrap text-slate-400 md:block">
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={count}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 4 }}
          transition={{ duration: 0.15 }}
          className="inline-block"
        >
          {text}
        </motion.span>
      </AnimatePresence>
    </p>
  )
}
