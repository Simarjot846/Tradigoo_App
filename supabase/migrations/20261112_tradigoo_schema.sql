-- ==============================================================================
-- Tradigoo Enterprise Migration: Roles, Support Ticketing & Trust Metrics
-- Run this in Supabase SQL Editor: skcbzqbtjdctpxtgglbv.supabase.co
-- ==============================================================================

-- 1. Update profiles table constraint to allow EMPLOYEE and FOUNDER roles
ALTER TABLE public.profiles 
  DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE public.profiles 
  ADD CONSTRAINT profiles_role_check 
  CHECK (role IN ('retailer', 'wholesaler', 'employee', 'founder'));

-- 2. Update Founder & Employee accounts in public.profiles
UPDATE public.profiles 
SET role = 'founder',
    business_name = 'Tradigoo Marketplace Founder Console',
    verified = true
WHERE email = 'simarjotkaur514@gmail.com';

UPDATE public.profiles 
SET role = 'employee',
    business_name = 'Tradigoo Operations & Support Desk',
    verified = true
WHERE email = 'tradigoobackendemployee@gmail.com';

-- 3. Create support_tickets table if not exists
CREATE TABLE IF NOT EXISTS public.support_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id TEXT UNIQUE NOT NULL,
    dispute_id TEXT,
    order_id TEXT,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    user_email TEXT NOT NULL,
    user_name TEXT,
    user_role TEXT DEFAULT 'retailer',
    subject TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT DEFAULT 'ORDER_DISPUTE',
    status TEXT DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'IN_INVESTIGATION', 'RESOLVED', 'CLOSED')),
    priority TEXT DEFAULT 'HIGH' CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    assigned_to TEXT,
    resolution_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS) on support_tickets
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

-- Allow service role full access
CREATE POLICY "Service role full access to support_tickets" 
ON public.support_tickets 
FOR ALL 
TO service_role 
USING (true) 
WITH CHECK (true);

-- Allow authenticated users to read their own tickets
CREATE POLICY "Users can read own tickets" 
ON public.support_tickets 
FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id OR user_email = auth.jwt() ->> 'email');

-- Allow authenticated users to create tickets
CREATE POLICY "Users can create tickets" 
ON public.support_tickets 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id OR user_email = auth.jwt() ->> 'email');

-- 4. Create support_messages table for real-time investigation chat
CREATE TABLE IF NOT EXISTS public.support_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id TEXT NOT NULL REFERENCES public.support_tickets(ticket_id) ON DELETE CASCADE,
    sender_email TEXT NOT NULL,
    sender_name TEXT,
    sender_role TEXT NOT NULL,
    message TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on support_messages
ALTER TABLE public.support_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access to support_messages" 
ON public.support_messages 
FOR ALL 
TO service_role 
USING (true) 
WITH CHECK (true);

-- 5. Helpful index on support_tickets
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON public.support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_created_at ON public.support_tickets(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_support_messages_ticket ON public.support_messages(ticket_id);
