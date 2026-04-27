'use client';

import React, { useState, useMemo } from 'react';
import Logo from '@/components/Logo';
import SentimentGauge from '@/components/SentimentGauge';
import IndicatorTable from '@/components/IndicatorTable';
import FlameIcon from '@/components/FlameIcon';

const AlertTriangle = ({ className = '' }: { className?: string }) => (
  <svg className={`w-5 h-5 ${className}`} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
  </svg>
);

const Check = ({ size = 20, className = '' }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
  </svg>
);

const X = ({ size = 20, className = '' }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" />
  </svg>
);

const ChevronDown = ({ className = '' }: { className?: string }) => (
  <svg className={`w-4 h-4 ${className}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ChevronUp = ({ className = '' }: { className?: string }) => (
  <svg className={`w-4 h-4 ${className}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" xmlns="http://www.w3.org/2000/svg">
    <path d="M18 15l-6-6-6 6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const BullIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" xmlns="http://www.w3.org/2000/svg" className="text-green-600">
    <path d="M12 19V5M5 12l7-7 7 7" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const BearIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" xmlns="http://www.w3.org/2000/svg" className="text-red-600">
    <path d="M12 5v14M5 12l7 7 7-7" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// ---------------------------------------------------------------------------
// Technical indicator derivation helpers
// ---------------------------------------------------------------------------

type TechAction =
  | 'Buy'
  | 'Sell'
  | 'Neutral'
  | 'Strong Buy'
  | 'Strong Sell'
  | 'Overbought'
  | 'Oversold';

interface TechRow {
  name: string;
  value: string;
  action: TechAction;
}

function deriveOscillators(
  direction: string,
  confidence: number,
  momentumCurrent: string,
): TechRow[] {
  const isBull = direction === 'bullish';
  const isBear = direction === 'bearish';
  const c = confidence / 100;

  // RSI (14)
  let rsi: number;
  if (isBull && confidence >= 70) rsi = 55 + ((confidence - 70) / 30) * 15;
  else if (isBear) rsi = 45 - c * 15;
  else rsi = 45 + c * 10;
  const rsiAction: TechAction = rsi > 70 ? 'Overbought' : rsi < 30 ? 'Oversold' : 'Neutral';

  // MACD (12,26)
  const macd = isBull ? c * 2.5 : isBear ? -c * 2.5 : (c - 0.5) * 0.5;
  const macdAction: TechAction = isBull ? 'Buy' : isBear ? 'Sell' : 'Neutral';

  // Stochastic %K
  const mom = (momentumCurrent || '').toLowerCase();
  let stoch: number;
  if (mom.includes('increas')) stoch = 60 + c * 20;
  else if (mom.includes('decreas')) stoch = 20 + c * 20;
  else stoch = 40 + c * 20;
  const stochAction: TechAction = stoch > 60 ? 'Buy' : stoch < 40 ? 'Sell' : 'Neutral';

  // CCI (20)
  const cci = isBull ? 80 + c * 70 : isBear ? -80 - c * 70 : -80 + c * 160;
  const cciAction: TechAction = isBull ? 'Buy' : isBear ? 'Sell' : 'Neutral';

  // Momentum (10)
  const momentum = isBull ? c * 15 : isBear ? -c * 15 : (c - 0.5) * 5;
  const momAction: TechAction = isBull ? 'Buy' : isBear ? 'Sell' : 'Neutral';

  // Williams %R
  const will = isBull ? -20 - c * 20 : isBear ? -60 - c * 20 : -40 - c * 20;
  const willAction: TechAction = isBull ? 'Buy' : isBear ? 'Sell' : 'Neutral';

  // Bull Bear Power
  const bbp = isBull ? c * 25 : isBear ? -c * 25 : (c - 0.5) * 10;
  const bbpAction: TechAction = isBull ? 'Buy' : isBear ? 'Sell' : 'Neutral';

  return [
    { name: 'RSI (14)', value: rsi.toFixed(2), action: rsiAction },
    { name: 'MACD (12,26)', value: macd.toFixed(3), action: macdAction },
    { name: 'Stochastic %K', value: stoch.toFixed(2), action: stochAction },
    { name: 'CCI (20)', value: cci.toFixed(2), action: cciAction },
    { name: 'Momentum (10)', value: momentum.toFixed(2), action: momAction },
    { name: 'Williams %R', value: will.toFixed(2), action: willAction },
    { name: 'Bull Bear Power', value: bbp.toFixed(2), action: bbpAction },
  ];
}

function deriveMovingAverages(
  direction: string,
  confidence: number,
  immediateSupport: number,
  immediateResistance: number,
  fallbackPrice?: number,
): TechRow[] {
  const isBull = direction === 'bullish';
  const isBear = direction === 'bearish';
  const c = confidence / 100;
  let price = (immediateSupport + immediateResistance) / 2;

  // Fallback to provided price if immediate levels are 0
  if (price === 0 && fallbackPrice && fallbackPrice > 0) {
    price = fallbackPrice;
  }

  const range = Math.abs(immediateResistance - immediateSupport) || (price > 0 ? price * 0.02 : 0.001);

  if (price === 0) return [];

  const periods = [10, 20, 50, 100, 200];
  const offsets = [0.15, 0.35, 0.7, 1.3, 2.2];
  const rows: TechRow[] = [];

  ['EMA', 'SMA'].forEach((type, typeIdx) => {
    periods.forEach((period, i) => {
      const offset = offsets[i] * range * (1 + typeIdx * 0.05);
      let val: number;
      let action: TechAction;
      if (isBull) {
        val = price - offset * c;
        // Shorter-period MAs stay close to price; threshold scales with offset
        action = offsets[i] * c > 0.25 ? 'Buy' : 'Neutral';
      } else if (isBear) {
        val = price + offset * c;
        action = offsets[i] * c > 0.25 ? 'Sell' : 'Neutral';
      } else {
        val = price + (i % 2 === 0 ? 1 : -1) * offset * 0.3;
        action = 'Neutral';
      }
      rows.push({ name: `${type} (${period})`, value: val.toFixed(2), action });
    });
  });

  rows.push({ name: 'VWAP', value: price.toFixed(2), action: 'Neutral' });
  return rows;
}

function countActions(rows: TechRow[]) {
  let buy = 0,
    neutral = 0,
    sell = 0;
  rows.forEach((r) => {
    if (r.action === 'Buy' || r.action === 'Strong Buy' || r.action === 'Oversold') buy++;
    else if (r.action === 'Sell' || r.action === 'Strong Sell' || r.action === 'Overbought') sell++;
    else neutral++;
  });
  return { buy, neutral, sell };
}

function gaugeLabel(buy: number, neutral: number, sell: number): string {
  const total = buy + neutral + sell;
  if (total === 0) return 'Neutral';
  if (buy / total >= 0.7) return 'Strong Buy';
  if (buy / total >= 0.45) return 'Buy';
  if (sell / total >= 0.7) return 'Strong Sell';
  if (sell / total >= 0.45) return 'Sell';
  return 'Neutral';
}

interface AnalysisResultProps {
  analysis: {
    grade: string;
    summary: string;
    asset_detected: boolean;
    timeframe_detected: boolean;
    bias: {
      direction: string;
      reasoning: string;
    };
    market_context: string;
    trend: {
      phase: string;
    };
    structure: {
      highs_lows: string;
      last_significant_move: string;
      current_position: string;
    };
    confidence_score: number;
    short_term: string;
    medium_term: string;
    momentum: {
      current: string;
      description: string;
      divergence: string;
    };
    key_levels: {
      resistance: Array<{
        price: number;
        strength: string;
        reason: string;
      }>;
      support: Array<{
        price: number;
        strength: string;
        reason: string;
      }>;
      immediate_resistance: number;
      immediate_support: number;
    };
    key_note: string;
    pattern: {
      detected: boolean;
      name?: string;
      completion?: string;
      implication?: string;
      invalidation?: string;
    };
    trade_setup: {
      setup_quality: string;
      entry_zone: string;
      entry_type: string;
      entry_reasoning: string;
      stop_loss: number;
      tp1: number;
      tp2: number;
      tp3: number;
      risk_reward: string;
      position_sizing_note: string;
    };
    scenarios: {
      bullish: string;
      bearish: string;
      key_decision_level: string;
    };
    checklist: {
      trend_confirmed: boolean;
      key_level_identified: boolean;
      pattern_valid: boolean;
      risk_reward_acceptable: boolean;
      entry_timing_clear: boolean;
      stop_loss_logical: boolean;
      no_major_news_risk: boolean;
    };
    style_specific_notes: string;
    warning: string | null;
    created_at?: string;
  };
  analysisId: string;
  onOutcomeUpdate: (outcome: string) => void;
}

const AnalysisResult: React.FC<AnalysisResultProps> = ({
  analysis: rawAnalysis,
  analysisId,
  onOutcomeUpdate,
}) => {
  // Normalize analysis so all nested fields are safe to access on old/partial records
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const a: any = rawAnalysis || {};
  const analysis = {
    grade: a.grade || a.overall_grade || '—',
    summary: a.summary || 'No summary available',
    asset_detected: a.asset_detected || false,
    timeframe_detected: a.timeframe_detected || false,
    bias: { direction: '—', reasoning: '', ...(a.bias || {}) },
    market_context: a.market_context || '',
    trend: { phase: '—', ...(a.trend || {}) },
    structure: { highs_lows: '—', last_significant_move: '—', current_position: '—', ...(a.structure || {}) },
    confidence_score: a.confidence_score ?? a.bias?.confidence_score ?? 0,
    short_term: a.short_term || a.bias?.short_term || '—',
    medium_term: a.medium_term || a.bias?.medium_term || '—',
    momentum: { current: '—', description: '', divergence: 'None visible', ...(a.momentum || {}) },
    key_levels: {
      resistance: a.key_levels?.resistance || a.key_levels?.major_resistance || [],
      support: a.key_levels?.support || a.key_levels?.major_support || [],
      immediate_resistance: a.key_levels?.immediate_resistance ?? 0,
      immediate_support: a.key_levels?.immediate_support ?? 0,
    },
    key_note: a.key_note || a.key_levels?.key_note || '',
    pattern: { detected: false, name: '', completion: '', implication: '', invalidation: '', ...(a.pattern || {}) },
    trade_setup: {
      setup_quality: '—', entry_zone: '—', entry_type: '—', entry_reasoning: '',
      stop_loss: 0, risk_reward: '—', position_sizing_note: '',
      ...(a.trade_setup || {}),
      tp1: a.trade_setup?.tp1 ?? a.trade_setup?.take_profit_1 ?? 0,
      tp2: a.trade_setup?.tp2 ?? a.trade_setup?.take_profit_2 ?? 0,
      tp3: a.trade_setup?.tp3 ?? a.trade_setup?.take_profit_3 ?? 0,
    },
    scenarios: {
      bullish: a.scenarios?.bullish || a.scenarios?.bullish_scenario || '',
      bearish: a.scenarios?.bearish || a.scenarios?.bearish_scenario || '',
      key_decision_level: a.scenarios?.key_decision_level || '',
    },
    checklist: {
      trend_confirmed: false, key_level_identified: false, pattern_valid: false,
      risk_reward_acceptable: false, entry_timing_clear: false, stop_loss_logical: false,
      no_major_news_risk: false, ...(a.checklist || {}),
    },
    style_specific_notes: a.style_specific_notes || '',
    warning: a.warning || null,
    created_at: a.created_at,
  };

  const [outcome, setOutcome] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedLevel, setExpandedLevel] = useState<string | null>(null);

  // Derive technical indicator data from the analysis
  const technicalData = useMemo(() => {
    const dir = (analysis.bias.direction || '').toLowerCase();
    const conf = analysis.confidence_score;

    const oscRows = deriveOscillators(dir, conf, analysis.momentum.current);

    // Parse immediate levels (they come as strings from API)
    let immSup = parseFloat(String(analysis.key_levels.immediate_support || 0));
    let immRes = parseFloat(String(analysis.key_levels.immediate_resistance || 0));

    // Fallback price: if immediate levels are 0, try first resistance/support level
    let fallbackPrice: number | undefined;
    if (immSup === 0 && immRes === 0) {
      if (analysis.key_levels.resistance?.length > 0) {
        const firstRes = analysis.key_levels.resistance[0];
        fallbackPrice = typeof firstRes === 'object' ? parseFloat(String(firstRes.price)) : parseFloat(String(firstRes));
      }
      if (!fallbackPrice && analysis.key_levels.support?.length > 0) {
        const firstSup = analysis.key_levels.support[0];
        fallbackPrice = typeof firstSup === 'object' ? parseFloat(String(firstSup.price)) : parseFloat(String(firstSup));
      }
    }

    const maRows = deriveMovingAverages(
      dir,
      conf,
      immSup,
      immRes,
      fallbackPrice,
    );

    const oscCounts = countActions(oscRows);
    const maCounts = countActions(maRows);
    const allCounts = {
      buy: oscCounts.buy + maCounts.buy,
      neutral: oscCounts.neutral + maCounts.neutral,
      sell: oscCounts.sell + maCounts.sell,
    };

    return {
      oscRows,
      maRows,
      oscCounts,
      maCounts,
      allCounts,
      summaryLabel: gaugeLabel(allCounts.buy, allCounts.neutral, allCounts.sell),
      oscLabel: gaugeLabel(oscCounts.buy, oscCounts.neutral, oscCounts.sell),
      maLabel: gaugeLabel(maCounts.buy, maCounts.neutral, maCounts.sell),
    };
  }, [
    analysis.bias.direction,
    analysis.confidence_score,
    analysis.momentum.current,
    analysis.key_levels.immediate_support,
    analysis.key_levels.immediate_resistance,
  ]);

  const handleOutcomeClick = async (value: string) => {
    setOutcome(value);
    onOutcomeUpdate(value);
    setIsSubmitting(true);
    try {
      await fetch('/api/analyses/outcome', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ analysisId, outcome: value }),
      });
    } catch (error) {
      console.error('Failed to update outcome:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getGradeColor = (grade: string) => {
    if (grade === 'A+' || grade === 'A') return 'bg-gradient-to-r from-green-400 to-emerald-500 text-white';
    if (grade === 'B') return 'bg-gradient-to-r from-blue-400 to-cyan-500 text-white';
    if (grade === 'C') return 'bg-gradient-to-r from-amber-400 to-orange-500 text-white';
    return 'bg-gradient-to-r from-red-400 to-rose-500 text-white';
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-blue-600';
    if (score >= 50) return 'text-amber-600';
    return 'text-red-600';
  };

  const getBiasColor = () => {
    const dir = (analysis.bias?.direction || '').toLowerCase();
    if (dir === 'bullish') return 'bg-green-100 text-green-800';
    if (dir === 'bearish') return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-800';
  };

  const checklistItems = [
    { key: 'trend_confirmed', label: 'Trend Confirmed', description: 'Price is moving in a clear direction' },
    { key: 'key_level_identified', label: 'Key Level Identified', description: 'A significant S/R level is in play' },
    { key: 'pattern_valid', label: 'Pattern Valid', description: 'Chart pattern is intact and unbroken' },
    { key: 'risk_reward_acceptable', label: 'Risk/Reward Acceptable', description: 'Minimum 1:2 R/R ratio met' },
    { key: 'entry_timing_clear', label: 'Entry Timing Clear', description: 'Clear trigger for when to enter' },
    { key: 'stop_loss_logical', label: 'Stop Loss Logical', description: 'Stop placed behind a key structure level' },
    { key: 'no_major_news_risk', label: 'No News Risk', description: 'No high-impact events imminent' },
  ];

  const getQualityColor = (quality: string) => {
    if (quality === 'A+' || quality === 'A') return 'text-green-600';
    if (quality === 'B') return 'text-blue-600';
    if (quality === 'C') return 'text-amber-600';
    return 'text-red-600';
  };

  const formatTimeToNow = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      const hours = String(date.getHours()).padStart(2, '0');
      const mins = String(date.getMinutes()).padStart(2, '0');
      return `Today at ${hours}:${mins}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      const hours = String(date.getHours()).padStart(2, '0');
      const mins = String(date.getMinutes()).padStart(2, '0');
      return `Yesterday at ${hours}:${mins}`;
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
  };

  const checkedCount = checklistItems.filter(
    (item) => analysis.checklist[item.key as keyof typeof analysis.checklist]
  ).length;
  const totalCount = checklistItems.length;
  const allGreen = checkedCount === totalCount;

  return (
    <div className="space-y-6 pb-8 animate-fade-in">
      {/* SECTION 0: BlueFLow Header */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4 flex-wrap mb-4">
          <div className="flex items-center gap-3">
            <Logo size={28} />
            <div>
              <h2 className="text-lg font-bold text-gray-900">BlueFLow Analysis</h2>
              <p className="text-[#64748B] text-xs">
                {formatTimeToNow(analysis.created_at || new Date().toISOString())}
              </p>
            </div>
          </div>
          <div className={`px-5 py-2 rounded-full font-bold text-lg ${getGradeColor(analysis.grade)}`}>
            {analysis.grade}
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          {analysis.asset_detected && (
            <span className="inline-block px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
              Asset Detected
            </span>
          )}
          {analysis.timeframe_detected && (
            <span className="inline-block px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
              Timeframe Detected
            </span>
          )}
          <span className={`inline-block px-3 py-1 text-sm font-medium rounded-full capitalize ${getBiasColor()}`}>
            {analysis.bias.direction}
          </span>
        </div>
      </div>

      {/* SECTION 2: Two Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT COLUMN */}
        <div className="space-y-6 order-2 lg:order-1">
          {/* Market Context Card */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-1">Market Context</h3>
            <p className="text-xs text-gray-400 mb-3">
              The broader environment shaping price behaviour — use this to align your trade with macro momentum.
            </p>
            <p className="text-gray-700 mb-4">{analysis.market_context}</p>
            <div className="inline-block px-3 py-1 bg-gray-100 text-gray-800 text-sm font-medium rounded-full">
              {analysis.trend.phase}
            </div>
          </div>

          {/* Market Structure Card */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-1">Market Structure</h3>
            <p className="text-xs text-gray-400 mb-4">
              The sequence of highs and lows reveals who controls price — structure shifts signal potential reversals.
            </p>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-500 uppercase font-semibold">Highs & Lows</p>
                <p className="text-gray-900 font-medium">{analysis.structure.highs_lows}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-semibold">Last Move</p>
                <p className="text-gray-900 font-medium">{analysis.structure.last_significant_move}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-semibold">Current Position</p>
                <p className="text-gray-900 font-medium">{analysis.structure.current_position}</p>
              </div>
            </div>
          </div>

          {/* Momentum Card */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-1">Momentum</h3>
            <p className="text-xs text-gray-400 mb-4">
              Momentum measures the speed and strength of price movement — divergence can warn of an impending reversal.
            </p>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-3 h-3 rounded-full bg-blue-600"></span>
              <p className="text-lg font-semibold text-gray-900">{analysis.momentum.current}</p>
            </div>
            <p className="text-gray-700 mb-3">{analysis.momentum.description}</p>
            {analysis.momentum.divergence !== 'None visible' && (
              <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 p-3 rounded-lg">
                ⚠ Divergence: {analysis.momentum.divergence}
              </p>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-6 order-1 lg:order-2">
          {/* Trade Setup Card */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-1">Trade Setup</h3>
            <p className="text-xs text-gray-400 mb-4">
              The specific entry, exit, and risk parameters for executing this trade idea — follow these levels precisely.
            </p>
            <div className={`text-3xl font-bold mb-4 ${getQualityColor(analysis.trade_setup.setup_quality)}`}>
              {analysis.trade_setup.setup_quality}
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <p className="text-xs text-blue-600 uppercase font-semibold">Entry Zone</p>
              <p className="text-sm font-semibold text-blue-900">{analysis.trade_setup.entry_zone}</p>
              <p className="text-xs text-blue-700">{analysis.trade_setup.entry_type}</p>
            </div>
            <p className="text-sm text-gray-700 mb-4">{analysis.trade_setup.entry_reasoning}</p>
            <div className="grid grid-cols-2 gap-2 mb-4">
              <div className="bg-red-50 border border-red-100 p-3 rounded-lg">
                <p className="text-xs text-red-500 font-semibold uppercase">Stop Loss</p>
                <p className="font-bold text-red-800 text-base">{analysis.trade_setup.stop_loss}</p>
              </div>
              <div className="bg-green-50 border border-green-100 p-3 rounded-lg">
                <p className="text-xs text-green-600 font-semibold uppercase">TP 1</p>
                <p className="font-bold text-green-800 text-base">{analysis.trade_setup.tp1}</p>
              </div>
              <div className="bg-green-50 border border-green-100 p-3 rounded-lg">
                <p className="text-xs text-green-600 font-semibold uppercase">TP 2</p>
                <p className="font-bold text-green-800 text-base">{analysis.trade_setup.tp2}</p>
              </div>
              <div className="bg-green-50 border border-green-100 p-3 rounded-lg">
                <p className="text-xs text-green-600 font-semibold uppercase">TP 3</p>
                <p className="font-bold text-green-800 text-base">{analysis.trade_setup.tp3}</p>
              </div>
            </div>
            <div className="flex items-center justify-between bg-blue-50 border border-blue-100 rounded-lg p-3">
              <span className="text-xs text-blue-500 font-semibold uppercase">Risk/Reward</span>
              <span className="text-blue-700 font-bold text-lg">{analysis.trade_setup.risk_reward}</span>
            </div>
            {analysis.trade_setup.position_sizing_note && (
              <p className="text-xs text-gray-500 mt-3 italic">{analysis.trade_setup.position_sizing_note}</p>
            )}
          </div>

          {/* Key Levels Card */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-1">Key Levels</h3>
            <p className="text-xs text-gray-400 mb-4">
              Price zones where buyers and sellers historically collide — tap each level to see why it matters.
            </p>
            <div className="space-y-4 mb-4">
              {analysis.key_levels.resistance && analysis.key_levels.resistance.length > 0 && (
                <div>
                  <p className="text-xs text-red-500 uppercase font-semibold mb-2">Resistance Levels</p>
                  <div className="flex flex-wrap gap-2">
                    {analysis.key_levels.resistance.map((level: { price: number; strength: string; reason: string }, idx) => {
                      const key = `r-${idx}`;
                      return (
                        <div key={idx}>
                          <button
                            onClick={() => setExpandedLevel(expandedLevel === key ? null : key)}
                            className="flex items-center gap-1 px-3 py-1.5 bg-red-50 border border-red-200 text-red-800 text-sm font-medium rounded-full hover:bg-red-100 transition-colors"
                          >
                            {level.price} <span className="text-red-400 text-xs">({level.strength})</span>
                            {expandedLevel === key ? <ChevronUp className="text-red-400" /> : <ChevronDown className="text-red-400" />}
                          </button>
                          {expandedLevel === key && (
                            <div className="mt-2 mx-1 p-3 bg-red-50 border border-red-100 rounded-lg text-xs text-red-800">
                              <p className="font-semibold mb-1">Why this level matters:</p>
                              <p>{level.reason}</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              {analysis.key_levels.support && analysis.key_levels.support.length > 0 && (
                <div>
                  <p className="text-xs text-green-600 uppercase font-semibold mb-2">Support Levels</p>
                  <div className="flex flex-wrap gap-2">
                    {analysis.key_levels.support.map((level: { price: number; strength: string; reason: string }, idx) => {
                      const key = `s-${idx}`;
                      return (
                        <div key={idx}>
                          <button
                            onClick={() => setExpandedLevel(expandedLevel === key ? null : key)}
                            className="flex items-center gap-1 px-3 py-1.5 bg-green-50 border border-green-200 text-green-800 text-sm font-medium rounded-full hover:bg-green-100 transition-colors"
                          >
                            {level.price} <span className="text-green-400 text-xs">({level.strength})</span>
                            {expandedLevel === key ? <ChevronUp className="text-green-400" /> : <ChevronDown className="text-green-400" />}
                          </button>
                          {expandedLevel === key && (
                            <div className="mt-2 mx-1 p-3 bg-green-50 border border-green-100 rounded-lg text-xs text-green-800">
                              <p className="font-semibold mb-1">Why this level matters:</p>
                              <p>{level.reason}</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
            {analysis.key_note && (
              <p className="text-sm text-gray-500 italic border-t border-gray-100 pt-3">{analysis.key_note}</p>
            )}
          </div>

        </div>
      </div>

      {/* Technical Summary — full width */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3 mb-1">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Technical Summary</h3>
            <p className="text-xs text-gray-400">Multi-indicator signal analysis</p>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
            <FlameIcon size={14} className="text-[#0052FF]" />
            <span>Powered by BlueFlow AI</span>
          </div>
        </div>
        <p className="text-[11px] text-gray-400 mb-6">
          Based on chart analysis &middot; Not live market data
        </p>

        {/* Three sentiment gauges */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="flex justify-center">
            <SentimentGauge
              sell={technicalData.allCounts.sell}
              neutral={technicalData.allCounts.neutral}
              buy={technicalData.allCounts.buy}
              label={technicalData.summaryLabel}
              confidence={analysis.confidence_score}
              title="Summary"
            />
          </div>
          <div className="flex justify-center">
            <SentimentGauge
              sell={technicalData.oscCounts.sell}
              neutral={technicalData.oscCounts.neutral}
              buy={technicalData.oscCounts.buy}
              label={technicalData.oscLabel}
              confidence={analysis.confidence_score}
              title="Oscillators"
            />
          </div>
          <div className="flex justify-center">
            <SentimentGauge
              sell={technicalData.maCounts.sell}
              neutral={technicalData.maCounts.neutral}
              buy={technicalData.maCounts.buy}
              label={technicalData.maLabel}
              confidence={analysis.confidence_score}
              title="Moving Averages"
            />
          </div>
        </div>

        <div className="border-t border-gray-100 my-6" />

        {/* Oscillators & Moving Averages tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <IndicatorTable
            title="Oscillators"
            rows={technicalData.oscRows}
            summary={technicalData.oscCounts}
          />
          <IndicatorTable
            title="Moving Averages"
            rows={technicalData.maRows}
            summary={technicalData.maCounts}
          />
        </div>

        <p className="text-[12px] text-gray-400 italic mt-4">
          Signals are derived from BlueFlow&apos;s AI analysis of your chart. For educational
          purposes only.
        </p>
      </div>

      {/* Pattern Card — full width */}
      {analysis.pattern.detected && (
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Pattern</h3>
          <div className="flex flex-wrap items-start gap-4">
            <div className="flex-1 min-w-0">
              <h4 className="text-xl font-bold text-gray-900 mb-2">{analysis.pattern.name}</h4>
              <div className="mb-3">
                <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                  {analysis.pattern.completion}
                </span>
              </div>
              <p className="text-gray-700 mb-3">{analysis.pattern.implication}</p>
            </div>
            {analysis.pattern.invalidation && (
              <div className="flex-shrink-0 w-full sm:w-auto sm:max-w-sm">
                <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 p-3 rounded-lg">
                  ⚠ Invalidation: {analysis.pattern.invalidation}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Scenarios Card — full width */}
      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
        <div className="px-6 pt-6 pb-2">
          <h3 className="text-lg font-bold text-gray-900 mb-1">Scenarios</h3>
          <p className="text-xs text-gray-400">
            Two possible paths price could take — watch the Key Decision Level to determine which unfolds.
          </p>
        </div>

        {/* Key Decision Level — prominent */}
        <div className="mx-6 mt-4 mb-5 rounded-xl border-2 border-blue-400 bg-blue-50 p-4 text-center">
          <p className="text-xs text-blue-500 uppercase font-bold tracking-widest mb-1">Key Decision Level</p>
          <p className="text-3xl font-extrabold text-blue-700 leading-none">{analysis.scenarios.key_decision_level}</p>
          <p className="text-xs text-blue-400 mt-1">Price behaviour at this level determines the next move</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-0 divide-x divide-gray-100">
          {/* Bullish */}
          <div className="bg-green-50 p-5 border-t-4 border-green-500">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <BullIcon />
              </div>
              <p className="font-bold text-green-800 text-base">Bullish</p>
            </div>
            <p className="text-xs text-green-500 font-semibold uppercase mb-1">If price holds above the key level</p>
            <p className="text-sm text-green-900 leading-relaxed">{analysis.scenarios.bullish}</p>
          </div>

          {/* Bearish */}
          <div className="bg-red-50 p-5 border-t-4 border-red-500">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <BearIcon />
              </div>
              <p className="font-bold text-red-800 text-base">Bearish</p>
            </div>
            <p className="text-xs text-red-500 font-semibold uppercase mb-1">If price breaks below the key level</p>
            <p className="text-sm text-red-900 leading-relaxed">{analysis.scenarios.bearish}</p>
          </div>
        </div>
        <div className="h-1" />
      </div>

      {/* SECTION 3: Pre-Trade Checklist */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4 flex-wrap mb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Logo size={20} />
              <h3 className="text-lg font-bold text-gray-900">BlueFlow's Pre-Trade Check</h3>
            </div>
            <p className="text-xs text-gray-400">All boxes should be green before you enter a position.</p>
          </div>
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border ${
            allGreen
              ? 'bg-green-50 text-green-700 border-green-200'
              : checkedCount >= Math.ceil(totalCount / 2)
              ? 'bg-amber-50 text-amber-700 border-amber-200'
              : 'bg-red-50 text-red-700 border-red-200'
          }`}>
            {allGreen ? '✓' : `${checkedCount}/${totalCount}`}
            <span>{allGreen ? 'All Checks Passed' : 'Checks Passed'}</span>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {checklistItems.map((item) => {
            const isChecked = analysis.checklist[item.key as keyof typeof analysis.checklist];
            return (
              <div
                key={item.key}
                className={`flex items-start gap-3 p-3 rounded-xl border ${
                  isChecked
                    ? 'bg-green-50 border-green-200'
                    : 'bg-red-50 border-red-200'
                }`}
              >
                <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center mt-0.5 ${
                  isChecked ? 'bg-green-500' : 'bg-red-500'
                }`}>
                  {isChecked
                    ? <Check size={14} className="text-white" />
                    : <X size={14} className="text-white" />
                  }
                </div>
                <div>
                  <p className={`text-sm font-semibold leading-tight ${isChecked ? 'text-green-800' : 'text-red-800'}`}>
                    {item.label}
                  </p>
                  <p className={`text-xs mt-0.5 leading-snug ${isChecked ? 'text-green-600' : 'text-red-500'}`}>
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 4: Style Specific Notes */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-8 shadow-md">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-shrink-0">
            <Logo size={24} />
          </div>
          <p className="text-lg font-bold text-[#0052FF]">BlueFlow says:</p>
        </div>
        <p className="text-gray-800 text-base leading-relaxed font-medium">
          {analysis.style_specific_notes}
        </p>
      </div>

      {/* SECTION 5: Warning */}
      {analysis.warning && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="text-amber-600 flex-shrink-0 mt-1" />
            <p className="text-amber-900">{analysis.warning}</p>
          </div>
        </div>
      )}

      {/* SECTION 6: Outcome Tracker */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
        <p className="text-sm font-semibold text-gray-900 mb-4">How did this trade go?</p>
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={() => handleOutcomeClick('won')}
            disabled={isSubmitting}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              outcome === 'won'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
          >
            Won ✓
          </button>
          <button
            onClick={() => handleOutcomeClick('pending')}
            disabled={isSubmitting}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              outcome === 'pending'
                ? 'bg-gray-600 text-white'
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => handleOutcomeClick('lost')}
            disabled={isSubmitting}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              outcome === 'lost'
                ? 'bg-red-600 text-white'
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
          >
            Lost ✗
          </button>
        </div>
      </div>

      {/* SECTION 7: BlueFLow Footer */}
      <div className="flex items-center justify-center gap-2 py-6 border-t border-gray-100">
        <Logo size={20} />
        <p className="text-[#64748B] text-sm">
          Analysis by BlueFLow AI · Powered by Anthropic Claude · For educational purposes only
        </p>
      </div>

      {/* SECTION 8: Disclaimer */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center text-sm text-gray-500 leading-relaxed">
        <p className="font-semibold text-gray-600 mb-1">Disclaimer</p>
        <p>
          This analysis is for educational purposes only and does not constitute financial advice. Past performance is not
          indicative of future results. Always conduct your own research and consult with a financial advisor before trading.
        </p>
      </div>
    </div>
  );
};

export default AnalysisResult;
