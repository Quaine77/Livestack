import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'LiveStack — Livestock Management Platform',
  description: 'Tag it. Track it. Protect it. Jamaica livestock chain-of-custody platform.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  )
}
