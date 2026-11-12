# Tradigoo - Quick Start Guide

## ⚡ Get Running in 2 Minutes

### 1. Install Dependencies
```bash
cd tradigoo
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

### 3. Open Browser
```
http://localhost:3000
```

### 4. Login with Demo Account
```
Email: retailer@demo.com
Password: (any password)
```

## 🎯 Test the Complete Flow

1. **Dashboard** → See AI recommendations
2. **Click any product** → View details
3. **Place Order** → Enter quantity
4. **Confirm Order** → Review escrow protection
5. **Pay Securely** → Payment goes to escrow
6. **Order Tracking** → Follow these steps:
   - Click "Simulate Shipment"
   - Click "Simulate Delivery"
   - Enter OTP (shown on screen)
   - Click "Confirm Quality"
7. **Done!** → Order completed, payment released

## 🚀 Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

Or push to GitHub and connect to Vercel dashboard.

## 📝 Key Files

- `app/page.tsx` - Landing page
- `app/dashboard/page.tsx` - Main dashboard with AI recommendations
- `app/marketplace/page.tsx` - Product listing
- `app/product/[id]/page.tsx` - Product details
- `app/order/confirm/page.tsx` - Order confirmation
- `app/order/[id]/page.tsx` - Order tracking (escrow flow)
- `lib/mock-data.ts` - Demo products and users
- `lib/ai-recommendations.ts` - AI recommendation logic

## 🎨 Customization

### Change Colors
Edit `app/globals.css` - Look for color variables

### Add Products
Edit `lib/mock-data.ts` - Add to `mockProducts` array

### Modify AI Logic
Edit `lib/ai-recommendations.ts` - Update scoring algorithm

## 🐛 Troubleshooting

### Port already in use?
```bash
npm run dev -- -p 3001
```

### Dependencies not installing?
```bash
rm -rf node_modules package-lock.json
npm install
```

### Build errors?
```bash
npm run build
```

## 📚 Learn More

- Full documentation: `README.md`
- Demo guide: `DEMO_GUIDE.md`
- Next.js docs: https://nextjs.org/docs

## 🎯 For Hackathon Judges

This is a **complete, working MVP** with:
- ✅ Full authentication flow
- ✅ AI-powered recommendations
- ✅ Complete order lifecycle
- ✅ Escrow payment system
- ✅ OTP verification
- ✅ Dispute resolution
- ✅ Trust score system
- ✅ Mobile-responsive design
- ✅ Hindi/English support

**No external APIs needed** - Everything works out of the box with mock data!

## 💡 Quick Tips

1. **Demo Account**: Use `retailer@demo.com` for buyer view
2. **OTP**: Always shown on screen during demo
3. **Simulate Buttons**: Use [Demo] buttons to progress order status
4. **Language Toggle**: Top right of dashboard
5. **Trust Score**: Visible in navbar

## 🎬 Perfect Demo Path

Dashboard → Product → Order → Escrow → OTP → Inspection → Complete

Takes 3-5 minutes to show the full value proposition!

---

**Need help?** Check `DEMO_GUIDE.md` for detailed presentation tips!
