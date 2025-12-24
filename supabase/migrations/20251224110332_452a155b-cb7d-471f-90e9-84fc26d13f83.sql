-- Create storage bucket for guidebook images
INSERT INTO storage.buckets (id, name, public)
VALUES ('guidebook-images', 'guidebook-images', true)
ON CONFLICT (id) DO NOTHING;

-- Create policy for public read access
CREATE POLICY "Guidebook images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'guidebook-images');

-- Create policy for authenticated users to upload
CREATE POLICY "Authenticated users can upload guidebook images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'guidebook-images' AND auth.role() = 'authenticated');

-- Create policy for authenticated users to update their uploads
CREATE POLICY "Authenticated users can update guidebook images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'guidebook-images' AND auth.role() = 'authenticated');

-- Create policy for authenticated users to delete their uploads
CREATE POLICY "Authenticated users can delete guidebook images"
ON storage.objects FOR DELETE
USING (bucket_id = 'guidebook-images' AND auth.role() = 'authenticated');