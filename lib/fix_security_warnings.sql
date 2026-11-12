-- Fix "Function Search Path Mutable" warnings
-- Security Best Practice: Set a fixed search_path for SECURITY DEFINER functions or functions called in triggers

-- 1. Fix update_updated_at_column
ALTER FUNCTION update_updated_at_column() SET search_path = public;

-- 2. Fix calculate_trust_score
ALTER FUNCTION calculate_trust_score(UUID) SET search_path = public;

-- Note: The "RLS Policy Always True" warning on 'products' might refer to a policy using 'USING (true)'. 
-- If your products are meant to be strictly public, this is generally acceptable, 
-- but ensuring you have specific logic (like 'is_active = true') is better.
