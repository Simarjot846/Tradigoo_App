-- Enable RLS on cart_items table
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

-- 1. Policy for SELECT (Users can see their own cart items)
CREATE POLICY "Users can view their own cart items"
ON cart_items FOR SELECT
USING (auth.uid() = user_id);

-- 2. Policy for INSERT (Users can add items to their own cart)
CREATE POLICY "Users can add items to their own cart"
ON cart_items FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 3. Policy for UPDATE (Users can update their own cart items, e.g., quantity)
CREATE POLICY "Users can update their own cart items"
ON cart_items FOR UPDATE
USING (auth.uid() = user_id);

-- 4. Policy for DELETE (Users can remove items from their own cart)
CREATE POLICY "Users can delete their own cart items"
ON cart_items FOR DELETE
USING (auth.uid() = user_id);
