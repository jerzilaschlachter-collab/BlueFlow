import Link from 'next/link'
import PricingCard from '@/components/PricingCard'

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-black">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-zinc-900 max-w-7xl mx-auto">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center">
            <span className="text-white font-bold text-sm">BF</span>
          </div>
          <span className="text-white font-bold text-xl tracking-tight">BlueFlow</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-zinc-400 hover:text-white transition-colors text-sm">
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
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Simple, transparent pricing
          </h1>
          <p className="text-zinc-400 text-xl">
            Start free. Upgrade when you need more.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 items-start">
          {/* Free */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-7">
            <div className="mb-6">
              <h2 className="text-white font-bold text-xl mb-1">Free</h2>
              <p className="text-zinc-500 text-sm">Perfect to get started</p>
            </div>
            <div className="mb-6">
              <span className="text-4xl font-bold text-white">€0</span>
              <span className="text-zinc-500 text-sm ml-1">/ month</span>
            </div>
            <ul className="space-y-3 mb-8">
              {[
                '2 analyses per month',
                'All trading styles',
                'Full analysis breakdown',
                'Analysis history',
              ].map((feature) => (
                <li key={feature} className="flex items-start gap-2.5 text-sm text-zinc-400">
                  <svg className="w-4 h-4 text-zinc-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>
            <Link
              href="/login"
              className="block w-full text-center border border-zinc-700 text-white py-3 rounded-xl text-sm font-medium hover:bg-zinc-800 transition-colors"
            >
              Get started free
            </Link>
          </div>

          {/* Pro */}
          <PricingCard
            tier="pro"
            name="Pro"
            price={20}
            description="For active traders"
            features={[
              'Unlimited analyses',
              'All trading styles',
              'Full analysis history',
              'Priority processing',
              'Export analyses as PDF',
            ]}
            highlighted
          />

          {/* Elite */}
          <PricingCard
            tier="elite"
            name="Elite"
            price={50}
            description="For professional traders"
            features={[
              'Everything in Pro',
              'Multi-timeframe analysis',
              'Custom AI prompts',
              'API access',
              'Dedicated support',
              'Early feature access',
            ]}
          />
        </div>

        {/* FAQ */}
        <div className="mt-20">
          <h2 className="text-2xl font-bold text-white text-center mb-10">
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
              <div key={item.q} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                <h3 className="text-white font-semibold mb-2">{item.q}</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
