import React from 'react'
import './styles.css'

export const metadata = {
  description: 'Utslovakia',
  title: 'Utslovakia 1.0',
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props

  return (
    <html lang="en">
      <body>
        <main>{children}</main>
      </body>
    </html>
  )
}
