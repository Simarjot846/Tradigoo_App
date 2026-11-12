# Pathway Real-Time Integration Setup Guide
## Hack for Green Bharat - Tradigoo Platform

This guide will help you set up and run the Pathway real-time streaming pipeline with live weather data integration.

---

## 🎯 What You'll Get

- ✅ **Live Weather Data**: Real-time weather from OpenWeatherMap API
- ✅ **Dynamic Demand Calculation**: Weather-influenced demand multipliers
- ✅ **Smart Wholesaler Matching**: AI-powered recommendations using Gemini
- ✅ **Real-Time Statistics**: Live carbon savings, orders, green scores
- ✅ **Seasonal Trends**: Weather-based product demand forecasting
- ✅ **Continuous Updates**: Background tasks updating data every 2-5 minutes

---

## 📋 Prerequisites

1. **Python 3.9+** installed
2. **Node.js 18+** for Next.js frontend
3. **API Keys**:
   - OpenWeatherMap API key (already in `.env`)
   - Google Gemini API key (optional, for AI reasoning)

---

## 🚀 Quick Start

### Step 1: Set Up Pathway Backend

```bash
# Navigate to pathway backend directory
cd pathway-backend

# Create virtual environment (if not exists)
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### Step 2: Configure Environment Variables

Edit `pathway-backend/.env`:

```env
# OpenWeatherMap API Key (get from https://openweathermap.org/api)
OPENWEATHER_API_KEY=your_openweather_api_key_here

# Google Gemini API Key (optional - get from https://makersuite.google.com/app/apikey)
GEMINI_API_KEY=your_gemini_api_key_here
```

### Step 3: Run Pathway Real-Time Server

```bash
# Make sure you're in pathway-backend directory with venv activated
python pathway_realtime.py
```

You should see:
```
============================================================
🌱 Tradigoo Pathway Real-Time Pipeline
   Hack for Green Bharat - Live Data Integration
============================================================

📡 Starting services...
   - Live Weather Streaming (OpenWeatherMap)
   - Real-Time Statistics
   - Smart Matching Engine
   - Green Score Tracking

🌐 API will be available at: http://localhost:8081
============================================================
```

### Step 4: Run Next.js Frontend

Open a **new terminal** (keep Pathway server running):

```bash
# Navigate to project root
cd ..

# Install dependencies (if not done)
npm install

# Run development server
npm run dev
```

Your app will be available at: `http://localhost:3000`

---

## 🧪 Testing the Integration

### 1. Test Pathway API Directly

Open your browser or use curl:

```bash
# Check if Pathway is running
curl http://localhost:8081/

# Get live weather data
curl http://localhost:8081/live-weather

# Get global statistics
curl http://localhost:8081/global-stats

# Get seasonal trends
curl http://localhost:8081/seasonal-trends

# Get weather for specific city
curl http://localhost:8081/live-weather/Delhi
```

### 2. Test Next.js API Routes

```bash
# Test pathway stats endpoint
curl http://localhost:3000/api/pathway-stats

# Test weather endpoint
curl http://localhost:3000/api/pathway-weather

# Test seasonal trends
curl http://localhost:3000/api/pathway-seasonal
```

### 3. View Live Dashboard

1. Go to `http://localhost:3000`
2. Login as a buyer/retailer
3. Navigate to Dashboard
4. You should see:
   - **Live ESG Carbon Tracking** chart updating every 3 seconds
   - **Top Wholesalers** section with live rankings
   - **Seasonal Trends** influenced by weather
   - **Weather-based demand** in various sections

---

