import { createClient } from '@supabase/supabase-js'

const projectId = 'xlcqxntucvekmxbuivcl'
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhsY3F4bnR1Y3Zla214YnVpdmNsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjA3ODY1MiwiZXhwIjoyMDkxNjU0NjUyfQ.C0T6burPyaUiau6UesG0FgMQ6RiJEhGsB9nLJdmA3jw'
const supabaseUrl = `https://${projectId}.supabase.co`

async function fixRLS() {
  const supabase = createClient(supabaseUrl, serviceRoleKey)

  console.log('🔐 Fixing Row-Level Security Policies\n')

  // Fix analyses table RLS
  console.log('1️⃣  Setting up analyses table RLS...')

  // First, disable RLS temporarily to check and recreate policies
  const { data: tables } = await supabase
    .from('information_schema.tables')
    .select('table_name')
    .eq('table_schema', 'public')

  // We need to use the SQL API directly for RLS policies
  // Since Supabase SDK doesn't expose RLS policy management,
  // we'll provide SQL commands to run

  console.log(`
To fix the RLS issue, run these SQL commands in your Supabase SQL Editor:

-- 1. Enable RLS on analyses table
ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;

-- 2. Allow users to insert their own analyses
CREATE POLICY "Users can insert their own analyses"
  ON analyses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 3. Allow users to read their own analyses
CREATE POLICY "Users can read their own analyses"
  ON analyses FOR SELECT
  USING (auth.uid() = user_id);

-- 4. Allow users to update their own analyses
CREATE POLICY "Users can update their own analyses"
  ON analyses FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 5. Allow users to delete their own analyses
CREATE POLICY "Users can delete their own analyses"
  ON analyses FOR DELETE
  USING (auth.uid() = user_id);

-- Verify policies are set
SELECT schemaname, tablename, policyname, permissive, roles, qual, with_check
FROM pg_policies
WHERE tablename = 'analyses';
  `)

  console.log('✅ RLS fix instructions generated\n')
  console.log('Steps:')
  console.log('1. Open your Supabase dashboard')
  console.log('2. Go to SQL Editor')
  console.log('3. Copy and run the SQL commands above')
  console.log('4. Then try uploading a chart again')
}

fixRLS()
