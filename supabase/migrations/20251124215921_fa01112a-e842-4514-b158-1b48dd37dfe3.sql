-- Add region column to properties table
ALTER TABLE public.properties 
ADD COLUMN region text DEFAULT 'continental' CHECK (region IN ('madeira', 'continental'));