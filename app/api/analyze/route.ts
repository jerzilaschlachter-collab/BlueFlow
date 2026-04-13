import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const TRADING_STYLE_PROMPTS: Record<string, string> = {
  scalping: `You are an expert scalp trader and technical analyst specializing in 1-5 minute timeframes. Focus on micro-patterns, momentum, order flow, candlestick signals, and immediate support/resistance. Identify high-probability setups where price can move quickly within minutes. Prioritize precision entry and exit levels.`,
  day: `You are an expert day trader and technical analyst. Focus on intraday patterns, VWAP levels, session highs/lows, opening range breakouts, and key intraday support/resistance zones. Analyze setups that resolve within the trading session. Consider volume, momentum, and trend continuation/reversal signals.`,
  swing: `You are an expert swing trader and technical analyst. Focus on multi-day to multi-week patterns, major support and resistance zones, trend structure, and classic chart patterns. Identify high-probability swing setups with clear risk/reward ratios. Analyze momentum, confluence zones, and key structural levels.`,
  position: `You are an expert position trader and technical analyst specializing in weekly and monthly timeframes. Focus on long-term trend analysis, major structural levels, macro chart patterns, and high-timeframe support/resistance. Identify key turning points and sustained trend setups that play out over weeks to months.`,
}

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
        setAll(cookiesToSet: Array<{ name: string; value: string; options: CookieOptions }>) {
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

  const { data: userProfile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!userProfile) {
    return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
  }

  // Check and reset monthly counter if needed
  const resetDate = new Date(userProfile.monthly_reset_date)
  const now = new Date()
  if (
    now.getMonth() !== resetDate.getMonth() ||
    now.getFullYear() !== resetDate.getFullYear()
  ) {
    await supabase
      .from('users')
      .update({ analyses_used_this_month: 0, monthly_reset_date: now.toISOString() })
      .eq('id', user.id)
    userProfile.analyses_used_this_month = 0
  }

  // Enforce free tier limit
  if (userProfile.subscription_tier === 'free' && userProfile.analyses_used_this_month >= 2) {
    return NextResponse.json(
      {
        error: 'Monthly limit reached. Upgrade to Pro for unlimited analyses.',
        limitReached: true,
      },
      { status: 403 }
    )
  }

  const body = await request.json()
  const { imagePath } = body

  if (!imagePath) {
    return NextResponse.json({ error: 'imagePath is required' }, { status: 400 })
  }

  // Download image from Supabase storage
  const { data: imageData, error: downloadError } = await supabase.storage
    .from('charts')
    .download(imagePath)

  if (downloadError || !imageData) {
    return NextResponse.json({ error: 'Failed to retrieve image from storage' }, { status: 500 })
  }

  const arrayBuffer = await imageData.arrayBuffer()
  const base64 = Buffer.from(arrayBuffer).toString('base64')
  const mimeType: 'image/jpeg' | 'image/png' = imagePath.toLowerCase().endsWith('.png')
    ? 'image/png'
    : 'image/jpeg'

  // Get public URL for storing in the analysis record
  const {
    data: { publicUrl },
  } = supabase.storage.from('charts').getPublicUrl(imagePath)

  const tradingStyle = userProfile.trading_style || 'swing'
  const basePrompt = TRADING_STYLE_PROMPTS[tradingStyle] ?? TRADING_STYLE_PROMPTS.swing

  const systemPrompt = `${basePrompt}

You MUST respond with ONLY a valid JSON object — no markdown, no explanation. Use exactly this structure:
{
  "trend": "clear description of the current trend direction and strength",
  "key_levels": {
    "support": ["level with brief context", "level with brief context"],
    "resistance": ["level with brief context", "level with brief context"]
  },
  "pattern": "identified chart pattern name and brief description",
  "bias": "bullish" or "bearish" or "neutral",
  "confidence_score": integer between 0 and 100,
  "pre_trade_checklist": [
    "condition to verify before entering",
    "condition to verify before entering",
    "condition to verify before entering",
    "condition to verify before entering",
    "condition to verify before entering"
  ]
}`

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1500,
    system: systemPrompt,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: mimeType,
              data: base64,
            },
          },
          {
            type: 'text',
            text: `Analyze this ${tradingStyle} trading chart and provide your analysis as a JSON object.`,
          },
        ],
      },
    ],
  })

  const rawText = response.content[0].type === 'text' ? response.content[0].text : ''

  let analysisData
  try {
    const jsonMatch = rawText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('No JSON in response')
    analysisData = JSON.parse(jsonMatch[0])
  } catch {
    return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 })
  }

  // Save to database
  const { data: savedAnalysis } = await supabase
    .from('analyses')
    .insert({
      user_id: user.id,
      image_url: publicUrl,
      trend: analysisData.trend,
      key_levels: analysisData.key_levels,
      pattern: analysisData.pattern,
      bias: analysisData.bias,
      confidence_score: analysisData.confidence_score,
      pre_trade_checklist: analysisData.pre_trade_checklist,
      raw_analysis: rawText,
      trading_style: tradingStyle,
    })
    .select()
    .single()

  // Increment usage counter
  await supabase
    .from('users')
    .update({ analyses_used_this_month: userProfile.analyses_used_this_month + 1 })
    .eq('id', user.id)

  return NextResponse.json({ analysis: analysisData, id: savedAnalysis?.id, image_url: publicUrl, created_at: savedAnalysis?.created_at })
}
