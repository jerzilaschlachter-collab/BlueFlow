'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Logo from '@/components/Logo'
import FlameIcon from '@/components/FlameIcon'
import { useTheme } from '@/components/ThemeProvider'
import { useAnalyzing } from '@/lib/contexts/AnalyzingContext'

export default function Navbar() {
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()
  const { theme, toggle } = useTheme()
  const { isAnalyzing } = useAnalyzing()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserEmail(user?.email ?? null)
    })
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const initial = userEmail ? userEmail[0].toUpperCase() : '?'

  return (
    <nav className="border-b border-[#E2E8F0] dark:border-[#1E2D45] bg-white dark:bg-[#0D1220] sticky top-0 z-50" style={{ boxShadow: '0 1px 12px rgba(0,0,0,0.06)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo + Wordmark */}
        <div className="flex items-center gap-2.5">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className={isAnalyzing ? 'flame-pulse-glow rounded-full p-1' : ''}>
              <Logo
                size={56}
                className="flame-float flex-shrink-0"
                style={{ filter: 'drop-shadow(0 0 8px rgba(0,82,255,0.35))' }}
              />
            </div>
          </Link>
          {isAnalyzing && (
            <span className="text-[#0052FF] text-sm font-medium">Analyzing...</span>
          )}
        </div>

        {/* Links */}
        <div className="hidden sm:flex items-center gap-1">
          {[
            { href: '/dashboard', label: 'Dashboard' },
            { href: '/dashboard/history', label: 'History' },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`relative px-3 py-2 rounded-lg text-sm transition-colors ${
                pathname === link.href
                  ? 'text-[#0A0E27] dark:text-[#F0F4FF] bg-[#F1F5F9] dark:bg-[#1A2340]'
                  : 'text-[#64748B] dark:text-[#7A8FAD] hover:text-[#0A0E27] dark:hover:text-[#F0F4FF] hover:bg-[#F8FAFC] dark:hover:bg-[#1A2340]'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {/* Theme toggle */}
          <button
            onClick={toggle}
            aria-label="Toggle dark mode"
            className="w-9 h-9 flex items-center justify-center rounded-lg text-[#64748B] dark:text-[#7A8FAD] hover:bg-[#F1F5F9] dark:hover:bg-[#1A2340] transition-colors"
          >
            {theme === 'dark' ? (
              /* Sun icon */
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
              </svg>
            ) : (
              /* Moon icon */
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>

          {/* User menu */}
          <div className="relative">
            <button
              onClick={() => setOpen(!open)}
              className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl border border-[#E2E8F0] dark:border-[#1E2D45] hover:border-[#CBD5E1] dark:hover:border-[#2A3D5F] transition-colors"
            >
              <div className="w-7 h-7 rounded-full gradient-bg flex items-center justify-center text-white text-xs font-bold">
                {initial}
              </div>
              <span className="text-[#334155] dark:text-[#A0B4CC] text-sm hidden sm:block max-w-[140px] truncate">
                {userEmail}
              </span>
              <svg
                className={`w-4 h-4 text-[#94A3B8] dark:text-[#4A5A75] transition-transform ${open ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {open && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
                <div className="absolute right-0 top-full mt-2 w-52 bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#1E2D45] rounded-xl shadow-[0_4px_16px_rgba(0,0,0,0.08)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.4)] z-20 overflow-hidden">
                  <div className="px-4 py-3 border-b border-[#E2E8F0] dark:border-[#1E2D45]">
                    <p className="text-[#94A3B8] dark:text-[#4A5A75] text-xs">Signed in as</p>
                    <p className="text-[#0A0E27] dark:text-[#F0F4FF] text-sm font-medium truncate">{userEmail}</p>
                  </div>
                  <div className="p-1">
                    <button
                      onClick={handleSignOut}
                      className="flex items-center gap-2 w-full text-left px-3 py-2 rounded-lg text-red-500 text-sm hover:bg-red-500/5 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Sign out
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
