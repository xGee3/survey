import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import ClientOnly from '@/components/ClientOnly'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Parking Customer Survey',
  description: 'Share your parking experience with us',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#dc2626',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Handle browser extension attributes that cause hydration mismatches
              if (typeof window !== 'undefined') {
                const body = document.body;
                if (body) {
                  // Remove Grammarly attributes that cause hydration issues
                  body.removeAttribute('data-new-gr-c-s-check-loaded');
                  body.removeAttribute('data-gr-ext-installed');
                }
              }
            `,
          }}
        />
      </head>
      <body className={inter.className} suppressHydrationWarning={true}>
        {children}
      </body>
    </html>
  )
}
