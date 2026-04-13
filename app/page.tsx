import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-black">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-zinc-900 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center">
            <span className="text-white font-bold text-sm">BF</span>
          </div>
          <span className="text-white font-bold text-xl tracking-tight">BlueFlow</span>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/pricing"
            className="text-zinc-400 hover:text-white transition-colors text-sm"
          >
            Pricing
          </Link>
          <Link
            href="/login"
            className="text-zinc-400 hover:text-white transition-colors text-sm"
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
        <div className="inline-flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-full px-4 py-1.5 text-sm text-zinc-400 mb-8">
          <span className="w-2 h-2 rounded-full bg-[#00AAFF] animate-pulse-slow"></span>
          Powered by Claude Vision AI
        </div>

        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-none">
          Read every chart
          <br />
          <span className="gradient-text">in seconds.</span>
        </h1>

        <p className="text-zinc-400 text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
          Upload any trading chart and get instant AI analysis — trend direction, key support &amp;
          resistance levels, chart patterns, and a pre-trade checklist. Tailored to your trading
          style.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/login"
            className="gradient-bg text-white px-8 py-3.5 rounded-xl font-semibold text-lg hover:opacity-90 transition-opacity w-full sm:w-auto"
          >
            Start for free
          </Link>
          <Link
            href="/pricing"
            className="border border-zinc-800 text-zinc-300 px-8 py-3.5 rounded-xl font-semibold text-lg hover:border-zinc-600 hover:text-white transition-all w-full sm:w-auto"
          >
            View pricing
          </Link>
        </div>

        <p className="text-zinc-600 text-sm mt-4">2 free analyses per month. No credit card required.</p>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-6 pb-24">
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              title: 'Trend & Bias',
              desc: 'Instantly identify the dominant trend and get a clear bullish, bearish, or neutral bias with a confidence score.',
              icon: '📈',
            },
            {
              title: 'Key Levels',
              desc: 'Pinpoint precise support and resistance zones, pivot points, and critical price levels to watch.',
              icon: '🎯',
            },
            {
              title: 'Pattern Recognition',
              desc: 'Detect chart patterns — flags, wedges, head & shoulders, double tops, and over 20 more formations.',
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
              className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 transition-colors"
            >
              <div className="text-3xl mb-4">{feature.icon}</div>
              <h3 className="text-white font-semibold text-lg mb-2">{feature.title}</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-6 pb-24 text-center">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Start analyzing charts today
          </h2>
          <p className="text-zinc-400 mb-8 text-lg">
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

      {/* Footer */}
      <footer className="border-t border-zinc-900 py-8 text-center text-zinc-600 text-sm">
        © {new Date().getFullYear()} BlueFlow. All rights reserved.
      </footer>
    </div>
  )
}
