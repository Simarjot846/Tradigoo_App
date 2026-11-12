# Tradigoo - Production Setup Guide

## 🚀 Complete Production Deployment Guide

This guide will help you deploy Tradigoo to production with real Supabase database, Razorpay payments, and enterprise-grade security.

---

## 📋 Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Supabase account (free tier works)
- Razorpay account (test mode for development)
- Vercel account (for deployment)

---

## 1️⃣ Supabase Setup

### Step 1: Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Click "New Project"
3. Fill in:
   - **Name**: tradigoo-production
   - **Database Password**: (generate strong password)
   - **Region**: Choose closest to your users (e.g., Mumbai for India)
4. Wait for project to be created (~2 minutes)

### Step 2: Get API Keys

1. Go to **Project Settings** > **API**
2. Copy these values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon/public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - **service_role key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (keep secret!)

### Step 3: Run Database Schema

1. Go to **SQL Editor** in Supabase dashboard
2. Click "New Query"
3. Copy entire contents of `supabase/schema.sql`
4. Paste and click "Run"
5. Verify tables created: profiles, products, orders, disputes

### Step 4: Configure Storage

1. Go to **Storage** in Supabase dashboard
2. Verify bucket `dispute-evidence` was created
3. If not, create it manually:
   - Name: `dispute-evidence`
   - Public: No (private)

### Step 5: Enable Email Auth

1. Go to **Authentication** > **Providers**
2. Enable **Email** provider
3. Configure email templates (optional):
   - Confirmation email
   - Password reset email
4. Set **Site URL**: `https://your-domain.com`
5. Add **Redirect URLs**: 
   - `http://localhost:3000/auth/callback`
   - `https://your-domain.com/auth/callback`

---

## 2️⃣ Razorpay Setup

### Step 1: Create Razorpay Account

