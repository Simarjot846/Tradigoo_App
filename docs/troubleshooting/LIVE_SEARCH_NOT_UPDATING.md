# 🔧 Live Search Not Updating - Diagnostic Guide

## Problem
The Live Search Stream shows the same data and doesn't change when you refresh.

---

## ✅ Quick Diagnosis

### Check 1: Is Pathway Backend Running?

**Open the terminal where Pathway is running and look for:**
```
✓ Search trends streaming active
✓ Product search tracking active
```

**If you DON'T see these messages:**
1. Pathway backend is not running
2. Or it's running the old version without search tracking

**Solution:**
```bash
# Stop Pathway (Ctrl+C)
cd pathway-backend
python pathway_realtime.py
```

### Check 2: Is Data Being Generated?

**Test the endpoint directly:**
```bash
curl http://localhost:8081/live-searches
```

**Expected Response:**
```json
{
  "searches": [
    {
      "product": "Wheat",
      "region": "Delhi",
      "timestamp": "2026-02-27T...",
      "user_type": "retailer"
    }
  ],
  "total_searches": 20,
  "searches_per_minute": 45,
  "timestamp": "2026-02-27T..."
}
```

**If you get an error or empty array:**
- Pathway backend is not generating data
- Wait 5-10 seconds and try again
- Check Pathway console for errors

### Check 3: Is Frontend Fetching Data?

**Open Browser DevTools (F12):**
1. Go to "Network" tab
2. Filter by "pathway"
3. Refresh page
4. Look for `/api/pathway-live-searches` requests

**Expected:**
- Request every 5 seconds
- Status: 200 OK
- Response has data

**If requests are failing:**
- Check console for errors
- Verify Pathway backend is on port 8081
- Check CORS settings

---

## 🚀 Step-by-Step Fix

### Step 1: Verify Pathway Backend

```bash
# Check if Pathway is running
curl http://localhost:8081/

# Should return:
{
  "service": "Tradigoo Pathway Real-Time API",
  "status": "running",
  ...
}
```

### Step 2: Check Search Generation

**In Pathway terminal, you should see periodic messages like:**
```
✓ Updated weather for Delhi: 28.5°C, Clear
```

**If you DON'T see any messages:**
- Pathway is frozen
- Restart it: Ctrl+C, then `python pathway_realtime.py`

### Step 3: Wait for Data Accumulation

The search tracking needs time to generate data:
- Wait 10-15 seconds after starting Pathway
- Then check: `curl http://localhost:8081/live-searches`
- Should have 10-20 searches

### Step 4: Hard Refresh Frontend

```bash
# Clear browser cache
Ctrl + Shift + Delete

# Hard refresh
Ctrl + Shift + R
```

### Step 5: Check Component State

**Open Browser Console (F12):**
- Look for errors
- Check if component is mounting
- Verify API calls are happening

---

## 🎯 Visual Indicators Added

The component now shows:

### 1. Connection Status
- **Green dot** + "Connected • X searches tracked" = Working ✅
- **Amber dot** + "Waiting for Pathway backend..." = Not connected ❌

### 2. Update Indicator
- Badge shows last update time
- "Updating..." text when fetching
- Activity icon pulses when updating

### 3. Empty State
- Shows "Waiting for live searches..." if no data
- Tells you to check Pathway backend

---

## 🐛 Common Issues

### Issue 1: "Waiting for Pathway backend..."

**Cause:** Pathway not running or not generating data

**Solution:**
```bash
cd pathway-backend
python pathway_realtime.py

# Wait 10 seconds, then check:
curl http://localhost:8081/live-searches
```

### Issue 2: Same Data on Refresh

**Cause:** Browser caching API responses

**Solution:**
```bash
# Hard refresh
Ctrl + Shift + R

# Or clear cache
Ctrl + Shift + Delete
```

### Issue 3: No Searches Showing

**Cause:** Search generation not started

**Solution:**
1. Check Pathway console for errors
2. Restart Pathway backend
3. Wait 15 seconds for data to accumulate
4. Refresh browser

