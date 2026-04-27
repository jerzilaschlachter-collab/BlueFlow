export type TradingStyle = 'scalping' | 'day' | 'swing' | 'position' | 'smc' | 'price_action'
export type SubscriptionTier = 'free' | 'pro' | 'elite'
export type Bias = 'bullish' | 'bearish' | 'neutral'

export interface User {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  country: string | null
  trading_platform: string | null
  setup_completed: boolean
  trading_style: TradingStyle
  subscription_tier: SubscriptionTier
  analyses_used_this_month: number
  monthly_reset_date: string
  stripe_customer_id: string | null
  referred_by_affiliate_code: string | null
  referred_by_affiliate_id: string | null
  created_at: string
  updated_at: string
}

export type AffiliateStatus = 'active' | 'paused' | 'suspended'
export type ApplicationStatus = 'pending' | 'approved' | 'rejected'

export interface AffiliateApplication {
  id: string
  name: string
  email: string
  platform: string
  audience_size: string
  note: string | null
  status: ApplicationStatus
  created_at: string
}

export interface Affiliate {
  id: string
  user_id: string | null
  code: string
  status: AffiliateStatus
  total_referrals: number
  created_at: string
  updated_at: string
}

export interface AffiliateReferral {
  id: string
  affiliate_id: string
  referred_user_id: string
  first_month_commission_paid: boolean
  recurring_active: boolean
  created_at: string
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
