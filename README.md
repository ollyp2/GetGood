# GetGood - Case Clicker Automation

Automated system for case-clicker.com to level up, complete missions, and automatically trade terminals.

## Project Goal

Create an automated system that:
1. **Levels up** the account by farming tokens
2. **Unlocks trading** functionality
3. **Completes missions** to earn terminals
4. **Automatically trades terminals** to a specific account via chat ("terminals for chicken")

## Architecture

The system consists of multiple independent modules coordinated by an orchestrator:

```
GetGood/
├── modules/
│   ├── account-monitor.js     # Tracks level, tokens, trading status
│   ├── token-farmer.js        # Auto-click and game automation
│   ├── mission-tracker.js     # Mission completion automation
│   ├── inventory-scanner.js   # Detects terminals in inventory
│   ├── trading-system.js      # Creates trades and posts in chat
│   ├── chat-monitor.js        # Monitors chat for trade responses
│   └── orchestrator.js        # Main coordinator
├── materials/                 # Screenshots and reference files
└── README.md
```

## API Documentation

### Base URL
```
https://case-clicker.com/api
```

### Endpoints Discovered

#### 1. Get User Stats
```http
GET /api/me
```
**Response:**
```json
{
  "caseOpenCount": 10,
  "level": 5,
  "tokens": 115624,
  // ... other user data
}
```

#### 2. Buy Cases
```http
POST /api/cases
Content-Type: application/json

{
  "id": "640c9ae8630b848c02320a64",
  "type": "case",
  "amount": 10
}
```

#### 3. Get Owned Cases
```http
GET /api/cases
```
**Response:**
```json
[
  {
    "_id": "640c9ae8630b848c02320a64",
    "amount": 5
  }
]
```

#### 4. Open Cases (with Auto-Sell & Auto-Favorite)
```http
POST /api/open/case
Content-Type: application/json

{
  "id": "640c9ae8630b848c02320a64",
  "quickOpen": true,
  "count": "10",
  "useEventTickets": false,
  "caseOpenMultiplier": 1,
  "autoOpenConfig": {
    "autosellActivated": true,
    "autosellAmount": 500,
    "autosellVariant": "money",
    "favoriteHighFloats": true,
    "favoriteLowFloats": true,
    "favoritePatterns": true,
    "customHighFloat": 0.99999,
    "customLowFloat": 0.0000001,
    "customSelectedFloats": ["0.123456", "0.42069"],
    "favoriteCustomFloats": true
  }
}
```

**Response:**
```json
{
  "skins": [...],
  "autoSellInfo": {
    "count": 8,
    "cost": 2210.92
  }
}
```

#### 5. Bulk Sell for Money
```http
DELETE /api/inventory
Content-Type: application/json

{
  "type": "price",
  "value": 500,
  "currency": "money"
}
```

**Response:**
```json
{
  "cost": 2210.92,
  "count": 290
}
```

#### 6. Bulk Sell for Tokens
```http
PATCH /api/inventory
Content-Type: application/json

{
  "type": "price",
  "value": 500,
  "currency": "money"
}
```

**Response:**
```json
{
  "cost": 2210.92,
  "count": 290
}
```

### Unknown Endpoints (To Discover)

We need to discover endpoints for:
- [ ] Trading system (create trade, add items, confirm)
- [ ] Chat system (send message, read messages)
- [ ] Mission system (get missions, claim rewards)
- [ ] Game systems (Blackjack, Coinflip, Jackpot, etc.)
- [ ] Leveling/XP system
- [ ] Skillmaps

## Implementation Roadmap

### Phase 1: Account Monitoring ⏳
**Goal:** Track account state (level, tokens, trading unlocked)

**Tasks:**
- Create module that polls `/api/me` endpoint
- Parse and expose: level, tokens, trading_unlocked status
- Event emitter for state changes

**API Endpoints Needed:**
- ✅ `GET /api/me` - Already known

**Completion Criteria:**
- Module can detect current level
- Module can detect if trading is unlocked
- Module emits events when state changes

---

### Phase 2: Token Farming ⏳
**Goal:** Automatically farm tokens through games

