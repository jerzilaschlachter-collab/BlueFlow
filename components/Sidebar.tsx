'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Logo from '@/components/Logo'
import { useTheme } from '@/components/ThemeProvider'
import { useAnalyzing } from '@/lib/contexts/AnalyzingContext'

const navLinks = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    href: '/dashboard/history',
    label: 'History',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    href: '/dashboard/news',
    label: 'Market News',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
      </svg>
    ),
  },
]

export default function Sidebar() {
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
    <aside className="fixed inset-y-0 left-0 w-60 flex flex-col border-r border-[#E2E8F0] dark:border-[#1E2D45] bg-white dark:bg-[#0D1220] z-40 transition-all duration-300" style={{ boxShadow: '1px 0 12px rgba(0,0,0,0.05)' }}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 h-16 border-b border-[#E2E8F0] dark:border-[#1E2D45] shrink-0">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className={isAnalyzing ? 'flame-pulse-glow rounded-full p-1' : ''}>
            <Logo
              size={42}
              className="flame-float flex-shrink-0"
              style={{ filter: 'drop-shadow(0 0 8px rgba(0,82,255,0.35))' }}
            />
          </div>
          <span className="font-semibold text-[#0A0E27] dark:text-[#F0F4FF] text-[15px] tracking-tight">BlueFlow</span>
        </Link>
      </div>

      {isAnalyzing && (
        <div className="mx-5 mt-3">
          <p className="text-[#0052FF] text-xs font-medium">Analyzing chart...</p>
        </div>
      )}

      {/* Nav links */}
      <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-0.5">
        {navLinks.map((link) => {
          const active = pathname === link.href
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2.5 text-sm transition-all duration-200 relative group ${
                active
                  ? 'text-[#0052FF] dark:text-[#5B8FFF] font-medium'
                  : 'text-[#94A3B8] dark:text-[#4A5A75] hover:text-[#334155] dark:hover:text-[#A0B4CC] font-normal'
              }`}
            >
              {active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-[#0052FF] dark:bg-[#5B8FFF] rounded-full" />
              )}
              <span>{link.icon}</span>
              {link.label}
            </Link>
          )
        })}
      </nav>

      {/* Bottom section */}
      <div className="px-4 pb-5 space-y-1 border-t border-[#E2E8F0] dark:border-[#1E2D45] pt-4">
        {/* Theme toggle */}
        <button
          onClick={toggle}
          aria-label="Toggle dark mode"
          className="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-[#94A3B8] dark:text-[#4A5A75] hover:text-[#334155] dark:hover:text-[#A0B4CC] transition-all duration-200"
        >
          {theme === 'dark' ? (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          )}
          {theme === 'dark' ? 'Light mode' : 'Dark mode'}
        </button>

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => setOpen(!open)}
            className="flex items-center gap-2.5 w-full px-3 py-2.5 text-sm hover:opacity-80 transition-all duration-200"
          >
            <div className="w-7 h-7 rounded-full gradient-bg flex items-center justify-center text-white text-xs font-bold shrink-0">
              {initial}
            </div>
            <span className="text-[#334155] dark:text-[#A0B4CC] text-sm truncate flex-1 text-left">
              {userEmail}
            </span>
            <svg
              className={`w-4 h-4 text-[#94A3B8] dark:text-[#4A5A75] transition-transform duration-200 shrink-0 ${open ? 'rotate-180' : ''}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {open && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
              <div className="absolute bottom-full left-0 mb-2 w-full bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#1E2D45] rounded-xl shadow-[0_4px_16px_rgba(0,0,0,0.08)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.4)] z-20 overflow-hidden">
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
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Sign out
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </aside>
  )
}
