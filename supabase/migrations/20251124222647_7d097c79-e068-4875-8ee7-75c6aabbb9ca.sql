-- Criar tabela para dados dos hóspedes
CREATE TABLE IF NOT EXISTS public.reservation_guests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reservation_id UUID NOT NULL REFERENCES public.reservations(id) ON DELETE CASCADE,
  nome_completo TEXT NOT NULL,
  data_nascimento DATE,
  local_nascimento TEXT,
  nacionalidade TEXT,
  local_residencia TEXT,
  pais_residencia TEXT NOT NULL,
  tipo_documento TEXT,
  numero_documento TEXT,
  pais_emissor TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.reservation_guests ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS
CREATE POLICY "Users can view guests for their reservation properties"
ON public.reservation_guests
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.reservations r
    JOIN public.properties p ON p.id = r.property_id
    WHERE r.id = reservation_guests.reservation_id
    AND p.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert guests for their reservation properties"
ON public.reservation_guests
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.reservations r
    JOIN public.properties p ON p.id = r.property_id
    WHERE r.id = reservation_guests.reservation_id
    AND p.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update guests for their reservation properties"
ON public.reservation_guests
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.reservations r
    JOIN public.properties p ON p.id = r.property_id
    WHERE r.id = reservation_guests.reservation_id
    AND p.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete guests for their reservation properties"
ON public.reservation_guests
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.reservations r
    JOIN public.properties p ON p.id = r.property_id
    WHERE r.id = reservation_guests.reservation_id
    AND p.user_id = auth.uid()
  )
);

-- Criar trigger para atualizar updated_at
CREATE TRIGGER update_reservation_guests_updated_at
BEFORE UPDATE ON public.reservation_guests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();