## 📊 Understanding the Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    OpenWeatherMap API                        │
│              (Live Weather Data Every 5 min)                 │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              Pathway Real-Time Pipeline                      │
│                  (pathway_realtime.py)                       │
│                                                              │
│  • Weather Data Ingestion                                   │
│  • Demand Multiplier Calculation                            │
│  • Smart Wholesaler Matching                                │
│  • Green Score Tracking                                     │
│  • Background Tasks (Continuous Updates)                    │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                  FastAPI Endpoints                           │
│                  (Port 8081)                                 │
│                                                              │
│  GET /live-weather          - Current weather all cities    │
│  GET /live-weather/{city}   - Weather for specific city     │
│  GET /global-stats          - Live carbon/orders stats      │
│  GET /seasonal-trends       - Weather-based trends          │
│  GET /top-wholesalers       - Live rankings                 │
│  POST /smart-matching       - AI-powered matching           │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              Next.js API Routes                              │
│           (app/api/pathway-*/route.ts)                       │
│                                                              │
│  • Proxy to Pathway backend                                 │
│  • Error handling with fallbacks                            │
│  • Data transformation                                      │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              React Components                                │
│         (components/dashboard/*)                             │
│                                                              │
│  • LiveDemandCard - Real-time chart                         │
│  • TopWholesalers - Live rankings                           │
│  • SeasonalTrends - Weather-based trends                    │
│  • GreenScoreMeter - Carbon tracking                        │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔧 Key Features Explained

### 1. Live Weather Integration

**How it works:**
- Fetches weather from OpenWeatherMap API every 5 minutes
- Tracks 6 major Indian cities: Delhi, Mumbai, Chennai, Kolkata, Bangalore, Pune
- Calculates demand multipliers based on weather conditions:
  - **Bad weather** (Rain/Snow/Thunderstorm, Temp < 10°C): 1.6x demand
  - **Extreme heat** (Temp > 35°C): 1.3x demand
  - **Good weather** (Clear, 20-30°C): 0.9x demand

**Code location:** `pathway-backend/pathway_realtime.py` - `fetch_live_weather()`

### 2. Smart Wholesaler Matching

**How it works:**
- Analyzes wholesalers based on:
  - Price (30% weight)
  - Green Score (40% weight)
  - Rating (30% weight)
- Adjusts delivery time based on weather
- Uses Gemini AI to generate reasoning

**Code location:** `pathway-backend/pathway_realtime.py` - `compute_best_wholesaler()`

### 3. Real-Time Statistics

**How it works:**
- Background task updates stats every 2 seconds
- Simulates increasing carbon savings
- Tracks active orders and green scores
- Provides live data stream to frontend

**Code location:** `pathway-backend/pathway_realtime.py` - `update_live_stats()`

### 4. Seasonal Trends

**How it works:**
- Calculates product demand based on current weather
- Adjusts base demand using weather multipliers
- Shows trend direction (up/stable/down)
- Updates when weather changes

**Code location:** `pathway-backend/pathway_realtime.py` - `compute_seasonal_trends()`

---

## 🎨 Frontend Components

### LiveDemandCard Component

**Location:** `components/dashboard/LiveDemandCard.tsx`

**Features:**
- Displays real-time carbon savings chart
- Updates every 3 seconds
- Uses Recharts for visualization
- Shows last 8 data points

**API Call:**
```typescript
const res = await fetch('/api/pathway-stats');
const stats = await res.json();
```

### TopWholesalers Component

**Location:** `components/dashboard/TopWholesalers.tsx`

**Features:**
- Shows top wholesalers by product
- Live purchase counts
- Updates every 5 seconds
- Displays rankings with badges

**API Call:**
```typescript
const res = await fetch('/api/pathway-top-wholesalers');
```

### SeasonalTrends Component

**Location:** `components/dashboard/SeasonalTrends.tsx`

**Features:**
- Weather-influenced demand trends
- Product-wise demand changes
- Trend indicators (up/down/stable)
- Percentage change display

**API Call:**
```typescript
const res = await fetch('/api/pathway-seasonal');
```

---

## 🐛 Troubleshooting

### Issue: Pathway server not starting

**Solution:**
```bash
# Check if port 8081 is already in use
# On Windows:
netstat -ano | findstr :8081

# On Mac/Linux:
lsof -i :8081

# Kill the process if needed and restart
```

### Issue: Weather data not updating

**Check:**
1. Verify OpenWeatherMap API key in `.env`
2. Check internet connection
3. Look for errors in Pathway server console
4. Test API directly: `curl http://api.openweathermap.org/data/2.5/weather?q=Delhi&appid=YOUR_KEY&units=metric`

### Issue: Frontend not showing live data

**Check:**
1. Pathway server is running on port 8081
2. Next.js dev server is running on port 3000
3. Check browser console for errors
4. Verify API routes are accessible: `curl http://localhost:3000/api/pathway-stats`

### Issue: "Failed to fetch" errors

**Solution:**
- This is normal if Pathway server isn't running
- Frontend will use mock data as fallback
- Start Pathway server to get real data

---

## 📈 Performance Optimization

### Polling Frequencies

Current settings (can be adjusted):
- **Weather updates**: Every 5 minutes (300 seconds)
- **Live stats**: Every 2 seconds
- **Frontend polling**: Every 3-5 seconds

To adjust, edit these values in:
- `pathway-backend/pathway_realtime.py` - `await asyncio.sleep(300)`
- `components/dashboard/*.tsx` - `setInterval(fetchData, 3000)`

### Caching Strategy

- Weather data cached in memory for 5 minutes
- Next.js API routes use `revalidate: 0` for real-time data
- Frontend components use React state for smooth updates

---

## 🎯 Demo Tips

### For Judges/Presentation

1. **Start with Weather Impact:**
   - Show live weather for Delhi
   - Explain how it affects demand multipliers
   - Demonstrate seasonal trends changing

2. **Highlight Real-Time Updates:**
   - Point out the live carbon savings chart
   - Show how numbers update every few seconds
   - Explain the Pathway streaming concept

3. **Showcase Smart Matching:**
   - Use the Pathway Smart Matching Engine
   - Show AI reasoning from Gemini
   - Explain green score calculations

4. **Emphasize Sustainability:**
   - Carbon savings tracking
   - Local sourcing percentages
   - Weather-optimized logistics

### Key Talking Points

- "Pathway enables real-time data ingestion from OpenWeatherMap"
- "Weather conditions directly influence demand forecasting"
- "AI-powered matching considers sustainability metrics"
- "Live updates every 2-5 seconds without page refresh"
- "Hybrid search combining vector similarity and real-time data"

---

## 📚 Additional Resources

### Pathway Documentation
- Official Docs: https://pathway.com/developers/
- Real-Time Streaming: https://pathway.com/developers/user-guide/connect/streaming/
- API Integration: https://pathway.com/developers/user-guide/deployment/

### OpenWeatherMap API
- API Docs: https://openweathermap.org/api
- Current Weather: https://openweathermap.org/current
- Rate Limits: 60 calls/minute (free tier)

### Google Gemini
- Get API Key: https://makersuite.google.com/app/apikey
- Documentation: https://ai.google.dev/docs

---

## ✅ Checklist for Hackathon Demo

- [ ] Pathway server running on port 8081
- [ ] Next.js app running on port 3000
- [ ] OpenWeatherMap API key configured
- [ ] Gemini API key configured (optional)
- [ ] Live weather data visible in dashboard
- [ ] Carbon savings chart updating
- [ ] Top wholesalers section showing data
- [ ] Seasonal trends displaying
- [ ] No console errors
- [ ] Smooth real-time updates

---

## 🎉 You're Ready!

Your Pathway real-time integration is now complete. The system will:
- ✅ Fetch live weather every 5 minutes
- ✅ Update statistics every 2 seconds
- ✅ Calculate weather-based demand
- ✅ Provide AI-powered recommendations
- ✅ Track sustainability metrics in real-time

**Good luck with your hackathon presentation! 🌱**

---

*Last Updated: February 27, 2026*
*For: Hack for Green Bharat Hackathon*
