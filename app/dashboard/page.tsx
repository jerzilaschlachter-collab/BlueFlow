'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import ChartUploader from '@/components/ChartUploader'
import AnalysisResult from '@/components/AnalysisResult'
import AnalysisCard from '@/components/AnalysisCard'
import LoadingPanel from '@/components/LoadingPanel'
import EmptyState from '@/components/EmptyState'
import { useAnalyzing } from '@/lib/contexts/AnalyzingContext'
import type { User, Analysis } from '@/types'

const TIER_LIMITS: Record<string, number | null> = {
  free: 2,
  pro: null,
  elite: null,
}

const TIER_COLORS: Record<string, string> = {
  free: 'text-[#64748B] bg-[#F1F5F9]',
  pro: 'text-[#00AAFF] bg-[#00AAFF]/10',
  elite: 'text-amber-500 bg-amber-400/10',
}

const TRADING_STYLES = [
  { value: 'smc', label: 'SMC', emoji: '🎯', time: 'Multi-TF' },
  { value: 'price_action', label: 'Price Action', emoji: '📈', time: 'Any TF' },
  { value: 'scalping', label: 'Scalping', emoji: '⚡', time: '1–5 min' },
  { value: 'day', label: 'Day Trading', emoji: '📊', time: 'Intraday' },
  { value: 'swing', label: 'Swing', emoji: '🔄', time: '2–7 days' },
  { value: 'position', label: 'Position', emoji: '📅', time: 'Weeks+' },
]

