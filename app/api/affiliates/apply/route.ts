import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse, type NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { name, email, platform, audience_size, handle, note } = body

  if (!name || !email || !platform || !audience_size) {
    return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 })
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return NextResponse.json({ error: 'Invalid email address.' }, { status: 400 })
  }

  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet: Array<{ name: string; value: string; options: CookieOptions }>) {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        },
      },
    }
  )

  const { error } = await supabase.from('affiliate_applications').insert({
    name: name.trim(),
    email: email.trim().toLowerCase(),
    platform,
    audience_size,
    handle: handle?.trim() || null,
    note: note?.trim() || null,
  })

  if (error) {
    return NextResponse.json({ error: 'Failed to submit application.' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
