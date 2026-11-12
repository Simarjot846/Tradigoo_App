-- Run this SQL in your Supabase SQL Editor to apply the changes for the Delivery Verification project

-- 1. Add new columns to orders table for Delivery Verification
ALTER TABLE orders ADD COLUMN IF NOT EXISTS qr_code_data TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS pickup_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS courier_proof JSONB;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_proof JSONB;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS resolution_status TEXT CHECK (resolution_status IN ('logistics_fault', 'wholesaler_fault', 'resolved', 'pending'));
ALTER TABLE orders ADD COLUMN IF NOT EXISTS trust_penalty_active BOOLEAN DEFAULT FALSE;

-- 2. Add is_low_trust column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_low_trust BOOLEAN DEFAULT FALSE;

-- 3. Update the trust score calculation function to include Low Trust Badge logic
CREATE OR REPLACE FUNCTION calculate_trust_score(user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  base_score INTEGER := 500;
  successful INTEGER;
  disputed INTEGER;
  total_value DECIMAL;
  final_score INTEGER;
BEGIN
  SELECT 
    successful_orders,
    disputed_orders
  INTO successful, disputed
  FROM profiles
  WHERE id = user_id;

  SELECT COALESCE(SUM(total_amount), 0)
  INTO total_value
  FROM orders
  WHERE (buyer_id = user_id OR seller_id = user_id)
  AND status = 'completed';

  final_score := base_score + (successful * 10) - (disputed * 20) + LEAST((total_value / 1000)::INTEGER, 200);
  final_score := GREATEST(0, LEAST(1000, final_score));

  -- Auto-set Low Trust Badge logic
  IF disputed > 3 THEN
    UPDATE profiles SET is_low_trust = TRUE WHERE id = user_id;
  ELSE
    UPDATE profiles SET is_low_trust = FALSE WHERE id = user_id;
  END IF;

  RETURN final_score;
END;
$$ LANGUAGE plpgsql;
