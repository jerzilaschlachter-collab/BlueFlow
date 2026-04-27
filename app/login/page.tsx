'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import Logo from '@/components/Logo'

function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null)
  const [refCode, setRefCode] = useState('')
  const [showRefField, setShowRefField] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  useEffect(() => {
    const ref = searchParams.get('ref')
    if (ref) {
      setRefCode(ref.toUpperCase())
      setShowRefField(true)
      setIsSignUp(true)
    }
  }, [searchParams])

  const handleEmailAuth = async () => {
    if (!email || !password) {
      setMessage({ type: 'error', text: 'Please fill in all fields.' })
      return
    }
    setLoading(true)
    setMessage(null)

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            referred_by_affiliate_code: refCode.trim().toUpperCase() || null,
          },
        },
      })
      if (error) {
        setMessage({ type: 'error', text: error.message })
      } else {
        setMessage({ type: 'success', text: 'Check your email to confirm your account.' })
      }
    } else {
      const { error, data } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setMessage({ type: 'error', text: error.message })
      } else {
        const { data: profile } = await supabase
          .from('users')
          .select('setup_completed')
          .eq('id', data.user.id)
          .single()
        router.push(profile?.setup_completed ? '/dashboard' : '/setup')
        router.refresh()
      }
    }

    setLoading(false)
  }

  const handleGoogleAuth = async () => {
    setLoading(true)
    const code = refCode.trim().toUpperCase()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback${code ? `?ref=${code}` : ''}`,
      },
    })
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleEmailAuth()
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center px-4">
      <Link href="/" className="flex items-center mb-10">
        <Logo size={200} />
      </Link>

      <div className="w-full max-w-sm bg-white border border-[#E2E8F0] rounded-2xl p-8 shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
        <h1 className="text-[#0A0E27] font-bold text-2xl mb-1">
          {isSignUp ? 'Create account' : 'Welcome back'}
        </h1>
        <p className="text-[#64748B] text-sm mb-7">
          {isSignUp ? 'Start analyzing charts for free.' : 'Sign in to your BlueFlow account.'}
        </p>

        {/* Google */}
        <button
          onClick={handleGoogleAuth}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 border border-[#E2E8F0] rounded-xl py-3 text-sm text-[#0A0E27] hover:bg-[#F8FAFC] transition-colors disabled:opacity-50 mb-5"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Continue with Google
        </button>

        <div className="relative mb-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#E2E8F0]" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-white px-2 text-[#94A3B8]">or continue with email</span>
          </div>
        </div>

        <div className="space-y-3 mb-4">
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-4 py-3 text-[#0A0E27] text-sm placeholder-[#94A3B8] focus:outline-none focus:border-[#0033CC] transition-colors"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-4 py-3 text-[#0A0E27] text-sm placeholder-[#94A3B8] focus:outline-none focus:border-[#0033CC] transition-colors"
          />

          {/* Referral code field */}
          {isSignUp && (
            showRefField ? (
              <input
                type="text"
                placeholder="Referral code (optional)"
                value={refCode}
                onChange={(e) => setRefCode(e.target.value.toUpperCase())}
                className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-4 py-3 text-[#0A0E27] text-sm placeholder-[#94A3B8] focus:outline-none focus:border-[#0033CC] transition-colors font-mono tracking-widest"
              />
            ) : (
              <button
                type="button"
                onClick={() => setShowRefField(true)}
                className="text-xs text-[#94A3B8] hover:text-[#00AAFF] transition-colors text-left"
              >
                Have a referral code?
              </button>
            )
          )}
        </div>

        {message && (
          <div
            className={`text-sm px-4 py-3 rounded-xl mb-4 ${
              message.type === 'error'
                ? 'bg-red-500/10 border border-red-500/20 text-red-500'
                : 'bg-green-500/10 border border-green-500/20 text-green-600'
            }`}
          >
            {message.text}
          </div>
        )}

        <button
          onClick={handleEmailAuth}
          disabled={loading}
          className="w-full gradient-bg text-white rounded-xl py-3 text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {loading ? 'Please wait...' : isSignUp ? 'Create account' : 'Sign in'}
        </button>

        <p className="text-center text-[#64748B] text-sm mt-5">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            onClick={() => {
              setIsSignUp(!isSignUp)
              setMessage(null)
            }}
            className="text-[#00AAFF] hover:underline"
          >
            {isSignUp ? 'Sign in' : 'Sign up'}
          </button>
        </p>
      </div>

      <p className="text-[#94A3B8] text-xs mt-6 text-center max-w-xs">
        By continuing, you agree to our Terms of Service and Privacy Policy.
      </p>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