**Tasks:**
- Research which game is most efficient for token farming
- Implement auto-clicker for "Home" page token collection
- Implement game automation (likely Blackjack or simplest game)
- Monitor token balance and log farming rate

**API Endpoints Needed:**
- [ ] `POST /api/click` or similar for token collection
- [ ] Game-specific endpoints (to be discovered)

**Questions:**
1. Which game gives best token/time ratio?
2. Is there a simple click-to-earn on the home page?
3. What are the game limitations (24h limits shown in screenshots)?

---

### Phase 3: Mission Automation ⏳
**Goal:** Complete daily/weekly missions to earn terminals

**Tasks:**
- Fetch current missions from API
- Categorize missions by type
- Implement mission completion automation
- Claim mission rewards

**API Endpoints Needed:**
- [ ] `GET /api/missions` - Get active missions
- [ ] `POST /api/missions/:id/claim` - Claim reward

**Mission Types from Screenshots:**
- Daily: Get natural Blackjack, Play casebattles, Open gloves, Win blackjack games
- Weekly: Lose casebattles, Win jackpot, Click X times, Win plinko, Play guess the rank

---

### Phase 4: Inventory Scanning ⏳
**Goal:** Detect terminals in inventory

**Tasks:**
- Fetch inventory from API
- Filter for "Terminal" items
- Track terminal count
- Emit event when new terminal detected

**API Endpoints Needed:**
- [ ] `GET /api/inventory` - Get inventory items

**Detection Criteria:**
- Item name contains "Terminal"
- Item rarity/type is "Terminal"

---

### Phase 5: Trading System ⏳
**Goal:** Create trade and post in chat

**Tasks:**
- Create new trade
- Add terminal items to trade
- Get trade ID/link
- Post trade link + message in global chat

**API Endpoints Needed:**
- [ ] `POST /api/trade` - Create new trade
- [ ] `POST /api/trade/:id/items` - Add items to trade
- [ ] `POST /api/chat` - Send chat message

**Trade Message Format:**
```
[Trade Link] terminals for chicken
```

---

### Phase 6: Chat Monitoring ⏳
**Goal:** Monitor chat for trade responses

**Tasks:**
- Monitor global chat for messages
- Detect when trade is accepted
- Log trade completion
- Confirm terminal transfer

**API Endpoints Needed:**
- [ ] `GET /api/chat` or WebSocket connection for chat
- [ ] `GET /api/trade/:id/status` - Check trade status

**Chat Monitoring:**
- Watch for trade acceptance
- Log successful trades
- Alert if trade fails

---

### Phase 7: Orchestrator ⏳
**Goal:** Coordinate all modules based on account state

**State Machine:**
```
START
  ↓
[Monitor Account]
  ↓
Trading Unlocked?
  ├─ NO → [Farm Tokens] → [Complete Missions] → [Level Up] → loop back
  ├─ YES ↓
[Scan Inventory for Terminals]
  ↓
Terminals Found?
  ├─ NO → [Complete Missions] → [Earn Terminals] → loop back
  ├─ YES ↓
[Create Trade]
  ↓
[Post in Chat: "terminals for chicken"]
  ↓
[Monitor Trade]
  ↓
[Wait for Completion]
  ↓
START (loop)
```

## Development Strategy

**One Task at a Time** - We implement each phase sequentially:
1. Research/discover needed APIs
2. Implement module
3. Test module in isolation
4. Integrate with orchestrator
5. Move to next phase

**No Bulk Changes** - Every change is:
- Small and focused
- Tested before moving forward
- Documented

## Current Status

- [x] Project initialized
- [x] Materials collected (screenshots)
- [x] API documentation started
- [ ] Phase 1: Account Monitor
- [ ] Phase 2: Token Farmer
- [ ] Phase 3: Mission Automation
- [ ] Phase 4: Inventory Scanner
- [ ] Phase 5: Trading System
- [ ] Phase 6: Chat Monitor
- [ ] Phase 7: Orchestrator

## Next Steps

**IMMEDIATE TASK:**
1. Explore the case-clicker.com website to discover missing API endpoints
2. Start with Phase 1: Account Monitoring module

