import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia',
  typescript: true,
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
