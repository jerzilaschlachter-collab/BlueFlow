-- Create or update the chart-images bucket as public
INSERT INTO storage.buckets (id, name, public)
VALUES ('chart-images', 'chart-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Drop old policies targeting the wrong bucket name ('charts')
DROP POLICY IF EXISTS "Users can upload their own charts" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own charts" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own charts" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own charts" ON storage.objects;

-- Allow authenticated users to upload to their own folder in chart-images
CREATE POLICY "Users can upload their own charts"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'chart-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow public read so <img> tags work without auth
CREATE POLICY "Public can view chart images"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'chart-images');

-- Allow authenticated users to delete their own charts
CREATE POLICY "Users can delete their own charts"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'chart-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
