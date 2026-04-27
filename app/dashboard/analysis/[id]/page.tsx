'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import AnalysisResult from '@/components/AnalysisResult'

interface DBAnalysis {
  id: string
  user_id: string
  chart_image_url: string | null
  image_url: string | null
  trading_style: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  result: any
  confidence_score: number
  outcome: 'pending' | 'won' | 'lost'
  created_at: string
}

export default function AnalysisDetailPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()

  const id = params?.id as string
  const [analysis, setAnalysis] = useState<DBAnalysis | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!id) return
    ;(async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data, error } = await supabase
        .from('analyses')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single()

      if (error || !data) {
        setNotFound(true)
        setLoading(false)
        return
      }

      setAnalysis(data as DBAnalysis)
      setLoading(false)
    })()
  }, [id])

  function handleOutcomeUpdate(outcome: string) {
    if (!analysis) return
    setAnalysis({ ...analysis, outcome: outcome as 'pending' | 'won' | 'lost' })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-[#0033CC] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (notFound || !analysis) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <p className="text-[#0A0E27] text-xl font-semibold mb-2">Analysis not found</p>
        <p className="text-[#64748B] text-sm mb-6">It may have been deleted or doesn&apos;t belong to you.</p>
        <Link
          href="/dashboard"
          className="text-white font-semibold px-6 py-3 rounded-xl"
          style={{ background: 'linear-gradient(135deg, #0033CC, #0052FF)' }}
        >
          Back to Dashboard
        </Link>
      </div>
    )
  }

  const chartUrl = analysis.chart_image_url || analysis.image_url
  const resultData = { ...(analysis.result || {}), created_at: analysis.created_at }

  return (
    <div className="space-y-6">
      {/* Header with back link */}
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-[#64748B] hover:text-[#0052FF] text-sm font-medium"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Dashboard
        </Link>
        <Link
          href="/dashboard/history"
          className="text-[#0052FF] text-sm font-medium hover:underline"
        >
          View All History →
        </Link>
      </div>

      {/* Chart image */}
      {chartUrl && (
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 shadow-sm">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={chartUrl}
            alt="Analyzed chart"
            className="w-full rounded-xl"
            style={{ maxHeight: 520, objectFit: 'contain', background: '#F8FAFC' }}
          />
        </div>
      )}

      {/* Full analysis */}
      <AnalysisResult
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        analysis={resultData as any}
        analysisId={analysis.id}
        onOutcomeUpdate={handleOutcomeUpdate}
      />
    </div>
  )
}
