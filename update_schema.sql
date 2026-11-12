-- SQL to add missing columns for QR Verification
-- Run this in your Supabase SQL Editor

-- 1. Add Batch Number and Expiry Date to Products table
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS batch_number TEXT DEFAULT 'BATCH-001',
ADD COLUMN IF NOT EXISTS expiry_date TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '1 year');

-- 2. Add comment to explain usage
COMMENT ON COLUMN products.batch_number IS 'Batch number for the current stock of this product';
COMMENT ON COLUMN products.expiry_date IS 'Expiration date for the current stock';

-- 3. (Optional) If you want to check if they exist first to avoid errors
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'batch_number') THEN
        ALTER TABLE products ADD COLUMN batch_number TEXT DEFAULT 'BATCH-001';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'expiry_date') THEN
        ALTER TABLE products ADD COLUMN expiry_date TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '1 year');
    END IF;
END $$;
