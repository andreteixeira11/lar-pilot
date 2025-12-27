-- Enable pgcrypto extension for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

-- Recreate the hash_owner_password function to use the proper schema
CREATE OR REPLACE FUNCTION public.hash_owner_password()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND NEW.password_hash <> OLD.password_hash) THEN
        NEW.password_hash = extensions.crypt(NEW.password_hash, extensions.gen_salt('bf'));
    END IF;
    RETURN NEW;
END;
$$;