-- Tradigoo Production Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- PROFILES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('retailer', 'wholesaler')),
  name TEXT NOT NULL,
  phone TEXT,
  business_name TEXT NOT NULL,
  location TEXT NOT NULL,
  trust_score INTEGER DEFAULT 500 CHECK (trust_score >= 0 AND trust_score <= 1000),
  total_orders INTEGER DEFAULT 0,
  successful_orders INTEGER DEFAULT 0,
  disputed_orders INTEGER DEFAULT 0,
  is_low_trust BOOLEAN DEFAULT FALSE,
  -- New fields for Profile Page
  profile_image_url TEXT,
  gst_number TEXT,
  gst_verified BOOLEAN DEFAULT FALSE,
  business_type TEXT,
  business_address TEXT,
  pin_code TEXT,
  business_description TEXT,
  years_in_business INTEGER,
  language_preference TEXT DEFAULT 'en',
  preferred_categories TEXT[],
  bank_details JSONB,
  min_order_quantity INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies for profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;

-- Create new policies
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- =============================================
-- PRODUCTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  base_price DECIMAL(10,2) NOT NULL CHECK (base_price > 0),
  demand_score INTEGER DEFAULT 50 CHECK (demand_score >= 0 AND demand_score <= 100),
  demand_level TEXT DEFAULT 'Medium' CHECK (demand_level IN ('High', 'Medium', 'Low')),
  expected_margin DECIMAL(5,2) DEFAULT 15.0,
  supplier_count INTEGER DEFAULT 1,
  image_url TEXT,
  description TEXT NOT NULL,
  unit TEXT NOT NULL,
  min_order_quantity INTEGER DEFAULT 1 CHECK (min_order_quantity > 0),
  region_boost INTEGER DEFAULT 0,
  season_factor INTEGER DEFAULT 0,
  recommendation_reason TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies for products
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view active products" ON products;
DROP POLICY IF EXISTS "Wholesalers can insert their own products" ON products;
DROP POLICY IF EXISTS "Wholesalers can update their own products" ON products;
DROP POLICY IF EXISTS "Wholesalers can delete their own products" ON products;

-- Create new policies
CREATE POLICY "Anyone can view active products"
  ON products FOR SELECT
  USING (is_active = TRUE);

CREATE POLICY "Wholesalers can insert their own products"
  ON products FOR INSERT
  WITH CHECK (
    auth.uid() = seller_id AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'wholesaler')
  );

CREATE POLICY "Wholesalers can update their own products"
  ON products FOR UPDATE
  USING (
    auth.uid() = seller_id AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'wholesaler')
  );

CREATE POLICY "Wholesalers can delete their own products"
  ON products FOR DELETE
  USING (
    auth.uid() = seller_id AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'wholesaler')
  );

-- =============================================
-- ORDERS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  buyer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(10,2) NOT NULL CHECK (unit_price > 0),
  total_amount DECIMAL(12,2) NOT NULL CHECK (total_amount > 0),
  status TEXT DEFAULT 'payment_pending' CHECK (
    status IN (
      'payment_pending',
      'payment_in_escrow',
      'shipped',
      'delivered',
      'inspection',
      'completed',
      'disputed',
      'cancelled',
      'refunded'
    )
  ),
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  razorpay_signature TEXT,
  otp TEXT,
  otp_verified BOOLEAN DEFAULT FALSE,
  inspection_deadline TIMESTAMPTZ,
  dispute_reason TEXT,
  dispute_evidence TEXT[],
  -- Delivery Verification Fields
  qr_code_data TEXT, -- Encrypted QR string
  pickup_verified BOOLEAN DEFAULT FALSE,
  courier_proof JSONB, -- { photo, weight, seal_condition }
  delivery_proof JSONB, -- { unboxing_video, etc. }
  resolution_status TEXT CHECK (resolution_status IN ('logistics_fault', 'wholesaler_fault', 'resolved', 'pending')),
  trust_penalty_active BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies for orders
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own orders" ON orders;
DROP POLICY IF EXISTS "Buyers can create orders" ON orders;
DROP POLICY IF EXISTS "Buyers and sellers can update their orders" ON orders;

-- Create new policies
CREATE POLICY "Users can view their own orders"
  ON orders FOR SELECT
  USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

CREATE POLICY "Buyers can create orders"
  ON orders FOR INSERT
  WITH CHECK (
    auth.uid() = buyer_id AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'retailer')
  );

