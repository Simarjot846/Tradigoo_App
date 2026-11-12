-- Comprehensive Migration for Hackathon Demo Features
-- Run this in Supabase SQL Editor to ensure all columns exist

-- 1. Add Image URL (Critical for photos)
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS image_url TEXT;

-- 2. Add AI Recommendation Fields
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS recommendation_reason TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS demand_level TEXT DEFAULT 'Medium';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS demand_score NUMERIC DEFAULT 50;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS expected_margin NUMERIC DEFAULT 10;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS supplier_count INTEGER DEFAULT 1;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS region_boost INTEGER DEFAULT 0;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS season_factor INTEGER DEFAULT 0;

-- 3. Add Marketplace Fields (if missing)
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS unit TEXT DEFAULT 'pcs';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS min_order_quantity INTEGER DEFAULT 1;

-- 4. Enable Realtime (Optional but good for demo)
alter publication supabase_realtime add table products;
alter publication supabase_realtime add table orders;

COMMENT ON COLUMN public.products.image_url IS 'Unsplash URL for product demo';
