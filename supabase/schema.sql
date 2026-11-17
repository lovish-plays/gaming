-- ============================================================
-- Underground A Gaming Playstation – Supabase Schema
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. PROFILES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT,
  full_name   TEXT NOT NULL,
  phone       TEXT,
  role        TEXT NOT NULL DEFAULT 'CUSTOMER' CHECK (role IN ('CUSTOMER', 'ADMIN')),
  avatar_id   TEXT NOT NULL DEFAULT 'ps_controller',
  spend_progress  INT NOT NULL DEFAULT 0,   -- INR progress toward next 1000
  total_spent     INT NOT NULL DEFAULT 0,   -- lifetime INR spent
  free_hours      INT NOT NULL DEFAULT 0,   -- redeemable free hours
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Ensure email & avatar_id columns exist on existing databases
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_id TEXT DEFAULT 'ps_controller';
ALTER TABLE public.profiles ALTER COLUMN phone DROP NOT NULL;

-- Permanent 1-to-1 Email & Phone partial unique constraints
CREATE UNIQUE INDEX IF NOT EXISTS profiles_email_unique_idx 
  ON public.profiles (email) 
  WHERE email IS NOT NULL AND email <> '';

CREATE UNIQUE INDEX IF NOT EXISTS profiles_phone_unique_idx 
  ON public.profiles (phone) 
  WHERE phone IS NOT NULL AND phone <> '';

-- Ensure valid 10-digit format for phone numbers when set
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_phone_format_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_phone_format_check 
  CHECK (phone IS NULL OR phone = '' OR phone ~ '^[0-9]{10}$');

-- ============================================================
-- 2. STATIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.stations (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT UNIQUE NOT NULL,
  type        TEXT NOT NULL CHECK (type IN ('TABLE', 'CONSOLE')),
  status      TEXT NOT NULL DEFAULT 'FREE' CHECK (status IN ('FREE', 'BOOKED')),
  booked_until TIMESTAMPTZ,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Ensure nullable booked_until column exists on existing installations
ALTER TABLE public.stations ADD COLUMN IF NOT EXISTS booked_until TIMESTAMPTZ;

-- Clean up any duplicate stations if script was run multiple times
DELETE FROM public.stations a
USING public.stations b
WHERE a.name = b.name AND a.id > b.id;

-- Ensure UNIQUE constraint on name so duplicates can NEVER be inserted
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'stations_name_unique'
  ) THEN
    BEGIN
      ALTER TABLE public.stations ADD CONSTRAINT stations_name_unique UNIQUE (name);
    EXCEPTION WHEN duplicate_table OR duplicate_object THEN NULL;
    END;
  END IF;
END;
$$;

-- Pre-seed exactly the 4 stations
INSERT INTO public.stations (name, type, status) VALUES
  ('Table 1',                 'TABLE',   'FREE'),
  ('Table 2',                 'TABLE',   'FREE'),
  ('Console 1 (PlayStation)', 'CONSOLE', 'FREE'),
  ('Console 2 (PlayStation)', 'CONSOLE', 'FREE')
ON CONFLICT (name) DO NOTHING;

-- ============================================================
-- 3. LOYALTY LOGS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.loyalty_logs (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  admin_id     UUID NOT NULL REFERENCES public.profiles(id),
  action_type  TEXT NOT NULL CHECK (action_type IN ('ADD_SPEND', 'REDEEM_HOUR')),
  amount_inr   INT NOT NULL DEFAULT 0,
  hours_changed INT NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 4. NON-RECURSIVE SECURITY DEFINER ADMIN HELPER & RLS
-- ============================================================

-- Helper: is_admin
-- Evaluates admin status without recursive policy loops
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'ADMIN'
  );
$$;

ALTER TABLE public.profiles     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stations     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loyalty_logs ENABLE ROW LEVEL SECURITY;

-- ---- PROFILES policies ----

DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
CREATE POLICY "profiles_select_own"
  ON public.profiles FOR SELECT
  USING (
    auth.uid() = id
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "profiles_update_admin_only" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own_or_admin" ON public.profiles;

-- Admins can update any profile; users can update their own profile (avatar_id, full_name)
CREATE POLICY "profiles_update_own_or_admin"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id OR public.is_admin())
  WITH CHECK (
    public.is_admin()
    OR (
      auth.uid() = id
      AND role = 'CUSTOMER'
    )
  );

-- ---- STATIONS policies ----

DROP POLICY IF EXISTS "stations_select_all" ON public.stations;
CREATE POLICY "stations_select_all"
  ON public.stations FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "stations_update_admin_only" ON public.stations;
CREATE POLICY "stations_update_admin_only"
  ON public.stations FOR UPDATE
  USING (public.is_admin());

-- ---- LOYALTY LOGS policies ----

DROP POLICY IF EXISTS "loyalty_logs_select" ON public.loyalty_logs;
CREATE POLICY "loyalty_logs_select"
  ON public.loyalty_logs FOR SELECT
  USING (
    auth.uid() = user_id
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "loyalty_logs_insert_admin_only" ON public.loyalty_logs;
CREATE POLICY "loyalty_logs_insert_admin_only"
  ON public.loyalty_logs FOR INSERT
  WITH CHECK (public.is_admin());

-- ============================================================
-- 5. ATOMIC RPC FUNCTIONS (SECURITY DEFINER)
-- ============================================================

-- Function: add_customer_spend
-- Called by admin to add a bill amount for a customer
CREATE OR REPLACE FUNCTION public.add_customer_spend(
  p_customer_id UUID,
  p_amount_inr  INT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_admin_id       UUID;
  v_admin_role     TEXT;
  v_customer       public.profiles%ROWTYPE;
  v_new_progress   INT;
  v_new_total      INT;
  v_earned_hours   INT;
  v_new_free_hours INT;
BEGIN
  -- Verify caller is an admin
  v_admin_id := auth.uid();
  SELECT role INTO v_admin_role
    FROM public.profiles WHERE id = v_admin_id;

  IF v_admin_role IS DISTINCT FROM 'ADMIN' THEN
    RAISE EXCEPTION 'Access denied: caller is not ADMIN';
  END IF;

  IF p_amount_inr <= 0 THEN
    RAISE EXCEPTION 'Amount must be positive';
  END IF;

  -- Lock and read customer row
  SELECT * INTO v_customer
    FROM public.profiles WHERE id = p_customer_id FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Customer not found';
  END IF;

  -- Calculate new progress and earned hours
  v_new_progress   := (v_customer.spend_progress + p_amount_inr) % 1000;
  v_earned_hours   := FLOOR((v_customer.spend_progress + p_amount_inr) / 1000);
  v_new_total      := v_customer.total_spent + p_amount_inr;
  v_new_free_hours := v_customer.free_hours + v_earned_hours;

  -- Update customer profile
  UPDATE public.profiles SET
    spend_progress = v_new_progress,
    total_spent    = v_new_total,
    free_hours     = v_new_free_hours,
    updated_at     = NOW()
  WHERE id = p_customer_id;

  -- Audit log
  INSERT INTO public.loyalty_logs
    (user_id, admin_id, action_type, amount_inr, hours_changed)
  VALUES
    (p_customer_id, v_admin_id, 'ADD_SPEND', p_amount_inr, v_earned_hours);

  RETURN json_build_object(
    'success',       true,
    'earned_hours',  v_earned_hours,
    'new_progress',  v_new_progress,
    'new_total',     v_new_total,
    'free_hours',    v_new_free_hours
  );
END;
$$;

-- Function: redeem_free_hour
-- Called by admin to deduct 1 free hour from a customer
CREATE OR REPLACE FUNCTION public.redeem_free_hour(
  p_customer_id UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_admin_id   UUID;
  v_admin_role TEXT;
  v_customer   public.profiles%ROWTYPE;
BEGIN
  -- Verify caller is an admin
  v_admin_id := auth.uid();
  SELECT role INTO v_admin_role
    FROM public.profiles WHERE id = v_admin_id;

  IF v_admin_role IS DISTINCT FROM 'ADMIN' THEN
    RAISE EXCEPTION 'Access denied: caller is not ADMIN';
  END IF;

  -- Lock and read customer row
  SELECT * INTO v_customer
    FROM public.profiles WHERE id = p_customer_id FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Customer not found';
  END IF;

  IF v_customer.free_hours < 1 THEN
    RAISE EXCEPTION 'Customer has no free hours to redeem';
  END IF;

  -- Deduct one hour
  UPDATE public.profiles SET
    free_hours = free_hours - 1,
    updated_at = NOW()
  WHERE id = p_customer_id;

  -- Audit log
  INSERT INTO public.loyalty_logs
    (user_id, admin_id, action_type, amount_inr, hours_changed)
  VALUES
    (p_customer_id, v_admin_id, 'REDEEM_HOUR', 0, -1);

  RETURN json_build_object(
    'success',    true,
    'free_hours', v_customer.free_hours - 1
  );
END;
$$;

-- Function: toggle_station_status
-- Called by admin to flip a station's status
CREATE OR REPLACE FUNCTION public.toggle_station_status(
  p_station_id UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_admin_role TEXT;
  v_new_status TEXT;
BEGIN
  SELECT role INTO v_admin_role
    FROM public.profiles WHERE id = auth.uid();

  IF v_admin_role IS DISTINCT FROM 'ADMIN' THEN
    RAISE EXCEPTION 'Access denied: caller is not ADMIN';
  END IF;

  UPDATE public.stations
    SET status     = CASE WHEN status = 'FREE' THEN 'BOOKED' ELSE 'FREE' END,
        updated_at = NOW()
  WHERE id = p_station_id
  RETURNING status INTO v_new_status;

  RETURN json_build_object('success', true, 'new_status', v_new_status);
END;
$$;

-- Function: set_station_booking
-- Called by admin to set timed sessions or mark a station as free
CREATE OR REPLACE FUNCTION public.set_station_booking(
  p_station_id        UUID,
  p_duration_minutes  INTEGER,
  p_extend            BOOLEAN DEFAULT FALSE
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_new_status       TEXT;
  v_new_booked_until TIMESTAMPTZ;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied: caller is not ADMIN';
  END IF;

  IF p_duration_minutes IS NULL OR p_duration_minutes <= 0 THEN
    -- Free up station immediately
    UPDATE public.stations
    SET status       = 'FREE',
        booked_until = NULL,
        updated_at   = NOW()
    WHERE id = p_station_id
    RETURNING status, booked_until INTO v_new_status, v_new_booked_until;
  ELSE
    -- Book or extend station
    UPDATE public.stations
    SET status       = 'BOOKED',
        booked_until = CASE
          WHEN p_extend AND booked_until IS NOT NULL AND booked_until > NOW()
            THEN booked_until + (p_duration_minutes || ' minutes')::INTERVAL
          ELSE
            NOW() + (p_duration_minutes || ' minutes')::INTERVAL
        END,
        updated_at   = NOW()
    WHERE id = p_station_id
    RETURNING status, booked_until INTO v_new_status, v_new_booked_until;
  END IF;

  RETURN json_build_object(
    'success',      true,
    'status',       v_new_status,
    'booked_until', v_new_booked_until
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.set_station_booking(UUID, INTEGER, BOOLEAN) TO authenticated;

-- Function: get_top_gamers
-- Fetches top 5 non-admin players for the Hall of Fame Leaderboard
-- Safe to query by anon or authenticated users
DROP FUNCTION IF EXISTS public.get_top_gamers();
CREATE OR REPLACE FUNCTION public.get_top_gamers()
RETURNS TABLE (
  rank                INT,
  id                  UUID,
  full_name           TEXT,
  masked_phone        TEXT,
  total_spent         INT,
  free_hours_unlocked INT,
  avatar_id           TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    ROW_NUMBER() OVER (ORDER BY p.total_spent DESC, p.created_at ASC)::INT AS rank,
    p.id,
    p.full_name,
    CASE
      WHEN length(p.phone) >= 4 THEN '••••' || right(p.phone, 4)
      ELSE '••••'
    END AS masked_phone,
    p.total_spent,
    FLOOR(p.total_spent / 1000)::INT AS free_hours_unlocked,
    COALESCE(p.avatar_id, 'ps_controller') AS avatar_id
  FROM public.profiles p
  WHERE p.role = 'CUSTOMER'
  ORDER BY p.total_spent DESC, p.created_at ASC
  LIMIT 5;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_top_gamers() TO anon, authenticated;

-- ============================================================
-- 6. STRICT DEFAULT USER ROLE & AUTO-PROFILE TRIGGERS
-- ============================================================

-- Function: enforce_default_customer_role
-- Runs BEFORE INSERT on public.profiles to guarantee that new
-- accounts are strictly given 'CUSTOMER' role, preventing any
-- tampering or exploitation via metadata or frontend requests.
CREATE OR REPLACE FUNCTION public.enforce_default_customer_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Strict security: Force every new profile row to 'CUSTOMER'
  -- Promotion to 'ADMIN' can only occur via explicit SQL UPDATE by an existing Admin
  NEW.role := 'CUSTOMER';
  NEW.spend_progress := COALESCE(NEW.spend_progress, 0);
  NEW.total_spent := COALESCE(NEW.total_spent, 0);
  NEW.free_hours := COALESCE(NEW.free_hours, 0);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_default_customer_role ON public.profiles;
CREATE TRIGGER trg_enforce_default_customer_role
  BEFORE INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.enforce_default_customer_role();

-- Function: handle_new_email_user (Auth Hook)
-- Automatically creates a public.profiles row upon auth.users signup via Email OTP
CREATE OR REPLACE FUNCTION public.handle_new_email_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_name TEXT;
BEGIN
  v_name := COALESCE(
    NULLIF(TRIM(NEW.raw_user_meta_data->>'full_name'), ''),
    split_part(NEW.email, '@', 1),
    'Gamer'
  );

  INSERT INTO public.profiles (id, email, full_name, role, avatar_id)
  VALUES (
    NEW.id,
    LOWER(TRIM(NEW.email)),
    v_name,
    'CUSTOMER',
    'ps_controller'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_email_user();

-- ============================================================
-- 6B. IMMUTABLE EMAIL ↔ PHONE LOCK TRIGGER
-- ============================================================

-- Function: enforce_permanent_email_phone_lock
-- Strictly prevents changing or swapping email or phone once set
CREATE OR REPLACE FUNCTION public.enforce_permanent_email_phone_lock()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- 1. Enforce permanent email lock once set
  IF OLD.email IS NOT NULL AND OLD.email <> '' AND NEW.email IS DISTINCT FROM OLD.email THEN
    RAISE EXCEPTION 'Email address is permanently locked to this account.';
  END IF;

  -- 2. Enforce permanent phone lock once set
  IF OLD.phone IS NOT NULL AND OLD.phone <> '' AND NEW.phone IS DISTINCT FROM OLD.phone THEN
    RAISE EXCEPTION 'Phone number is permanently locked to this email and cannot be changed or replaced.';
  END IF;

  -- 3. Security: Non-admins cannot alter their own role, spend progress, or hours directly
  IF NOT public.is_admin() THEN
    NEW.role := OLD.role;
    NEW.spend_progress := OLD.spend_progress;
    NEW.total_spent := OLD.total_spent;
    NEW.free_hours := OLD.free_hours;
  END IF;

  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_permanent_email_phone_lock ON public.profiles;
CREATE TRIGGER trg_enforce_permanent_email_phone_lock
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.enforce_permanent_email_phone_lock();

-- ============================================================
-- 6C. ATOMIC 1-TO-1 PHONE NUMBER LINKING RPC
-- ============================================================

-- Function: link_phone_to_profile
-- Verifies and permanently binds a 10-digit mobile number to the authenticated user's email
CREATE OR REPLACE FUNCTION public.link_phone_to_profile(
  p_phone     TEXT,
  p_full_name TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid         UUID;
  v_clean_phone TEXT;
  v_profile     public.profiles%ROWTYPE;
BEGIN
  v_uid := auth.uid();
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated. Please sign in to link your phone number.';
  END IF;

  -- Strip all non-digit characters and handle optional +91 prefix
  v_clean_phone := REGEXP_REPLACE(COALESCE(p_phone, ''), '[^0-9]', '', 'g');
  IF LENGTH(v_clean_phone) > 10 AND LEFT(v_clean_phone, 2) = '91' THEN
    v_clean_phone := RIGHT(v_clean_phone, 10);
  END IF;

  IF v_clean_phone !~ '^[0-9]{10}$' THEN
    RAISE EXCEPTION 'Please enter a valid 10-digit Indian mobile number.';
  END IF;

  -- Lock caller's profile row
  SELECT * INTO v_profile FROM public.profiles WHERE id = v_uid FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Profile not found. Please log in again.';
  END IF;

  -- Check if caller already has a phone permanently linked
  IF v_profile.phone IS NOT NULL AND v_profile.phone <> '' THEN
    RAISE EXCEPTION 'This email already has a phone number permanently linked (%).', v_profile.phone;
  END IF;

  -- Check if this phone number is already permanently linked to ANY other email
  IF EXISTS (
    SELECT 1 FROM public.profiles
    WHERE phone = v_clean_phone AND id <> v_uid
  ) THEN
    RAISE EXCEPTION 'This mobile number (%s) is already permanently linked to another email account. Each phone number can only be linked to one email permanently.', v_clean_phone;
  END IF;

  -- Update profile with permanent phone link
  UPDATE public.profiles
  SET
    phone = v_clean_phone,
    full_name = COALESCE(NULLIF(TRIM(p_full_name), ''), full_name),
    updated_at = NOW()
  WHERE id = v_uid
  RETURNING * INTO v_profile;

  RETURN to_jsonb(v_profile);
END;
$$;

GRANT EXECUTE ON FUNCTION public.link_phone_to_profile(TEXT, TEXT) TO authenticated;

-- ============================================================
-- 7. COMMUNITY CHAT & LIVE COMMUNITY POLLS
-- ============================================================

-- 1. CHAT MESSAGES TABLE
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id      UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  sender_name  TEXT NOT NULL,
  sender_role    TEXT NOT NULL DEFAULT 'CUSTOMER',
  sender_tier    TEXT NOT NULL DEFAULT 'Rookie',
  sender_avatar  TEXT NOT NULL DEFAULT 'ps_controller',
  content        TEXT NOT NULL CHECK (char_length(content) > 0 AND char_length(content) <= 300),
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.chat_messages ADD COLUMN IF NOT EXISTS sender_tier TEXT DEFAULT 'Rookie';
ALTER TABLE public.chat_messages ADD COLUMN IF NOT EXISTS sender_avatar TEXT DEFAULT 'ps_controller';

-- Stamp sender_tier, sender_avatar & verify sender_role before message insert
CREATE OR REPLACE FUNCTION public.set_chat_sender_tier()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role   TEXT;
  v_spent  INT;
  v_avatar TEXT;
BEGIN
  SELECT role, total_spent, avatar_id INTO v_role, v_spent, v_avatar
    FROM public.profiles WHERE id = NEW.user_id;

  NEW.sender_avatar := COALESCE(v_avatar, NEW.sender_avatar, 'ps_controller');

  IF v_role = 'ADMIN' THEN
    NEW.sender_role := 'ADMIN';
    NEW.sender_tier := 'Lounge Boss';
  ELSIF v_spent >= 5000 THEN
    NEW.sender_tier := 'Underground Legend';
  ELSIF v_spent >= 3000 THEN
    NEW.sender_tier := 'Elite';
  ELSIF v_spent >= 1000 THEN
    NEW.sender_tier := 'Pro';
  ELSE
    NEW.sender_tier := 'Rookie';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_set_chat_sender_tier ON public.chat_messages;
CREATE TRIGGER trg_set_chat_sender_tier
  BEFORE INSERT ON public.chat_messages
  FOR EACH ROW EXECUTE FUNCTION public.set_chat_sender_tier();

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "chat_messages_select_all" ON public.chat_messages;
CREATE POLICY "chat_messages_select_all"
  ON public.chat_messages FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "chat_messages_insert_auth" ON public.chat_messages;
CREATE POLICY "chat_messages_insert_auth"
  ON public.chat_messages FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "chat_messages_delete_admin" ON public.chat_messages;
CREATE POLICY "chat_messages_delete_admin"
  ON public.chat_messages FOR DELETE
  USING (public.is_admin());

-- 2. POLLS TABLE
CREATE TABLE IF NOT EXISTS public.polls (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  question    TEXT NOT NULL,
  options     JSONB NOT NULL,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_by  UUID REFERENCES public.profiles(id),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.polls ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "polls_select_all" ON public.polls;
CREATE POLICY "polls_select_all"
  ON public.polls FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "polls_insert_admin" ON public.polls;
CREATE POLICY "polls_insert_admin"
  ON public.polls FOR INSERT
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "polls_update_admin" ON public.polls;
CREATE POLICY "polls_update_admin"
  ON public.polls FOR UPDATE
  USING (public.is_admin());

-- 3. POLL VOTES TABLE
CREATE TABLE IF NOT EXISTS public.poll_votes (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  poll_id       UUID REFERENCES public.polls(id) ON DELETE CASCADE NOT NULL,
  user_id       UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  option_index  INTEGER NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT poll_votes_unique_user_poll UNIQUE (poll_id, user_id)
);

ALTER TABLE public.poll_votes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "poll_votes_select_all" ON public.poll_votes;
CREATE POLICY "poll_votes_select_all"
  ON public.poll_votes FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "poll_votes_insert_own" ON public.poll_votes;
CREATE POLICY "poll_votes_insert_own"
  ON public.poll_votes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "poll_votes_update_own" ON public.poll_votes;
CREATE POLICY "poll_votes_update_own"
  ON public.poll_votes FOR UPDATE
  USING (auth.uid() = user_id);

-- 4. FUNCTION: get_mentionable_users
-- Returns sanitized list of member names and avatars for autocomplete (no phone or email)
DROP FUNCTION IF EXISTS public.get_mentionable_users();
CREATE OR REPLACE FUNCTION public.get_mentionable_users()
RETURNS TABLE (
  id        UUID,
  full_name TEXT,
  avatar_id TEXT
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT p.id, p.full_name, COALESCE(p.avatar_id, 'ps_controller') AS avatar_id
  FROM public.profiles p
  ORDER BY p.full_name ASC
  LIMIT 50;
$$;

GRANT EXECUTE ON FUNCTION public.get_mentionable_users() TO anon, authenticated;

-- Pre-seed an initial community poll if none exists
INSERT INTO public.polls (question, options, is_active)
SELECT 
  'Which game should we install next on PS5?',
  '["EA Sports FC 26", "Tekken 8", "GTA V", "Mortal Kombat 1"]'::jsonb,
  true
WHERE NOT EXISTS (SELECT 1 FROM public.polls);

-- ============================================================
-- 8. REALTIME PUBLICATIONS (SAFE / IDEMPOTENT)
-- ============================================================
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.stations;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.polls;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.poll_votes;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
END;
$$;

-- ============================================================
-- DONE! To promote the first user to ADMIN, run:
-- UPDATE public.profiles SET role = 'ADMIN' WHERE phone = 'your-phone-number';
-- ============================================================
