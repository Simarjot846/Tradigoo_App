# Tradigoo - Production Quick Start

## ⚡ Get Production Running in 15 Minutes

This is the fastest path to get Tradigoo running in production.

---

## 🚀 Quick Setup

### 1. Clone & Install (2 minutes)

```bash
cd tradigoo
npm install
```

### 2. Supabase Setup (5 minutes)

1. **Create Project**: https://supabase.com → New Project
2. **Get Keys**: Settings → API
   - Copy `Project URL`
   - Copy `anon public` key
   - Copy `service_role` key (keep secret!)
3. **Run Schema**: SQL Editor → New Query → Paste `supabase/schema.sql` → Run

### 3. Razorpay Setup (3 minutes)

1. **Create Account**: https://razorpay.com → Sign Up
2. **Get Test Keys**: Settings → API Keys → Generate Test Keys
   - Copy `Key ID` (rzp_test_xxx)
   - Copy `Key Secret` (keep secret!)
3. **Setup Webhook** (do this after deployment):
   - URL: `https://your-domain.com/api/payments/webhook`
   - Secret: Generate random string
   - Events: Select all payment events

### 4. Environment Variables (2 minutes)

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...

# Razorpay
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=xxxxx
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

### 5. Test Locally (1 minute)

```bash
npm run dev
```

Visit: http://localhost:3000

Test:
1. Sign up with email
2. Check Supabase dashboard for new user
3. Browse products (add some via SQL first)

### 6. Deploy to Vercel (2 minutes)

```bash
npm i -g vercel
vercel login
vercel
```

Add environment variables in Vercel dashboard.

---

## 🎯 Essential Commands

```bash
# Development
npm run dev              # Start dev server

# Production
npm run build            # Build for production
npm run start            # Start production server

# Deployment
npm run deploy           # Deploy to production
npm run deploy:preview   # Deploy preview

# Type checking
npm run type-check       # Check TypeScript types
```

---

## 📝 Quick Test Checklist

After setup, test these:

- [ ] Sign up with email
- [ ] Verify email (check inbox)
- [ ] Login
- [ ] View dashboard
- [ ] Browse products
- [ ] Place test order
- [ ] Use test card: 4111 1111 1111 1111
- [ ] Verify order in database
- [ ] Check webhook received (Razorpay dashboard)

---

## 🔧 Common Issues

### "Unauthorized" errors
**Fix**: Check Supabase URL and keys in .env.local

### Payment not working
**Fix**: Verify Razorpay keys, check test mode enabled

### Database errors
**Fix**: Ensure schema.sql was run successfully

### Webhook not receiving
**Fix**: Update webhook URL after deployment

---

## 📚 Next Steps

1. **Add Products**: Create products via SQL or build admin panel
2. **Customize**: Update branding, colors, text
3. **Test Flows**: Test complete order → payment → escrow flow
4. **Monitor**: Check Vercel logs and Supabase dashboard
5. **Launch**: Switch to Razorpay live keys when ready

---

## 🆘 Need Help?

- **Full Setup**: See `PRODUCTION_SETUP.md`
- **Security**: See `SECURITY.md`
- **Upgrade Details**: See `PRODUCTION_UPGRADE_SUMMARY.md`

---

## ✅ You're Ready!

In 15 minutes, you now have:
- ✅ Real database with security
- ✅ Working authentication
- ✅ Payment integration
- ✅ Production deployment

**Start trading! 🚀**
