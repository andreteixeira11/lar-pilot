-- Add customization columns to direct_booking_pages
ALTER TABLE public.direct_booking_pages
ADD COLUMN IF NOT EXISTS primary_color TEXT DEFAULT '#247d7f',
ADD COLUMN IF NOT EXISTS secondary_color TEXT DEFAULT '#1e293b',
ADD COLUMN IF NOT EXISTS button_color TEXT DEFAULT '#247d7f',
ADD COLUMN IF NOT EXISTS button_hover_color TEXT DEFAULT '#1d6466',
ADD COLUMN IF NOT EXISTS logo_url TEXT,
ADD COLUMN IF NOT EXISTS font_family TEXT DEFAULT 'Lato',
ADD COLUMN IF NOT EXISTS short_description TEXT,
ADD COLUMN IF NOT EXISTS show_gallery BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS show_amenities BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS show_rules BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS show_cancellation_policy BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS book_button_text TEXT DEFAULT 'Reservar Agora',
ADD COLUMN IF NOT EXISTS contact_button_text TEXT DEFAULT 'Pedir Informações';

-- Create storage bucket for direct booking images
INSERT INTO storage.buckets (id, name, public)
VALUES ('direct-booking-images', 'direct-booking-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for direct-booking-images bucket
CREATE POLICY "Users can upload their own images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'direct-booking-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'direct-booking-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'direct-booking-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Public can view direct booking images"
ON storage.objects FOR SELECT
USING (bucket_id = 'direct-booking-images');