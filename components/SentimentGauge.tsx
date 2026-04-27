'use client';

import React, { useEffect, useState } from 'react';

interface SentimentGaugeProps {
  sell: number;
  neutral: number;
  buy: number;
  label: string;
  confidence: number;
  title: string;
}

const SentimentGauge: React.FC<SentimentGaugeProps> = ({ sell, neutral, buy, label, title }) => {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const total = buy + sell + neutral;
  const score = total > 0 ? (buy - sell) / total : 0;
  const rotation = animated ? score * 90 : 0;

  const cx = 120;
  // Arc is centered at cx=150 within a 300px wide viewBox
  // giving 60px of space on each side of the arc for labels
  const cy = 120;
  const r = 85;
  const gradientId = `gaugeGradient-${title.replace(/\s+/g, '-')}`;
  // override cx for this wider layout
  const arcCx = 150;

  const getLabelColor = (lbl: string) => {
    if (lbl === 'Strong Buy') return '#2962FF';
    if (lbl === 'Buy') return '#2962FF';
    if (lbl === 'Neutral') return '#787B86';
    if (lbl === 'Sell') return '#F23645';
    if (lbl === 'Strong Sell') return '#F23645';
    return '#787B86';
  };

  return (
    <div className="flex flex-col items-center select-none">
      {/* Section title */}
      <p className="text-xs text-[#787B86] font-medium mb-2">{title}</p>

      {/* SVG Gauge — wider viewBox so side labels have room */}
      <svg width={260} height={155} viewBox="0 0 300 155">
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="50%" x2="100%" y2="50%">
            <stop offset="0%" style={{ stopColor: '#F23645' }} />
            <stop offset="25%" style={{ stopColor: '#FF9B9B' }} />
            <stop offset="50%" style={{ stopColor: '#787B86' }} />
            <stop offset="75%" style={{ stopColor: '#6FA8FF' }} />
            <stop offset="100%" style={{ stopColor: '#2962FF' }} />
          </linearGradient>
        </defs>

        {/* Arc: from (65,120) to (235,120) */}
        <path
          d={`M ${arcCx - r} ${cy} A ${r} ${r} 0 0 1 ${arcCx + r} ${cy}`}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={22}
          strokeLinecap="round"
        />

        {/* Zone labels — side labels sit outside the arc, never overlapping */}
        {/* Strong sell — left of arc start (arc starts at x=65) */}
        <text fontSize="9" fill="#787B86" textAnchor="middle" fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif">
          <tspan x="32" y="118">Strong</tspan>
          <tspan x="32" dy="11">sell</tspan>
        </text>
        {/* Sell */}
        <text x="62" y="66" fontSize="9" fill="#787B86" textAnchor="middle" fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif">Sell</text>
        {/* Neutral */}
        <text x="150" y="20" fontSize="9" fill="#787B86" textAnchor="middle" fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif">Neutral</text>
        {/* Buy */}
        <text x="238" y="66" fontSize="9" fill="#787B86" textAnchor="middle" fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif">Buy</text>
        {/* Strong buy — right of arc end (arc ends at x=235) */}
        <text fontSize="9" fill="#787B86" textAnchor="middle" fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif">
          <tspan x="268" y="118">Strong</tspan>
          <tspan x="268" dy="11">buy</tspan>
        </text>

        {/* Needle */}
        <g
          style={{
            transform: `rotate(${rotation}deg)`,
            transformOrigin: `${arcCx}px ${cy}px`,
            transition: 'transform 1s cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
        >
          {/* Needle body - tapered and sharp */}
          <polygon
            points={`${arcCx - 2.5},${cy + 4} ${arcCx + 2.5},${cy + 4} ${arcCx},${cy - 65}`}
            fill="#131722"
          />
        </g>

        {/* Pivot dot */}
        <circle cx={arcCx} cy={cy} r={5} fill="#131722" />
        <circle cx={arcCx} cy={cy} r={2} fill="white" />
      </svg>

      {/* Sentiment label */}
      <p
        className="text-[20px] font-semibold leading-none mt-1"
        style={{ color: getLabelColor(label), fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}
      >
        {label}
      </p>

      {/* Sell / Neutral / Buy counts */}
      <div className="flex gap-8 mt-3">
        {[
          { lbl: 'Sell', val: sell, color: '#F23645' },
          { lbl: 'Neutral', val: neutral, color: '#787B86' },
          { lbl: 'Buy', val: buy, color: '#2962FF' },
        ].map((b) => (
          <div key={b.lbl} className="text-center">
            <p className="text-[11px] font-medium leading-none mb-1" style={{ color: '#787B86' }}>{b.lbl}</p>
            <p className="text-[16px] font-bold leading-none" style={{ color: b.color }}>{b.val}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SentimentGauge;