CREATE POLICY "Buyers and sellers can update their orders"
  ON orders FOR UPDATE
  USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- =============================================
-- DISPUTES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS disputes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  raised_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  evidence_urls TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'pending' CHECK (
    status IN ('pending', 'under_review', 'resolved', 'rejected')
  ),
  resolution_notes TEXT,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies for disputes
ALTER TABLE disputes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view disputes for their orders" ON disputes;
DROP POLICY IF EXISTS "Users can create disputes for their orders" ON disputes;

-- Create new policies
CREATE POLICY "Users can view disputes for their orders"
  ON disputes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = disputes.order_id 
      AND (orders.buyer_id = auth.uid() OR orders.seller_id = auth.uid())
    )
  );

CREATE POLICY "Users can create disputes for their orders"
  ON disputes FOR INSERT
  WITH CHECK (
    auth.uid() = raised_by AND
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_id 
      AND (orders.buyer_id = auth.uid() OR orders.seller_id = auth.uid())
    )
  );

-- =============================================
-- FUNCTIONS & TRIGGERS
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
DROP TRIGGER IF EXISTS update_products_updated_at ON products;
DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
DROP TRIGGER IF EXISTS update_disputes_updated_at ON disputes;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_disputes_updated_at
  BEFORE UPDATE ON disputes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate trust score
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

  -- Auto-set Low Trust Badge
  IF disputed > 3 THEN
    UPDATE profiles SET is_low_trust = TRUE WHERE id = user_id;
  ELSE
    UPDATE profiles SET is_low_trust = FALSE WHERE id = user_id;
  END IF;

  RETURN final_score;
END;
$$ LANGUAGE plpgsql;

-- Function to update trust score after order completion
CREATE OR REPLACE FUNCTION update_trust_scores_on_order_complete()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    -- Update buyer
    UPDATE profiles
    SET 
      successful_orders = successful_orders + 1,
      total_orders = total_orders + 1,
      trust_score = calculate_trust_score(NEW.buyer_id)
    WHERE id = NEW.buyer_id;

    -- Update seller
    UPDATE profiles
    SET 
      successful_orders = successful_orders + 1,
      total_orders = total_orders + 1,
      trust_score = calculate_trust_score(NEW.seller_id)
    WHERE id = NEW.seller_id;
  END IF;

  IF NEW.status = 'disputed' AND OLD.status != 'disputed' THEN
    -- Update disputed count
    UPDATE profiles
    SET 
      disputed_orders = disputed_orders + 1,
      trust_score = calculate_trust_score(NEW.buyer_id)
    WHERE id = NEW.buyer_id;

    UPDATE profiles
    SET 
      disputed_orders = disputed_orders + 1,
      trust_score = calculate_trust_score(NEW.seller_id)
    WHERE id = NEW.seller_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_trust_scores_trigger ON orders;

CREATE TRIGGER update_trust_scores_trigger
  AFTER UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_trust_scores_on_order_complete();

-- =============================================
-- STORAGE BUCKETS
-- =============================================

-- Create storage bucket for dispute evidence
INSERT INTO storage.buckets (id, name, public)
VALUES ('dispute-evidence', 'dispute-evidence', false)
ON CONFLICT (id) DO NOTHING;

-- Create storage bucket for avatars
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for dispute evidence
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can upload dispute evidence" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own dispute evidence" ON storage.objects;

-- Create new policies
CREATE POLICY "Users can upload dispute evidence"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'dispute-evidence' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view their own dispute evidence"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'dispute-evidence' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Storage policies for avatars
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;

CREATE POLICY "Avatar images are publicly accessible"
  ON storage.objects FOR SELECT
  USING ( bucket_id = 'avatars' );

CREATE POLICY "Users can upload their own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their own avatar"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

CREATE INDEX IF NOT EXISTS idx_products_seller_id ON products(seller_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_demand_level ON products(demand_level);
CREATE INDEX IF NOT EXISTS idx_orders_buyer_id ON orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_orders_seller_id ON orders(seller_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_disputes_order_id ON disputes(order_id);
CREATE INDEX IF NOT EXISTS idx_disputes_status ON disputes(status);

-- =============================================
-- SEED DATA (Optional - for testing)
-- =============================================

-- Note: Run seed data separately after creating test users through Supabase Auth
