# Quick Test Guide - Verify Click API in Minutes

**Goal:** Discover the Click API and test it **immediately** (not after 2 days!)

---

## 🚀 Quick Start (4 Steps, ~15 minutes)

### Step 1: Setup (3 minutes)

**Install dependencies:**
```bash
cd orchestrator
npm install
```

**Create accounts.json:**
```bash
cd config
cp accounts.json.example accounts.json
```

**Edit `config/accounts.json`:**
```json
{
  "accounts": [
    {
      "id": "acc_001",
      "username": "your_username",
      "password": "your_password",
      "sessionToken": "PASTE_TOKEN_HERE",
      "notes": "Test account"
    }
  ]
}
```

---

### Step 2: Get Session Token (3 minutes)

**Option A: From Network Tab (Recommended)**

1. Open **case-clicker.com** and **login**
2. Press **F12** → **Network** tab
3. Filter: **Fetch/XHR**
4. Click any button on the site (home clicker, open case, etc.)
5. Click on ANY API request in Network tab
6. Go to **Headers** tab → **Request Headers**
7. Find `Authorization: Bearer eyJhbGc...` (long string)
8. Copy everything AFTER "Bearer " (the token itself)
9. Paste into `accounts.json` under `sessionToken`

**Option B: From Cookies**

1. F12 → **Application** → **Cookies** → https://case-clicker.com
2. Find cookie named `token` or `auth` or similar
3. Copy value
4. Paste into `accounts.json`

**Save the file!**

---

### Step 3: Discover Click API (5 minutes)

**Follow these steps carefully:**

1. **Open case-clicker.com** (keep DevTools open, F12)
2. Go to **Network** tab
3. Filter: **Fetch/XHR**
4. **Clear** the network log (🚫 icon)
5. Go to **Home** page
6. Click the **"collect your money"** button **ONCE**
7. **Immediately** look at Network tab - you should see a new request appear!

**Identify the request:**
- Look for something like: `click`, `collect`, `home`, `money`, etc.
- Should be a **POST** request (red color)
- Click on it

**Document the endpoint:**
- Check **Headers** tab
- Request URL might be:
  - `POST https://case-clicker.com/api/click`
  - `POST https://case-clicker.com/api/home/click`
  - `POST https://case-clicker.com/api/home/collect`
  - `POST https://case-clicker.com/api/money/collect`
  - Or something similar

**Take note of the path after `/api/`**

Example:
```
Request URL: https://case-clicker.com/api/home/collect
                                           ^^^^^^^^^^^^
                                           This is what we need!
```

---

### Step 4: Update apiClient.js (2 minutes)

**Open:** `orchestrator/src/core/apiClient.js`

**Find line ~166** (search for "clickToken"):
```javascript
async clickToken() {
  // TODO: Discover endpoint
  logger.warn('clickToken() - API endpoint not yet discovered');
  throw new Error('API endpoint not discovered: POST /api/click');
}
```

**Replace with the endpoint you discovered:**

**Example 1:** If you found `POST /api/click`
```javascript
async clickToken() {
  return this.request('POST', '/click');
}
```

**Example 2:** If you found `POST /api/home/collect`
```javascript
async clickToken() {
  return this.request('POST', '/home/collect');
}
```

**Example 3:** If you found `POST /api/home/click`
```javascript
async clickToken() {
  return this.request('POST', '/home/click');
}
```

**Just use whatever you found after `/api/`**

**Save the file!**

---

## ✅ Test 1: Quick Click Test (10 clicks)

Test that the API works with 10 quick clicks:

```bash
cd orchestrator
npm run test-click acc_001
```

**Expected output:**
```
============================================================
Click API Test Script
============================================================

📋 Testing account: acc_001
👤 Username: your_username

1️⃣ Testing session token with /api/me...
✅ Session valid!
   Level: 5, Tokens: 115624, Rank: Silver 3

2️⃣ Testing Click API...
   Attempting 10 test clicks...

   ✅ Click 1/10 - Success (125ms)
   ✅ Click 2/10 - Success (118ms)
   ✅ Click 3/10 - Success (132ms)
   ...
   ✅ Click 10/10 - Success (121ms)

============================================================
Test Results:
============================================================
✅ Successful clicks: 10/10
❌ Failed clicks: 0/10
⏱️  Average response time: 124ms

📊 Analysis:
✅ Click API is working perfectly!

✨ Next steps:
   1. Run short test: npm run test-phase1
   2. Run full automation: npm start acc_001
============================================================
```

