-- Add new fields to properties table
ALTER TABLE public.properties 
ADD COLUMN rnal text,
ADD COLUMN insurance_validity date,
ADD COLUMN insurance_file_url text,
ADD COLUMN platform_status text DEFAULT 'nao_submetido' CHECK (platform_status IN ('nao_submetido', 'submetido', 'aprovado'));

-- Create storage bucket for insurance documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('insurance-documents', 'insurance-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for insurance documents bucket
CREATE POLICY "Users can view their own insurance documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'insurance-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can upload their own insurance documents"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'insurance-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own insurance documents"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'insurance-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own insurance documents"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'insurance-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);