import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from '@/components/ThemeProvider'

export const metadata: Metadata = {
  title: 'BlueFlow — AI Trading Chart Analysis',
  description:
    'Analyze trading charts with AI. Get instant trend analysis, key levels, pattern recognition, and trading bias powered by Claude Vision.',
  keywords: ['trading', 'chart analysis', 'AI', 'technical analysis', 'forex', 'crypto'],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Anti-flash: apply saved/preferred theme before first paint */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark')}}catch(e){}`,
          }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="dark:bg-[#0A0E1F] text-[#0A0E27] dark:text-[#F0F4FF] antialiased">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
