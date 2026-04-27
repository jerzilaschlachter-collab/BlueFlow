import { createClient } from '@supabase/supabase-js'

const projectId = 'xlcqxntucvekmxbuivcl'
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhsY3F4bnR1Y3Zla214YnVpdmNsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjA3ODY1MiwiZXhwIjoyMDkxNjU0NjUyfQ.C0T6burPyaUiau6UesG0FgMQ6RiJEhGsB9nLJdmA3jw'
const supabaseUrl = `https://${projectId}.supabase.co`

async function checkRLS() {
  const supabase = createClient(supabaseUrl, serviceRoleKey)

  console.log('🔍 Checking RLS Status\n')

  try {
    // Check if we can read the analyses table
    const { data, error } = await supabase.from('analyses').select('count')

    if (error) {
      console.log('❌ Error querying analyses table:', error.message)
    } else {
      console.log('✅ Can read analyses table')
    }

    // Check table schema
    const { data: columns } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type')
      .eq('table_name', 'analyses')

    console.log('\n📋 analyses table columns:')
    columns?.forEach((col: any) => {
      console.log(`   • ${col.column_name}: ${col.data_type}`)
    })

    console.log('\n⚠️  If RLS policies are still causing issues, try this alternative:')
    console.log('\nRun this in your Supabase SQL Editor instead:\n')

    const alternativeSQL = `
-- Simpler RLS setup - allow authenticated users to insert/read/update/delete their own analyses
ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;

-- Drop old policies
DROP POLICY IF EXISTS "Users can insert their own analyses" ON analyses;
DROP POLICY IF EXISTS "Users can read their own analyses" ON analyses;
DROP POLICY IF EXISTS "Users can update their own analyses" ON analyses;
DROP POLICY IF EXISTS "Users can delete their own analyses" ON analyses;

-- New policies - using authenticated role instead of auth.uid()
CREATE POLICY "Enable insert for authenticated users"
  ON analyses FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable select for authenticated users"
  ON analyses FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Enable update for authenticated users"
  ON analyses FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable delete for authenticated users"
  ON analyses FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Verify policies
SELECT schemaname, tablename, policyname, permissive, roles
FROM pg_policies
WHERE tablename = 'analyses'
ORDER BY policyname;
    `

    console.log(alternativeSQL)
  } catch (error) {
    console.error('Error:', error)
  }
}

checkRLS()
