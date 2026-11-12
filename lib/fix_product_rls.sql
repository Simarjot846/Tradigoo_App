-- Fix "RLS Policy Always True" warning on products table

-- 1. Drop the insecure policies if they exist (Cleanup)
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON "public"."products";
DROP POLICY IF EXISTS "Enable update for authenticated users" ON "public"."products";

-- 2. Drop the specific policies we are about to create (Idempotency fix)
DROP POLICY IF EXISTS "Wholesalers can insert their own products" ON "public"."products";
DROP POLICY IF EXISTS "Wholesalers can update their own products" ON "public"."products";
DROP POLICY IF EXISTS "Anyone can view active products" ON "public"."products";

-- 3. Create proper secure policies
-- Only allow Wholesalers to INSERT products
CREATE POLICY "Wholesalers can insert their own products"
ON "public"."products" FOR INSERT
WITH CHECK (
    auth.uid() = seller_id AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'wholesaler')
);

-- Only allow Wholesalers to UPDATE their own products
CREATE POLICY "Wholesalers can update their own products"
ON "public"."products" FOR UPDATE
USING (
    auth.uid() = seller_id AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'wholesaler')
);

-- Ensure public READ access remains
CREATE POLICY "Anyone can view active products"
ON "public"."products" FOR SELECT
USING (is_active = TRUE);
