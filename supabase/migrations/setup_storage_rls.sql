-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can upload their own charts" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own charts" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own charts" ON storage.objects;

-- CREATE INSERT policy - allow authenticated users to upload to their own folder
CREATE POLICY "Users can upload their own charts"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'charts'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- CREATE SELECT policy - allow authenticated users to view their own charts
CREATE POLICY "Users can view their own charts"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'charts'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- CREATE DELETE policy - allow authenticated users to delete their own charts
CREATE POLICY "Users can delete their own charts"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'charts'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- CREATE UPDATE policy - allow authenticated users to update their own charts
CREATE POLICY "Users can update their own charts"
  ON storage.objects
  FOR UPDATE
  WITH CHECK (
    bucket_id = 'charts'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
