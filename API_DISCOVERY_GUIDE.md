# API Discovery Guide

**Goal:** Discover missing case-clicker.com API endpoints to complete the orchestrator.

---

## Missing Endpoints

We need to discover these endpoints to complete automation:

### Priority 1 (Phase 1 - Click Freeze)
- [ ] **Click API** - `POST /api/click` or `/api/home/click`
  - Used by: `clickFarmer.js`
  - Function: `clickToken()`

### Priority 2 (Phase 2 - Level to MG1)
- [ ] **Missions API** - `GET /api/missions`
  - Get daily/weekly missions
- [ ] **Claim Mission** - `POST /api/missions/:id/claim`
  - Claim mission reward
- [ ] **Inventory API** - `GET /api/inventory`
  - Get all inventory items
- [ ] **Favorite Item** - `POST /api/inventory/:id/favorite`
  - Mark item as favorite (protect from auto-sell)
- [ ] **Rewards API** - `GET /api/rewards`
  - Get rewards tab
- [ ] **Claim Reward** - `POST /api/rewards/:id/claim`
  - Claim daily/weekly reward

### Priority 3 (Phase 3 - Level to Global)
- [ ] **Skillmap API** - `GET /api/skillmap` or `/api/skills`
  - Get skillmap state
- [ ] **Set Skill Point** - `POST /api/skillmap/:id` or `PATCH /api/skills`
  - Unlock skill with point

### Priority 4 (Future - Trading)
- [ ] **Create Trade** - `POST /api/trade`
- [ ] **Add Items to Trade** - `POST /api/trade/:id/items`
- [ ] **Confirm Trade** - `POST /api/trade/:id/confirm`
- [ ] **Chat API** - `POST /api/chat` (send message)
- [ ] **Chat API** - `GET /api/chat` (read messages)

---

## How to Discover Endpoints

### Step 1: Open Browser DevTools
1. Open **case-clicker.com** in Chrome/Firefox
2. Press **F12** to open DevTools
3. Go to **Network** tab
4. Filter by **Fetch/XHR** requests

### Step 2: Perform Actions & Capture

#### Discover Click API
1. Go to Home page
2. Click the "collect your money" button
3. Check Network tab for POST request
4. Document:
   - URL (e.g., `POST https://case-clicker.com/api/click`)
   - Request payload (if any)
   - Response format

#### Discover Missions API
1. Go to Missions page
2. Check Network tab for GET request loading missions
3. Click "Claim" on a mission
4. Check Network tab for POST request
5. Document:
   - GET URL for missions list
   - POST URL for claiming
   - Request/response format

#### Discover Inventory API
1. Go to Inventory page
2. Check Network tab for GET request loading items
3. Right-click an item → "Favorite"
4. Check Network tab for POST/PATCH request
5. Document endpoints

#### Discover Rewards API
1. Go to Rewards tab
2. Check Network tab for GET request
3. Click "Claim" on a reward
4. Check Network tab for POST request
5. Document endpoints

#### Discover Skillmap API
1. Go to Skillmaps page
2. Check Network tab for GET request loading skills
3. Click to unlock a skill
4. Check Network tab for POST/PATCH request
5. Document endpoints

---

## Step 3: Document Findings

For each endpoint, document in this format:

```markdown
### Endpoint Name
**URL:** POST /api/example
**Request:**
```json
{
  "key": "value"
}
```
**Response:**
```json
{
  "success": true,
  "data": { ... }
}
```
**Notes:** Any special headers, authentication, etc.
```

---

## Step 4: Add to apiClient.js

Once discovered, add to `orchestrator/src/core/apiClient.js`:

**Example: Click API**
```javascript
// Replace this:
async clickToken() {
  logger.warn('clickToken() - API endpoint not yet discovered');
  throw new Error('API endpoint not discovered: POST /api/click');
}

// With this:
async clickToken() {
  return this.request('POST', '/click'); // or whatever the endpoint is
}
```

---

## Step 5: Test the Endpoint

Test with a simple script before integrating:

```javascript
import { APIClient } from './orchestrator/src/core/apiClient.js';

const client = new APIClient('YOUR_SESSION_TOKEN');

// Test click API
const result = await client.clickToken();
console.log('Click result:', result);
```

---

## Getting Session Token

You need a session token to make API calls:

### Method 1: Browser Cookies
1. Login to case-clicker.com
2. Open DevTools → Application → Cookies
3. Look for token/session cookie
4. Copy value

### Method 2: Network Tab
1. Perform any action on site
2. Check Network tab → Headers
3. Look for `Authorization: Bearer <token>` header
4. Copy token

### Method 3: LocalStorage
1. Open DevTools → Console
2. Run: `localStorage.getItem('token')` or similar
3. Copy token

---

## Quick Discovery Checklist

Copy this to a text file and check off as you discover:

```
Phase 1 (Click Freeze):
[ ] Click API - POST /api/___

Phase 2 (Level to MG1):
[ ] Get Missions - GET /api/___
[ ] Claim Mission - POST /api/___
[ ] Get Inventory - GET /api/___
[ ] Favorite Item - POST /api/___
[ ] Get Rewards - GET /api/___
[ ] Claim Reward - POST /api/___

Phase 3 (Level to Global):
[ ] Get Skillmap - GET /api/___
[ ] Set Skill Point - POST /api/___

Future:
[ ] Create Trade - POST /api/___
[ ] Add Trade Items - POST /api/___
[ ] Send Chat Message - POST /api/___
```

---

## Example: Discovering Click API

**Step-by-step walkthrough:**

1. Open case-clicker.com
2. F12 → Network tab → Filter "Fetch/XHR"
3. Clear network log
4. Click the home page clicker once
5. See new request appear (e.g., `POST /api/home/collect`)
6. Click on the request
7. Check **Headers** tab:
   ```
   Request URL: https://case-clicker.com/api/home/collect
   Request Method: POST
   ```
8. Check **Payload** tab (if any body data)
9. Check **Response** tab:
   ```json
   {
     "money": 125.50,
     "clicks": 1
   }
   ```
10. Document in apiClient.js:
    ```javascript
    async clickToken() {
      return this.request('POST', '/home/collect');
    }
    ```

---

## Next Steps After Discovery

Once you've discovered all Phase 1 endpoints:

1. **Update apiClient.js** with real endpoints
2. **Create accounts.json** from template:
   ```bash
   cd orchestrator/config
   cp accounts.json.example accounts.json
   # Edit accounts.json with real credentials
   ```
3. **Install dependencies:**
   ```bash
   cd orchestrator
   npm install
   ```
4. **Test Phase 1:**
   ```bash
   npm start acc_001
   ```

---

## Troubleshooting

### "401 Unauthorized"
- Session token expired
- Get fresh token from browser

### "429 Too Many Requests"
- API rate limiting active
- Orchestrator will auto-retry with backoff

### "404 Not Found"
- Wrong endpoint URL
- Double-check Network tab

### CORS errors
- Run from Node.js (not browser)
- API client uses axios (no CORS issues)

---

## Ready to Start?

**I recommend discovering in this order:**
1. **Click API** (Phase 1) - Test click freeze first
2. **Missions + Rewards** (Phase 2) - Most important for leveling
3. **Skillmap** (Phase 3) - Needed for Global
4. **Trading + Chat** (Future) - Can wait

**Time estimate:** 30-60 minutes to discover all critical endpoints

---

Let me know when you're ready to start, or if you want me to guide you through discovering a specific endpoint!
