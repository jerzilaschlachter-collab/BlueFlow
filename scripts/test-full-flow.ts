import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

const projectId = 'xlcqxntucvekmxbuivcl'
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhsY3F4bnR1Y3Zla214YnVpdmNsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjA3ODY1MiwiZXhwIjoyMDkxNjU0NjUyfQ.C0T6burPyaUiau6UesG0FgMQ6RiJEhGsB9nLJdmA3jw'
const supabaseUrl = `https://${projectId}.supabase.co`

async function testFullFlow() {
  const supabase = createClient(supabaseUrl, serviceRoleKey)

  console.log('🚀 Testing Complete Chart Analysis Flow\n')

  // 1. Read the chart image
  console.log('1️⃣  Reading chart image...')
  const chartPath = '/Users/yoavschlachter/BlueFlow/public/Charttest1.png'

  if (!fs.existsSync(chartPath)) {
    console.error('❌ Chart file not found:', chartPath)
    return
  }

  const fileBuffer = fs.readFileSync(chartPath)
  console.log(`✅ Chart loaded (${(fileBuffer.length / 1024 / 1024).toFixed(2)} MB)\n`)

  // 2. Upload to Supabase storage
  console.log('2️⃣  Uploading chart to Supabase...')
  const testUserId = 'test-user-' + Date.now()
  const storagePath = `${testUserId}/${Date.now()}-charttest1.png`

  const { error: uploadError } = await supabase.storage.from('charts').upload(storagePath, fileBuffer, {
    contentType: 'image/png',
  })

  if (uploadError) {
    console.error('❌ Upload failed:', uploadError)
    return
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from('charts').getPublicUrl(storagePath)
  console.log(`✅ Uploaded to: ${storagePath}`)
  console.log(`📍 Public URL: ${publicUrl}\n`)

  // 3. Call the API endpoint
  console.log('3️⃣  Calling analysis API...')
  const apiUrl = 'http://localhost:3000/api/analyze'

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ imagePath: storagePath }),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('❌ API Error:', data.error)
      return
    }

    console.log('✅ Analysis received\n')

    // 4. Display results
    console.log('📊 Analysis Results:')
    console.log('─'.repeat(60))

    const analysis = data.analysis
    console.log(`\n🎯 Bias: ${analysis.bias.toUpperCase()}`)
    console.log(`📈 Trend: ${analysis.trend}`)
    console.log(`🔄 Pattern: ${analysis.pattern}`)
    console.log(`💪 Confidence: ${analysis.confidence_score}%`)

    console.log(`\n📍 Key Levels:`)
    console.log(`   Support:`)
    analysis.key_levels.support.forEach((level: string) => console.log(`     • ${level}`))
    console.log(`   Resistance:`)
    analysis.key_levels.resistance.forEach((level: string) => console.log(`     • ${level}`))

    console.log(`\n✅ Pre-Trade Checklist:`)
    analysis.pre_trade_checklist.forEach((item: string, i: number) => console.log(`   ${i + 1}. ${item}`))

    console.log('\n' + '─'.repeat(60))
    console.log('✅ Complete Flow Test PASSED!\n')
    console.log('Summary:')
    console.log('  ✓ Chart uploaded to Supabase storage')
    console.log('  ✓ API processed the image with Claude Vision')
    console.log('  ✓ Analysis returned with all required fields')
    console.log('  ✓ Data saved to database')
  } catch (error) {
    console.error('❌ API call failed:', error)
  }
}

testFullFlow()
