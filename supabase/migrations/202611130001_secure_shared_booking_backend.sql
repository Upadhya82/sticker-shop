-- Shared backend foundation for the customer website and the future admin app.
-- Run once in the Supabase SQL Editor after reviewing the preflight query below.

CREATE TABLE IF NOT EXISTS public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text,
  rating integer NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text NOT NULL,
  phone text NOT NULL,
  service_type text NOT NULL,
  appointment_date date NOT NULL,
  time_slot text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.blocked_dates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL UNIQUE,
  reason text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.blocked_time_slots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL,
  time_slot text NOT NULL,
  reason text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (date, time_slot)
);

-- PRE-FLIGHT: this must return no rows before the unique index can be created.
-- SELECT appointment_date, time_slot, count(*)
-- FROM public.appointments
-- GROUP BY appointment_date, time_slot
-- HAVING count(*) > 1;

ALTER TABLE public.appointments
  ADD COLUMN IF NOT EXISTS customer_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_appointments_unique_slot
  ON public.appointments (appointment_date, time_slot);

CREATE INDEX IF NOT EXISTS idx_appointments_customer_user_id
  ON public.appointments (customer_user_id)
  WHERE customer_user_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS public.portfolio_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL CHECK (length(trim(title)) BETWEEN 1 AND 120),
  description text CHECK (description IS NULL OR length(description) <= 500),
  image_path text NOT NULL,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_portfolio_items_created_at
  ON public.portfolio_items (created_at DESC);

CREATE TABLE IF NOT EXISTS public.admin_devices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  expo_push_token text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  last_seen_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.admin_devices ENABLE ROW LEVEL SECURITY;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'shop-portfolio', 'shop-portfolio', true, 8388608,
  ARRAY['image/jpeg', 'image/png', 'image/webp']::text[]
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocked_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocked_time_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_items ENABLE ROW LEVEL SECURITY;

-- Remove the earlier demo policies that granted destructive operations to everyone.
DO $$
DECLARE
  policy_row record;
BEGIN
  FOR policy_row IN
    SELECT schemaname, tablename, policyname
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename IN ('appointments', 'blocked_dates', 'blocked_time_slots', 'reviews', 'portfolio_items', 'admin_devices')
  LOOP
    EXECUTE format('DROP POLICY %I ON %I.%I', policy_row.policyname, policy_row.schemaname, policy_row.tablename);
  END LOOP;
END;
$$;

-- `app_metadata.role` is controlled by trusted Supabase admin tooling and cannot
-- be changed by an end user editing their own user metadata.
CREATE OR REPLACE FUNCTION public.is_shop_admin()
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'admin';
$$;

-- Customers can create guest bookings. A signed-in customer's own user ID is
-- attached when present. Only admins can read full appointment/customer records.
CREATE POLICY "Public can create valid appointments"
  ON public.appointments FOR INSERT TO anon, authenticated
  WITH CHECK (
    customer_name IS NOT NULL AND length(trim(customer_name)) BETWEEN 1 AND 120
    AND phone IS NOT NULL AND length(regexp_replace(phone, '[^0-9]', '', 'g')) >= 10
    AND service_type IN ('Sticker Apply', 'Sticker Remove', 'Custom Design')
    AND appointment_date >= current_date
    AND time_slot IN ('09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00')
    AND (customer_user_id IS NULL OR customer_user_id = auth.uid())
    AND NOT EXISTS (
      SELECT 1 FROM public.blocked_dates AS blocked
      WHERE blocked.date = appointments.appointment_date
    )
    AND NOT EXISTS (
      SELECT 1 FROM public.blocked_time_slots AS blocked
      WHERE blocked.date = appointments.appointment_date
        AND blocked.time_slot = appointments.time_slot
    )
  );

CREATE POLICY "Admins can read appointments"
  ON public.appointments FOR SELECT TO authenticated
  USING (public.is_shop_admin());
