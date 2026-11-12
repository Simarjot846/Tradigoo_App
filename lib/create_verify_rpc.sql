-- Secure function to verify order details by ID
-- usage: SELECT * FROM verify_order('UUID');

CREATE OR REPLACE FUNCTION verify_order(input_order_id UUID)
RETURNS TABLE (
  order_id UUID,
  quantity INTEGER,
  product_name TEXT,
  status TEXT
) 
SECURITY DEFINER -- Runs with privileges of creator (postgres), bypassing RLS
SET search_path = public -- Secure search path
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    o.id as order_id,
    o.quantity,
    p.name as product_name,
    o.status
  FROM orders o
  JOIN products p ON o.product_id = p.id
  WHERE o.id = input_order_id;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission to anon and authenticated users
GRANT EXECUTE ON FUNCTION verify_order(UUID) TO anon, authenticated, service_role;
