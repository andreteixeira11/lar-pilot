
-- Fix admin_users: restrict SELECT to authenticated users checking their own email
DROP POLICY IF EXISTS "Allow admin status check" ON public.admin_users;
CREATE POLICY "Allow admin status check"
ON public.admin_users FOR SELECT
TO authenticated
USING (email = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- Fix owner-documents storage: scope to user's own folder
DROP POLICY IF EXISTS "Authenticated users can read owner documents" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload owner documents" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update owner documents" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete owner documents" ON storage.objects;

CREATE POLICY "Users access own owner documents"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'owner-documents' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users upload own owner documents"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'owner-documents' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users update own owner documents"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'owner-documents' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users delete own owner documents"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'owner-documents' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Rate limiting table for owner login
CREATE TABLE IF NOT EXISTS public.owner_login_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  attempted_at timestamp with time zone NOT NULL DEFAULT now(),
  success boolean NOT NULL DEFAULT false
);

ALTER TABLE public.owner_login_attempts ENABLE ROW LEVEL SECURITY;

-- Create index for efficient lookups
CREATE INDEX IF NOT EXISTS idx_owner_login_attempts_email_time ON public.owner_login_attempts(email, attempted_at);

-- Replace verify_owner_login with rate-limited version
CREATE OR REPLACE FUNCTION public.verify_owner_login(p_email text, p_password text)
RETURNS TABLE(owner_id uuid, owner_name text, property_id uuid, property_name text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  failed_count integer;
  dummy_hash text;
BEGIN
  -- Check rate limiting: max 5 failed attempts in last 15 minutes
  SELECT COUNT(*) INTO failed_count
  FROM public.owner_login_attempts
  WHERE email = p_email
    AND attempted_at > now() - interval '15 minutes'
    AND success = false;

  IF failed_count >= 5 THEN
    -- Still compute bcrypt to prevent timing attacks
    dummy_hash := extensions.crypt(p_password, extensions.gen_salt('bf'));
    -- Log the blocked attempt
    INSERT INTO public.owner_login_attempts (email, success) VALUES (p_email, false);
    RETURN;
  END IF;

  -- Attempt login
  RETURN QUERY
  SELECT 
    po.id,
    po.name,
    po.property_id,
    p.name
  FROM property_owners po
  JOIN properties p ON p.id = po.property_id
  WHERE po.email = p_email
  AND po.password_hash = extensions.crypt(p_password, po.password_hash);

  -- Log attempt result
  IF FOUND THEN
    INSERT INTO public.owner_login_attempts (email, success) VALUES (p_email, true);
    -- Clean old successful attempts
    DELETE FROM public.owner_login_attempts WHERE email = p_email AND attempted_at < now() - interval '1 day';
  ELSE
    -- Always compute bcrypt for unknown emails to prevent timing attacks
    IF NOT EXISTS (SELECT 1 FROM property_owners WHERE email = p_email) THEN
      dummy_hash := extensions.crypt(p_password, extensions.gen_salt('bf'));
    END IF;
    INSERT INTO public.owner_login_attempts (email, success) VALUES (p_email, false);
  END IF;
END;
$$;
