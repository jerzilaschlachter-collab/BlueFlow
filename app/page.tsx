'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import Logo from '@/components/Logo'
import SentimentGauge from '@/components/SentimentGauge'
import ReviewsCarousel from '@/components/ReviewsCarousel'
import PricingCard from '@/components/PricingCard'

export default function HomePage() {
  const [interval, setInterval] = useState<'monthly' | 'yearly'>('monthly')

  const [affiliateForm, setAffiliateForm] = useState({
    name: '', email: '', platform: '', audience_size: '', handle: '', note: '',
  })
  const [affiliateStatus, setAffiliateStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [affiliateError, setAffiliateError] = useState('')

  const handleAffiliateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!affiliateForm.name || !affiliateForm.email || !affiliateForm.platform || !affiliateForm.audience_size) {
      setAffiliateError('Please fill in all required fields.')
      return
    }
    setAffiliateStatus('loading')
    setAffiliateError('')
    try {
      const res = await fetch('/api/affiliates/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(affiliateForm),
      })
      const data = await res.json()
      if (!res.ok) {
        setAffiliateError(data.error || 'Something went wrong.')
        setAffiliateStatus('error')
      } else {
        setAffiliateStatus('success')
      }
    } catch {
      setAffiliateError('Something went wrong. Please try again.')
      setAffiliateStatus('error')
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-[#E2E8F0] max-w-7xl mx-auto">
        <div className="flex items-center">
          <Logo size={128} />
        </div>
        <div className="hidden sm:flex items-center gap-6">
          <a href="#features" className="text-[#64748B] hover:text-[#0A0E27] transition-colors text-sm">Features</a>
          <a href="#testimonials" className="text-[#64748B] hover:text-[#0A0E27] transition-colors text-sm">Testimonials</a>
          <a href="#pricing" className="text-[#64748B] hover:text-[#0A0E27] transition-colors text-sm">Pricing</a>
          <a href="#affiliates" className="text-[#64748B] hover:text-[#0A0E27] transition-colors text-sm">Affiliates</a>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="text-[#64748B] hover:text-[#0A0E27] transition-colors text-sm"
          >
            Sign in
          </Link>
          <Link
            href="/login"
            className="gradient-bg text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Get started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 pt-24 pb-20 text-center">
        <div className="inline-flex items-center gap-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-full px-4 py-1.5 text-sm text-[#64748B] mb-8">
          <span className="w-2 h-2 rounded-full bg-[#00AAFF] animate-pulse-slow"></span>
          Powered by Anthropic Claude Vision AI
        </div>

        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-none text-[#0A0E27]">
          Your chart analyzed.
          <br />
          <span className="gradient-text">In 2 seconds.</span>
        </h1>

        <p className="text-[#64748B] text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
          Stop spending hours on analysis. BlueFlow reads any chart instantly — applying the level of analysis used by professionals.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/login"
            className="gradient-bg text-white px-8 py-3.5 rounded-xl font-semibold text-lg hover:opacity-90 transition-opacity w-full sm:w-auto"
          >
            Start for free
          </Link>
          <a
            href="#pricing"
            className="border border-[#E2E8F0] text-[#64748B] px-8 py-3.5 rounded-xl font-semibold text-lg hover:border-[#CBD5E1] hover:text-[#0A0E27] transition-all w-full sm:w-auto"
          >
            View pricing
          </a>
        </div>

        <p className="text-[#94A3B8] text-sm mt-4">2 free analyses per month. No credit card required.</p>
      </section>

      {/* AI Analyst intro */}
      <section
        style={{
          background: '#F0F4FF',
          borderRadius: 24,
          margin: '0 auto 60px',
          maxWidth: 1100,
        }}
        className="px-10 py-16 mx-6 lg:mx-auto"
      >
        <div className="flex flex-col md:flex-row items-center gap-12">
          {/* Left: text */}
          <div className="flex-1 min-w-0">
            <span className="text-xs font-semibold tracking-widest text-[#00AAFF] uppercase mb-3 block">
              Your AI Analyst
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-[#0A0E27] leading-tight mb-6">
              He reads charts.
              <br />
              You make money.
            </h2>
            <ul className="space-y-3 text-[#64748B] text-base mb-8">
              <li className="flex items-start gap-2"><span className="text-[#00AAFF] mt-1">•</span>Powered by Anthropic Claude Vision AI</li>
              <li className="flex items-start gap-2"><span className="text-[#00AAFF] mt-1">•</span>Speaks YOUR trading style — SMC, Price Action, Elliott Wave and more</li>
              <li className="flex items-start gap-2"><span className="text-[#00AAFF] mt-1">•</span>Full analysis in under 2 seconds, every time</li>
            </ul>
            <Link
              href="/login"
              className="gradient-bg text-white px-6 py-3 rounded-xl font-semibold text-base hover:opacity-90 transition-opacity inline-block"
            >
              Analyze Your First Chart Free →
            </Link>
          </div>

          {/* Right: flame with sonar rings */}
          <div className="flex flex-col items-center gap-4 flex-shrink-0">
            <div className="relative flex items-center justify-center" style={{ width: 180, height: 180 }}>
              <span className="sonar-ring" />
              <span className="sonar-ring sonar-ring-2" />
              <span className="sonar-ring sonar-ring-3" />
              <div className="relative z-10 flame-float">
                <Logo size={240} />
              </div>
            </div>
            <p className="text-[#0A0E27] font-semibold text-sm">BlueFlow AI Analyst</p>
            <p className="text-[#94A3B8] text-xs">Always on. Always precise.</p>
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section className="max-w-7xl mx-auto px-6 pb-24">
        <div className="text-center mb-12">
          <span className="text-xs font-semibold tracking-widest text-[#00AAFF] uppercase mb-3 block">See It In Action</span>
          <h2 className="text-3xl md:text-4xl font-bold text-[#0A0E27]">Upload a chart. Get this.</h2>
          <p className="text-[#64748B] mt-3 text-lg max-w-xl mx-auto">Real output from a single chart upload — in under 2 seconds.</p>
        </div>

        {/* 3-col layout: chart+checklist | arrows | output cards */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_56px_1fr] gap-0 items-stretch">

          {/* LEFT: chart + checklist */}
          <div className="flex flex-col gap-4">
            <div className="rounded-2xl overflow-hidden border border-[#E2E8F0] shadow-xl">
              <div className="bg-[#0A0E27] px-4 py-2.5 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500 opacity-80" />
                <span className="w-3 h-3 rounded-full bg-yellow-400 opacity-80" />
                <span className="w-3 h-3 rounded-full bg-green-400 opacity-80" />
                <span className="ml-3 text-[#64748B] text-xs font-mono">SPX · 1D · TradingView</span>
              </div>
              <Image
                src="/Charttest1.png"
                alt="S&P 500 chart example"
                width={2940}
                height={1912}
                className="w-full h-auto"
                priority
              />
            </div>

            {/* Pre-Trade Checklist below chart */}
            <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-sm">
              <h3 className="text-[#131722] font-semibold text-sm mb-4 flex items-center gap-2">
                ✅ Pre-Trade Checklist
              </h3>
              <ul className="space-y-2">
                {[
                  'Trend confirmed',
                  'Key level identified',
                  'Pattern valid',
                  'Risk/reward acceptable',
                  'Entry timing clear',
                  'Stop loss logical',
                  'No major news risk',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2.5 text-sm text-[#131722]">
                    <span className="font-bold" style={{ color: '#26A69A' }}>✓</span>
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-4 rounded-lg px-4 py-2.5 text-sm font-medium text-center" style={{ background: '#F0FFF4', color: '#26A69A', border: '1px solid #C6F6D5' }}>
                All conditions met — setup is valid
              </div>
            </div>

            {/* AI Scan card */}
            <div className="flex-1 rounded-xl overflow-hidden shadow-sm" style={{ background: '#0A0E27', border: '1px solid #1E2D45' }}>
              <div className="px-5 py-3 flex items-center justify-between" style={{ borderBottom: '1px solid #1E2D45' }}>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#00AAFF] animate-pulse" />
                  <span className="text-xs font-semibold text-[#00AAFF] uppercase tracking-widest">BlueFlow</span>
                </div>
                <span className="text-[10px] text-[#3D5A7A] font-mono">SPX · 1D</span>
              </div>
              <div className="relative px-5 py-4" style={{ minHeight: 148 }}>
                {/* Sweep line */}
                <div className="scan-line absolute left-0 right-0 h-px pointer-events-none" style={{ background: 'linear-gradient(90deg, transparent, #00AAFF88, #00AAFF, #00AAFF88, transparent)', boxShadow: '0 0 8px 2px #00AAFF55' }} />
                <ul className="space-y-2.5">
                  {[
                    { cls: 'scan-item-1', icon: '📐', label: 'Bullish engulfing pattern', tag: 'Pattern' },
                    { cls: 'scan-item-2', icon: '🔵', label: 'Support at $6,782 confirmed', tag: 'Level' },
                    { cls: 'scan-item-3', icon: '📈', label: 'RSI bullish divergence', tag: 'Oscillator' },
                    { cls: 'scan-item-4', icon: '🟢', label: 'Price above EMA 20 & 50', tag: 'MA' },
                    { cls: 'scan-item-5', icon: '⚡', label: 'Volume surge on breakout', tag: 'Volume' },
                  ].map(({ cls, icon, label, tag }) => (
                    <li key={label} className={`${cls} flex items-center gap-3`}>
                      <span className="text-sm">{icon}</span>
                      <span className="text-[13px] text-[#CBD5E1] flex-1">{label}</span>
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded" style={{ background: '#1E2D45', color: '#00AAFF' }}>{tag}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* MIDDLE: arrow connectors (desktop only) */}
          <div className="hidden lg:flex flex-col items-center gap-4">
            {/* Arrow 1 → Oscillators & MAs card */}
            <div className="flex items-center justify-center" style={{ height: 260 }}>
              <svg width="32" height="20" viewBox="0 0 32 20" fill="none">
                <path d="M0 10h26" stroke="#00AAFF" strokeWidth="2" strokeLinecap="round"/>
                <path d="M20 3l10 7-10 7" stroke="#00AAFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            {/* Arrow 2 → Trade Setup card */}
            <div className="flex items-center justify-center flex-1">
              <svg width="32" height="20" viewBox="0 0 32 20" fill="none">
                <path d="M0 10h26" stroke="#00AAFF" strokeWidth="2" strokeLinecap="round"/>
                <path d="M20 3l10 7-10 7" stroke="#00AAFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>

          {/* RIGHT: output cards */}
          <div className="flex flex-col gap-4">
            {/* Card 1: Oscillators & Moving Averages gauges */}
            <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-sm">
              <div className="flex items-start justify-around gap-2 divide-x divide-[#F0F3FA]">
                <div className="flex-1 flex flex-col items-center">
                  <SentimentGauge
                    title="Oscillators"
                    label="Buy"
                    buy={7}
                    neutral={2}
                    sell={1}
                    confidence={70}
                  />
                </div>
                <div className="flex-1 flex flex-col items-center pl-2">
                  <SentimentGauge
                    title="Moving Averages"
                    label="Strong Buy"
                    buy={14}
                    neutral={1}
                    sell={0}
                    confidence={93}
                  />
                </div>
              </div>
            </div>

            {/* Card 2: Trade Setup */}
            <div className="flex-1 bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-1">Trade Setup</h3>
              <p className="text-xs text-gray-400 mb-4">
                The specific entry, exit, and risk parameters for executing this trade idea — follow these levels precisely.
              </p>
              <div className="text-3xl font-bold mb-4 text-green-600">A</div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <p className="text-xs text-blue-600 uppercase font-semibold">Entry Zone</p>
                <p className="text-sm font-semibold text-blue-900">$6,780.00 to $6,820.00</p>
                <p className="text-xs text-blue-700">Limit</p>
              </div>
              <p className="text-sm text-gray-700 mb-4">
                Enter on pullback to key support zone after confirmation of bullish structure hold; allows favorable risk entry with defined stop.
              </p>
              <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="bg-red-50 border border-red-100 p-3 rounded-lg">
                  <p className="text-xs text-red-500 font-semibold uppercase">Stop Loss</p>
                  <p className="font-bold text-red-800 text-base">$6,710.00</p>
                </div>
                <div className="bg-green-50 border border-green-100 p-3 rounded-lg">
                  <p className="text-xs text-green-600 font-semibold uppercase">TP 1</p>
                  <p className="font-bold text-green-800 text-base">$6,920.00</p>
                </div>
                <div className="bg-green-50 border border-green-100 p-3 rounded-lg">
                  <p className="text-xs text-green-600 font-semibold uppercase">TP 2</p>
                  <p className="font-bold text-green-800 text-base">$7,050.00</p>
                </div>
                <div className="bg-green-50 border border-green-100 p-3 rounded-lg">
                  <p className="text-xs text-green-600 font-semibold uppercase">TP 3</p>
                  <p className="font-bold text-green-800 text-base">$7,200.00</p>
                </div>
              </div>
              <div className="flex items-center justify-between bg-blue-50 border border-blue-100 rounded-lg p-3">
                <span className="text-xs text-blue-500 font-semibold uppercase">Risk/Reward</span>
                <span className="text-blue-700 font-bold text-lg">1:2.9</span>
              </div>
              <p className="text-xs text-gray-500 mt-3 italic">
                Use 1-2% risk per trade; strong structure supports larger position on breakout confirmation.
              </p>
            </div>
            <Link href="/login" className="w-full block text-center text-sm font-semibold py-3 rounded-xl gradient-bg text-white hover:opacity-90 transition-opacity">
              Scan your chart for free →
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-7xl mx-auto px-6 pb-24 scroll-mt-20">
        <div className="text-center mb-12">
          <span className="text-xs font-semibold tracking-widest text-[#00AAFF] uppercase mb-3 block">Features</span>
          <h2 className="text-3xl md:text-4xl font-bold text-[#0A0E27]">Everything you need to trade smarter</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              title: 'Trend & Bias',
              desc: 'Know instantly if the market is bullish, bearish, or ranging — with a confidence score.',
              icon: '📈',
            },
            {
              title: 'Key Levels',
              desc: "Support, resistance, order blocks — spotted precisely in your trading style's language.",
              icon: '🎯',
            },
            {
              title: 'Pattern Recognition',
              desc: 'Flags, wedges, SMC structures — identified and explained in plain English, instantly.',
              icon: '🔍',
            },
            {
              title: 'Pre-Trade Checklist',
              desc: 'Receive a personalized checklist of conditions to verify before entering any trade.',
              icon: '✅',
            },
            {
              title: 'Trading Style AI',
              desc: 'Analysis adapts to your style — scalping, day trading, swing trading, or position trading.',
              icon: '⚡',
            },
            {
              title: 'Full History',
              desc: 'Every analysis is saved. Review your past setups, track your edge, and improve over time.',
              icon: '📚',
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="bg-white border border-[#E2E8F0] rounded-xl p-6 hover:border-[#CBD5E1] transition-colors shadow-[0_1px_4px_rgba(0,0,0,0.06)]"
            >
              <div className="text-3xl mb-4">{feature.icon}</div>
              <h3 className="text-[#0A0E27] font-semibold text-lg mb-2">{feature.title}</h3>
              <p className="text-[#64748B] text-sm leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="max-w-7xl mx-auto px-6 pb-24 scroll-mt-20">
        <div className="text-center mb-12">
          <span className="text-xs font-semibold tracking-widest text-[#00AAFF] uppercase mb-3 block">Testimonials</span>
          <h2 className="text-3xl md:text-4xl font-bold text-[#0A0E27]">Traders love BlueFlow</h2>
          <p className="text-[#64748B] mt-3 text-lg max-w-xl mx-auto">Real feedback from real traders using BlueFlow every day.</p>
        </div>
        <ReviewsCarousel />
      </section>

      {/* Pricing */}
      <section id="pricing" className="max-w-7xl mx-auto px-6 pb-24 scroll-mt-20">
        <div className="text-center mb-12">
          <span className="text-xs font-semibold tracking-widest text-[#00AAFF] uppercase mb-3 block">Pricing</span>
          <h2 className="text-3xl md:text-4xl font-bold text-[#0A0E27] mb-4">Simple, transparent pricing</h2>
          <p className="text-[#64748B] text-xl">Start free. Upgrade when you need more.</p>
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

        <div className="grid md:grid-cols-3 gap-6 items-start max-w-5xl mx-auto">
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
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-6 pb-24 text-center">
        <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-12 shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-[#0A0E27]">
            Start analyzing charts today
          </h2>
          <p className="text-[#64748B] mb-8 text-lg">
            Join traders who use BlueFlow to make better, faster decisions.
          </p>
          <Link
            href="/login"
            className="gradient-bg text-white px-10 py-4 rounded-xl font-semibold text-lg hover:opacity-90 transition-opacity inline-block"
          >
            Get 2 free analyses
          </Link>
        </div>
      </section>

      {/* Affiliate Program */}
      <section id="affiliates" className="max-w-7xl mx-auto px-6 pb-24 scroll-mt-20">
        {/* Header */}
        <div className="text-center mb-14">
          <span className="text-xs font-semibold tracking-widest text-[#00AAFF] uppercase mb-3 block">Affiliate Program</span>
          <h2 className="text-3xl md:text-4xl font-bold text-[#0A0E27] mb-4">Earn by sharing BlueFlow</h2>
          <p className="text-[#64748B] text-xl max-w-2xl mx-auto">
            Recommend BlueFlow to your audience and earn real commissions — for every trader you bring in, and every month they stay.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-10 items-start max-w-6xl mx-auto">

          {/* Left: commission structure + how it works */}
          <div className="flex flex-col gap-6">
            {/* Commission cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-2xl p-6 text-center" style={{ background: 'linear-gradient(135deg, #0A0E27 0%, #0d1a3a 100%)', border: '1px solid #1E2D45' }}>
                <div className="text-4xl font-bold text-[#00AAFF] mb-1">20%</div>
                <div className="text-white font-semibold text-sm mb-2">First Month</div>
                <div className="text-[#64748B] text-xs leading-relaxed">One-time commission on the referred user's first paid month</div>
              </div>
              <div className="rounded-2xl p-6 text-center" style={{ background: 'linear-gradient(135deg, #0A0E27 0%, #0d1a3a 100%)', border: '1px solid #1E2D45' }}>
                <div className="text-4xl font-bold text-[#00AAFF] mb-1">10%</div>
                <div className="text-white font-semibold text-sm mb-2">Recurring</div>
                <div className="text-[#64748B] text-xs leading-relaxed">Every month for the lifetime of that user's subscription</div>
              </div>
            </div>

            {/* Example earnings */}
            <div className="bg-[#F0F4FF] rounded-2xl p-6">
              <h3 className="text-[#0A0E27] font-semibold text-sm mb-4 uppercase tracking-wide">Example earnings</h3>
              <div className="space-y-3">
                {[
                  { label: '10 Pro referrals', first: '€40', monthly: '€20 / mo' },
                  { label: '10 Elite referrals', first: '€100', monthly: '€50 / mo' },
                  { label: '50 Pro referrals', first: '€200', monthly: '€100 / mo' },
                ].map(({ label, first, monthly }) => (
                  <div key={label} className="flex items-center justify-between text-sm">
                    <span className="text-[#64748B]">{label}</span>
                    <div className="flex gap-4">
                      <span className="text-[#0A0E27] font-medium">{first} upfront</span>
                      <span className="text-[#00AAFF] font-semibold">+{monthly}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* How it works */}
            <div>
              <h3 className="text-[#0A0E27] font-semibold text-base mb-5">How it works</h3>
              <div className="space-y-5">
                {[
                  {
                    step: '1',
                    title: 'Apply & get approved',
                    desc: 'Submit your application. Once approved you\'ll receive a unique referral code and URL.',
                  },
                  {
                    step: '2',
                    title: 'Share your link',
                    desc: 'Promote BlueFlow via your URL (blueflow.com/login?ref=YOURCODE) or share your code directly. New users can also enter it manually at signup.',
                  },
                  {
                    step: '3',
                    title: 'Earn commissions',
                    desc: '20% when your referral subscribes, then 10% every month they stay active — automatically tracked.',
                  },
                ].map(({ step, title, desc }) => (
                  <div key={step} className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full gradient-bg flex items-center justify-center text-white text-sm font-bold">
                      {step}
                    </div>
                    <div>
                      <div className="text-[#0A0E27] font-semibold text-sm mb-1">{title}</div>
                      <div className="text-[#64748B] text-sm leading-relaxed">{desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: application form */}
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-8 shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
            {affiliateStatus === 'success' ? (
              <div className="text-center py-8">
                <div className="text-5xl mb-4">🎉</div>
                <h3 className="text-[#0A0E27] font-bold text-xl mb-2">Application received!</h3>
                <p className="text-[#64748B] text-sm leading-relaxed">
                  We'll review your application and reach out within 2–3 business days. Keep an eye on your inbox.
                </p>
              </div>
            ) : (
              <>
                <h3 className="text-[#0A0E27] font-bold text-xl mb-1">Apply to become an affiliate</h3>
                <p className="text-[#64748B] text-sm mb-7">Tell us about yourself and your audience. We review every application personally.</p>

                <form onSubmit={handleAffiliateSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-[#0A0E27] mb-1.5">Name <span className="text-red-400">*</span></label>
                      <input
                        type="text"
                        placeholder="Your name"
                        value={affiliateForm.name}
                        onChange={(e) => setAffiliateForm(f => ({ ...f, name: e.target.value }))}
                        className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-4 py-3 text-[#0A0E27] text-sm placeholder-[#94A3B8] focus:outline-none focus:border-[#0033CC] transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[#0A0E27] mb-1.5">Email <span className="text-red-400">*</span></label>
                      <input
                        type="email"
                        placeholder="you@example.com"
                        value={affiliateForm.email}
                        onChange={(e) => setAffiliateForm(f => ({ ...f, email: e.target.value }))}
                        className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-4 py-3 text-[#0A0E27] text-sm placeholder-[#94A3B8] focus:outline-none focus:border-[#0033CC] transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#0A0E27] mb-1.5">Primary platform <span className="text-red-400">*</span></label>
                    <select
                      value={affiliateForm.platform}
                      onChange={(e) => setAffiliateForm(f => ({ ...f, platform: e.target.value }))}
                      className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-4 py-3 text-[#0A0E27] text-sm focus:outline-none focus:border-[#0033CC] transition-colors"
                    >
                      <option value="">Select platform</option>
                      <option value="twitter">Twitter / X</option>
                      <option value="youtube">YouTube</option>
                      <option value="tiktok">TikTok</option>
                      <option value="instagram">Instagram</option>
                      <option value="newsletter">Newsletter</option>
                      <option value="blog">Blog / Website</option>
                      <option value="discord">Discord / Community</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#0A0E27] mb-1.5">Audience size <span className="text-red-400">*</span></label>
                    <select
                      value={affiliateForm.audience_size}
                      onChange={(e) => setAffiliateForm(f => ({ ...f, audience_size: e.target.value }))}
                      className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-4 py-3 text-[#0A0E27] text-sm focus:outline-none focus:border-[#0033CC] transition-colors"
                    >
                      <option value="">Select range</option>
                      <option value="under_1k">Under 1,000</option>
                      <option value="1k_5k">1,000 – 5,000</option>
                      <option value="5k_20k">5,000 – 20,000</option>
                      <option value="20k_100k">20,000 – 100,000</option>
                      <option value="over_100k">100,000+</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#0A0E27] mb-1.5">
                      Your handle <span className="text-[#94A3B8] font-normal">(so we can DM you)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="@yourhandle"
                      value={affiliateForm.handle}
                      onChange={(e) => setAffiliateForm(f => ({ ...f, handle: e.target.value }))}
                      className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-4 py-3 text-[#0A0E27] text-sm placeholder-[#94A3B8] focus:outline-none focus:border-[#0033CC] transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#0A0E27] mb-1.5">How do you plan to promote BlueFlow?</label>
                    <textarea
                      rows={3}
                      placeholder="Brief description of your content and audience..."
                      value={affiliateForm.note}
                      onChange={(e) => setAffiliateForm(f => ({ ...f, note: e.target.value }))}
                      className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-4 py-3 text-[#0A0E27] text-sm placeholder-[#94A3B8] focus:outline-none focus:border-[#0033CC] transition-colors resize-none"
                    />
                  </div>

                  {affiliateError && (
                    <div className="text-sm px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500">
                      {affiliateError}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={affiliateStatus === 'loading'}
                    className="w-full gradient-bg text-white rounded-xl py-3 text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    {affiliateStatus === 'loading' ? 'Submitting…' : 'Submit application'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#E2E8F0] py-8 text-center text-[#94A3B8] text-sm">
        © {new Date().getFullYear()} BlueFlow. All rights reserved.
      </footer>
    </div>
  )
}
