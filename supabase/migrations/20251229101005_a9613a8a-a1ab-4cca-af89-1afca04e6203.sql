-- Create storage bucket for owner documents
INSERT INTO storage.buckets (id, name, public) 
VALUES ('owner-documents', 'owner-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Create policies for owner documents bucket
CREATE POLICY "Authenticated users can upload owner documents"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'owner-documents');

CREATE POLICY "Authenticated users can read owner documents"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'owner-documents');

CREATE POLICY "Authenticated users can update owner documents"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'owner-documents');

CREATE POLICY "Authenticated users can delete owner documents"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'owner-documents');