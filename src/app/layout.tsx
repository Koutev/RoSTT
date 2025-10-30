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
    <html lang="es" suppressHydrationWarning>
      <body className={inter.className}>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function(){
                try {
                  var theme = localStorage.getItem('theme');
                  if (!theme && window.matchMedia) {
                    theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                  }
                  if (theme === 'dark') document.documentElement.classList.add('dark');
                } catch (e) {}
              })();
            `,
          }}
        />
        {children}
        {/* Botón flotante de control del show */}
        <ShowControlButton />
      </body>
    </html>
  )
}
