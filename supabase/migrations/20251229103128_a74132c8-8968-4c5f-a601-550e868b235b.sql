-- Create property_reviews table for storing reviews from platforms
CREATE TABLE public.property_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  guest_name TEXT NOT NULL,
  rating NUMERIC NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  review_date DATE NOT NULL,
  response_text TEXT,
  response_date DATE,
  external_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.property_reviews ENABLE ROW LEVEL SECURITY;

-- Policies for property owners to manage reviews
CREATE POLICY "Users can view reviews for their properties" 
ON public.property_reviews 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM properties 
  WHERE properties.id = property_reviews.property_id 
  AND properties.user_id = auth.uid()
));

CREATE POLICY "Users can insert reviews for their properties" 
ON public.property_reviews 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM properties 
  WHERE properties.id = property_reviews.property_id 
  AND properties.user_id = auth.uid()
));

CREATE POLICY "Users can update reviews for their properties" 
ON public.property_reviews 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM properties 
  WHERE properties.id = property_reviews.property_id 
  AND properties.user_id = auth.uid()
));

CREATE POLICY "Users can delete reviews for their properties" 
ON public.property_reviews 
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM properties 
  WHERE properties.id = property_reviews.property_id 
  AND properties.user_id = auth.uid()
));

-- Create index for better performance
CREATE INDEX idx_property_reviews_property_id ON public.property_reviews(property_id);
CREATE INDEX idx_property_reviews_platform ON public.property_reviews(platform);

-- Alter property_owners to allow multiple properties (add a junction table)
CREATE TABLE public.owner_properties (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID NOT NULL REFERENCES public.property_owners(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(owner_id, property_id)
);

-- Enable RLS
ALTER TABLE public.owner_properties ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Managers can view owner properties" 
ON public.owner_properties 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM properties 
  WHERE properties.id = owner_properties.property_id 
  AND properties.user_id = auth.uid()
));

CREATE POLICY "Managers can insert owner properties" 
ON public.owner_properties 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM properties 
  WHERE properties.id = owner_properties.property_id 
  AND properties.user_id = auth.uid()
));

CREATE POLICY "Managers can delete owner properties" 
ON public.owner_properties 
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM properties 
  WHERE properties.id = owner_properties.property_id 
  AND properties.user_id = auth.uid()
));