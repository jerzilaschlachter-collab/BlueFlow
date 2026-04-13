export type TradingStyle = 'scalping' | 'day' | 'swing' | 'position'
export type SubscriptionTier = 'free' | 'pro' | 'elite'
export type Bias = 'bullish' | 'bearish' | 'neutral'

export interface User {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  trading_style: TradingStyle
  subscription_tier: SubscriptionTier
  analyses_used_this_month: number
  monthly_reset_date: string
  stripe_customer_id: string | null
  created_at: string
  updated_at: string
}

export interface KeyLevels {
  support: string[]
  resistance: string[]
}

export interface Analysis {
  id: string
  user_id: string
  image_url: string
  trend: string
  key_levels: KeyLevels
  pattern: string
  bias: Bias
  confidence_score: number
  pre_trade_checklist: string[]
  raw_analysis: string
  trading_style: TradingStyle
  created_at: string
}

export interface Subscription {
  id: string
  user_id: string
  stripe_subscription_id: string
  stripe_price_id: string
  status: 'active' | 'canceled' | 'past_due'
  tier: 'pro' | 'elite'
  current_period_start: string
  current_period_end: string
  created_at: string
  updated_at: string
}

export interface AnalysisResult {
  trend: string
  key_levels: KeyLevels
  pattern: string
  bias: Bias
  confidence_score: number
  pre_trade_checklist: string[]
}
