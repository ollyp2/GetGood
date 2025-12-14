# Getting Started with Case Clicker Orchestrator

**Welcome!** This guide will get you from setup to running your first automated account.

---

## 📋 Prerequisites

- **Node.js 18+** installed
- **1-2 test accounts** on case-clicker.com
- **Session token** from your browser (we'll get this)
- **30-60 minutes** for API discovery

---

## 🚀 Quick Start (5 Steps)

### Step 1: Install Dependencies

```bash
cd orchestrator
npm install
```

This installs:
- `axios` - HTTP client for API calls
- `lowdb` - JSON database for state
- `winston` - Logging
- `node-cron` - Scheduled tasks

---

### Step 2: Configure Your Account

1. Copy the example accounts file:
   ```bash
   cd config
   cp accounts.json.example accounts.json
   ```

2. Edit `accounts.json` with your test account:
   ```json
   {
     "accounts": [
       {
         "id": "acc_001",
         "username": "your_username",
         "password": "your_password",
         "sessionToken": "",
         "notes": "Test account 1"
       }
     ]
   }
   ```

---

### Step 3: Get Session Token

**Option A: Browser DevTools (Recommended)**
1. Login to case-clicker.com
2. Press F12 → Network tab
3. Perform any action (click home, open case, etc.)
4. Click on any API request
5. Go to Headers → Look for `Authorization: Bearer <token>`
6. Copy the token (long string)
7. Paste into `accounts.json` under `sessionToken`

**Option B: Browser Cookies**
1. Login to case-clicker.com
2. F12 → Application → Cookies
3. Find cookie named `token` or `session`
4. Copy value
5. Paste into `accounts.json`

---

### Step 4: Discover Missing API Endpoints

The orchestrator is **90% complete**, but we need to discover a few API endpoints first.

**See: `../API_DISCOVERY_GUIDE.md` for detailed instructions**

**Quick version:**
1. Open case-clicker.com with F12 → Network tab
2. Click the home page clicker → Find POST request → Document URL
3. Open missions page → Find GET request → Document URL
4. Claim a mission → Find POST request → Document URL
5. Update `src/core/apiClient.js` with discovered endpoints

**Minimum needed to start:**
- Click API (`POST /api/click` or similar) - **Required for Phase 1**

---

### Step 5: Run the Orchestrator

```bash
npm start acc_001
```

Or with auto-reload during development:
```bash
npm run dev acc_001
```

---

## 📊 What Happens When You Run

The orchestrator will:

1. **Initialize** - Load account, create state database
2. **Sync** - Get current level/rank from `/api/me`
3. **Determine Phase:**
   - **Phase 1:** If no click freeze started → Start 2-day clicking
   - **Phase 2:** If click freeze done, rank < MG1 → Open cases + missions
   - **Phase 3:** If rank >= MG1 → Open cases + missions + skillmap
4. **Execute** - Run automation loop
5. **Log** - Output to console + `logs/orchestrator.log`

---

## 🔍 Monitoring Progress

### Console Output
```
[12:05:23] info: === GetGood Orchestrator Starting ===
[12:05:23] info: [acc_001] Account initialized
[12:05:24] info: [acc_001] Starting from Phase 1 (Level 0, Rank Unranked)
[12:05:24] info: [acc_001] === Starting Phase 1: Click Freeze ===
[12:05:24] info: [acc_001] Click freeze: 2025-12-14 → 2025-12-16
[12:05:24] info: [acc_001] Starting token clicking
[12:05:30] debug: [acc_001] Clicked 100 times
```

### Log File
Check `logs/orchestrator.log` for detailed logs:
```bash
tail -f logs/orchestrator.log
```

### State Database
Check `db/state.json` to see account state:
```bash
cat db/state.json
```

Example state:
```json
{
  "accounts": {
    "acc_001": {
      "id": "acc_001",
      "phase": 1,
      "level": 3,
      "rank": "Silver 2",
      "tokens": 25430,
      "clickFreezeStarted": "2025-12-14T12:00:00.000Z",
      "clickFreezeEnds": "2025-12-16T12:00:00.000Z",
      "lastUpdate": "2025-12-14T12:30:00.000Z"
    }
  }
}
```

---

## 🧪 Testing Individual Modules

Before running the full orchestrator, you can test individual modules:

### Test API Client
```javascript
// test-api.js
import { APIClient } from './src/core/apiClient.js';

const client = new APIClient('YOUR_SESSION_TOKEN');

// Test getMe
const me = await client.getMe();
console.log('User:', me);

// Test buy cases
const result = await client.buyCases('63529100e4821cab2f1c5ed2', 10);
console.log('Bought cases:', result);
```

Run: `node test-api.js`

### Test Click Farmer (After API Discovery)
```javascript
// test-click.js
import { APIClient } from './src/core/apiClient.js';
import { clickTokens } from './src/modules/clickFarmer.js';

const client = new APIClient('YOUR_SESSION_TOKEN');
await clickTokens(client, 'acc_001', 100); // Click 100 times
```

---

## ⚙️ Configuration

Edit `config/settings.json` to customize:

```json
{
  "clickDelay": 100,              // ms between clicks (increase if rate limited)
  "caseBatchSize": 100,           // cases to open per batch
  "clickFreezeMaxConcurrent": 3,  // max accounts in click freeze
  "customSellThreshold": 100000,  // auto-sell items below this price
  "logLevel": "info"              // debug | info | warn | error
}
```

---

## 🐛 Troubleshooting

### "Account acc_001 not found in config/accounts.json"
- Make sure you created `config/accounts.json` from template
- Check account ID matches

### "API endpoint not discovered"
- You haven't completed API discovery yet
- See `API_DISCOVERY_GUIDE.md`

### "401 Unauthorized"
- Session token expired
- Get fresh token from browser

### "Rate limited. Retrying..."
- Normal behavior, orchestrator will auto-retry
- Increase `clickDelay` in settings.json if happens often

### "Fatal error: Cannot find module"
- Run `npm install` first
- Make sure you're in `orchestrator/` directory

---

## 📂 Project Structure

```
orchestrator/
├── src/
│   ├── core/
│   │   ├── apiClient.js       ← Add discovered endpoints here
│   │   ├── accountManager.js
│   │   ├── stateManager.js
│   │   ├── logger.js
│   │   └── config.js
│   ├── modules/
│   │   ├── clickFarmer.js     ← Phase 1: Clicking
│   │   ├── caseOpener.js      ← Phase 2/3: Case opening
│   │   └── (more to come)
│   ├── phases/
│   │   ├── phase1.js          ← Click freeze coordinator
│   │   ├── phase2.js          ← Level to MG1 coordinator
│   │   └── phase3.js          ← Level to Global coordinator
│   ├── orchestrator.js        ← Main state machine
│   └── index.js               ← Entry point
├── config/
│   ├── settings.json          ← Edit to customize
│   └── accounts.json          ← Your account credentials (REQUIRED)
├── db/
│   └── state.json             ← Auto-generated, persistent state
└── logs/
    └── orchestrator.log       ← Auto-generated, all logs
```

---

## 🎯 Next Steps

### Immediate (Today)
1. ✅ Install dependencies (`npm install`)
2. ✅ Create `config/accounts.json`
3. ✅ Get session token
4. 🔄 Discover Click API (see `API_DISCOVERY_GUIDE.md`)
5. 🔄 Test Phase 1 with `npm start acc_001`

### Short Term (This Week)
1. Discover Missions API
2. Discover Rewards API
3. Implement mission evaluator
4. Test Phase 2 (Level to MG1)

### Medium Term (Next Week)
1. Discover Skillmap API
2. Test Phase 3 (Level to Global)
3. Optimize click freeze queue (multi-account)

### Long Term (Future)
1. Trading system
2. Multi-account management
3. Account creation automation
4. Web dashboard

---

## 💡 Tips

- **Start small:** Test with 1 account first
- **Monitor logs:** Check console and log file for issues
- **Save state:** The orchestrator auto-saves progress (resume after restart)
- **Session tokens:** They expire eventually, refresh when needed
- **Rate limits:** If you get 429 errors, increase delays in settings.json

---

## 🆘 Need Help?

1. Check `logs/orchestrator.log` for detailed errors
2. Review `API_DISCOVERY_GUIDE.md` for endpoint discovery
3. Check `../ORCHESTRATOR_ARCHITECTURE.md` for system design
4. Ask me questions!

---

## ✅ Checklist Before First Run

- [ ] Node.js 18+ installed
- [ ] Dependencies installed (`npm install`)
- [ ] `config/accounts.json` created with credentials
- [ ] Session token added to accounts.json
- [ ] Click API discovered and added to apiClient.js
- [ ] Ready to run `npm start acc_001`

---

**Ready?** Let's discover those APIs and get your first bot running! 🚀
