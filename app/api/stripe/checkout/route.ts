import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { stripe, PLANS } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  const cookieStore = cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { tier } = await request.json()

  if (tier !== 'pro' && tier !== 'elite') {
    return NextResponse.json({ error: 'Invalid tier' }, { status: 400 })
  }

  const plan = PLANS[tier as 'pro' | 'elite']

  const { data: userProfile } = await supabase
    .from('users')
    .select('stripe_customer_id, email')
    .eq('id', user.id)
    .single()

  let customerId = userProfile?.stripe_customer_id

  // Create Stripe customer if none exists
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: userProfile?.email ?? user.email ?? undefined,
      metadata: { supabase_user_id: user.id },
    })
    customerId = customer.id

    await supabase
      .from('users')
      .update({ stripe_customer_id: customerId })
      .eq('id', user.id)
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: plan.priceId,
        quantity: 1,
      },
    ],
    success_url: `${appUrl}/dashboard?upgraded=true`,
    cancel_url: `${appUrl}/pricing`,
    subscription_data: {
      metadata: { supabase_user_id: user.id, tier },
    },
  })

  return NextResponse.json({ url: session.url })
}
