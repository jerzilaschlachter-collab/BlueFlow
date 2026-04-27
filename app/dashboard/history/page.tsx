'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import AnalysisResult from '@/components/AnalysisResult'
import FlameIcon from '@/components/FlameIcon'
import Link from 'next/link'

// ─── Types ───────────────────────────────────────────────────────────────────

interface DBAnalysis {
  id: string
  user_id: string
  chart_image_url: string | null
  trading_style: string
  result: AnalysisResultData
  confidence_score: number
  outcome: 'pending' | 'won' | 'lost'
  created_at: string
}

interface AnalysisResultData {
  bias?: { direction?: string; reasoning?: string; confidence_score?: number }
  overall_grade?: string
  asset_detected?: string
  timeframe_detected?: string
  summary?: string
  style_specific_notes?: string
  [key: string]: unknown
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  }) + ' · ' + d.toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit',
  })
}

function getBiasColor(direction?: string) {
  const d = (direction || '').toLowerCase()
  if (d === 'bullish') return { bg: '#DCFCE7', color: '#16A34A' }
  if (d === 'bearish') return { bg: '#FEE2E2', color: '#DC2626' }
  return { bg: '#F1F5F9', color: '#64748B' }
}

function getGradeBadge(grade?: string) {
  if (!grade) return { bg: '#F1F5F9', color: '#64748B' }
  if (grade === 'A+' || grade === 'A') return { bg: '#DCFCE7', color: '#16A34A' }
  if (grade === 'B') return { bg: '#DBEAFE', color: '#2563EB' }
  if (grade === 'C') return { bg: '#FEF3C7', color: '#D97706' }
  return { bg: '#FEE2E2', color: '#DC2626' }
}

function exportCSV(analyses: DBAnalysis[]) {
  const header = ['Date', 'Asset', 'Timeframe', 'Style', 'Bias', 'Confidence', 'Grade', 'Outcome', 'Summary']
  const rows = analyses.map(a => {
    const r = a.result || {}
    return [
      new Date(a.created_at).toISOString(),
      r.asset_detected ?? '',
      r.timeframe_detected ?? '',
      a.trading_style,
      r.bias?.direction ?? '',
      a.confidence_score,
      r.overall_grade ?? '',
      a.outcome,
      (r.summary ?? '').replace(/,/g, ';'),
    ]
  })
  const csv = [header, ...rows].map(r => r.join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'blueflow-analyses.csv'
  a.click()
  URL.revokeObjectURL(url)
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function StatCard({
  icon, label, value, sub, valueColor,
}: {
  icon: string; label: string; value: string; sub: string; valueColor?: string
}) {
  return (
    <div style={{
      background: 'var(--bf-surface)',
      borderRadius: '16px',
      border: '1px solid var(--bf-surface-border)',
      padding: '20px',
    }}>
      <div style={{ fontSize: '22px', marginBottom: '8px' }}>{icon}</div>
      <p style={{ color: '#94A3B8', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, marginBottom: '4px' }}>
        {label}
      </p>
      <p style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '28px', lineHeight: 1, color: valueColor || 'var(--bf-text-primary)' }}>
        {value}
      </p>
      <p style={{ color: '#94A3B8', fontSize: '12px', marginTop: '6px' }}>{sub}</p>
    </div>
  )
}

function OutcomeBadge({ outcome }: { outcome: string }) {
  if (outcome === 'won') return (
    <span style={{ background: '#DCFCE7', color: '#16A34A', fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '100px' }}>✓ Won</span>
  )
  if (outcome === 'lost') return (
    <span style={{ background: '#FEE2E2', color: '#DC2626', fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '100px' }}>✗ Lost</span>
  )
  return (
    <span style={{ background: 'var(--bf-chip-bg)', color: 'var(--bf-chip-text)', fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '100px', border: '1px solid var(--bf-chip-border)' }}>· Pending</span>
  )
}

