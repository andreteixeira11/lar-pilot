-- Add checkin_token field to reservations table
ALTER TABLE public.reservations 
ADD COLUMN checkin_token TEXT UNIQUE;

-- Create function to generate unique checkin token
CREATE OR REPLACE FUNCTION public.generate_checkin_token()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  new_token TEXT;
  token_exists BOOLEAN;
BEGIN
  LOOP
    -- Generate random token (32 characters)
    new_token := encode(gen_random_bytes(24), 'base64');
    new_token := replace(new_token, '/', '_');
    new_token := replace(new_token, '+', '-');
    
    -- Check if token already exists
    SELECT EXISTS(SELECT 1 FROM public.reservations WHERE checkin_token = new_token) INTO token_exists;
    
    -- Exit loop if token is unique
    EXIT WHEN NOT token_exists;
  END LOOP;
  
  RETURN new_token;
END;
$$;

-- Add RLS policy for public access to reservations via checkin_token
CREATE POLICY "Public can view reservation by checkin token"
ON public.reservations
FOR SELECT
USING (checkin_token IS NOT NULL);

-- Add RLS policy for public to update reservation checkin status
CREATE POLICY "Public can update reservation via checkin token"
ON public.reservations
FOR UPDATE
USING (checkin_token IS NOT NULL)
WITH CHECK (checkin_token IS NOT NULL);