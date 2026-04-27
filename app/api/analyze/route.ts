import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { Anthropic } from '@anthropic-ai/sdk'
import sharp from 'sharp'

export const maxDuration = 60

// Usage limits per tier
const USAGE_LIMITS: Record<string, number> = {
  free: 2,
  pro: 60,
  elite: 200,
}

// Trading style specific instructions
const STYLE_INSTRUCTIONS: Record<string, string> = {
  smc: `Focus your analysis on Smart Money Concepts: order blocks, Fair Value Gaps (FVGs), liquidity levels, Break of Structure (BOS), Change of Character (CHoCH), premium/discount zones, and inducement moves. Identify where institutions are accumulating or distributing. Mark order blocks, liquidity voids, and institutional levels.`,

  price_action: `Focus your analysis on pure price action: candlestick patterns, wick rejections, market structure breaks, clean support and resistance. Identify where price is accepting or rejecting levels. Look for confluence of multiple price action signals.`,

  indicators: `Focus your analysis on technical indicators: RSI, MACD, Moving Averages, divergences, overbought/oversold conditions, and indicator confluence. Use indicators to confirm price structure and identify momentum shifts.`,

  elliott_wave: `Focus your analysis on Elliott Wave Theory: identify wave counts, apply Fibonacci ratios, distinguish between impulse and corrective structures, establish invalidation levels, and forecast likely targets based on wave relationships.`,

  wyckoff: `Focus your analysis on Wyckoff methodology: identify accumulation and distribution phases, spot springs, upthrusts, signs of strength (SOS), signs of weakness (SOW), and schematic pattern development.`,

  mixed: `Provide comprehensive analysis using all methods: Smart Money Concepts (order blocks, FVGs, liquidity), price action (candlesticks, structure), indicators (RSI, MACD, MAs), Elliott Wave structure, and Wyckoff phases.`,
}

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user profile
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('id, subscription_tier, trading_style, analyses_used_this_month, monthly_reset_date')
      .eq('id', user.id)
      .single()

    if (profileError || !userProfile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
    }

    // Check and reset monthly counter if needed
    const resetDate = new Date(userProfile.monthly_reset_date || new Date())
    const now = new Date()
    let usageCount = userProfile.analyses_used_this_month || 0

    if (
      now.getMonth() !== resetDate.getMonth() ||
      now.getFullYear() !== resetDate.getFullYear()
    ) {
      await supabase
        .from('users')
        .update({ analyses_used_this_month: 0, monthly_reset_date: now.toISOString() })
        .eq('id', user.id)
      usageCount = 0
    }

    // Check usage limits
    const tier = (userProfile.subscription_tier || 'free') as string
    const limit = USAGE_LIMITS[tier] || USAGE_LIMITS.free

    if (usageCount >= limit) {
      const usageRemaining = 0
      return NextResponse.json(
        {
          error: `Monthly limit of ${limit} analyses reached for ${tier} tier. Upgrade to analyze more charts.`,
          limitReached: true,
          usageRemaining,
        },
        { status: 403 }
      )
    }

    // Parse FormData
    const formData = await request.formData()
    const imageFile = formData.get('image') as File | null
    const asset = (formData.get('asset') as string) || 'Unknown Asset'

    if (!imageFile) {
      return NextResponse.json({ error: 'Image field is required' }, { status: 400 })
    }

    // Validate MIME type before processing
    const mimeType = imageFile.type as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp'
    if (!['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(mimeType)) {
      return NextResponse.json({ error: 'Invalid image format' }, { status: 400 })
    }

    // Convert image to base64, resizing to max 800px to reduce token cost
    const rawBuffer = Buffer.from(await imageFile.arrayBuffer())
    const resizedBuffer = await sharp(rawBuffer)
      .resize({ width: 800, height: 800, fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 75 })
      .toBuffer()
    const base64Image = resizedBuffer.toString('base64')

    // Get trading style and style-specific instructions
    const tradingStyle = userProfile.trading_style || 'mixed'
    const styleInstructions = STYLE_INSTRUCTIONS[tradingStyle] || STYLE_INSTRUCTIONS.mixed

    // Build system prompt
    const systemPrompt = `You are BlueFlow, an AI trading analyst. Return ONLY valid JSON, no extra text.

${styleInstructions}

Return exactly this JSON schema:
{"is_valid_chart":true,"summary":"headline","timeframe_detected":"TF","asset_detected":"asset","market_context":"1-2 sentences","trend":{"direction":"Bullish|Bearish|Sideways","strength":"Strong|Moderate|Weak","phase":"Impulse|Correction|Consolidation|Reversal","description":"sentence"},"structure":{"highs_lows":"brief","last_significant_move":"brief","current_position":"brief"},"key_levels":{"major_resistance":[{"price":"level","strength":"Strong|Moderate|Weak","reason":"brief"}],"major_support":[{"price":"level","strength":"Strong|Moderate|Weak","reason":"brief"}],"immediate_resistance":"level","immediate_support":"level","key_note":"sentence"},"pattern":{"detected":true,"name":"name or None","completion":"Complete|Forming|Broken","implication":"brief","invalidation":"brief"},"momentum":{"current":"Increasing|Decreasing|Neutral","description":"sentence","divergence":"brief or None"},"bias":{"direction":"Bullish|Bearish|Neutral","confidence_score":75,"short_term":"Bullish|Bearish|Neutral","medium_term":"Bullish|Bearish|Neutral","reasoning":"2 sentences"},"trade_setup":{"setup_quality":"A+|A|B|C|No Setup","entry_type":"Limit|Market|Wait","entry_zone":"price","entry_reasoning":"brief","stop_loss":"price","stop_reasoning":"brief","take_profit_1":"price","take_profit_2":"price","take_profit_3":"price or null","risk_reward":"1:2","position_sizing_note":"brief"},"checklist":{"trend_confirmed":true,"key_level_identified":true,"pattern_valid":true,"risk_reward_acceptable":true,"entry_timing_clear":true,"stop_loss_logical":true,"no_major_news_risk":true},"style_specific_notes":"3-4 sentences","scenarios":{"bullish_scenario":"brief","bearish_scenario":"brief","key_decision_level":"price"},"annotations":[{"type":"horizontal_line","label":"≤15 chars","price_label":"price","color":"#EF4444 or #22C55E","style":"solid or dashed","y_percent":30},{"type":"zone","label":"name","color":"#EF444420 or #22C55E20","border_color":"#EF4444 or #22C55E","y_top_percent":20,"y_bottom_percent":35},{"type":"arrow","label":"Entry or Target","color":"#22C55E or #EF4444","direction":"up or down","y_percent":60,"x_percent":75}],"warning":null,"overall_grade":"A+|A|B|C|D","disclaimer":"Educational purposes only"}

Include 4-6 annotations. y_percent: 0=top, 100=bottom.
If not a chart: {"is_valid_chart":false,"error":"reason"}`

    // Call Claude API with vision
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    })

    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 3000,
      system: [
        {
          type: 'text',
          text: systemPrompt,
          cache_control: { type: 'ephemeral' },
        },
      ],
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: 'image/jpeg',
                data: base64Image,
              },
            },
            {
              type: 'text',
              text: `Analyze this ${tradingStyle} trading chart${asset ? ` for ${asset}` : ''}. Return valid JSON only.`,
            },
          ],
        },
      ],
    })

    const { input_tokens, output_tokens } = response.usage
    const cache_read = (response.usage as unknown as Record<string, number>).cache_read_input_tokens ?? 0
    console.log(`[analyze] tokens — input: ${input_tokens}, output: ${output_tokens}, cache_read: ${cache_read}`)

    // Extract and parse JSON response
    const rawText = response.content[0].type === 'text' ? response.content[0].text : ''

    let analysis
    try {
      const jsonMatch = rawText.match(/\{[\s\S]*\}/)
      if (!jsonMatch) throw new Error('No JSON found in response')
      analysis = JSON.parse(jsonMatch[0])
    } catch (error) {
      return NextResponse.json(
        { error: 'Failed to parse AI response as JSON' },
        { status: 500 }
      )
    }

    // Check if valid chart
    if (!analysis.is_valid_chart) {
      return NextResponse.json(
        { error: analysis.error || 'Not a valid trading chart' },
        { status: 400 }
      )
    }

    // Upload image to Supabase storage (non-blocking — analysis proceeds even if upload fails)
    let chartImageUrl = ''
    try {
      const timestamp = Date.now()
      const fileName = `${user.id}/${timestamp}.jpg`

      const { error: uploadError } = await supabase.storage
        .from('chart-images')
        .upload(fileName, resizedBuffer, {
          contentType: 'image/jpeg',
          upsert: false,
        })

      if (uploadError) {
        console.error('Storage upload error (non-fatal):', uploadError)
      } else {
        const { data: publicUrl } = supabase.storage
          .from('chart-images')
          .getPublicUrl(fileName)
        chartImageUrl = publicUrl.publicUrl
      }
    } catch (storageErr) {
      console.error('Storage exception (non-fatal):', storageErr)
    }

    // Save analysis to database
    const { data: savedAnalysis, error: insertError } = await supabase
      .from('analyses')
      .insert({
        user_id: user.id,
        image_url: chartImageUrl || '',
        chart_image_url: chartImageUrl || null,
        trading_style: tradingStyle,
        result: analysis,
        bias: (analysis.bias?.direction || 'neutral').toLowerCase(),
        confidence_score: analysis.bias?.confidence_score || 0,
        trend: analysis.trend?.direction || null,
        pattern: analysis.pattern?.name || null,
        key_levels: analysis.key_levels || null,
        raw_analysis: JSON.stringify(analysis),
        outcome: 'pending',
      })
      .select('id, created_at')
      .single()

    if (insertError || !savedAnalysis) {
      console.error('Database insert error:', insertError)
      return NextResponse.json(
        { error: 'Failed to save analysis' },
        { status: 500 }
      )
    }

    // Increment usage counter
    await supabase
      .from('users')
      .update({ analyses_used_this_month: usageCount + 1 })
      .eq('id', user.id)

    // Calculate remaining usage
    const usageRemaining = limit - (usageCount + 1)

    return NextResponse.json({
      success: true,
      analysis,
      analysisId: savedAnalysis.id,
      chartImageUrl,
      createdAt: savedAnalysis.created_at,
      usageRemaining,
    })
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error('Analyze endpoint error:', error)
    return NextResponse.json(
      { error: `Internal server error: ${msg}` },
      { status: 500 }
    )
  }
}
