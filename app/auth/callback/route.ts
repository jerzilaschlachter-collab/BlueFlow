import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse, type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'
  const refCode = searchParams.get('ref')?.toUpperCase() ?? null

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=no-code`)
  }

  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options: CookieOptions }>) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )

  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    return NextResponse.redirect(`${origin}/login?error=exchange-failed`)
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    const { data: existingProfile } = await supabase
      .from('users')
      .select('id, setup_completed')
      .eq('id', user.id)
      .single()

    if (!existingProfile) {
      // Resolve affiliate code — prefer OAuth ?ref param, fall back to signup metadata
      const codeToResolve =
        refCode ?? (user.user_metadata?.referred_by_affiliate_code as string | null) ?? null

      let affiliateId: string | null = null
      if (codeToResolve) {
        const { data: affiliate } = await supabase
          .from('affiliates')
          .select('id')
          .eq('code', codeToResolve)
          .eq('status', 'active')
          .single()
        affiliateId = affiliate?.id ?? null
      }

      await supabase.from('users').insert({
        id: user.id,
        email: user.email!,
        full_name: user.user_metadata?.full_name ?? null,
        avatar_url: user.user_metadata?.avatar_url ?? null,
        trading_style: 'swing',
        subscription_tier: 'free',
        analyses_used_this_month: 0,
        monthly_reset_date: new Date().toISOString(),
        setup_completed: false,
        referred_by_affiliate_code: codeToResolve,
        referred_by_affiliate_id: affiliateId,
      })

      if (affiliateId) {
        await supabase.from('affiliate_referrals').insert({
          affiliate_id: affiliateId,
          referred_user_id: user.id,
        })
        await supabase.rpc('increment_affiliate_referrals', { affiliate_id: affiliateId }).maybeSingle()
      }

      return NextResponse.redirect(`${origin}/setup`)
    }

    const setupDone = existingProfile && (existingProfile as { setup_completed?: boolean }).setup_completed
    if (!setupDone) {
      return NextResponse.redirect(`${origin}/setup`)
    }
  }

  return NextResponse.redirect(`${origin}${next}`)
}
