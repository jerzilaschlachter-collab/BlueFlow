'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface Props {
  tier: 'pro' | 'elite'
  name: string
  price: number
  description: string
  features: string[]
  highlighted?: boolean
}

export default function PricingCard({ tier, name, price, description, features, highlighted }: Props) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

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
      body: JSON.stringify({ tier }),
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
      className={`relative rounded-2xl p-7 flex flex-col ${
        highlighted
          ? 'bg-zinc-900 border-2 border-[#0033CC]'
          : 'bg-zinc-900 border border-zinc-800'
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
        <h2 className="text-white font-bold text-xl mb-1">{name}</h2>
        <p className="text-zinc-500 text-sm">{description}</p>
      </div>

      <div className="mb-6">
        <span className="text-4xl font-bold text-white">€{price}</span>
        <span className="text-zinc-500 text-sm ml-1">/ month</span>
      </div>

      <ul className="space-y-3 mb-8 flex-1">
        {features.map((feature) => (
          <li key={feature} className="flex items-start gap-2.5 text-sm text-zinc-300">
            <svg
              className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                highlighted ? 'text-[#00AAFF]' : 'text-zinc-500'
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
            : 'border border-zinc-700 text-white hover:bg-zinc-800'
        }`}
      >
        {loading ? 'Redirecting...' : `Upgrade to ${name}`}
      </button>
    </div>
  )
}
