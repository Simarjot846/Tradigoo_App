-- Add new Order Status Enum (Not supported by all postgres clients directly, using check constraint or text)
-- For simplicity in Hackathon, we will just use TEXT with CHECK constraint or just Update existing rows.

-- Update Orders Table
ALTER TABLE orders 
ADD COLUMN otp_hash TEXT,
ADD COLUMN otp_expiry TIMESTAMP WITH TIME ZONE,
ADD COLUMN inspection_deadline TIMESTAMP WITH TIME ZONE;

-- Add Trust Score to Profiles
ALTER TABLE profiles 
ADD COLUMN trust_score INTEGER DEFAULT 100;

-- Comments for usage
COMMENT ON COLUMN orders.status IS 'ORDER_CREATED, PAYMENT_HELD, SHIPPED, DELIVERED, OTP_CONFIRMED, INSPECTION_PENDING, PAYMENT_RELEASED, DISPUTED, CANCELLED';

-- Disputes Table
CREATE TABLE IF NOT EXISTS disputes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id),
  raised_by UUID REFERENCES profiles(id),
  reason TEXT NOT NULL,
  evidence_urls TEXT[],
  status TEXT CHECK (status IN ('pending', 'under_review', 'resolved', 'rejected')) DEFAULT 'pending',
  resolution_notes TEXT,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cart Items Table
CREATE TABLE IF NOT EXISTS cart_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  product_id UUID REFERENCES products(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);
