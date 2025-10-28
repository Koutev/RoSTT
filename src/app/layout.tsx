import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '@/styles/globals.css'

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
        {/* Botón flotante iniciar show */}
        <div className="fixed bottom-6 right-6 z-50">
          <a href="#" className="inline-flex items-center justify-center h-12 px-5 rounded-full bg-primary text-primary-foreground shadow-lg">
            Iniciar show
          </a>
        </div>
      </body>
    </html>
  )
}
