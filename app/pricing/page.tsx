'use client'

import { useState } from 'react'
import Link from 'next/link'
import PricingCard from '@/components/PricingCard'
import Logo from '@/components/Logo'

export default function PricingPage() {
  const [interval, setInterval] = useState<'monthly' | 'yearly'>('monthly')

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-[#E2E8F0] max-w-7xl mx-auto">
        <Link href="/" className="flex items-center">
          <Logo size={128} />
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-[#64748B] hover:text-[#0A0E27] transition-colors text-sm">
            Dashboard
          </Link>
          <Link
            href="/login"
            className="gradient-bg text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Get started
          </Link>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-[#0A0E27] mb-4">
            Simple, transparent pricing
          </h1>
          <p className="text-[#64748B] text-xl">
            Start free. Upgrade when you need more.
          </p>
        </div>

        {/* Billing toggle */}
        <div className="flex items-center justify-center gap-3 mb-12">
          <button
            onClick={() => setInterval('monthly')}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
              interval === 'monthly'
                ? 'gradient-bg text-white shadow-sm'
                : 'text-[#64748B] hover:text-[#0A0E27]'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setInterval('yearly')}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
              interval === 'yearly'
                ? 'gradient-bg text-white shadow-sm'
                : 'text-[#64748B] hover:text-[#0A0E27]'
            }`}
          >
            Yearly
            <span className="ml-2 bg-green-100 text-green-700 text-xs font-semibold px-2 py-0.5 rounded-full">
              Save up to 58%
            </span>
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-6 items-start">
          {/* Free */}
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-7 shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
            <div className="mb-6">
              <h2 className="text-[#0A0E27] font-bold text-xl mb-1">Free</h2>
              <p className="text-[#64748B] text-sm">Perfect to get started</p>
            </div>
            <div className="mb-2">
              <span className="text-4xl font-bold text-[#0A0E27]">€0</span>
              <span className="text-[#64748B] text-sm ml-1">/ month</span>
            </div>
            <div className="mb-5" />
            <ul className="space-y-3 mb-8">
              {[
                '2 analyses per month',
                'All trading styles',
                'Full analysis breakdown',
                'Analysis history',
              ].map((feature) => (
                <li key={feature} className="flex items-start gap-2.5 text-sm text-[#64748B]">
                  <svg className="w-4 h-4 text-[#94A3B8] mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>
            <Link
              href="/login"
              className="block w-full text-center border border-[#E2E8F0] text-[#0A0E27] py-3 rounded-xl text-sm font-medium hover:bg-[#F8FAFC] transition-colors"
            >
              Get started free
            </Link>
          </div>

          {/* Pro */}
          <PricingCard
            tier="pro"
            name="Pro"
            monthlyPrice={20}
            yearlyPrice={150}
            description="For active traders"
            features={[
              '100+ analyses per month',
              'All trading styles',
              'Full analysis history',
              'Priority processing',
              'Export analyses as PDF',
            ]}
            highlighted
            interval={interval}
          />

          {/* Elite */}
          <PricingCard
            tier="elite"
            name="Elite"
            monthlyPrice={50}
            yearlyPrice={250}
            description="For professional traders"
            features={[
              '200+ analyses per month',
              'Everything in Pro',
              'Multi-timeframe analysis',
              'Custom AI prompts',
              'API access',
              'Dedicated support',
              'Early feature access',
            ]}
            interval={interval}
          />
        </div>

        {/* FAQ */}
        <div className="mt-20">
          <h2 className="text-2xl font-bold text-[#0A0E27] text-center mb-10">
            Frequently asked questions
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                q: 'What counts as an analysis?',
                a: 'Each chart you upload and analyze counts as one analysis. The result is saved to your history.',
              },
              {
                q: 'Can I cancel anytime?',
                a: 'Yes. Cancel your subscription anytime from your billing settings. You keep access until the end of your billing period.',
              },
              {
                q: 'What chart formats are supported?',
                a: 'BlueFlow accepts JPG and PNG chart images. TradingView screenshots, broker charts, and any other image format work.',
              },
              {
                q: 'What trading styles does the AI support?',
                a: 'Scalping, day trading, swing trading, and position trading. The AI analysis adapts its focus to your selected style.',
              },
            ].map((item) => (
              <div key={item.q} className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
                <h3 className="text-[#0A0E27] font-semibold mb-2">{item.q}</h3>
                <p className="text-[#64748B] text-sm leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
