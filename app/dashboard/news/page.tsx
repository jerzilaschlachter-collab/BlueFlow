'use client'

import { useState, useEffect, useCallback } from 'react'
import type { NewsHeadline } from '@/lib/news'

const SOURCES = ['All', 'Yahoo Finance', 'Investing.com', 'MarketWatch', 'WSJ Markets', 'CNBC']

interface Market {
  symbol: string
  label: string
  keywords: string[]
}

const MARKETS: Market[] = [
  { symbol: 'SPX',   label: 'S&P 500',      keywords: ['s&p', 'sp500', 's&p 500', 'spx', 'spy'] },
  { symbol: 'DJI',   label: 'Dow Jones',     keywords: ['dow', 'djia', 'dow jones', 'dji'] },
  { symbol: 'NDX',   label: 'Nasdaq',        keywords: ['nasdaq', 'ndx', 'qqq', 'composite'] },
  { symbol: 'RUT',   label: 'Russell 2000',  keywords: ['russell', 'rut', 'iwm', 'small.cap', 'small cap'] },
  { symbol: 'XAU',   label: 'Gold',          keywords: ['gold', 'xau', 'gld', 'bullion'] },
  { symbol: 'WTI',   label: 'Oil',           keywords: ['oil', 'wti', 'crude', 'brent', 'opec', 'petroleum'] },
  { symbol: 'BTC',   label: 'Bitcoin',       keywords: ['bitcoin', 'btc', 'crypto', 'cryptocurrency'] },
  { symbol: 'EUR',   label: 'EUR/USD',       keywords: ['euro', 'eur/usd', 'eurusd', 'eur usd'] },
  { symbol: 'FED',   label: 'Fed / Rates',   keywords: ['federal reserve', 'fed', 'fomc', 'interest rate', 'inflation', 'powell', 'rate cut', 'rate hike'] },
  { symbol: 'VIX',   label: 'VIX',           keywords: ['vix', 'volatility index', 'fear index'] },
]

