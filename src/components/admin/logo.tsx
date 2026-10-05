import Image from 'next/image'
import React from 'react'

export function Logo() {
  return (
    // White card so the logo's white background reads as intentional on the dark admin theme.
    <div
      style={{
        background: '#fff',
        borderRadius: 16,
        padding: '20px 28px',
        boxShadow: '0 8px 24px rgb(0 0 0 / 0.25)',
      }}
    >
      <Image
        src="/uts_logo.webp"
        alt="Logo"
        width={1280}
        height={290}
        style={{ display: 'block', width: '100%', height: 'auto', borderRadius: 8 }}
      />
    </div>
  )
}
