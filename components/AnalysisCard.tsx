'use client'

import { useState } from 'react'
import type { Analysis } from '@/types'

interface Props {
  analysis: Analysis
}

const BIAS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  bullish: { bg: 'bg-green-500/15', text: 'text-green-400', label: 'BULLISH' },
  bearish: { bg: 'bg-red-500/15', text: 'text-red-400', label: 'BEARISH' },
  neutral: { bg: 'bg-yellow-500/15', text: 'text-yellow-400', label: 'NEUTRAL' },
}

const CONFIDENCE_COLOR = (score: number) => {
  if (score >= 70) return 'from-green-500 to-emerald-400'
  if (score >= 45) return 'from-yellow-500 to-amber-400'
  return 'from-red-500 to-rose-400'
}

export default function AnalysisCard({ analysis }: Props) {
  const [checkedItems, setCheckedItems] = useState<Set<number>>(new Set())

  const bias = BIAS_STYLES[analysis.bias] ?? BIAS_STYLES.neutral
  const confColor = CONFIDENCE_COLOR(analysis.confidence_score)

  const toggleCheck = (index: number) => {
    setCheckedItems((prev) => {
      const next = new Set(prev)
      if (next.has(index)) next.delete(index)
      else next.add(index)
      return next
    })
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span
            className={`text-sm font-bold px-3 py-1 rounded-full ${bias.bg} ${bias.text}`}
          >
            {bias.label}
          </span>
          <span className="text-zinc-500 text-sm">
            {analysis.trading_style
              ? analysis.trading_style.charAt(0).toUpperCase() + analysis.trading_style.slice(1)
              : ''}{' '}
            Analysis
          </span>
        </div>
        <span className="text-zinc-600 text-xs">
          {new Date(analysis.created_at).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
      </div>

      <div className="p-6 grid md:grid-cols-2 gap-6">
        {/* Left column */}
        <div className="space-y-5">
          {/* Trend */}
          <div>
            <p className="text-zinc-500 text-xs uppercase tracking-widest mb-2">Trend</p>
            <p className="text-white text-sm leading-relaxed">{analysis.trend}</p>
          </div>

          {/* Pattern */}
          <div>
            <p className="text-zinc-500 text-xs uppercase tracking-widest mb-2">Pattern</p>
            <p className="text-white text-sm leading-relaxed">{analysis.pattern}</p>
          </div>

          {/* Confidence Score */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-zinc-500 text-xs uppercase tracking-widest">Confidence Score</p>
              <span className="text-white font-bold text-lg tabular-nums">
                {analysis.confidence_score}
                <span className="text-zinc-500 text-sm font-normal">%</span>
              </span>
            </div>
            <div className="h-2.5 w-full bg-zinc-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full bg-gradient-to-r ${confColor} transition-all duration-700`}
                style={{ width: `${analysis.confidence_score}%` }}
              />
            </div>
          </div>

          {/* Key Levels */}
          <div>
            <p className="text-zinc-500 text-xs uppercase tracking-widest mb-3">Key Levels</p>
            <div className="grid grid-cols-2 gap-3">
              {/* Support */}
              <div className="bg-green-500/5 border border-green-500/15 rounded-xl p-3">
                <p className="text-green-500 text-xs font-semibold uppercase mb-2">Support</p>
                <ul className="space-y-1">
                  {(analysis.key_levels?.support ?? []).map((level, i) => (
                    <li key={i} className="text-white text-xs">
                      {level}
                    </li>
                  ))}
                </ul>
              </div>
              {/* Resistance */}
              <div className="bg-red-500/5 border border-red-500/15 rounded-xl p-3">
                <p className="text-red-500 text-xs font-semibold uppercase mb-2">Resistance</p>
                <ul className="space-y-1">
                  {(analysis.key_levels?.resistance ?? []).map((level, i) => (
                    <li key={i} className="text-white text-xs">
                      {level}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Right column — Pre-Trade Checklist */}
        <div>
          <p className="text-zinc-500 text-xs uppercase tracking-widest mb-3">
            Pre-Trade Checklist
          </p>
          <div className="space-y-2">
            {(analysis.pre_trade_checklist ?? []).map((item, i) => {
              const checked = checkedItems.has(i)
              return (
                <button
                  key={i}
                  onClick={() => toggleCheck(i)}
                  className={`w-full flex items-start gap-3 p-3 rounded-xl border text-left transition-all ${
                    checked
                      ? 'border-[#0033CC]/40 bg-[#0033CC]/10'
                      : 'border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <div
                    className={`flex-shrink-0 w-5 h-5 rounded-md border flex items-center justify-center mt-0.5 transition-all ${
                      checked
                        ? 'gradient-bg border-transparent'
                        : 'border-zinc-600'
                    }`}
                  >
                    {checked && (
                      <svg
                        className="w-3 h-3 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </div>
                  <span
                    className={`text-sm leading-relaxed ${
                      checked ? 'text-zinc-400 line-through' : 'text-white'
                    }`}
                  >
                    {item}
                  </span>
                </button>
              )
            })}
          </div>

          {checkedItems.size === (analysis.pre_trade_checklist?.length ?? 0) &&
            checkedItems.size > 0 && (
              <div className="mt-4 flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3">
                <svg
                  className="w-4 h-4 text-green-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-green-400 text-sm font-medium">All conditions met — ready to trade</p>
              </div>
            )}

          {/* Chart thumbnail */}
          {analysis.image_url && (
            <div className="mt-5">
              <p className="text-zinc-500 text-xs uppercase tracking-widest mb-2">Chart</p>
              <img
                src={analysis.image_url}
                alt="Analyzed chart"
                className="w-full rounded-xl object-cover max-h-40 bg-zinc-800"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
