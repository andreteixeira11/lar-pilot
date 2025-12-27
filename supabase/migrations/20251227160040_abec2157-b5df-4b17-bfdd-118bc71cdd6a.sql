-- Recreate the hash function and trigger
CREATE OR REPLACE FUNCTION public.hash_owner_password()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND NEW.password_hash <> OLD.password_hash) THEN
        NEW.password_hash = crypt(NEW.password_hash, gen_salt('bf'));
    END IF;
    RETURN NEW;
END;
$$;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS hash_owner_password_trigger ON property_owners;

CREATE TRIGGER hash_owner_password_trigger
BEFORE INSERT OR UPDATE ON property_owners
FOR EACH ROW
EXECUTE FUNCTION hash_owner_password();