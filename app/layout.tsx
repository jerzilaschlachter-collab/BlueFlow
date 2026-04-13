import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'BlueFlow — AI Trading Chart Analysis',
  description:
    'Analyze trading charts with AI. Get instant trend analysis, key levels, pattern recognition, and trading bias powered by Claude Vision.',
  keywords: ['trading', 'chart analysis', 'AI', 'technical analysis', 'forex', 'crypto'],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-black text-white antialiased">{children}</body>
    </html>
  )
}
