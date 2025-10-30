import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '@/styles/globals.css'
import ShowControlButton from '@/components/ShowControlButton'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'vMix Automation Dashboard',
  description: 'Automatiza y controla tu show de vMix con precisión',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        {children}
        {/* Botón flotante de control del show */}
        <ShowControlButton />
      </body>
    </html>
  )
}
