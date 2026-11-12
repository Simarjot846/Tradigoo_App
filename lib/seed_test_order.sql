-- Run this SQL to create a test order in "SHIPPED" state
-- allowing you to test the QR Scanner immediately as a Retailer.

-- Replace 'YOUR_USER_ID' with your actual User ID from the 'auth.users' table
-- You can find your ID by running: SELECT id, email FROM auth.users;

DO $$
DECLARE
  my_user_id UUID := 'YOUR_USER_ID'; -- <--- PASTE YOUR USER ID HERE
  seller_id UUID;
  product_id UUID;
  order_id UUID;
BEGIN
  -- 1. Find a wholesaler (or create a dummy one if needed, but let's assume one exists)
  -- For this test, we'll try to find a different user to act as seller. 
  -- If none exists, we'll just use the same user (self-trading) for testing purposes.
  SELECT id INTO seller_id FROM profiles WHERE role = 'wholesaler' LIMIT 1;
  
  IF seller_id IS NULL THEN
     seller_id := my_user_id; -- Fallback
  END IF;

  -- 2. Find a product
  SELECT id INTO product_id FROM products LIMIT 1;

  -- 3. Create the Order directly in SHIPPED status
  INSERT INTO orders (
    buyer_id,
    seller_id,
    product_id,
    quantity,
    unit_price,
    total_amount,
    status,
    pickup_verified
  ) VALUES (
    my_user_id,
    seller_id,
    product_id,
    5,
    100.00,
    500.00,
    'shipped', -- This is the key status to see the QR Scanner
    true
  ) RETURNING id INTO order_id;

  RAISE NOTICE 'Test Order Created! ID: %', order_id;
END $$;
