import Stripe from 'stripe'

// Lazy singleton — avoids throwing at build time when env vars are not yet set
let _stripe: Stripe | null = null

export function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY
    if (!key) throw new Error('STRIPE_SECRET_KEY is not configured')
    _stripe = new Stripe(key, { apiVersion: '2025-02-24.acacia' })
  }
  return _stripe
}

// Convenience proxy so existing `stripe.xxx` call sites keep working
export const stripe = new Proxy({} as Stripe, {
  get(_target, prop: string) {
    return getStripe()[prop as keyof Stripe]
  },
})

export const PLANS = {
  pro: {
    name: 'Pro',
    price: 20,
    currency: 'eur',
    priceId: process.env.STRIPE_PRO_PRICE_ID!,
    analyses: 'Unlimited',
    features: [
      'Unlimited chart analyses',
      'All trading styles',
      'Full analysis history',
      'Priority processing',
      'Export analyses as PDF',
    ],
  },
  elite: {
    name: 'Elite',
    price: 50,
    currency: 'eur',
    priceId: process.env.STRIPE_ELITE_PRICE_ID!,
    analyses: 'Unlimited',
    features: [
      'Everything in Pro',
      'Multi-timeframe analysis',
      'Custom AI system prompts',
      'API access',
      'Dedicated support',
      'Early access to new features',
    ],
  },
}
