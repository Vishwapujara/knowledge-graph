import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'PtP Knowledge Graph — Journey Explorer',
  description: 'Partners to Parenthood — Ecosystem Knowledge Graph connecting patient journeys with providers',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
