'use client'

import Logo from '@/components/Logo'

export default function EmptyState() {
  return (
    <div
      className="relative flex flex-col items-center justify-center h-full rounded-2xl overflow-hidden"
      style={{
        background: 'var(--bf-card-bg)',
        border: '1px solid var(--bf-card-border)',
        boxShadow: 'var(--bf-card-shadow)',
      }}
    >
      {/* Outer glow ring */}
      <div className="relative flex items-center justify-center">
        <div
          className="absolute rounded-full empty-pulse-out"
          style={{
            width: 160,
            height: 160,
            border: '1px solid rgba(0,82,255,0.12)',
          }}
        />
        {/* Inner ring */}
        <div
          className="absolute rounded-full empty-pulse-in"
          style={{
            width: 120,
            height: 120,
            border: '1px solid rgba(0,82,255,0.2)',
          }}
        />
        {/* Flame logo */}
        <div className="relative z-10 empty-float">
          <Logo
            size={72}
            style={{ filter: 'drop-shadow(0 0 16px rgba(0,82,255,0.4))' }}
          />
        </div>
      </div>

      {/* Text */}
      <div className="mt-10 text-center px-8">
        <h2
          style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '26px', color: 'var(--bf-text-primary)' }}
        >
          Ready to analyze.
        </h2>
        <p className="text-[#94A3B8] text-[14px] mt-2">
          <span className="hidden md:inline">Drop any chart on the left.</span>
          <span className="md:hidden">Drop any chart above.</span>
        </p>

        {/* Screenshot tips */}
        <div className="mt-6 text-left space-y-2.5">
          <p className="text-[#64748B] text-[11px] uppercase tracking-widest font-semibold text-center mb-3">
            For best results, your screenshot should include
          </p>
          {[
            { icon: '📐', text: 'Full candle structure — no cropped wicks' },
            { icon: '🏷️', text: 'Price axis & timeframe label visible' },
            { icon: '🔍', text: '50–200 candles for proper context' },
          ].map(({ icon, text }) => (
            <div key={text} className="flex items-center gap-2.5">
              <span className="text-[15px] flex-shrink-0">{icon}</span>
              <p className="text-[#64748B] text-[12px]">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