1. Go to [https://razorpay.com](https://razorpay.com)
2. Sign up for account
3. Complete KYC (for production) or use test mode

### Step 2: Get API Keys

1. Go to **Settings** > **API Keys**
2. Generate **Test Keys** (for development):
   - **Key ID**: `rzp_test_xxxxx`
   - **Key Secret**: `xxxxx` (keep secret!)
3. For production, generate **Live Keys** after KYC

### Step 3: Configure Webhook

1. Go to **Settings** > **Webhooks**
2. Click "Add New Webhook"
3. Fill in:
   - **Webhook URL**: `https://your-domain.com/api/payments/webhook`
   - **Secret**: Generate strong secret (save it!)
   - **Active Events**: Select all payment events
     - payment.authorized
     - payment.captured
     - payment.failed
     - refund.created
4. Click "Create Webhook"

### Step 4: Test Mode Configuration

For development:
- Use test keys (rzp_test_xxx)
- Use test cards: 4111 1111 1111 1111
- No real money charged

---

## 3️⃣ Environment Variables

### Step 1: Create .env.local

```bash
cd tradigoo
cp .env.example .env.local
```

### Step 2: Fill in Values

Edit `.env.local`:

```env
# Supabase (from Step 1.2)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Razorpay (from Step 2.2)
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=xxxxx
RAZORPAY_WEBHOOK_SECRET=xxxxx

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development

# Optional: OpenAI for advanced AI
OPENAI_API_KEY=sk-xxxxx
```

### Step 3: Verify Configuration

```bash
npm run dev
```

Visit `http://localhost:3000` and test:
1. Sign up with email
2. Check Supabase dashboard for new user
3. Try creating test order

---

## 4️⃣ Seed Data (Optional)

### Create Test Products

Run this SQL in Supabase SQL Editor:

```sql
-- First, create a test wholesaler user through the app
-- Then get their ID and run:

INSERT INTO products (
  seller_id,
  name,
  category,
  base_price,
  demand_score,
  demand_level,
  expected_margin,
  description,
  unit,
  min_order_quantity,
  recommendation_reason
) VALUES
  (
    'YOUR_WHOLESALER_USER_ID',
    'Premium Basmati Rice',
    'Grains',
    85.00,
    92,
    'High',
    18.0,
    '1kg premium quality basmati rice',
    'kg',
    50,
    'High demand in your region this month'
  ),
  (
    'YOUR_WHOLESALER_USER_ID',
    'Toor Dal',
    'Pulses',
    120.00,
    88,
    'High',
    15.0,
    '1kg premium toor dal',
    'kg',
    30,
    'Consistent demand. Price stable.'
  );
```

---

## 5️⃣ Vercel Deployment

### Step 1: Install Vercel CLI

```bash
npm i -g vercel
```

### Step 2: Login to Vercel

```bash
vercel login
```

### Step 3: Deploy

```bash
cd tradigoo
vercel
```

Follow prompts:
- Set up and deploy? **Yes**
- Which scope? **Your account**
- Link to existing project? **No**
- Project name? **tradigoo**
- Directory? **./  (current directory)**
- Override settings? **No**

### Step 4: Add Environment Variables

```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add NEXT_PUBLIC_RAZORPAY_KEY_ID
vercel env add RAZORPAY_KEY_SECRET
vercel env add RAZORPAY_WEBHOOK_SECRET
vercel env add NEXT_PUBLIC_APP_URL
```

Or add via Vercel Dashboard:
1. Go to project settings
2. Environment Variables
3. Add all variables
4. Select environments (Production, Preview, Development)

### Step 5: Redeploy

```bash
vercel --prod
```

### Step 6: Update Razorpay Webhook

1. Go to Razorpay Dashboard > Webhooks
2. Update webhook URL to: `https://your-vercel-domain.vercel.app/api/payments/webhook`

### Step 7: Update Supabase Redirect URLs

1. Go to Supabase Dashboard > Authentication > URL Configuration
2. Add: `https://your-vercel-domain.vercel.app/auth/callback`

---

## 6️⃣ Security Checklist

### ✅ Database Security

- [x] RLS enabled on all tables
- [x] Policies restrict access to own data
- [x] Service role key kept secret (server-side only)
- [x] No sensitive data in client-side code

### ✅ API Security

- [x] All API routes verify authentication
- [x] Input validation with Zod
- [x] Webhook signature verification
- [x] Rate limiting on sensitive endpoints
- [x] CORS configured properly

### ✅ Payment Security

- [x] Razorpay keys kept secret
- [x] Payment verification before order update
- [x] Webhook signature validation
- [x] Manual capture for escrow
- [x] Refund authorization checks

### ✅ Application Security

- [x] CSP headers configured
- [x] XSS protection enabled
- [x] CSRF protection via SameSite cookies
- [x] Secure session management
- [x] HTTPS enforced in production

### ✅ File Upload Security

- [x] File type validation
- [x] File size limits (10MB)
- [x] User-specific folders
- [x] Private storage bucket
- [x] Signed URLs for access

---

## 7️⃣ Testing

### Test User Accounts

Create test accounts:

**Retailer:**
```
Email: retailer@test.com
Password: Test@123456
Role: Retailer
```

**Wholesaler:**
```
Email: wholesaler@test.com
Password: Test@123456
Role: Wholesaler
```

### Test Payment Flow

1. Login as retailer
2. Browse products
3. Place order
4. Use Razorpay test card: `4111 1111 1111 1111`
5. CVV: Any 3 digits
6. Expiry: Any future date
7. Verify order status changes to "payment_in_escrow"

### Test Escrow Flow

1. Simulate shipment (admin panel or SQL)
2. Simulate delivery with OTP
3. Confirm quality
4. Verify payment captured
5. Check trust scores updated

---

## 8️⃣ Monitoring & Logging

### Vercel Logs

```bash
vercel logs
```

Or view in Vercel Dashboard > Deployments > Logs

### Supabase Logs

1. Go to Supabase Dashboard
2. Logs & Reports
3. View API logs, Database logs

### Error Tracking (Optional)

Add Sentry:

```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

---

## 9️⃣ Performance Optimization

### Database Indexes

Already created in schema.sql:
- Products: seller_id, category, demand_level
- Orders: buyer_id, seller_id, status
- Disputes: order_id, status

### Caching

Add Redis for caching (optional):

```bash
npm install @upstash/redis
```

### CDN

Vercel automatically provides:
- Global CDN
- Edge caching
- Image optimization

---

## 🔟 Production Checklist

Before going live:

### Pre-Launch

- [ ] All environment variables set
- [ ] Database schema deployed
- [ ] RLS policies tested
- [ ] Razorpay webhook configured
- [ ] Email templates customized
- [ ] Test all user flows
- [ ] Security audit completed
- [ ] Performance testing done

### Launch

- [ ] Switch to Razorpay live keys
- [ ] Update webhook URLs
- [ ] Enable production mode
- [ ] Monitor error logs
- [ ] Set up alerts

### Post-Launch

- [ ] Monitor payment success rate
- [ ] Track user signups
- [ ] Review error logs daily
- [ ] Backup database regularly
- [ ] Update dependencies monthly

---

## 🆘 Troubleshooting

### Issue: "Unauthorized" errors

**Solution:**
- Check Supabase URL and keys
- Verify user is logged in
- Check RLS policies

### Issue: Payment not processing

**Solution:**
- Verify Razorpay keys
- Check webhook is receiving events
- Review Razorpay dashboard logs
- Ensure webhook signature is correct

### Issue: File upload fails

**Solution:**
- Check storage bucket exists
- Verify storage policies
- Check file size and type
- Review browser console errors

### Issue: Database queries slow

**Solution:**
- Check indexes are created
- Review query patterns
- Enable query logging
- Consider connection pooling

---

## 📞 Support

### Resources

- **Supabase Docs**: https://supabase.com/docs
- **Razorpay Docs**: https://razorpay.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Vercel Docs**: https://vercel.com/docs

### Community

- Supabase Discord
- Razorpay Support
- Next.js GitHub Discussions

---

## 🎉 You're Ready!

Your production-grade Tradigoo platform is now live with:

✅ Real database with RLS
✅ Secure payment processing
✅ File uploads for disputes
✅ Email authentication
✅ Enterprise security
✅ Scalable infrastructure

**Next Steps:**
1. Add more products
2. Invite beta users
3. Monitor metrics
4. Iterate based on feedback
5. Scale to 12M+ retailers! 🚀
