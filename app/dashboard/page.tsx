'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import ChartUpload from '@/components/ChartUpload'
import AnalysisCard from '@/components/AnalysisCard'
import type { User, Analysis } from '@/types'

const TIER_LIMITS: Record<string, number | null> = {
  free: 2,
  pro: null,
  elite: null,
}

const TIER_COLORS: Record<string, string> = {
  free: 'text-zinc-400 bg-zinc-800',
  pro: 'text-[#00AAFF] bg-[#00AAFF]/10',
  elite: 'text-amber-400 bg-amber-400/10',
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [analyses, setAnalyses] = useState<Analysis[]>([])
  const [activeAnalysis, setActiveAnalysis] = useState<Analysis | null>(null)
  const [loading, setLoading] = useState(true)
  const [tradingStyle, setTradingStyle] = useState<string>('swing')
  const [savingStyle, setSavingStyle] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    loadUserData()
  }, [])

  async function loadUserData() {
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser()

    if (!authUser) {
      router.push('/login')
      return
    }

    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUser.id)
      .single()

    if (profile) {
      setUser(profile as User)
      setTradingStyle(profile.trading_style || 'swing')
    }

    const { data: recentAnalyses } = await supabase
      .from('analyses')
      .select('*')
      .eq('user_id', authUser.id)
      .order('created_at', { ascending: false })
      .limit(10)

    if (recentAnalyses) setAnalyses(recentAnalyses as Analysis[])
    setLoading(false)
  }

  async function saveTradingStyle(style: string) {
    if (!user) return
    setSavingStyle(true)
    await supabase.from('users').update({ trading_style: style }).eq('id', user.id)
    setUser((prev) => prev ? { ...prev, trading_style: style as User['trading_style'] } : null)
    setSavingStyle(false)
  }

  function handleAnalysisComplete(analysis: Analysis) {
    setActiveAnalysis(analysis)
    setAnalyses((prev) => [analysis, ...prev])
    setUser((prev) =>
      prev ? { ...prev, analyses_used_this_month: prev.analyses_used_this_month + 1 } : null
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-[#0033CC] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const limit = user ? TIER_LIMITS[user.subscription_tier] : 2
  const used = user?.analyses_used_this_month ?? 0
  const atLimit = limit !== null && used >= limit
  const tierColor = user ? TIER_COLORS[user.subscription_tier] : TIER_COLORS.free

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">
            {user?.full_name ? `Hello, ${user.full_name.split(' ')[0]}` : 'Dashboard'}
          </h1>
          <p className="text-zinc-500 text-sm mt-1">Upload a chart to get AI-powered analysis</p>
        </div>

        <div className="flex items-center gap-3">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full uppercase tracking-wide ${tierColor}`}>
            {user?.subscription_tier || 'free'}
          </span>
          {user?.subscription_tier === 'free' && (
            <Link
              href="/pricing"
              className="gradient-bg text-white text-sm px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity"
            >
              Upgrade
            </Link>
          )}
        </div>
      </div>

      {/* Usage bar */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-zinc-400 text-sm">Analyses this month</span>
          <span className="text-white text-sm font-semibold">
            {limit === null ? `${used} / Unlimited` : `${used} / ${limit}`}
          </span>
        </div>
        {limit !== null && (
          <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full gradient-bg transition-all duration-500"
              style={{ width: `${Math.min((used / limit) * 100, 100)}%` }}
            />
          </div>
        )}
        {atLimit && (
          <p className="text-amber-400 text-sm mt-3">
            Monthly limit reached.{' '}
            <Link href="/pricing" className="text-[#00AAFF] hover:underline">
              Upgrade to Pro
            </Link>{' '}
            for unlimited analyses.
          </p>
        )}
      </div>

      {/* Trading style selector */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-white font-semibold">Trading Style</h2>
            <p className="text-zinc-500 text-xs mt-0.5">AI analysis adapts to your style</p>
          </div>
          {savingStyle && <span className="text-zinc-500 text-xs">Saving...</span>}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { value: 'scalping', label: 'Scalping', desc: '1-5 min' },
            { value: 'day', label: 'Day Trading', desc: 'Intraday' },
            { value: 'swing', label: 'Swing', desc: 'Multi-day' },
            { value: 'position', label: 'Position', desc: 'Weeks+' },
          ].map((style) => (
            <button
              key={style.value}
              onClick={() => {
                setTradingStyle(style.value)
                saveTradingStyle(style.value)
              }}
              className={`p-3 rounded-xl border text-left transition-all ${
                tradingStyle === style.value
                  ? 'border-[#0033CC] bg-[#0033CC]/10'
                  : 'border-zinc-800 hover:border-zinc-700'
              }`}
            >
              <div className="text-white text-sm font-medium">{style.label}</div>
              <div className="text-zinc-500 text-xs">{style.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Upload */}
      <ChartUpload
        disabled={atLimit}
        tradingStyle={tradingStyle}
        onAnalysisComplete={handleAnalysisComplete}
      />

      {/* Active analysis result */}
      {activeAnalysis && (
        <div className="animate-fade-in">
          <h2 className="text-white font-semibold mb-4">Latest Analysis</h2>
          <AnalysisCard analysis={activeAnalysis} />
        </div>
      )}

      {/* History */}
      {analyses.length > 0 && (
        <div>
          <h2 className="text-white font-semibold mb-4">Recent Analyses</h2>
          <div className="space-y-4">
            {analyses.map((analysis) => (
              <div
                key={analysis.id}
                className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center gap-4 hover:border-zinc-700 transition-colors cursor-pointer"
                onClick={() => setActiveAnalysis(analysis)}
              >
                {analysis.image_url && (
                  <img
                    src={analysis.image_url}
                    alt="Chart"
                    className="w-16 h-12 object-cover rounded-lg bg-zinc-800 flex-shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        analysis.bias === 'bullish'
                          ? 'bg-green-500/15 text-green-400'
                          : analysis.bias === 'bearish'
                          ? 'bg-red-500/15 text-red-400'
                          : 'bg-yellow-500/15 text-yellow-400'
                      }`}
                    >
                      {analysis.bias?.toUpperCase()}
                    </span>
                    <span className="text-zinc-500 text-xs">
                      {analysis.confidence_score}% confidence
                    </span>
                  </div>
                  <p className="text-zinc-300 text-sm truncate">{analysis.pattern}</p>
                  <p className="text-zinc-600 text-xs">
                    {new Date(analysis.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                <svg
                  className="w-5 h-5 text-zinc-600 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