const COUNTRY_TIMEZONES: Record<string, string> = {
  'Afghanistan': 'Asia/Kabul',
  'Albania': 'Europe/Tirane',
  'Algeria': 'Africa/Algiers',
  'Andorra': 'Europe/Andorra',
  'Angola': 'Africa/Luanda',
  'Antigua and Barbuda': 'America/Antigua',
  'Argentina': 'America/Argentina/Buenos_Aires',
  'Armenia': 'Asia/Yerevan',
  'Australia': 'Australia/Sydney',
  'Austria': 'Europe/Vienna',
  'Azerbaijan': 'Asia/Baku',
  'Bahamas': 'America/Nassau',
  'Bahrain': 'Asia/Bahrain',
  'Bangladesh': 'Asia/Dhaka',
  'Barbados': 'America/Barbados',
  'Belarus': 'Europe/Minsk',
  'Belgium': 'Europe/Brussels',
  'Belize': 'America/Belize',
  'Benin': 'Africa/Porto-Novo',
  'Bhutan': 'Asia/Thimphu',
  'Bolivia': 'America/La_Paz',
  'Bosnia and Herzegovina': 'Europe/Sarajevo',
  'Botswana': 'Africa/Gaborone',
  'Brazil': 'America/Sao_Paulo',
  'Brunei': 'Asia/Brunei',
  'Bulgaria': 'Europe/Sofia',
  'Burkina Faso': 'Africa/Ouagadougou',
  'Burundi': 'Africa/Bujumbura',
  'Cabo Verde': 'Atlantic/Cape_Verde',
  'Cambodia': 'Asia/Phnom_Penh',
  'Cameroon': 'Africa/Douala',
  'Canada': 'America/Toronto',
  'Central African Republic': 'Africa/Bangui',
  'Chad': 'Africa/Ndjamena',
  'Chile': 'America/Santiago',
  'China': 'Asia/Shanghai',
  'Colombia': 'America/Bogota',
  'Comoros': 'Indian/Comoro',
  'Congo (Brazzaville)': 'Africa/Brazzaville',
  'Congo (Kinshasa)': 'Africa/Kinshasa',
  'Costa Rica': 'America/Costa_Rica',
  'Croatia': 'Europe/Zagreb',
  'Cuba': 'America/Havana',
  'Cyprus': 'Asia/Nicosia',
  'Czech Republic': 'Europe/Prague',
  'Denmark': 'Europe/Copenhagen',
  'Djibouti': 'Africa/Djibouti',
  'Dominica': 'America/Dominica',
  'Dominican Republic': 'America/Santo_Domingo',
  'Ecuador': 'America/Guayaquil',
  'Egypt': 'Africa/Cairo',
  'El Salvador': 'America/El_Salvador',
  'Equatorial Guinea': 'Africa/Malabo',
  'Eritrea': 'Africa/Asmara',
  'Estonia': 'Europe/Tallinn',
  'Eswatini': 'Africa/Mbabane',
  'Ethiopia': 'Africa/Addis_Ababa',
  'Fiji': 'Pacific/Fiji',
  'Finland': 'Europe/Helsinki',
  'France': 'Europe/Paris',
  'Gabon': 'Africa/Libreville',
  'Gambia': 'Africa/Banjul',
  'Georgia': 'Asia/Tbilisi',
  'Germany': 'Europe/Berlin',
  'Ghana': 'Africa/Accra',
  'Greece': 'Europe/Athens',
  'Grenada': 'America/Grenada',
  'Guatemala': 'America/Guatemala',
  'Guinea': 'Africa/Conakry',
  'Guinea-Bissau': 'Africa/Bissau',
  'Guyana': 'America/Guyana',
  'Haiti': 'America/Port-au-Prince',
  'Honduras': 'America/Tegucigalpa',
  'Hungary': 'Europe/Budapest',
  'Iceland': 'Atlantic/Reykjavik',
  'India': 'Asia/Kolkata',
  'Indonesia': 'Asia/Jakarta',
  'Iran': 'Asia/Tehran',
  'Iraq': 'Asia/Baghdad',
  'Ireland': 'Europe/Dublin',
  'Israel': 'Asia/Jerusalem',
  'Italy': 'Europe/Rome',
  'Jamaica': 'America/Jamaica',
  'Japan': 'Asia/Tokyo',
  'Jordan': 'Asia/Amman',
  'Kazakhstan': 'Asia/Almaty',
  'Kenya': 'Africa/Nairobi',
  'Kiribati': 'Pacific/Tarawa',
  'Kuwait': 'Asia/Kuwait',
  'Kyrgyzstan': 'Asia/Bishkek',
  'Laos': 'Asia/Vientiane',
  'Latvia': 'Europe/Riga',
  'Lebanon': 'Asia/Beirut',
  'Lesotho': 'Africa/Maseru',
  'Liberia': 'Africa/Monrovia',
  'Libya': 'Africa/Tripoli',
  'Liechtenstein': 'Europe/Vaduz',
  'Lithuania': 'Europe/Vilnius',
  'Luxembourg': 'Europe/Luxembourg',
  'Madagascar': 'Indian/Antananarivo',
  'Malawi': 'Africa/Blantyre',
  'Malaysia': 'Asia/Kuala_Lumpur',
  'Maldives': 'Indian/Maldives',
  'Mali': 'Africa/Bamako',
  'Malta': 'Europe/Malta',
  'Marshall Islands': 'Pacific/Majuro',
  'Mauritania': 'Africa/Nouakchott',
  'Mauritius': 'Indian/Mauritius',
  'Mexico': 'America/Mexico_City',
  'Micronesia': 'Pacific/Pohnpei',
  'Moldova': 'Europe/Chisinau',
  'Monaco': 'Europe/Monaco',
  'Mongolia': 'Asia/Ulaanbaatar',
  'Montenegro': 'Europe/Podgorica',
  'Morocco': 'Africa/Casablanca',
  'Mozambique': 'Africa/Maputo',
  'Myanmar': 'Asia/Rangoon',
  'Namibia': 'Africa/Windhoek',
  'Nauru': 'Pacific/Nauru',
  'Nepal': 'Asia/Kathmandu',
  'Netherlands': 'Europe/Amsterdam',
  'New Zealand': 'Pacific/Auckland',
  'Nicaragua': 'America/Managua',
  'Niger': 'Africa/Niamey',
  'Nigeria': 'Africa/Lagos',
  'North Korea': 'Asia/Pyongyang',
  'North Macedonia': 'Europe/Skopje',
  'Norway': 'Europe/Oslo',
  'Oman': 'Asia/Muscat',
  'Pakistan': 'Asia/Karachi',
  'Palau': 'Pacific/Palau',
  'Palestine': 'Asia/Gaza',
  'Panama': 'America/Panama',
  'Papua New Guinea': 'Pacific/Port_Moresby',
  'Paraguay': 'America/Asuncion',
  'Peru': 'America/Lima',
  'Philippines': 'Asia/Manila',
  'Poland': 'Europe/Warsaw',
  'Portugal': 'Europe/Lisbon',
  'Qatar': 'Asia/Qatar',
  'Romania': 'Europe/Bucharest',
  'Russia': 'Europe/Moscow',
  'Rwanda': 'Africa/Kigali',
  'Saint Kitts and Nevis': 'America/St_Kitts',
  'Saint Lucia': 'America/St_Lucia',
  'Saint Vincent and the Grenadines': 'America/St_Vincent',
  'Samoa': 'Pacific/Apia',
  'San Marino': 'Europe/San_Marino',
  'Sao Tome and Principe': 'Africa/Sao_Tome',
  'Saudi Arabia': 'Asia/Riyadh',
  'Senegal': 'Africa/Dakar',
  'Serbia': 'Europe/Belgrade',
  'Seychelles': 'Indian/Mahe',
  'Sierra Leone': 'Africa/Freetown',
  'Singapore': 'Asia/Singapore',
  'Slovakia': 'Europe/Bratislava',
  'Slovenia': 'Europe/Ljubljana',
  'Solomon Islands': 'Pacific/Guadalcanal',
  'Somalia': 'Africa/Mogadishu',
  'South Africa': 'Africa/Johannesburg',
  'South Korea': 'Asia/Seoul',
  'South Sudan': 'Africa/Juba',
  'Spain': 'Europe/Madrid',
  'Sri Lanka': 'Asia/Colombo',
  'Sudan': 'Africa/Khartoum',
  'Suriname': 'America/Paramaribo',
  'Sweden': 'Europe/Stockholm',
  'Switzerland': 'Europe/Zurich',
  'Syria': 'Asia/Damascus',
  'Taiwan': 'Asia/Taipei',
  'Tajikistan': 'Asia/Dushanbe',
  'Tanzania': 'Africa/Dar_es_Salaam',
  'Thailand': 'Asia/Bangkok',
  'Timor-Leste': 'Asia/Dili',
  'Togo': 'Africa/Lome',
  'Tonga': 'Pacific/Tongatapu',
  'Trinidad and Tobago': 'America/Port_of_Spain',
  'Tunisia': 'Africa/Tunis',
  'Turkey': 'Europe/Istanbul',
  'Turkmenistan': 'Asia/Ashgabat',
  'Tuvalu': 'Pacific/Funafuti',
  'Uganda': 'Africa/Kampala',
  'Ukraine': 'Europe/Kiev',
  'United Arab Emirates': 'Asia/Dubai',
  'United Kingdom': 'Europe/London',
  'United States': 'America/New_York',
  'Uruguay': 'America/Montevideo',
  'Uzbekistan': 'Asia/Tashkent',
  'Vanuatu': 'Pacific/Efate',
  'Vatican City': 'Europe/Vatican',
  'Venezuela': 'America/Caracas',
  'Vietnam': 'Asia/Ho_Chi_Minh',
  'Yemen': 'Asia/Aden',
  'Zambia': 'Africa/Lusaka',
  'Zimbabwe': 'Africa/Harare',
}

