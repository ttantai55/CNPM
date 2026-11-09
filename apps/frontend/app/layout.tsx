
import type { Metadata, Viewport } from 'next'
import { Be_Vietnam_Pro } from 'next/font/google'
import './globals.css'
import { ClearLocalStorage } from '@/components/brewlite/clear-local-storage'

const beVietnam = Be_Vietnam_Pro({
  subsets: ['latin', 'vietnamese'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-be-vietnam',
})

export const metadata: Metadata = {
  title: 'BrewLite – Mỗi ngày một vị ngon',
  description:
    'Đặt cà phê, trà sữa và nước ép tươi từ BrewLite. Tùy chỉnh size, đường, đá và topping theo ý bạn.',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#f5f1eb',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="vi" className={beVietnam.variable} suppressHydrationWarning>
      <body className="antialiased" suppressHydrationWarning>
        <ClearLocalStorage />
        {children}
      </body>
    </html>
  )
}
