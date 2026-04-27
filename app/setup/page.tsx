'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Logo from '@/components/Logo'

const COUNTRIES = [
  { name: 'Afghanistan', flag: '🇦🇫' },
  { name: 'Albania', flag: '🇦🇱' },
  { name: 'Algeria', flag: '🇩🇿' },
  { name: 'Andorra', flag: '🇦🇩' },
  { name: 'Angola', flag: '🇦🇴' },
  { name: 'Antigua and Barbuda', flag: '🇦🇬' },
  { name: 'Argentina', flag: '🇦🇷' },
  { name: 'Armenia', flag: '🇦🇲' },
  { name: 'Australia', flag: '🇦🇺' },
  { name: 'Austria', flag: '🇦🇹' },
  { name: 'Azerbaijan', flag: '🇦🇿' },
  { name: 'Bahamas', flag: '🇧🇸' },
  { name: 'Bahrain', flag: '🇧🇭' },
  { name: 'Bangladesh', flag: '🇧🇩' },
  { name: 'Barbados', flag: '🇧🇧' },
  { name: 'Belarus', flag: '🇧🇾' },
  { name: 'Belgium', flag: '🇧🇪' },
  { name: 'Belize', flag: '🇧🇿' },
  { name: 'Benin', flag: '🇧🇯' },
  { name: 'Bhutan', flag: '🇧🇹' },
  { name: 'Bolivia', flag: '🇧🇴' },
  { name: 'Bosnia and Herzegovina', flag: '🇧🇦' },
  { name: 'Botswana', flag: '🇧🇼' },
  { name: 'Brazil', flag: '🇧🇷' },
  { name: 'Brunei', flag: '🇧🇳' },
  { name: 'Bulgaria', flag: '🇧🇬' },
  { name: 'Burkina Faso', flag: '🇧🇫' },
  { name: 'Burundi', flag: '🇧🇮' },
  { name: 'Cabo Verde', flag: '🇨🇻' },
  { name: 'Cambodia', flag: '🇰🇭' },
  { name: 'Cameroon', flag: '🇨🇲' },
  { name: 'Canada', flag: '🇨🇦' },
  { name: 'Central African Republic', flag: '🇨🇫' },
  { name: 'Chad', flag: '🇹🇩' },
  { name: 'Chile', flag: '🇨🇱' },
  { name: 'China', flag: '🇨🇳' },
  { name: 'Colombia', flag: '🇨🇴' },
  { name: 'Comoros', flag: '🇰🇲' },
  { name: 'Congo (Brazzaville)', flag: '🇨🇬' },
  { name: 'Congo (Kinshasa)', flag: '🇨🇩' },
  { name: 'Costa Rica', flag: '🇨🇷' },
  { name: 'Croatia', flag: '🇭🇷' },
  { name: 'Cuba', flag: '🇨🇺' },
  { name: 'Cyprus', flag: '🇨🇾' },
  { name: 'Czech Republic', flag: '🇨🇿' },
  { name: 'Denmark', flag: '🇩🇰' },
  { name: 'Djibouti', flag: '🇩🇯' },
  { name: 'Dominica', flag: '🇩🇲' },
  { name: 'Dominican Republic', flag: '🇩🇴' },
  { name: 'Ecuador', flag: '🇪🇨' },
  { name: 'Egypt', flag: '🇪🇬' },
  { name: 'El Salvador', flag: '🇸🇻' },
  { name: 'Equatorial Guinea', flag: '🇬🇶' },
  { name: 'Eritrea', flag: '🇪🇷' },
  { name: 'Estonia', flag: '🇪🇪' },
  { name: 'Eswatini', flag: '🇸🇿' },
  { name: 'Ethiopia', flag: '🇪🇹' },
  { name: 'Fiji', flag: '🇫🇯' },
  { name: 'Finland', flag: '🇫🇮' },
  { name: 'France', flag: '🇫🇷' },
  { name: 'Gabon', flag: '🇬🇦' },
  { name: 'Gambia', flag: '🇬🇲' },
  { name: 'Georgia', flag: '🇬🇪' },
  { name: 'Germany', flag: '🇩🇪' },
  { name: 'Ghana', flag: '🇬🇭' },
  { name: 'Greece', flag: '🇬🇷' },
  { name: 'Grenada', flag: '🇬🇩' },
  { name: 'Guatemala', flag: '🇬🇹' },
  { name: 'Guinea', flag: '🇬🇳' },
  { name: 'Guinea-Bissau', flag: '🇬🇼' },
  { name: 'Guyana', flag: '🇬🇾' },
  { name: 'Haiti', flag: '🇭🇹' },
  { name: 'Honduras', flag: '🇭🇳' },
  { name: 'Hungary', flag: '🇭🇺' },
  { name: 'Iceland', flag: '🇮🇸' },
  { name: 'India', flag: '🇮🇳' },
  { name: 'Indonesia', flag: '🇮🇩' },
  { name: 'Iran', flag: '🇮🇷' },
  { name: 'Iraq', flag: '🇮🇶' },
  { name: 'Ireland', flag: '🇮🇪' },
  { name: 'Israel', flag: '🇮🇱' },
  { name: 'Italy', flag: '🇮🇹' },
  { name: 'Jamaica', flag: '🇯🇲' },
  { name: 'Japan', flag: '🇯🇵' },
  { name: 'Jordan', flag: '🇯🇴' },
  { name: 'Kazakhstan', flag: '🇰🇿' },
  { name: 'Kenya', flag: '🇰🇪' },
  { name: 'Kiribati', flag: '🇰🇮' },
  { name: 'Kuwait', flag: '🇰🇼' },
  { name: 'Kyrgyzstan', flag: '🇰🇬' },
  { name: 'Laos', flag: '🇱🇦' },
  { name: 'Latvia', flag: '🇱🇻' },
  { name: 'Lebanon', flag: '🇱🇧' },
  { name: 'Lesotho', flag: '🇱🇸' },
  { name: 'Liberia', flag: '🇱🇷' },
  { name: 'Libya', flag: '🇱🇾' },
  { name: 'Liechtenstein', flag: '🇱🇮' },
  { name: 'Lithuania', flag: '🇱🇹' },
  { name: 'Luxembourg', flag: '🇱🇺' },
  { name: 'Madagascar', flag: '🇲🇬' },
  { name: 'Malawi', flag: '🇲🇼' },
  { name: 'Malaysia', flag: '🇲🇾' },
  { name: 'Maldives', flag: '🇲🇻' },
  { name: 'Mali', flag: '🇲🇱' },
  { name: 'Malta', flag: '🇲🇹' },
  { name: 'Marshall Islands', flag: '🇲🇭' },
  { name: 'Mauritania', flag: '🇲🇷' },
  { name: 'Mauritius', flag: '🇲🇺' },
  { name: 'Mexico', flag: '🇲🇽' },
  { name: 'Micronesia', flag: '🇫🇲' },
  { name: 'Moldova', flag: '🇲🇩' },
  { name: 'Monaco', flag: '🇲🇨' },
  { name: 'Mongolia', flag: '🇲🇳' },
  { name: 'Montenegro', flag: '🇲🇪' },
  { name: 'Morocco', flag: '🇲🇦' },
  { name: 'Mozambique', flag: '🇲🇿' },
  { name: 'Myanmar', flag: '🇲🇲' },
  { name: 'Namibia', flag: '🇳🇦' },
  { name: 'Nauru', flag: '🇳🇷' },
  { name: 'Nepal', flag: '🇳🇵' },
  { name: 'Netherlands', flag: '🇳🇱' },
  { name: 'New Zealand', flag: '🇳🇿' },
  { name: 'Nicaragua', flag: '🇳🇮' },
  { name: 'Niger', flag: '🇳🇪' },
  { name: 'Nigeria', flag: '🇳🇬' },
  { name: 'North Korea', flag: '🇰🇵' },
  { name: 'North Macedonia', flag: '🇲🇰' },
  { name: 'Norway', flag: '🇳🇴' },
  { name: 'Oman', flag: '🇴🇲' },
  { name: 'Pakistan', flag: '🇵🇰' },
  { name: 'Palau', flag: '🇵🇼' },
  { name: 'Palestine', flag: '🇵🇸' },
  { name: 'Panama', flag: '🇵🇦' },
  { name: 'Papua New Guinea', flag: '🇵🇬' },
  { name: 'Paraguay', flag: '🇵🇾' },
  { name: 'Peru', flag: '🇵🇪' },
  { name: 'Philippines', flag: '🇵🇭' },
  { name: 'Poland', flag: '🇵🇱' },
  { name: 'Portugal', flag: '🇵🇹' },
  { name: 'Qatar', flag: '🇶🇦' },
  { name: 'Romania', flag: '🇷🇴' },
  { name: 'Russia', flag: '🇷🇺' },
  { name: 'Rwanda', flag: '🇷🇼' },
  { name: 'Saint Kitts and Nevis', flag: '🇰🇳' },
  { name: 'Saint Lucia', flag: '🇱🇨' },
  { name: 'Saint Vincent and the Grenadines', flag: '🇻🇨' },
  { name: 'Samoa', flag: '🇼🇸' },
  { name: 'San Marino', flag: '🇸🇲' },
  { name: 'Sao Tome and Principe', flag: '🇸🇹' },
  { name: 'Saudi Arabia', flag: '🇸🇦' },
  { name: 'Senegal', flag: '🇸🇳' },
  { name: 'Serbia', flag: '🇷🇸' },
  { name: 'Seychelles', flag: '🇸🇨' },
  { name: 'Sierra Leone', flag: '🇸🇱' },
  { name: 'Singapore', flag: '🇸🇬' },
  { name: 'Slovakia', flag: '🇸🇰' },
  { name: 'Slovenia', flag: '🇸🇮' },
  { name: 'Solomon Islands', flag: '🇸🇧' },
  { name: 'Somalia', flag: '🇸🇴' },
  { name: 'South Africa', flag: '🇿🇦' },
  { name: 'South Korea', flag: '🇰🇷' },
  { name: 'South Sudan', flag: '🇸🇸' },
  { name: 'Spain', flag: '🇪🇸' },
  { name: 'Sri Lanka', flag: '🇱🇰' },
  { name: 'Sudan', flag: '🇸🇩' },
  { name: 'Suriname', flag: '🇸🇷' },
  { name: 'Sweden', flag: '🇸🇪' },
  { name: 'Switzerland', flag: '🇨🇭' },
  { name: 'Syria', flag: '🇸🇾' },
  { name: 'Taiwan', flag: '🇹🇼' },
  { name: 'Tajikistan', flag: '🇹🇯' },
  { name: 'Tanzania', flag: '🇹🇿' },
  { name: 'Thailand', flag: '🇹🇭' },
  { name: 'Timor-Leste', flag: '🇹🇱' },
  { name: 'Togo', flag: '🇹🇬' },
  { name: 'Tonga', flag: '🇹🇴' },
  { name: 'Trinidad and Tobago', flag: '🇹🇹' },
  { name: 'Tunisia', flag: '🇹🇳' },
  { name: 'Turkey', flag: '🇹🇷' },
  { name: 'Turkmenistan', flag: '🇹🇲' },
  { name: 'Tuvalu', flag: '🇹🇻' },
  { name: 'Uganda', flag: '🇺🇬' },
  { name: 'Ukraine', flag: '🇺🇦' },
  { name: 'United Arab Emirates', flag: '🇦🇪' },
  { name: 'United Kingdom', flag: '🇬🇧' },
  { name: 'United States', flag: '🇺🇸' },
  { name: 'Uruguay', flag: '🇺🇾' },
  { name: 'Uzbekistan', flag: '🇺🇿' },
  { name: 'Vanuatu', flag: '🇻🇺' },
  { name: 'Vatican City', flag: '🇻🇦' },
  { name: 'Venezuela', flag: '🇻🇪' },
  { name: 'Vietnam', flag: '🇻🇳' },
  { name: 'Yemen', flag: '🇾🇪' },
  { name: 'Zambia', flag: '🇿🇲' },
  { name: 'Zimbabwe', flag: '🇿🇼' },
]