function getGreeting(country?: string | null) {
  let hour: number
  const tz = country ? COUNTRY_TIMEZONES[country] : undefined
  if (tz) {
    const timeStr = new Intl.DateTimeFormat('en-US', { timeZone: tz, hour: 'numeric', hour12: false }).format(new Date())
    hour = parseInt(timeStr, 10) % 24
  } else {
    hour = new Date().getHours()
  }
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

// Circular progress ring SVG
function CircularProgress({ used, limit }: { used: number; limit: number | null }) {
  const pct = limit === null ? 0 : Math.min((used / limit) * 100, 100)
  const r = 28
  const circ = 2 * Math.PI * r
  const offset = circ - (pct / 100) * circ
  const isHigh = pct >= 80
  const color = isHigh ? '#DC2626' : '#0052FF'

  return (
    <div className="relative flex items-center justify-center" style={{ width: 72, height: 72 }}>
      <svg width={72} height={72} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={36} cy={36} r={r} fill="none" stroke="#DCE8FF" strokeWidth={6} />
        <circle
          cx={36}
          cy={36}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={6}
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.5s ease' }}
        />
      </svg>
      <span
        className="absolute text-xs font-bold"
        style={{ color }}
      >
        {limit === null ? '∞' : `${Math.round(pct)}%`}
      </span>
    </div>
  )
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [analyses, setAnalyses] = useState<Analysis[]>([])
  const [activeAnalysis, setActiveAnalysis] = useState<Analysis | null>(null)
  const [isNewAnalysis, setIsNewAnalysis] = useState(false)
  const [loading, setLoading] = useState(true)
  const [tradingStyle, setTradingStyle] = useState<string>('swing')
  const [savingStyle, setSavingStyle] = useState(false)
  const router = useRouter()
  const supabase = createClient()
  const { isAnalyzing, setIsAnalyzing } = useAnalyzing()

  useEffect(() => {
    loadUserData()
  }, [])

  async function loadUserData() {
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) { router.push('/login'); return }

    const { data: profile } = await supabase
      .from('users').select('*').eq('id', authUser.id).single()

    if (profile) {
      setUser(profile as User)
      setTradingStyle(profile.trading_style || 'swing')
    }

    const { data: recentAnalyses } = await supabase
      .from('analyses').select('*').eq('user_id', authUser.id)
      .order('created_at', { ascending: false })

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
    setIsNewAnalysis(true)
    setAnalyses((prev) => [analysis, ...prev])
    setUser((prev) =>
      prev ? { ...prev, analyses_used_this_month: prev.analyses_used_this_month + 1 } : null
    )
    setIsAnalyzing(false)
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

  // Stats calculations
  const totalAnalyses = analyses.length
  const wonCount = analyses.filter(a => a.bias === 'bullish').length
  const winRate = totalAnalyses > 0 ? Math.round((wonCount / totalAnalyses) * 100) : 0
  const styleFreq = analyses.reduce<Record<string, number>>((acc, a) => {
    acc[a.trading_style] = (acc[a.trading_style] || 0) + 1
    return acc
  }, {})
  const topStyle = Object.entries(styleFreq).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '—'
  const topStyleLabel = TRADING_STYLES.find(s => s.value === topStyle)?.label ?? topStyle

  // Days until reset
  const resetDate = user?.monthly_reset_date ? new Date(user.monthly_reset_date) : null
  const daysUntilReset = resetDate
    ? Math.max(0, Math.ceil((resetDate.getTime() - Date.now()) / 86400000))
    : null

  return (
    <div className="relative">
      <LoadingPanel isLoading={isAnalyzing} />

      <div className="space-y-6">
        {/* ── Dashboard Header ── */}
        <div
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
          style={{
            background: 'var(--bf-header-bg)',
            padding: '28px 40px',
            borderBottom: '1px solid var(--bf-header-border)',
            marginLeft: '-1rem',
            marginRight: '-1rem',
            marginTop: '-2rem',
            boxShadow: '0 4px 24px rgba(0,52,255,0.05)',
          }}
        >
          <div>
            <p
              className="text-[#0052FF] uppercase tracking-widest text-xs font-semibold mb-1"
            >
              BLUEFLOW DASHBOARD
            </p>
            <h1
              style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '32px', lineHeight: 1.1, color: 'var(--bf-text-primary)' }}
            >
              {getGreeting(user?.country)}{user?.full_name ? `, ${user.full_name.split(' ')[0]}` : ''}.
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full uppercase tracking-wide ${tierColor}`}>
              {user?.subscription_tier || 'free'}
            </span>
            {user?.subscription_tier === 'free' && (
              <Link
                href="/pricing"
                className="text-white text-sm font-semibold flex items-center gap-1"
                style={{
                  background: 'linear-gradient(135deg, #0033CC, #00AAFF)',
                  padding: '10px 24px',
                  borderRadius: '10px',
                }}
              >
                ⚡ Upgrade
              </Link>
            )}
          </div>
        </div>

        {/* ── Usage Card ── */}
        <div
          className="rounded-2xl transition-all duration-200"
          style={{
            background: 'var(--bf-card-bg)',
            padding: '20px 28px',
            border: '1px solid var(--bf-card-border)',
            boxShadow: 'var(--bf-card-shadow)',
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#94A3B8] text-xs uppercase tracking-widest font-semibold mb-1">
                Analyses Used
              </p>
              <div className="flex items-baseline gap-2">
                <span
                  style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '36px', lineHeight: 1, color: 'var(--bf-text-primary)' }}
                >
                  {used}
                </span>
                <span className="text-[#94A3B8] text-sm">
                  of {limit === null ? 'unlimited' : limit} this month
                </span>
              </div>
              {daysUntilReset !== null && (
                <p className="text-[#94A3B8] mt-2" style={{ fontSize: '11px' }}>
                  {daysUntilReset} days until reset
                </p>
              )}
              {atLimit && (
                <p className="text-amber-500 text-xs mt-2">
                  Monthly limit reached.{' '}
                  <Link href="/pricing" className="text-[#00AAFF] hover:underline">
                    Upgrade to Pro
                  </Link>
                </p>
              )}
            </div>
            <CircularProgress used={used} limit={limit} />
          </div>
        </div>

        {/* ── Quick Stats Row ── */}
        {analyses.length > 0 && (
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: '📊', label: 'Total Analyses', value: totalAnalyses.toString(), accent: '#0052FF' },
              { icon: '🎯', label: 'Win Rate', value: `${winRate}%`, accent: '#16A34A' },
              { icon: '⚡', label: 'Best Style', value: topStyleLabel, accent: '#7C3AED' },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl transition-all duration-200 cursor-default"
                style={{
                  background: 'var(--bf-card-bg-subtle)',
                  padding: '16px 20px',
                  border: '1px solid var(--bf-card-border-subtle)',
                  boxShadow: 'var(--bf-card-shadow-subtle)',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.boxShadow = '0 6px 24px rgba(0,52,255,0.12)'
                  ;(e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.boxShadow = '0 2px 12px rgba(0,52,255,0.06)'
                  ;(e.currentTarget as HTMLDivElement).style.transform = 'none'
                }}
              >
                <div
                  className="text-lg mb-2 w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: `${stat.accent}14` }}
                >
                  {stat.icon}
                </div>
                <p className="text-[#94A3B8] uppercase tracking-widest font-semibold mb-1" style={{ fontSize: '11px' }}>
                  {stat.label}
                </p>
                <p
                  style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '24px', lineHeight: 1, color: 'var(--bf-text-primary)' }}
                >
                  {stat.value}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* ── Two-column: Upload + Analysis/Empty ── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-stretch">
          {/* Left: Upload card + Trading Style */}
          <div className="lg:col-span-3 flex flex-col gap-4">
            <ChartUploader
              disabled={atLimit}
              tradingStyle={tradingStyle}
              onAnalysisComplete={handleAnalysisComplete}
              onLoadingChange={setIsAnalyzing}
            />

            {/* Trading Style Chips */}
            <div
              className="rounded-xl transition-all duration-200"
              style={{
                background: 'var(--bf-style-card-bg)',
                border: '1px solid var(--bf-card-border)',
                borderLeft: '3px solid #0052FF',
                padding: '16px 20px',
                boxShadow: 'var(--bf-card-shadow-subtle)',
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h2 className="font-semibold text-sm" style={{ color: 'var(--bf-text-primary)' }}>Trading Style</h2>
                  <p className="text-[#64748B] text-xs mt-0.5">Select before analyzing your chart</p>
                </div>
                {savingStyle && <span className="text-[#64748B] text-xs">Saving...</span>}
              </div>
              <div className="flex flex-wrap gap-2">
                {TRADING_STYLES.map((style) => {
                  const selected = tradingStyle === style.value
                  return (
                    <button
                      key={style.value}
                      onClick={() => { setTradingStyle(style.value); saveTradingStyle(style.value) }}
                      className="transition-all duration-150 font-medium text-[13px]"
                      style={{
                        padding: '7px 16px',
                        borderRadius: '100px',
                        border: selected ? 'none' : '1px solid var(--bf-chip-border)',
                        background: selected ? 'linear-gradient(135deg, #0033CC, #0052FF)' : 'var(--bf-chip-bg)',
                        color: selected ? 'white' : 'var(--bf-chip-text)',
                        boxShadow: selected ? '0 4px 12px rgba(0,82,255,0.35)' : 'none',
                        transform: selected ? 'translateY(-1px)' : 'none',
                      }}
                      onMouseEnter={(e) => {
                        if (!selected) {
                          e.currentTarget.style.borderColor = '#0052FF'
                          e.currentTarget.style.color = '#0052FF'
                          e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0,82,255,0.08)'
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!selected) {
                          e.currentTarget.style.borderColor = 'var(--bf-chip-border)'
                          e.currentTarget.style.color = 'var(--bf-chip-text)'
                          e.currentTarget.style.boxShadow = 'none'
                        }
                      }}
                    >
                      <span className="flex flex-col items-center leading-tight">
                        <span>{style.emoji} {style.label}</span>
                        <span style={{ fontSize: '10px', opacity: selected ? 0.75 : 0.5, fontWeight: 400 }}>{style.time}</span>
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Right: Empty state or analysis result (narrower) */}
          <div className="lg:col-span-2 flex flex-col">
            {!activeAnalysis && !isAnalyzing ? (
              <EmptyState />
            ) : activeAnalysis && !isAnalyzing ? (
              <div className="animate-fade-in">
                {isNewAnalysis ? (
                  <AnalysisResult
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    analysis={activeAnalysis as any}
                    analysisId={activeAnalysis.id}
                    onOutcomeUpdate={() => {}}
                  />
                ) : (
                  <AnalysisCard analysis={activeAnalysis} />
                )}
              </div>
            ) : null}
          </div>
        </div>


        {/* ── Recent Analyses ── */}
        {analyses.length > 0 && !isAnalyzing && (
          <div
            className="pt-6"
            style={{ borderTop: '1px solid var(--bf-section-border)' }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2
                style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '18px', color: 'var(--bf-text-primary)' }}
              >
                Recent Analyses
              </h2>
              <Link href="/dashboard/history" className="text-[#0052FF] text-sm font-medium hover:underline">
                View all →
              </Link>
            </div>

            <div className="space-y-3">
              {analyses.slice(0, 1).map((analysis) => (
                <div
                  key={analysis.id}
                  className="flex items-center gap-4 transition-all duration-200 cursor-pointer"
                  style={{
                    background: 'var(--bf-analysis-row-bg)',
                    borderRadius: '16px',
                    border: '1px solid var(--bf-analysis-row-border)',
                    padding: '16px',
                    boxShadow: '0 2px 8px rgba(0,52,255,0.05)',
                  }}
                  onClick={() => router.push(`/dashboard/analysis/${analysis.id}`)}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget as HTMLDivElement
                    el.style.borderColor = '#BFDBFE'
                    el.style.boxShadow = '0 6px 24px rgba(0,82,255,0.12)'
                    el.style.transform = 'translateY(-2px)'
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget as HTMLDivElement
                    el.style.borderColor = 'var(--bf-analysis-row-border)'
                    el.style.boxShadow = '0 2px 8px rgba(0,52,255,0.05)'
                    el.style.transform = 'none'
                  }}
                >
                  {/* Thumbnail */}
                  <div
                    className="flex-shrink-0"
                    style={{
                      width: 68,
                      height: 68,
                      borderRadius: '12px',
                      border: '1px solid var(--bf-thumbnail-border)',
                      background: 'var(--bf-thumbnail-bg)',
                      overflow: 'hidden',
                    }}
                  >
                    {analysis.image_url && (
                      <img
                        src={analysis.image_url}
                        alt="Chart"
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span
                        className="text-xs font-semibold px-2 py-0.5 rounded-full"
                        style={{
                          background: analysis.bias === 'bullish' ? '#DCFCE7' : analysis.bias === 'bearish' ? '#FEE2E2' : '#FEF9C3',
                          color: analysis.bias === 'bullish' ? '#16A34A' : analysis.bias === 'bearish' ? '#DC2626' : '#CA8A04',
                        }}
                      >
                        {analysis.bias?.toUpperCase()}
                      </span>
{analysis.trading_style && (
                        <span
                          className="text-xs font-medium px-2 py-0.5 rounded-full"
                          style={{ background: '#EEF4FF', color: '#0052FF' }}
                        >
                          {TRADING_STYLES.find(s => s.value === analysis.trading_style)?.label ?? analysis.trading_style}
                        </span>
                      )}
                    </div>

                    <p className="text-[14px] font-medium truncate" style={{ color: 'var(--bf-text-primary)' }}>{analysis.pattern}</p>

                    <div className="flex items-center justify-between mt-1">
                      <span className="text-[#94A3B8] text-[12px]">
                        {new Date(analysis.created_at).toLocaleDateString('en-US', {
                          month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                        })}
                      </span>
                      <span className="text-[#0052FF] text-[12px] font-medium">View Analysis →</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
