-- The error "violates check constraint 'orders_status_check'" means the database
-- is restricting what values can be put into the 'status' column.

-- Option 1: Drop the check constraint completely (easiest for development)
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;

-- Option 2: Update the constraint to include 'courier_verified' if it was missing
-- (Only run this if you want to keep the check but fix the missing value)
-- ALTER TABLE orders DROP CONSTRAINT orders_status_check;
-- ALTER TABLE orders ADD CONSTRAINT orders_status_check 
-- CHECK (status IN ('pending', 'payment_pending', 'payment_in_escrow', 'shipped', 'courier_verified', 'delivered', 'inspection', 'completed', 'disputed', 'cancelled'));