function matchesMarket(h: NewsHeadline, market: Market): boolean {
  const haystack = `${h.title} ${h.summary ?? ''}`.toLowerCase()
  return market.keywords.some((kw) => haystack.includes(kw))
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

function SourceBadge({ source }: { source: string }) {
  return (
    <span
      className="inline-block text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full"
      style={{
        background: 'linear-gradient(135deg, rgba(0,51,204,0.10), rgba(0,170,255,0.10))',
        color: '#0052FF',
        border: '1px solid rgba(0,82,255,0.18)',
      }}
    >
      {source}
    </span>
  )
}

function MarketChip({
  market,
  count,
  active,
  onClick,
}: {
  market: Market
  count: number
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 shrink-0 ${
        active
          ? 'text-white shadow-sm'
          : 'bg-white dark:bg-[#0D1220] text-[#334155] dark:text-[#94A3B8] border border-[#E2E8F0] dark:border-[#1E2D45] hover:border-[#0052FF]/40 dark:hover:border-[#0052FF]/40'
      }`}
      style={active ? { background: 'linear-gradient(135deg, #0033CC, #00AAFF)' } : {}}
    >
      <span className={`font-bold tracking-tight ${active ? 'text-white/90' : 'text-[#0052FF] dark:text-[#5B8FFF]'}`}>
        {market.symbol}
      </span>
      <span className={active ? 'text-white/80' : ''}>{market.label}</span>
      <span className={`text-[10px] rounded-full px-1.5 py-0.5 font-semibold ml-0.5 ${
        active
          ? 'bg-white/20 text-white'
          : 'bg-[#F1F5F9] dark:bg-[#1E2D45] text-[#64748B] dark:text-[#4A5A75]'
      }`}>
        {count}
      </span>
    </button>
  )
}

function NewsCard({ headline }: { headline: NewsHeadline }) {
  return (
    <a
      href={headline.link}
      target="_blank"
      rel="noopener noreferrer"
      className="group block rounded-xl border border-[#E2E8F0] dark:border-[#1E2D45] bg-white dark:bg-[#0D1220] p-4 hover:border-[#0052FF]/40 dark:hover:border-[#0052FF]/40 transition-all duration-200"
      style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-[#0A0E27] dark:text-[#F0F4FF] leading-snug group-hover:text-[#0052FF] dark:group-hover:text-[#5B8FFF] transition-colors duration-200 line-clamp-2">
            {headline.title}
          </p>
          {headline.summary && (
            <p className="mt-1.5 text-xs text-[#64748B] dark:text-[#4A5A75] line-clamp-2 leading-relaxed">
              {headline.summary}
            </p>
          )}
          <div className="mt-2.5 flex items-center gap-2.5 flex-wrap">
            <SourceBadge source={headline.source} />
            <span className="text-[11px] text-[#94A3B8] dark:text-[#4A5A75]">
              {timeAgo(headline.pubDate)}
            </span>
          </div>
        </div>
        <svg
          className="w-4 h-4 text-[#CBD5E1] dark:text-[#2D3F5A] group-hover:text-[#0052FF] dark:group-hover:text-[#5B8FFF] transition-colors duration-200 shrink-0 mt-0.5"
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
      </div>
    </a>
  )
}

function SkeletonCard() {
  return (
    <div className="rounded-xl border border-[#E2E8F0] dark:border-[#1E2D45] bg-white dark:bg-[#0D1220] p-4 animate-pulse">
      <div className="h-4 bg-[#F1F5F9] dark:bg-[#1E2D45] rounded w-3/4 mb-2" />
      <div className="h-3 bg-[#F1F5F9] dark:bg-[#1E2D45] rounded w-full mb-1" />
      <div className="h-3 bg-[#F1F5F9] dark:bg-[#1E2D45] rounded w-2/3 mb-3" />
      <div className="flex gap-2">
        <div className="h-4 bg-[#F1F5F9] dark:bg-[#1E2D45] rounded-full w-20" />
        <div className="h-4 bg-[#F1F5F9] dark:bg-[#1E2D45] rounded w-12" />
      </div>
    </div>
  )
}

export default function NewsPage() {
  const [headlines, setHeadlines] = useState<NewsHeadline[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeSource, setActiveSource] = useState('All')
  const [activeMarket, setActiveMarket] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true)
    else setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/news', { cache: 'no-store' })
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setHeadlines(data.headlines ?? [])
      setLastUpdated(new Date())
    } catch {
      setError('Unable to load market news. Please try again.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    load()
    const interval = setInterval(() => load(true), 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [load])

  const bySource = activeSource === 'All'
    ? headlines
    : headlines.filter((h) => h.source === activeSource)

  const filtered = activeMarket
    ? bySource.filter((h) => {
        const market = MARKETS.find((m) => m.symbol === activeMarket)!
        return matchesMarket(h, market)
      })
    : bySource

  const availableSources = SOURCES.filter(
    (s) => s === 'All' || headlines.some((h) => h.source === s)
  )

  function handleMarketClick(symbol: string) {
    setActiveMarket((prev) => (prev === symbol ? null : symbol))
  }

  return (
    <div className="min-h-screen bg-[#F8FAFF] dark:bg-[#080D1A] px-6 py-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#0A0E27] dark:text-[#F0F4FF] tracking-tight">
            Market News
          </h1>
          <p className="mt-1 text-sm text-[#64748B] dark:text-[#4A5A75]">
            Live headlines from top financial sources
            {lastUpdated && (
              <span className="ml-2 text-[#94A3B8] dark:text-[#2D3F5A]">
                · updated {timeAgo(lastUpdated.toISOString())}
              </span>
            )}
          </p>
        </div>

        <button
          onClick={() => load(true)}
          disabled={loading || refreshing}
          className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[#E2E8F0] dark:border-[#1E2D45] bg-white dark:bg-[#0D1220] text-sm text-[#334155] dark:text-[#A0B4CC] hover:border-[#0052FF]/40 disabled:opacity-50 transition-all duration-200"
        >
          <svg
            className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      {/* Market chips */}
      <div className="mb-4">
        <p className="text-[11px] font-semibold text-[#94A3B8] dark:text-[#2D3F5A] uppercase tracking-wider mb-2">
          Filter by market
        </p>
        <div className="flex items-center gap-2 flex-wrap">
          {MARKETS.map((market) => {
            const count = loading
              ? 0
              : bySource.filter((h) => matchesMarket(h, market)).length
            return (
              <MarketChip
                key={market.symbol}
                market={market}
                count={count}
                active={activeMarket === market.symbol}
                onClick={() => handleMarketClick(market.symbol)}
              />
            )
          })}
          {activeMarket && (
            <button
              onClick={() => setActiveMarket(null)}
              className="text-xs text-[#94A3B8] dark:text-[#4A5A75] hover:text-[#334155] dark:hover:text-[#A0B4CC] underline transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Source filter tabs */}
      <div className="flex items-center gap-2 flex-wrap mb-6">
        {availableSources.map((src) => (
          <button
            key={src}
            onClick={() => setActiveSource(src)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
              activeSource === src
                ? 'text-white'
                : 'bg-white dark:bg-[#0D1220] text-[#64748B] dark:text-[#4A5A75] border border-[#E2E8F0] dark:border-[#1E2D45] hover:border-[#0052FF]/40'
            }`}
            style={activeSource === src ? { background: 'linear-gradient(135deg, #0033CC, #00AAFF)' } : {}}
          >
            {src}
            {src !== 'All' && !loading && (
              <span className="ml-1.5 opacity-60">
                ({headlines.filter((h) => h.source === src).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      {error ? (
        <div className="rounded-xl border border-red-200 dark:border-red-900/30 bg-red-50 dark:bg-red-950/20 p-6 text-center">
          <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
          <button
            onClick={() => load()}
            className="mt-3 text-xs font-medium text-[#0052FF] dark:text-[#5B8FFF] hover:underline"
          >
            Try again
          </button>
        </div>
      ) : loading ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {Array.from({ length: 10 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-[#E2E8F0] dark:border-[#1E2D45] bg-white dark:bg-[#0D1220] p-12 text-center">
          <p className="text-[#64748B] dark:text-[#4A5A75] text-sm">
            {activeMarket
              ? `No headlines found for ${MARKETS.find((m) => m.symbol === activeMarket)?.label}.`
              : 'No headlines available for this source.'}
          </p>
          {activeMarket && (
            <button
              onClick={() => setActiveMarket(null)}
              className="mt-2 text-xs font-medium text-[#0052FF] dark:text-[#5B8FFF] hover:underline"
            >
              Clear filter
            </button>
          )}
        </div>
      ) : (
        <>
          <p className="text-xs text-[#94A3B8] dark:text-[#2D3F5A] mb-3">
            {filtered.length} article{filtered.length !== 1 ? 's' : ''}
            {activeMarket && (
              <span className="ml-1">
                · <span className="font-medium text-[#0052FF] dark:text-[#5B8FFF]">
                  {MARKETS.find((m) => m.symbol === activeMarket)?.label}
                </span>
              </span>
            )}
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {filtered.map((h, i) => <NewsCard key={`${h.link}-${i}`} headline={h} />)}
          </div>
        </>
      )}
    </div>
  )
}
