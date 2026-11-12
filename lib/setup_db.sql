-- Run this in your Supabase SQL Editor to fix the Cart System

-- Create Cart Items Table
CREATE TABLE IF NOT EXISTS cart_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  product_id UUID REFERENCES products(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- Policies (Optional but good for security, enable if you have RLS on)
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own cart" 
ON cart_items FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert into their own cart" 
ON cart_items FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cart" 
ON cart_items FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own cart" 
ON cart_items FOR DELETE 
USING (auth.uid() = user_id);
