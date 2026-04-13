import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'
import { stripe } from '@/lib/stripe'

// Use service role to bypass RLS for webhook updates
function getAdminSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST(request: Request) {
  const body = await request.text()
  const sig = headers().get('stripe-signature')

  if (!sig) {
    return NextResponse.json({ error: 'No Stripe signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 })
  }

  const supabase = getAdminSupabase()

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      if (session.mode !== 'subscription') break

      const subscription = await stripe.subscriptions.retrieve(session.subscription as string)
      const customerId = session.customer as string
      const priceId = subscription.items.data[0].price.id
      const tier =
        priceId === process.env.STRIPE_PRO_PRICE_ID
          ? 'pro'
          : priceId === process.env.STRIPE_ELITE_PRICE_ID
          ? 'elite'
          : 'pro'

      const { data: userRow } = await supabase
        .from('users')
        .select('id')
        .eq('stripe_customer_id', customerId)
        .single()

      if (userRow) {
        await supabase.from('subscriptions').upsert(
          {
            user_id: userRow.id,
            stripe_subscription_id: subscription.id,
            stripe_price_id: priceId,
            status: subscription.status,
            tier,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'stripe_subscription_id' }
        )

        await supabase
          .from('users')
          .update({ subscription_tier: tier })
          .eq('id', userRow.id)
      }
      break
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription
      const priceId = subscription.items.data[0].price.id
      const tier =
        priceId === process.env.STRIPE_PRO_PRICE_ID
          ? 'pro'
          : priceId === process.env.STRIPE_ELITE_PRICE_ID
          ? 'elite'
          : 'pro'

      const { data: subRow } = await supabase
        .from('subscriptions')
        .update({
          status: subscription.status,
          tier,
          stripe_price_id: priceId,
          current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('stripe_subscription_id', subscription.id)
        .select('user_id')
        .single()

      if (subRow) {
        const newTier = subscription.status === 'active' ? tier : 'free'
        await supabase.from('users').update({ subscription_tier: newTier }).eq('id', subRow.user_id)
      }
      break
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription

      const { data: subRow } = await supabase
        .from('subscriptions')
        .update({ status: 'canceled', updated_at: new Date().toISOString() })
        .eq('stripe_subscription_id', subscription.id)
        .select('user_id')
        .single()

      if (subRow) {
        await supabase
          .from('users')
          .update({ subscription_tier: 'free' })
          .eq('id', subRow.user_id)
      }
      break
    }
  }

  return NextResponse.json({ received: true })
}
