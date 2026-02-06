-- Create table to store email verification codes
CREATE TABLE public.email_verification_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for fast lookups
CREATE INDEX idx_email_verification_codes_email ON public.email_verification_codes(email);

-- Enable RLS but allow edge functions to access via service role
ALTER TABLE public.email_verification_codes ENABLE ROW LEVEL SECURITY;

-- No public policies - only accessible via service role in edge functions