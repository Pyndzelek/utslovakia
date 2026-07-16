'use client'

import React, { useState } from 'react'
import { Minus, Plus } from 'lucide-react'

/** Visual-only quantity selector. */
export function QuantityPicker() {
  const [quantity, setQuantity] = useState(1)

  return (
    <div className="flex h-12 items-center rounded-full border border-line bg-white">
      <button
        type="button"
        aria-label="Decrease quantity"
        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
        className="flex size-12 cursor-pointer items-center justify-center rounded-full text-slate-500 transition-colors hover:text-navy-900 disabled:opacity-40"
        disabled={quantity <= 1}
      >
        <Minus className="size-4" aria-hidden />
      </button>
      <span className="w-8 text-center text-sm font-semibold text-navy-900" aria-live="polite">
        {quantity}
      </span>
      <button
        type="button"
        aria-label="Increase quantity"
        onClick={() => setQuantity((q) => Math.min(99, q + 1))}
        className="flex size-12 cursor-pointer items-center justify-center rounded-full text-slate-500 transition-colors hover:text-navy-900"
      >
        <Plus className="size-4" aria-hidden />
      </button>
    </div>
  )
}
