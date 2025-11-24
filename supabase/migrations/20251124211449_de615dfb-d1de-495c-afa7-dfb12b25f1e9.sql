-- Add DELETE policy for tourist_tax table
CREATE POLICY "Users can delete tourist tax for their properties"
ON public.tourist_tax
FOR DELETE
USING (
  EXISTS (
    SELECT 1
    FROM public.properties
    WHERE properties.id = tourist_tax.property_id
      AND properties.user_id = auth.uid()
  )
);