function AnalysisCard({ analysis, onClick }: { analysis: DBAnalysis; onClick: () => void }) {
  const r = analysis.result || {}
  const direction = r.bias?.direction
  const biasStyle = getBiasColor(direction)
  const gradeStyle = getGradeBadge(r.overall_grade)
  const [hovered, setHovered] = useState(false)

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'var(--bf-surface)',
        borderRadius: '16px',
        border: `1px solid ${hovered ? '#BFDBFE' : 'var(--bf-surface-border)'}`,
        overflow: 'hidden',
        transition: 'all 0.2s',
        boxShadow: hovered ? '0 4px 20px rgba(0,82,255,0.08)' : 'none',
        transform: hovered ? 'translateY(-2px)' : 'none',
        cursor: 'pointer',
      }}
    >
      {/* Chart thumbnail */}
      <div style={{ position: 'relative', height: '160px', background: '#0D1B3E', overflow: 'hidden' }}>
        {analysis.chart_image_url ? (
          <img
            src={analysis.chart_image_url}
            alt="Chart"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%',
            background: 'linear-gradient(135deg, #0D1B3E, #1A2F6E)' }}>
            <FlameIcon size={40} />
          </div>
        )}
        {/* Badges over image */}
        <div style={{ position: 'absolute', top: 10, left: 10 }}>
          <span style={{ background: biasStyle.bg, color: biasStyle.color, fontSize: '11px', fontWeight: 700,
            padding: '3px 8px', borderRadius: '100px' }}>
            {(direction || 'N/A').toUpperCase()}
          </span>
        </div>
        {r.overall_grade && (
          <div style={{ position: 'absolute', top: 10, right: 10 }}>
            <span style={{ background: gradeStyle.bg, color: gradeStyle.color, fontSize: '11px', fontWeight: 700,
              padding: '3px 8px', borderRadius: '100px' }}>
              {r.overall_grade}
            </span>
          </div>
        )}
      </div>

      {/* Middle */}
      <div style={{ padding: '16px' }}>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '8px' }}>
          {r.asset_detected && (
            <span style={{ background: '#EEF4FF', color: '#0052FF', fontSize: '12px', fontWeight: 600, padding: '2px 8px', borderRadius: '100px' }}>
              {r.asset_detected}
            </span>
          )}
          {r.timeframe_detected && (
            <span style={{ background: 'var(--bf-surface-border)', color: 'var(--bf-text-muted)', fontSize: '12px', fontWeight: 500, padding: '2px 8px', borderRadius: '100px' }}>
              {r.timeframe_detected}
            </span>
          )}
          {analysis.trading_style && (
            <span style={{ background: 'var(--bf-chip-bg)', color: 'var(--bf-chip-text)', fontSize: '12px', fontWeight: 500, padding: '2px 8px', borderRadius: '100px', border: '1px solid var(--bf-chip-border)' }}>
              {analysis.trading_style.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
            </span>
          )}
        </div>
        <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--bf-text-primary)', lineHeight: 1.4,
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {r.summary || '—'}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px' }}>
          <span style={{ fontSize: '12px', color: '#94A3B8' }}>{formatDate(analysis.created_at)}</span>
          <OutcomeBadge outcome={analysis.outcome} />
        </div>
      </div>

      {/* Bottom action row */}
      <div style={{ borderTop: '1px solid var(--bf-surface-border)', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '12px', color: '#64748B', fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: '5px', maxWidth: '65%', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
          <FlameIcon size={14} />
          {(r.style_specific_notes || '').slice(0, 60) || 'No notes'}
        </span>
        <span style={{ fontSize: '12px', color: '#0052FF', fontWeight: 500, flexShrink: 0 }}>View Full Analysis →</span>
      </div>
    </div>
  )
}

// ─── Modal ────────────────────────────────────────────────────────────────────

