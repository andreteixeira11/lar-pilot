-- Update verify_owner_login to use extensions schema for crypt
CREATE OR REPLACE FUNCTION public.verify_owner_login(p_email text, p_password text)
RETURNS TABLE(owner_id uuid, owner_name text, property_id uuid, property_name text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
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
END;
$$;