import { createClient } from '@supabase/supabase-js'

const projectId = 'xlcqxntucvekmxbuivcl'
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhsY3F4bnR1Y3Zla214YnVpdmNsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjA3ODY1MiwiZXhwIjoyMDkxNjU0NjUyfQ.C0T6burPyaUiau6UesG0FgMQ6RiJEhGsB9nLJdmA3jw'
const supabaseUrl = `https://${projectId}.supabase.co`

async function setupStorage() {
  const supabase = createClient(supabaseUrl, serviceRoleKey)

  console.log('🔧 Setting up Supabase storage bucket...')

  try {
    // Create the 'charts' bucket
    console.log('📦 Creating charts bucket...')
    const { data: buckets } = await supabase.storage.listBuckets()

    const chartsExists = buckets?.some(b => b.name === 'charts')

    if (!chartsExists) {
      const { data, error } = await supabase.storage.createBucket('charts', {
        public: true,
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
      })

      if (error) {
        console.error('❌ Failed to create bucket:', error)
        process.exit(1)
      }

      console.log('✅ Bucket created:', data?.name)
    } else {
      console.log('✅ Bucket already exists')
    }

    console.log('🎉 Storage setup complete!')
    console.log('\nYour bucket is ready for chart uploads.')
    console.log('Users can now upload charts to: /charts/{user_id}/{timestamp}-chart.{ext}')
  } catch (error) {
    console.error('❌ Setup failed:', error)
    process.exit(1)
  }
}

setupStorage()
