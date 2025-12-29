-- Allow admins to update any profile (for blocking/unblocking users)
CREATE POLICY "Admins can update all profiles" 
ON public.profiles 
FOR UPDATE 
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());