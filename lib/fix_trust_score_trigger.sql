-- The issue is that there is an automatic trigger 'update_trust_scores_trigger'
-- that recalculates the trust score every time an order is completed, overwriting your manual penalty.

-- Run this to DISABLE that automatic calculation so you can set it manually to 50.
DROP TRIGGER IF EXISTS update_trust_scores_trigger ON orders;
DROP FUNCTION IF EXISTS update_trust_scores_on_order_complete;

-- Optionally, verify it's gone
-- SELECT trigger_name FROM information_schema.triggers WHERE event_object_table = 'orders';
