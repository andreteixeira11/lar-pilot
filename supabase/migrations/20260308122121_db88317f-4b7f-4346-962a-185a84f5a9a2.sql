
CREATE TABLE public.guest_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_id uuid NOT NULL REFERENCES public.reservations(id) ON DELETE CASCADE,
  request_type text NOT NULL DEFAULT 'other',
  message text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  manager_response text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.guest_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Managers can view guest requests"
  ON public.guest_requests FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM reservations r
    JOIN properties p ON p.id = r.property_id
    WHERE r.id = guest_requests.reservation_id
    AND p.user_id = auth.uid()
  ));

CREATE POLICY "Managers can update guest requests"
  ON public.guest_requests FOR UPDATE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM reservations r
    JOIN properties p ON p.id = r.property_id
    WHERE r.id = guest_requests.reservation_id
    AND p.user_id = auth.uid()
  ));
