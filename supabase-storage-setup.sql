-- Create storage buckets if they don't exist
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('resumes', 'resumes', false),
  ('images', 'images', false)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for the resumes bucket
CREATE POLICY "Users can manage their own resumes" ON storage.objects
  FOR ALL USING (
    bucket_id = 'resumes' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Create RLS policies for the images bucket  
CREATE POLICY "Users can manage their own images" ON storage.objects
  FOR ALL USING (
    bucket_id = 'images' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Alternative simpler policies (use these if the above don't work)
-- These allow any authenticated user to manage files in their respective buckets

-- CREATE POLICY "Authenticated users can access resumes" ON storage.objects
--   FOR ALL USING (
--     bucket_id = 'resumes' AND 
--     auth.role() = 'authenticated'
--   );

-- CREATE POLICY "Authenticated users can access images" ON storage.objects
--   FOR ALL USING (
--     bucket_id = 'images' AND 
--     auth.role() = 'authenticated'
--   );

-- Enable RLS on the storage.objects table (if not already enabled)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