function AnalysisModal({
  analysis,
  onClose,
  onOutcomeUpdate,
}: {
  analysis: DBAnalysis
  onClose: () => void
  onOutcomeUpdate: (id: string, outcome: string) => void
}) {
  const supabase = createClient()
  const [updatingOutcome, setUpdatingOutcome] = useState(false)
  const [localOutcome, setLocalOutcome] = useState(analysis.outcome)

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  async function updateOutcome(outcome: string) {
    setUpdatingOutcome(true)
    await supabase.from('analyses').update({ outcome }).eq('id', analysis.id)
    setLocalOutcome(outcome as 'pending' | 'won' | 'lost')
    onOutcomeUpdate(analysis.id, outcome)
    setUpdatingOutcome(false)
  }

  const r = analysis.result || {}

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1000,
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{
        background: 'var(--bf-surface)', borderRadius: '20px', width: '100%', maxWidth: '900px',
        maxHeight: '90vh', overflowY: 'auto', display: 'flex', flexDirection: 'column',
      }}>
        {/* Modal header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '20px 24px', borderBottom: '1px solid var(--bf-surface-border)', position: 'sticky', top: 0, background: 'var(--bf-surface)', zIndex: 10 }}>
          <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '16px', color: 'var(--bf-text-primary)' }}>
            Analysis · {formatDate(analysis.created_at)}
          </span>
          <button
            onClick={onClose}
            style={{ width: 32, height: 32, borderRadius: '50%', border: '1px solid var(--bf-chip-border)',
              background: 'var(--bf-surface)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '16px', color: 'var(--bf-text-muted)' }}
          >
            ✕
          </button>
        </div>

        {/* Chart image if present */}
        {analysis.chart_image_url && (
          <div style={{ padding: '16px 24px 0' }}>
            <img
              src={analysis.chart_image_url}
              alt="Chart"
              style={{ width: '100%', borderRadius: '12px', maxHeight: '400px', objectFit: 'cover', border: '1px solid var(--bf-surface-border)' }}
            />
          </div>
        )}

        {/* Analysis result */}
        <div style={{ padding: '16px 24px' }}>
          <AnalysisResult
            analysis={r as unknown as Parameters<typeof AnalysisResult>[0]['analysis']}
            analysisId={analysis.id}
            onOutcomeUpdate={(outcome) => { setLocalOutcome(outcome as 'pending' | 'won' | 'lost'); onOutcomeUpdate(analysis.id, outcome) }}
          />
        </div>

        {/* Outcome updater */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid var(--bf-surface-border)' }}>
          <p style={{ fontSize: '12px', color: '#64748B', marginBottom: '10px', fontWeight: 500 }}>Update trade outcome</p>
          <div style={{ display: 'flex', gap: '8px' }}>
            {(['won', 'pending', 'lost'] as const).map((o) => (
              <button
                key={o}
                disabled={updatingOutcome}
                onClick={() => updateOutcome(o)}
                style={{
                  padding: '8px 20px',
                  borderRadius: '100px',
                  border: localOutcome === o ? 'none' : '1px solid var(--bf-chip-border)',
                  background: localOutcome === o
                    ? o === 'won' ? '#16A34A' : o === 'lost' ? '#DC2626' : '#64748B'
                    : 'var(--bf-chip-bg)',
                  color: localOutcome === o ? 'white' : 'var(--bf-chip-text)',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: updatingOutcome ? 'not-allowed' : 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                {o === 'won' ? '✓ Won' : o === 'lost' ? '✗ Lost' : '· Pending'}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Chip component ───────────────────────────────────────────────────────────

function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '6px 16px',
        borderRadius: '100px',
        border: active ? 'none' : '1px solid var(--bf-chip-border)',
        background: active ? 'linear-gradient(135deg, #0033CC, #0052FF)' : 'var(--bf-chip-bg)',
        color: active ? 'white' : 'var(--bf-chip-text)',
        fontSize: '13px',
        fontWeight: 500,
        cursor: 'pointer',
        boxShadow: active ? '0 4px 12px rgba(0,82,255,0.25)' : 'none',
        transition: 'all 0.15s',
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </button>
  )
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div style={{
      background: 'var(--bf-surface)', borderRadius: '20px', border: '1px solid var(--bf-surface-border)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      minHeight: '400px', padding: '48px 24px', textAlign: 'center',
    }}>
      <div style={{ filter: 'drop-shadow(0 0 20px rgba(0,82,255,0.4))', marginBottom: '20px' }}>
        <FlameIcon size={64} />
      </div>
      <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '24px', color: 'var(--bf-text-primary)', marginBottom: '10px' }}>
        No analyses yet
      </h2>
      <p style={{ color: '#64748B', fontSize: '14px', maxWidth: '320px', marginBottom: '24px', lineHeight: 1.6 }}>
        Upload your first chart and BlueFlow will analyze it instantly.
      </p>
      <Link
        href="/dashboard"
        style={{
          background: 'linear-gradient(135deg, #0033CC, #0052FF)',
          color: 'white', fontWeight: 600, fontSize: '14px',
          padding: '12px 28px', borderRadius: '12px', textDecoration: 'none',
          boxShadow: '0 4px 12px rgba(0,82,255,0.35)',
        }}
      >
        Analyze Your First Chart →
      </Link>
    </div>
  )
}

// ─── Pagination ───────────────────────────────────────────────────────────────

function Pagination({
  page, totalPages, onPage,
}: { page: number; totalPages: number; onPage: (p: number) => void }) {
  if (totalPages <= 1) return null
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center', marginTop: '32px' }}>
      <button
        disabled={page === 1}
        onClick={() => onPage(page - 1)}
        style={{
          padding: '8px 18px', borderRadius: '100px', border: '1px solid var(--bf-chip-border)',
          background: 'var(--bf-chip-bg)', color: 'var(--bf-chip-text)', fontSize: '13px', fontWeight: 500,
          cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.4 : 1,
        }}
      >
        ← Previous
      </button>

      {pages.map(p => (
        <button
          key={p}
          onClick={() => onPage(p)}
          style={{
            width: 36, height: 36, borderRadius: '50%',
            border: p === page ? 'none' : '1px solid var(--bf-chip-border)',
            background: p === page ? 'linear-gradient(135deg, #0033CC, #0052FF)' : 'var(--bf-chip-bg)',
            color: p === page ? 'white' : 'var(--bf-chip-text)',
            fontSize: '13px', fontWeight: 600, cursor: 'pointer',
          }}
        >
          {p}
        </button>
      ))}

      <button
        disabled={page === totalPages}
        onClick={() => onPage(page + 1)}
        style={{
          padding: '8px 18px', borderRadius: '100px', border: '1px solid var(--bf-chip-border)',
          background: 'var(--bf-chip-bg)', color: 'var(--bf-chip-text)', fontSize: '13px', fontWeight: 500,
          cursor: page === totalPages ? 'not-allowed' : 'pointer', opacity: page === totalPages ? 0.4 : 1,
        }}
      >
        Next →
      </button>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const PAGE_SIZE = 12

export default function HistoryPage() {
  const router = useRouter()
  const supabase = createClient()

  const [analyses, setAnalyses] = useState<DBAnalysis[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedAnalysis, setSelectedAnalysis] = useState<DBAnalysis | null>(null)

  // Filters
  const [biasFilter, setBiasFilter] = useState<string>('All')
  const [outcomeFilter, setOutcomeFilter] = useState<string>('All Outcomes')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('newest')
  const [page, setPage] = useState(1)

  useEffect(() => {
    loadAnalyses()
  }, [])

  async function loadAnalyses() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const { data } = await supabase
      .from('analyses')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (data) setAnalyses(data as DBAnalysis[])
    setLoading(false)
  }

  function handleOutcomeUpdate(id: string, outcome: string) {
    setAnalyses(prev => prev.map(a => a.id === id ? { ...a, outcome: outcome as 'pending' | 'won' | 'lost' } : a))
  }

  // Derived stats
  const totalCount = analyses.length
  const withOutcome = analyses.filter(a => a.outcome !== 'pending')
  const wonCount = withOutcome.filter(a => a.outcome === 'won').length
  const winRate = withOutcome.length > 0 ? Math.round((wonCount / withOutcome.length) * 100) : 0
  const avgConfidence = totalCount > 0
    ? Math.round(analyses.reduce((s, a) => s + (a.confidence_score || 0), 0) / totalCount)
    : 0
  const assetFreq = analyses.reduce<Record<string, number>>((acc, a) => {
    const asset = a.result?.asset_detected
    if (asset) acc[asset] = (acc[asset] || 0) + 1
    return acc
  }, {})
  const topAsset = Object.entries(assetFreq).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '—'

  const winRateColor = winRate > 60 ? '#16A34A' : winRate >= 40 ? '#D97706' : '#DC2626'

  // Filtered + sorted
  const filtered = useMemo(() => {
    let list = [...analyses]

    if (biasFilter !== 'All') {
      list = list.filter(a => (a.result?.bias?.direction || '').toLowerCase() === biasFilter.toLowerCase())
    }
    if (outcomeFilter !== 'All Outcomes') {
      list = list.filter(a => a.outcome === outcomeFilter.toLowerCase())
    }
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(a =>
        (a.result?.asset_detected || '').toLowerCase().includes(q) ||
        (a.result?.summary || '').toLowerCase().includes(q)
      )
    }

    if (sort === 'oldest') list.reverse()
    else if (sort === 'highest_conf') list.sort((a, b) => b.confidence_score - a.confidence_score)
    else if (sort === 'lowest_conf') list.sort((a, b) => a.confidence_score - b.confidence_score)

    return list
  }, [analyses, biasFilter, outcomeFilter, search, sort])

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  // Reset page on filter change
  useEffect(() => { setPage(1) }, [biasFilter, outcomeFilter, search, sort])

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div className="w-8 h-8 border-2 border-[#0033CC] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* ── Modal ── */}
      {selectedAnalysis && (
        <AnalysisModal
          analysis={selectedAnalysis}
          onClose={() => setSelectedAnalysis(null)}
          onOutcomeUpdate={handleOutcomeUpdate}
        />
      )}

      {/* ── Page Header ── */}
      <div
        style={{
          background: 'var(--bf-header-bg)',
          padding: '28px 40px',
          borderBottom: '1px solid var(--bf-header-border)',
          marginLeft: '-1rem',
          marginRight: '-1rem',
          marginTop: '-2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          flexWrap: 'wrap',
        }}
      >
        <div>
          <p style={{ color: '#0052FF', textTransform: 'uppercase', letterSpacing: '0.12em', fontSize: '11px', fontWeight: 600, marginBottom: '4px' }}>
            BLUEFLOW DASHBOARD
          </p>
          <h1 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '32px', color: 'var(--bf-text-primary)', lineHeight: 1.1, margin: 0 }}>
            Analysis History
          </h1>
          <p style={{ color: '#64748B', fontSize: '14px', marginTop: '4px' }}>
            Every chart BlueFlow has analyzed for you
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ background: 'rgba(0,82,255,0.12)', color: '#4D8EFF', fontSize: '13px', fontWeight: 600, padding: '6px 14px', borderRadius: '100px' }}>
            {totalCount} {totalCount === 1 ? 'analysis' : 'analyses'}
          </span>
          <button
            onClick={() => exportCSV(analyses)}
            style={{
              padding: '8px 18px', borderRadius: '10px',
              border: '1px solid var(--bf-chip-border)', background: 'var(--bf-chip-bg)',
              color: '#0052FF', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
            }}
          >
            Export CSV
          </button>
        </div>
      </div>

      {/* ── Stats Row ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' }}>
        <StatCard icon="📊" label="Total Analyses" value={totalCount.toString()} sub="All time" />
        <StatCard icon="🎯" label="Win Rate" value={withOutcome.length > 0 ? `${winRate}%` : '—'} sub="Based on logged outcomes" valueColor={withOutcome.length > 0 ? winRateColor : '#94A3B8'} />
<StatCard icon="🏆" label="Top Asset" value={topAsset} sub="Your most analyzed market" />
      </div>

      {/* ── Filters Bar ── */}
      <div style={{
        background: 'var(--bf-surface)', borderRadius: '16px', border: '1px solid var(--bf-surface-border)',
        padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap',
      }}>
        {/* Bias chips */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {['All', 'Bullish', 'Bearish', 'Neutral'].map(b => (
            <Chip key={b} label={b} active={biasFilter === b} onClick={() => setBiasFilter(b)} />
          ))}
        </div>

        <div style={{ width: '1px', height: '28px', background: 'var(--bf-chip-border)', flexShrink: 0 }} />

        {/* Outcome chips */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {['All Outcomes', 'Won', 'Pending', 'Lost'].map(o => (
            <Chip key={o} label={o} active={outcomeFilter === o} onClick={() => setOutcomeFilter(o)} />
          ))}
        </div>

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Search by asset or summary..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              border: '1px solid var(--bf-chip-border)', borderRadius: '10px',
              padding: '8px 16px', fontSize: '14px', width: '240px',
              outline: 'none', color: 'var(--bf-text-primary)',
              background: 'var(--bf-chip-bg)',
            }}
          />
          <select
            value={sort}
            onChange={e => setSort(e.target.value)}
            style={{
              border: '1px solid var(--bf-chip-border)', borderRadius: '10px',
              padding: '8px 14px', fontSize: '14px', color: 'var(--bf-text-primary)',
              outline: 'none', background: 'var(--bf-chip-bg)', cursor: 'pointer',
            }}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="highest_conf">Highest Confidence</option>
            <option value="lowest_conf">Lowest Confidence</option>
          </select>
        </div>
      </div>

      {/* ── Analyses Grid ── */}
      {filtered.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '16px',
          }}>
            {paginated.map(analysis => (
              <AnalysisCard
                key={analysis.id}
                analysis={analysis}
                onClick={() => router.push(`/dashboard/analysis/${analysis.id}`)}
              />
            ))}
          </div>

          <Pagination page={page} totalPages={totalPages} onPage={setPage} />
        </>
      )}
    </div>
  )
}
