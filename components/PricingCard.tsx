'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface Props {
  tier: 'pro' | 'elite'
  name: string
  monthlyPrice: number
  yearlyPrice: number
  description: string
  features: string[]
  highlighted?: boolean
  interval: 'monthly' | 'yearly'
}

export default function PricingCard({ tier, name, monthlyPrice, yearlyPrice, description, features, highlighted, interval }: Props) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const price = interval === 'yearly' ? yearlyPrice : monthlyPrice
  const monthlyCost = interval === 'yearly' ? (yearlyPrice / 12).toFixed(2) : null
  const yearlySavings = interval === 'yearly' ? (monthlyPrice * 12) - yearlyPrice : 0

  const handleSubscribe = async () => {
    setLoading(true)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      router.push('/login')
      return
    }

    const response = await fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tier, interval }),
    })

    const data = await response.json()

    if (data.url) {
      window.location.href = data.url
    } else {
      console.error('Checkout failed:', data.error)
      setLoading(false)
    }
  }

  return (
    <div
      className={`relative rounded-2xl p-7 flex flex-col shadow-[0_1px_4px_rgba(0,0,0,0.06)] ${
        highlighted
          ? 'bg-white border-2 border-[#0033CC]'
          : 'bg-white border border-[#E2E8F0]'
      }`}
    >
      {highlighted && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
          <span className="gradient-bg text-white text-xs font-bold px-4 py-1.5 rounded-full">
            MOST POPULAR
          </span>
        </div>
      )}

      <div className="mb-6">
        <h2 className="text-[#0A0E27] font-bold text-xl mb-1">{name}</h2>
        <p className="text-[#64748B] text-sm">{description}</p>
      </div>

      <div className="mb-2">
        {interval === 'yearly' ? (
          <>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-bold text-[#0A0E27]">€{price}</span>
              <span className="text-[#64748B] text-sm">/ year</span>
            </div>
            <p className="text-[#64748B] text-xs mt-0.5">€{monthlyCost} / month</p>
          </>
        ) : (
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-bold text-[#0A0E27]">€{price}</span>
            <span className="text-[#64748B] text-sm">/ month</span>
          </div>
        )}
      </div>

      {interval === 'yearly' && yearlySavings > 0 && (
        <div className="mb-5">
          <span className="inline-block bg-green-50 text-green-700 text-xs font-semibold px-2.5 py-1 rounded-full">
            Save €{yearlySavings} / year
          </span>
        </div>
      )}

      {interval === 'monthly' && <div className="mb-5" />}

      <ul className="space-y-3 mb-8 flex-1">
        {features.map((feature) => (
          <li key={feature} className="flex items-start gap-2.5 text-sm text-[#334155]">
            <svg
              className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                highlighted ? 'text-[#00AAFF]' : 'text-[#94A3B8]'
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {feature}
          </li>
        ))}
      </ul>

      <button
        onClick={handleSubscribe}
        disabled={loading}
        className={`w-full py-3 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 ${
          highlighted
            ? 'gradient-bg text-white hover:opacity-90'
            : 'border border-[#E2E8F0] text-[#0A0E27] hover:bg-[#F8FAFC]'
        }`}
      >
        {loading ? 'Redirecting...' : `Upgrade to ${name}`}
      </button>
    </div>
  )
}
