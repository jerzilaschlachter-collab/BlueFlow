'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function Navbar() {
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

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
    <nav className="border-b border-zinc-900 bg-black/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-sm">BF</span>
          </div>
          <span className="text-white font-bold text-xl tracking-tight">BlueFlow</span>
        </Link>

        {/* Links */}
        <div className="hidden sm:flex items-center gap-1">
          {[
            { href: '/dashboard', label: 'Dashboard' },
            { href: '/pricing', label: 'Pricing' },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                pathname === link.href
                  ? 'text-white bg-zinc-900'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => setOpen(!open)}
            className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl border border-zinc-800 hover:border-zinc-700 transition-colors"
          >
            <div className="w-7 h-7 rounded-full gradient-bg flex items-center justify-center text-white text-xs font-bold">
              {initial}
            </div>
            <span className="text-zinc-300 text-sm hidden sm:block max-w-[140px] truncate">
              {userEmail}
            </span>
            <svg
              className={`w-4 h-4 text-zinc-500 transition-transform ${open ? 'rotate-180' : ''}`}
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
              <div className="absolute right-0 top-full mt-2 w-52 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl z-20 overflow-hidden">
                <div className="px-4 py-3 border-b border-zinc-800">
                  <p className="text-zinc-500 text-xs">Signed in as</p>
                  <p className="text-white text-sm font-medium truncate">{userEmail}</p>
                </div>
                <div className="p-1">
                  <Link
                    href="/pricing"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2 w-full text-left px-3 py-2 rounded-lg text-zinc-300 text-sm hover:bg-zinc-800 hover:text-white transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Upgrade plan
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-2 w-full text-left px-3 py-2 rounded-lg text-red-400 text-sm hover:bg-red-500/10 transition-colors"
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
    </nav>
  )
}
