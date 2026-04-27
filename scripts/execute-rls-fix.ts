import { createClient } from '@supabase/supabase-js'

const projectId = 'xlcqxntucvekmxbuivcl'
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhsY3F4bnR1Y3Zla214YnVpdmNsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjA3ODY1MiwiZXhwIjoyMDkxNjU0NjUyfQ.C0T6burPyaUiau6UesG0FgMQ6RiJEhGsB9nLJdmA3jw'
const supabaseUrl = `https://${projectId}.supabase.co`

async function executeRLSFix() {
  const supabase = createClient(supabaseUrl, serviceRoleKey)

  console.log('🔐 Attempting to fix RLS policies...\n')

  try {
    // Try to use the rpc call to execute the SQL
    const sqlCommands = `
      -- Drop existing policies
      DROP POLICY IF EXISTS "Users can insert their own analyses" ON analyses;
      DROP POLICY IF EXISTS "Users can read their own analyses" ON analyses;
      DROP POLICY IF EXISTS "Users can update their own analyses" ON analyses;
      DROP POLICY IF EXISTS "Users can delete their own analyses" ON analyses;

      -- Enable RLS
      ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;

      -- Create policies
      CREATE POLICY "Users can insert their own analyses"
        ON analyses FOR INSERT
        WITH CHECK (auth.uid() = user_id);

      CREATE POLICY "Users can read their own analyses"
        ON analyses FOR SELECT
        USING (auth.uid() = user_id);

      CREATE POLICY "Users can update their own analyses"
        ON analyses FOR UPDATE
        USING (auth.uid() = user_id)
        WITH CHECK (auth.uid() = user_id);

      CREATE POLICY "Users can delete their own analyses"
        ON analyses FOR DELETE
        USING (auth.uid() = user_id);
    `

    // The Supabase JS client doesn't have a direct SQL execution method
    // We need to use the REST API with proper headers

    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${serviceRoleKey}`,
        'Content-Type': 'application/json',
        'apikey': serviceRoleKey,
      },
      body: JSON.stringify({ query: sqlCommands }),
    })

    const result = await response.json()

    if (!response.ok) {
      console.log('⚠️  Could not auto-execute SQL (expected without a SQL function)')
      console.log('\n📋 Please run this in your Supabase SQL Editor:\n')
      console.log(sqlCommands)
      return
    }

    console.log('✅ RLS policies created successfully!')
  } catch (error) {
    console.log('⚠️  Auto-execution not available\n')
    console.log('📋 To fix the RLS issue, please:\n')
    console.log('1. Go to https://app.supabase.com/project/xlcqxntucvekmxbuivcl')
    console.log('2. Open SQL Editor')
    console.log('3. Click "New Query"')
    console.log('4. Paste this SQL and run it:\n')

    const sqlCommands = `-- Drop existing policies
DROP POLICY IF EXISTS "Users can insert their own analyses" ON analyses;
DROP POLICY IF EXISTS "Users can read their own analyses" ON analyses;
DROP POLICY IF EXISTS "Users can update their own analyses" ON analyses;
DROP POLICY IF EXISTS "Users can delete their own analyses" ON analyses;

-- Enable RLS on analyses table
ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;

-- Allow users to insert their own analyses
CREATE POLICY "Users can insert their own analyses"
  ON analyses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Allow users to read their own analyses
CREATE POLICY "Users can read their own analyses"
  ON analyses FOR SELECT
  USING (auth.uid() = user_id);

-- Allow users to update their own analyses
CREATE POLICY "Users can update their own analyses"
  ON analyses FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own analyses
CREATE POLICY "Users can delete their own analyses"
  ON analyses FOR DELETE
  USING (auth.uid() = user_id);`

    console.log(sqlCommands)
    console.log('\n5. After running the SQL, try uploading a chart again!')
  }
}

executeRLSFix()