## Questions to Answer

1. ✅ **How is trading unlocked?** → **Master Guardian 1 (MG1) rank**
2. ✅ **What are terminals exactly?** → **High-value Special Effect items (~25k each, 15 = 375k)**
3. ⏳ **Which missions give terminals?** → **Missions give "Special Effects" - some are terminals**
4. ✅ **What's the most efficient token farming?** → **Use all game 24h limits + home clicker (2250 clicks mission)**
5. ⏳ **Is there a WebSocket?** → **To be discovered**
6. ⏳ **How does chat work?** → **Global Chat visible in UI, API needs discovery**

---

## Important Discoveries from Screenshots

### Game System (24h Limits)
All games have daily limits that reset after 24 hours. We want to use these efficiently:

| Game | Hosted Remaining | Joined Remaining | Max Bet | Notes |
|------|-----------------|------------------|---------|-------|
| Casebattle | 93 | 291 | - | Good for missions |
| Coinflip | 179 | 397 | 100m | High volume game |
| Upgrade | - | 283 | - | Skin upgrade game |
| Dice | - | 454 | 10m | Simple dice game |
| Guess the Rank | - | 12 | 1m total | Low limit |
| Jackpot | - | 183 | - | Win mission target |
| **Blackjack** | - | 0 | 100m | **USED UP** - good for missions |
| Plinko | - | 11 | 1m | Low limit, mission target |

**Strategy:** Run all games in parallel to use up daily limits efficiently

### Mission System

#### Daily Missions
- Get a natural Blackjack in 1 blackjack game
- Play 4 casebattles
- Open 300 gloves
- Win 3 blackjack games
- Lose 2 casebattles

#### Weekly Missions
- Lose 2 casebattles
- Win 1 jackpot
- **Click 2250 times** ← HOME CLICKER TARGET
- Win 90 plinko games
- Play 2 guess the rank games
- Win 2 casebattles

**Mission Rewards:** Give "Special Effects" which can be activated in inventory or on click

### Trading System Details
- **Trade ID Format:** Long hex string (e.g., `695c5d8811f62d5bf1a850235`)
- **Host/Guest Model:** One person hosts, another joins and accepts
- **Trade Interface Components:**
  - "Add Skins" button
  - "Add Tokens" button
  - Shows: Skins Value, Tokens, Total Value (both sides)
  - "Confirm Trade" button
  - "Accept Trade" checkbox
  - Trade Link (shareable)
- **Limitation:** "You can only host 1 trade at a time"
- **Status:** "Waiting for player" / "Go to trade" buttons visible

### Chat System
- **Location:** Right side of UI (Global Chat)
- **Format:** Player name + message + timestamp
- **Trade Posts:** Players post trade links with messages
- **Terminal Trade Message:** `[Trade Link] terminals for chicken`
- **Chat Activity:** Active discussions about trades and items

### Inventory System
- **Value Tracking:** Total inventory value displayed (e.g., $24,520.44)
- **Size Limit:** Current/Max items (e.g., 3407/3700)
- **Filtering:**
  - Sort: Price, Exterior, Rarity
  - **Favorites** (protected from auto-sell)
  - Event items
- **Tabs:**
  - **Custom Sell**
  - **Storage Units**
  - **Special Effects** ← Where terminals appear
- **Item Properties:** Items have floats (e.g., `0.2000078602384`)
- **Pagination:** 69 pages of items

### Terminals
- **Type:** Special Effect items (appear in Special Effects inventory tab)
- **Value:** ~25,000 each (15 terminals = 375k according to chat)
- **Source:** Mission rewards (and possibly cases/rewards)
- **Trade Target:** Specific account via chat message "terminals for chicken"
- **Importance:** High-value items that are the end goal of automation

### Home/Token System
- **Token Display:** "Your current tokens: 115,624"
- **Token Conversion:** Can convert tokens → skins
- **Clicker:** "collect your money" on Home page
- **Click Mission:** Weekly mission requires 2250 clicks
- **Token Farming:** Primary resource for leveling and progression
