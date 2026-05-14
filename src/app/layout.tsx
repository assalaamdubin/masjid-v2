import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { headers } from 'next/headers'

const inter = Inter({ subsets: ['latin'], weight: ['300', '400', '500', '600', '700'], display: 'swap', variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'As-Salaam Mosque Management System',
  description: 'Sistem Manajemen Masjid Al-Salam Kintamani Duta Bintaro',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const headersList = await headers()
  const nonce = headersList.get('x-nonce') ?? ''

  return (
    <html lang="id">
      <head>
        <meta httpEquiv="Content-Security-Policy" 
          content={`script-src 'self' 'nonce-${nonce}'`} />
      </head>
      <body className={inter.variable + " font-sans"} suppressHydrationWarning>
        {children}
      </body>
    </html>
  )
}
