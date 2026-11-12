# 🚀 Pathway Quick Start - 2 Minutes
## Tradigoo Hack for Green Bharat

---

## ⚡ Super Quick Start

### 1. Start Pathway Backend (Terminal 1)
```bash
cd pathway-backend
start_pathway.bat
```
*Mac/Linux: `./start_pathway.sh`*

### 2. Start Next.js (Terminal 2)
```bash
npm run dev
```

### 3. Open Browser
```
http://localhost:3000
```

**Done! 🎉**

---

## ✅ Quick Test

```bash
# Test Pathway is running
curl http://localhost:8081/live-weather

# Test Next.js integration
curl http://localhost:3000/api/pathway-weather
```

---

## 📊 What You'll See

1. **Live Weather Widget** - Real weather from OpenWeatherMap
2. **Carbon Savings Chart** - Updates every 3 seconds
3. **Top Wholesalers** - Live rankings
4. **Seasonal Trends** - Weather-based forecasts

---

## 🔑 API Key (Already Configured)

```env
OPENWEATHER_API_KEY=your_openweather_api_key_here
```
Location: `pathway-backend/.env`

---

## 🐛 Troubleshooting

### Pathway won't start?
```bash
# Check port 8081
netstat -ano | findstr :8081

# Reinstall dependencies
cd pathway-backend
pip install -r requirements.txt
```

### Frontend not showing data?
1. Check Pathway is running: `curl http://localhost:8081/`
2. Check browser console for errors
3. Refresh page

---

## 📚 Full Documentation

- **Complete Setup**: `PATHWAY_SETUP_GUIDE.md`
- **Backend Docs**: `pathway-backend/README.md`
- **Integration Summary**: `PATHWAY_INTEGRATION_COMPLETE.md`

---

## 🎯 Demo Talking Points

1. "Live weather from OpenWeatherMap every 5 minutes"
2. "Real-time demand multipliers based on weather"
3. "Carbon savings updating every 2 seconds"
4. "AI-powered wholesaler matching with Gemini"
5. "All powered by Pathway streaming framework"

---

## 🏆 Success Checklist

- [ ] Pathway running on port 8081
- [ ] Next.js running on port 3000
- [ ] Weather widget showing data
- [ ] Charts animating
- [ ] No console errors

---

**You're ready! Good luck! 🌱**