const TRADING_PLATFORMS = [
  'TradingView',
  'MetaTrader 4 (MT4)',
  'MetaTrader 5 (MT5)',
  'cTrader',
  'Thinkorswim (TD Ameritrade)',
  'Interactive Brokers',
  'NinjaTrader',
  'Webull',
  'Robinhood',
  'eToro',
  'Saxo Bank',
  'OANDA',
  'IG Group',
  'Binance',
  'Coinbase',
  'Other',
]

function CountrySelect({
  value,
  onChange,
}: {
  value: string
  onChange: (val: string) => void
}) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  const filtered = COUNTRIES.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  )

  const selected = COUNTRIES.find((c) => c.name === value)

  useEffect(() => {
    if (open) {
      setTimeout(() => searchRef.current?.focus(), 0)
    } else {
      setSearch('')
    }
  }, [open])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-4 py-3 text-sm text-left flex items-center justify-between focus:outline-none focus:border-[#0033CC] transition-colors"
      >
        {selected ? (
          <span className="flex items-center gap-2 text-[#0A0E27]">
            <span className="text-base leading-none">{selected.flag}</span>
            {selected.name}
          </span>
        ) : (
          <span className="text-[#94A3B8]">Select your country</span>
        )}
        <svg
          className={`w-4 h-4 text-[#94A3B8] transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-[#E2E8F0] rounded-xl shadow-lg overflow-hidden">
          {/* Search */}
          <div className="p-2 border-b border-[#E2E8F0]">
            <div className="flex items-center gap-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-3 py-2">
              <svg className="w-3.5 h-3.5 text-[#94A3B8] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
              </svg>
              <input
                ref={searchRef}
                type="text"
                placeholder="Search country..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-transparent text-[#0A0E27] text-sm placeholder-[#94A3B8] focus:outline-none w-full"
              />
            </div>
          </div>

          {/* List */}
          <ul className="max-h-48 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <li className="px-4 py-3 text-sm text-[#94A3B8] text-center">No results</li>
            ) : (
              filtered.map((c) => (
                <li key={c.name}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(c.name)
                      setOpen(false)
                    }}
                    className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-2.5 hover:bg-[#F8FAFC] transition-colors ${
                      value === c.name ? 'bg-blue-50 text-[#0033CC] font-medium' : 'text-[#0A0E27]'
                    }`}
                  >
                    <span className="text-base leading-none">{c.flag}</span>
                    {c.name}
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  )
}