### Issue 4: Searches Not Changing

**Cause:** Polling interval too long or Pathway frozen

**Solution:**
```typescript
// Temporarily reduce interval for testing
// Edit components/dashboard/LiveSearchTrends.tsx
const searchInterval = setInterval(fetchLiveSearches, 2000); // 2 seconds
```

---

## 🧪 Test Data Generation

### Manual Test

**Run this in Pathway terminal to verify search generation:**

```bash
# Check live searches
curl http://localhost:8081/live-searches

# Wait 5 seconds

# Check again - should have different data
curl http://localhost:8081/live-searches
```

**Expected:**
- First call: 10-15 searches
- Second call: 20-30 searches (more accumulated)
- Timestamps should be recent (within last minute)

### Verify Background Task

**In `pathway-backend/pathway_realtime.py`, the task should be running:**

```python
async def update_search_trends():
    while True:
        # Generates 2-5 searches per second
        num_searches = random.randint(2, 5)
        # ... adds to live_searches
        await asyncio.sleep(1)  # Every second
```

**Check it's started:**
```python
@app.on_event("startup")
async def startup_event():
    asyncio.create_task(update_search_trends())  # ← This line
```

---

## 📊 Expected Behavior

### When Working Correctly:

1. **Pathway Backend:**
   - Generates 2-5 searches per second
   - Accumulates in memory
   - Serves via `/live-searches` endpoint

2. **Frontend:**
   - Fetches every 5 seconds
   - Shows new searches at top
   - Updates "just now", "2s ago" timestamps
   - Green "Connected" indicator

3. **Visual Changes:**
   - New searches appear with fade-in animation
   - Top search has green pulsing dot
   - Timestamps update ("just now" → "5s ago" → "10s ago")
   - Search count increases

---

## 🔍 Debug Checklist

- [ ] Pathway backend running on port 8081
- [ ] Can access `http://localhost:8081/`
- [ ] `/live-searches` returns data
- [ ] Data has recent timestamps (< 1 minute old)
- [ ] Frontend making requests every 5 seconds
- [ ] No errors in browser console
- [ ] No errors in Pathway console
- [ ] Component shows "Connected" status
- [ ] Searches have "just now" timestamps

---

## 💡 Quick Fixes

### Fix 1: Force Data Generation

Add this to test if Pathway is working:

```bash
# Call endpoint multiple times rapidly
for i in {1..5}; do curl http://localhost:8081/live-searches; sleep 2; done
```

Should show increasing search counts.

### Fix 2: Reduce Update Interval

For demo, make updates more frequent:

```typescript
// components/dashboard/LiveSearchTrends.tsx
const searchInterval = setInterval(fetchLiveSearches, 2000); // 2s instead of 5s
```

### Fix 3: Add Console Logging

```typescript
const fetchLiveSearches = async () => {
    console.log('Fetching live searches...');
    const res = await fetch('/api/pathway-live-searches');
    const data = await res.json();
    console.log('Received:', data.searches?.length, 'searches');
    // ...
};
```

---

## 🎬 For Demo

If searches aren't updating during demo:

### Option 1: Show Static Data
- Comment out the live component
- Show screenshots of it working

### Option 2: Explain the Concept
- "This would show live searches in production"
- "Simulates 2-5 searches per second"
- "Updates every 5 seconds via Pathway streaming"

### Option 3: Use Mock Data
- Temporarily use mock data that changes
- Show the UI/UX concept
- Explain real implementation

---

## ✅ Success Indicators

You'll know it's working when:

1. ✅ Green "Connected" indicator
2. ✅ Search count > 0
3. ✅ Timestamps say "just now" or "2s ago"
4. ✅ New searches appear when you wait 5 seconds
5. ✅ Trending products show counts
6. ✅ "Searches/Min" stat is > 0
7. ✅ No "Waiting for Pathway backend..." message

---

**If still not working after all these steps, the Pathway backend may need to be restarted with the updated code that includes search tracking.**

*Last Updated: February 27, 2026*
*Status: Diagnostic Guide*
