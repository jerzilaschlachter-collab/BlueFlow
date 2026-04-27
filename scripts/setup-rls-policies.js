#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://xlcqxntucvekmxbuivcl.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhsY3F4bnR1Y3Zla214YnVpdmNsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjA3ODY1MiwiZXhwIjoyMDkxNjU0NjUyfQ.C0T6burPyaUiau6UesG0FgMQ6RiJEhGsB9nLJdmA3jw';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

async function setupRLSPolicies() {
  try {
    console.log('Setting up RLS policies for charts bucket...');

    // Execute SQL via PostgreSQL directly through Supabase
    const { error } = await supabase.rpc('exec_sql', {
      sql: `
        -- Enable RLS on storage.objects
        ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

        -- Drop existing policies if they exist
        DROP POLICY IF EXISTS "Users can upload their own charts" ON storage.objects;
        DROP POLICY IF EXISTS "Users can view their own charts" ON storage.objects;
        DROP POLICY IF EXISTS "Users can delete their own charts" ON storage.objects;
        DROP POLICY IF EXISTS "Users can update their own charts" ON storage.objects;

        -- CREATE INSERT policy
        CREATE POLICY "Users can upload their own charts"
          ON storage.objects
          FOR INSERT
          WITH CHECK (
            bucket_id = 'charts'
            AND (storage.foldername(name))[1] = auth.uid()::text
          );

        -- CREATE SELECT policy
        CREATE POLICY "Users can view their own charts"
          ON storage.objects
          FOR SELECT
          USING (
            bucket_id = 'charts'
            AND (storage.foldername(name))[1] = auth.uid()::text
          );

        -- CREATE DELETE policy
        CREATE POLICY "Users can delete their own charts"
          ON storage.objects
          FOR DELETE
          USING (
            bucket_id = 'charts'
            AND (storage.foldername(name))[1] = auth.uid()::text
          );

        -- CREATE UPDATE policy
        CREATE POLICY "Users can update their own charts"
          ON storage.objects
          FOR UPDATE
          WITH CHECK (
            bucket_id = 'charts'
            AND (storage.foldername(name))[1] = auth.uid()::text
          );
      `
    });

    if (error) {
      console.error('Trying alternative approach...');

      // Alternative: Try with individual statements
      const statements = [
        `ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;`,
        `DROP POLICY IF EXISTS "Users can upload their own charts" ON storage.objects;`,
        `DROP POLICY IF EXISTS "Users can view their own charts" ON storage.objects;`,
        `DROP POLICY IF EXISTS "Users can delete their own charts" ON storage.objects;`,
        `DROP POLICY IF EXISTS "Users can update their own charts" ON storage.objects;`,
        `CREATE POLICY "Users can upload their own charts" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'charts' AND (storage.foldername(name))[1] = auth.uid()::text);`,
        `CREATE POLICY "Users can view their own charts" ON storage.objects FOR SELECT USING (bucket_id = 'charts' AND (storage.foldername(name))[1] = auth.uid()::text);`,
        `CREATE POLICY "Users can delete their own charts" ON storage.objects FOR DELETE USING (bucket_id = 'charts' AND (storage.foldername(name))[1] = auth.uid()::text);`,
        `CREATE POLICY "Users can update their own charts" ON storage.objects FOR UPDATE WITH CHECK (bucket_id = 'charts' AND (storage.foldername(name))[1] = auth.uid()::text);`
      ];

      for (const stmt of statements) {
        const { error: stmtError } = await supabase.rpc('exec_sql', { sql: stmt });
        if (!stmtError) {
          console.log('✅ Executed:', stmt.substring(0, 50) + '...');
        }
      }
    }

    console.log('✅ RLS policies configured successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error setting up RLS policies:', error.message);
    console.error('\n⚠️  If the above fails, you need to manually set up RLS policies in Supabase Dashboard:');
    console.error('   1. Go to Storage > charts bucket');
    console.error('   2. Click Policies');
    console.error('   3. Add INSERT and SELECT policies for authenticated users');
    process.exit(1);
  }
}

setupRLSPolicies();