---

## ✅ Test 2: 5-Minute Click Test

If Test 1 worked, run a longer test (5 minutes instead of 2 days):

```bash
npm run test-phase1 acc_001
```

**Expected output:**
```
============================================================
Phase 1 SHORT TEST (5 minutes)
============================================================

[12:30:00] info: State manager initialized
[12:30:00] info: [acc_001] Account initialized
[12:30:01] info: [acc_001] Current: Level 5, Rank Silver 3
[12:30:01] info: [acc_001] Starting 3000 clicks (5 minutes)...

💡 This is a SHORT TEST. Press Ctrl+C to stop early.

[12:30:10] info: [acc_001] Clicked 50 times (10s elapsed, 290s remaining)
[12:30:20] info: [acc_001] Clicked 100 times (20s elapsed, 280s remaining)
[12:30:30] info: [acc_001] Clicked 150 times (30s elapsed, 270s remaining)
...
[12:35:00] info: [acc_001] Clicked 3000 times (300s elapsed, 0s remaining)

============================================================
Test Complete!
============================================================
[12:35:00] info: [acc_001] Total clicks: 3000
[12:35:00] info: [acc_001] Total time: 300 seconds
[12:35:00] info: [acc_001] Rate: 10.00 clicks/second
[12:35:01] info: [acc_001] Final: Level 5, Tokens 118624

✅ Phase 1 short test completed successfully!

✨ Next steps:
   1. If this worked well, run full automation: npm start acc_001
   2. Full Phase 1 will run for 2 days (click freeze)
   3. Monitor with: tail -f logs/orchestrator.log
```

**This proves the click automation works!** ✅

---

## ✅ Test 3: Full Automation (Optional - 2 Days)

If both tests worked perfectly, run the full automation:

```bash
npm start acc_001
```

This will:
- Run Phase 1 (click freeze for 2 days)
- Automatically transition to Phase 2 (level to MG1)
- Continue until Global Elite

**Monitor progress:**
```bash
# Watch logs in real-time
tail -f logs/orchestrator.log

# Check state
cat db/state.json
```

**Stop anytime with Ctrl+C** (it saves progress and can resume)

---

## 🐛 Troubleshooting

### "❌ Account acc_001 not found"
- Make sure you created `config/accounts.json` from template
- Check the account ID matches

### "❌ No session token"
- You forgot to add sessionToken to accounts.json
- Get token from browser (Step 2 above)

### "❌ Session valid... ❌ Click 1/10 - Error: 404 Not Found"
- Wrong endpoint URL
- Go back to Step 3, double-check the endpoint path
- Make sure you found the right request in Network tab

### "❌ Session valid... ❌ Click 1/10 - Error: API endpoint not discovered"
- You didn't update apiClient.js yet
- Go to Step 4, replace the clickToken() function

### "❌ Fatal error: 401 Unauthorized"
- Session token expired
- Get fresh token from browser (Step 2)

### "✅ Click 1/10 - Success... ❌ Click 2/10 - Error: 429 Too Many Requests"
- You're being rate limited
- Edit `config/settings.json`, increase `clickDelay` from 100 to 200 or 300
- Try again

---

## 📊 What Success Looks Like

**Test 1 (10 clicks):** ✅ 10/10 successful
**Test 2 (5 minutes):** ✅ 3000+ clicks completed
**Result:** Click API works perfectly!

**Now you can:**
1. Run full automation confidently
2. Discover other APIs (missions, rewards, etc.)
3. Let it run for 2 days while you do other things

---

## 🎯 Quick Reference

```bash
# Setup
cd orchestrator
npm install
cd config
cp accounts.json.example accounts.json
# Edit accounts.json with credentials + token

# Test (after discovering endpoint)
npm run test-click acc_001      # 10 clicks
npm run test-phase1 acc_001     # 5 minutes
npm start acc_001               # Full automation (2 days)
```

---

## ❓ Need Help?

**If Test 1 fails:**
1. Check `accounts.json` has valid sessionToken
2. Verify endpoint in `apiClient.js` matches Network tab
3. Try clicking manually on website to see the exact endpoint

**If you can't find the click endpoint:**
1. Make sure you're on the **Home** page
2. Clear Network tab first (🚫 button)
3. Click **ONCE** on the clicker
4. Look for POST requests immediately after clicking
5. Take a screenshot and I can help identify it

**Ready to start?** Go to **Step 1** above!