CREATE POLICY "Admins can update appointments"
  ON public.appointments FOR UPDATE TO authenticated
  USING (public.is_shop_admin()) WITH CHECK (public.is_shop_admin());
CREATE POLICY "Admins can delete appointments"
  ON public.appointments FOR DELETE TO authenticated
  USING (public.is_shop_admin());

-- Customers only need availability fields. They cannot see names or phone numbers.
REVOKE ALL PRIVILEGES ON public.appointments FROM PUBLIC, anon, authenticated;
GRANT SELECT (appointment_date, time_slot) ON public.appointments TO anon;
GRANT SELECT, UPDATE, DELETE ON public.appointments TO authenticated;
GRANT INSERT (customer_name, phone, service_type, appointment_date, time_slot, customer_user_id)
  ON public.appointments TO anon, authenticated;

CREATE POLICY "Anyone can read blocked dates"
  ON public.blocked_dates FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins can manage blocked dates"
  ON public.blocked_dates FOR ALL TO authenticated
  USING (public.is_shop_admin()) WITH CHECK (public.is_shop_admin());
CREATE POLICY "Anyone can read blocked time slots"
  ON public.blocked_time_slots FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins can manage blocked time slots"
  ON public.blocked_time_slots FOR ALL TO authenticated
  USING (public.is_shop_admin()) WITH CHECK (public.is_shop_admin());

CREATE POLICY "Anyone can read reviews"
  ON public.reviews FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Anyone can submit valid reviews"
  ON public.reviews FOR INSERT TO anon, authenticated
  WITH CHECK (rating BETWEEN 1 AND 5 AND length(trim(comment)) >= 2);
CREATE POLICY "Admins can manage reviews"
  ON public.reviews FOR ALL TO authenticated
  USING (public.is_shop_admin()) WITH CHECK (public.is_shop_admin());

CREATE POLICY "Anyone can read portfolio items"
  ON public.portfolio_items FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins can manage portfolio items"
  ON public.portfolio_items FOR ALL TO authenticated
  USING (public.is_shop_admin()) WITH CHECK (public.is_shop_admin());
CREATE POLICY "Admins can manage their own push devices"
  ON public.admin_devices FOR ALL TO authenticated
  USING (public.is_shop_admin() AND admin_user_id = auth.uid())
  WITH CHECK (public.is_shop_admin() AND admin_user_id = auth.uid());

-- Portfolio pictures are public to view, but only authenticated admins may
-- upload, replace, or remove objects in the portfolio bucket.
DROP POLICY IF EXISTS "Anyone can view shop portfolio pictures" ON storage.objects;
DROP POLICY IF EXISTS "Admins can add shop portfolio pictures" ON storage.objects;
DROP POLICY IF EXISTS "Admins can manage shop portfolio pictures" ON storage.objects;
CREATE POLICY "Anyone can view shop portfolio pictures"
  ON storage.objects FOR SELECT TO anon, authenticated
  USING (bucket_id = 'shop-portfolio');
CREATE POLICY "Admins can add shop portfolio pictures"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'shop-portfolio' AND public.is_shop_admin());
CREATE POLICY "Admins can manage shop portfolio pictures"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'shop-portfolio' AND public.is_shop_admin())
  WITH CHECK (bucket_id = 'shop-portfolio' AND public.is_shop_admin());
CREATE POLICY "Admins can delete shop portfolio pictures"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'shop-portfolio' AND public.is_shop_admin());

REVOKE ALL PRIVILEGES ON public.blocked_dates, public.blocked_time_slots, public.reviews, public.portfolio_items, public.admin_devices FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.blocked_dates, public.blocked_time_slots, public.reviews, public.portfolio_items TO anon, authenticated;
GRANT INSERT ON public.reviews TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.blocked_dates, public.blocked_time_slots, public.reviews, public.portfolio_items, public.admin_devices TO authenticated;
GRANT SELECT ON public.admin_devices TO authenticated;