export default function SetupPage() {
  const [firstName, setFirstName] = useState('')
  const [country, setCountry] = useState('')
  const [tradingPlatform, setTradingPlatform] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async () => {
    if (!firstName.trim() || !country || !tradingPlatform) {
      setError('Please fill in all fields.')
      return
    }

    setLoading(true)
    setError(null)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      router.push('/login')
      return
    }

    const { error: updateError } = await supabase
      .from('users')
      .update({
        full_name: firstName.trim(),
        country,
        trading_platform: tradingPlatform,
        setup_completed: true,
      })
      .eq('id', user.id)

    if (updateError) {
      setError('Something went wrong. Please try again.')
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSubmit()
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-start pt-4 px-4">
      <div className="flex items-center mb-10">
        <Logo size={200} />
      </div>

      <div className="w-full max-w-sm bg-white border border-[#E2E8F0] rounded-2xl p-8 shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
        <h1 className="text-[#0A0E27] font-bold text-2xl mb-1">Set up your profile</h1>
        <p className="text-[#64748B] text-sm mb-7">
          Just a few details to personalise your experience.
        </p>

        <div className="space-y-3 mb-4">
          {/* First name */}
          <div>
            <label className="block text-xs font-medium text-[#64748B] mb-1.5">First name</label>
            <input
              type="text"
              placeholder="Your first name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-4 py-3 text-[#0A0E27] text-sm placeholder-[#94A3B8] focus:outline-none focus:border-[#0033CC] transition-colors"
            />
          </div>

          {/* Country */}
          <div>
            <label className="block text-xs font-medium text-[#64748B] mb-1.5">Country</label>
            <CountrySelect value={country} onChange={setCountry} />
          </div>

          {/* Trading platform */}
          <div>
            <label className="block text-xs font-medium text-[#64748B] mb-1.5">Trading platform</label>
            <select
              value={tradingPlatform}
              onChange={(e) => setTradingPlatform(e.target.value)}
              className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-4 py-3 text-[#0A0E27] text-sm focus:outline-none focus:border-[#0033CC] transition-colors appearance-none"
            >
              <option value="" disabled>Select your platform</option>
              {TRADING_PLATFORMS.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
        </div>

        {error && (
          <div className="text-sm px-4 py-3 rounded-xl mb-4 bg-red-500/10 border border-red-500/20 text-red-500">
            {error}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full gradient-bg text-white rounded-xl py-3 text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Continue to dashboard'}
        </button>
      </div>
    </div>
  )
}
