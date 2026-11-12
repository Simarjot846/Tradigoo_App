-- ==============================================================================
-- Tradigoo: Enforce Strict Email Uniqueness in Database
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)
-- ==============================================================================

-- 1. Ensure email column in profiles is unique case-insensitively
CREATE UNIQUE INDEX IF NOT EXISTS profiles_email_lower_unique_idx
  ON public.profiles (LOWER(TRIM(email)));

-- 2. Function to prevent duplicate emails across profiles
CREATE OR REPLACE FUNCTION check_profile_email_unique()
RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.profiles
    WHERE LOWER(TRIM(email)) = LOWER(TRIM(NEW.email))
      AND id <> NEW.id
  ) THEN
    RAISE EXCEPTION 'An account with this email (%) already exists.', NEW.email;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Trigger before insert or update on profiles
DROP TRIGGER IF EXISTS trg_check_profile_email_unique ON public.profiles;
CREATE TRIGGER trg_check_profile_email_unique
  BEFORE INSERT OR UPDATE OF email ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION check_profile_email_unique();

-- 4. Enable public read for email checking (or rely on service role)
-- Service role key bypasses RLS, so /api/auth/check-email functions securely.
