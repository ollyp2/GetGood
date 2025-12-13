# GetGood - Node.js Orchestrator Architecture

**Last Updated:** 2025-12-14
**Version:** 1.0
**Target:** Single-account end-to-end automation (scales to multi-account later)

---

## Overview

A **Node.js-based orchestrator** that automates case-clicker.com accounts from creation through Global rank. Designed for single-account automation first, with architecture that scales to 10+ parallel accounts.

---

## Design Principles

1. **API-First:** All actions via case-clicker.com API (headless automation)
2. **Modular:** Independent modules with clear responsibilities
3. **Stateful:** Persistent state tracking (resume after crashes)
4. **Observable:** Real-time logging and monitoring
5. **Scalable:** Single account → Multi-account without rewrite

---

## Technology Stack

### Core
- **Runtime:** Node.js 18+ (ESM modules)
- **HTTP Client:** `axios` (API calls)
- **Browser Automation:** `puppeteer` (login, complex UI interactions if needed)
- **Database:** `lowdb` or `sqlite3` (state persistence)
- **Scheduler:** `node-cron` (mission timers, daily tasks)
- **Logging:** `winston` (structured logging)

### Optional
- **WebSocket:** `ws` (if case-clicker uses WebSockets for chat/trades)
- **Dashboard:** `express` + `socket.io` (web UI for monitoring)
- **Testing:** `vitest` (unit tests for modules)

---

## Project Structure

```
GetGood/
├── orchestrator/              # Node.js orchestrator (NEW!)
│   ├── src/
│   │   ├── core/
│   │   │   ├── apiClient.js          # Axios wrapper for case-clicker API
│   │   │   ├── accountManager.js     # Account state & credentials
│   │   │   ├── stateManager.js       # Persistent state (db)
│   │   │   ├── logger.js             # Winston logger
│   │   │   └── config.js             # Configuration
│   │   │
│   │   ├── modules/
│   │   │   ├── clickFarmer.js        # Phase 1: Click freeze automation
│   │   │   ├── caseOpener.js         # Buy & open D&N cases
│   │   │   ├── autoFavoriter.js      # Auto-favorite patterns/floats
│   │   │   ├── autoSeller.js         # Custom sell automation
│   │   │   ├── missionSystem.js      # Read, complete, claim missions
│   │   │   ├── rewardCollector.js    # Collect rewards tab
│   │   │   ├── skillmapManager.js    # Phase 3: Skillmap progression
│   │   │   ├── tradingSystem.js      # Create trades, post chat
│   │   │   └── inventoryScanner.js   # Scan for terminals
│   │   │
│   │   ├── phases/
│   │   │   ├── phase1.js             # Click freeze coordinator
│   │   │   ├── phase2.js             # Level to MG1
│   │   │   └── phase3.js             # Level to Global
│   │   │
│   │   ├── orchestrator.js           # Main coordinator (state machine)
│   │   └── index.js                  # Entry point
│   │
│   ├── db/
│   │   └── accounts.json             # LowDB account state
│   │
│   ├── logs/
│   │   └── orchestrator.log          # Winston logs
│   │
│   ├── config/
│   │   ├── accounts.json             # Account credentials
│   │   └── settings.json             # Global settings
│   │
│   ├── package.json
│   └── README.md
│
├── case-clicker-assistant.user.js   # Existing Tampermonkey script
├── case-clicker-autosell.user.js    # Existing Tampermonkey script
├── MilestonesRoad                    # German roadmap
├── SESSION.md                        # Project status
├── ARCHITECTURE_V2.md                # V2 architecture
└── ORCHESTRATOR_ARCHITECTURE.md     # This file
```

---

## Core Modules

### 1. API Client (`apiClient.js`)

Wrapper for all case-clicker.com API calls.

**Methods:**
```javascript
class APIClient {
  constructor(sessionToken)

  // Account
  getMe()                          // GET /api/me

  // Cases
  buyCases(caseId, amount)         // POST /api/cases
  getOwnedCases()                  // GET /api/cases
  openCase(caseId, count, config)  // POST /api/open/case

  // Inventory
  getInventory()                   // GET /api/inventory (to discover)
  sellForMoney(threshold)          // DELETE /api/inventory
  sellForTokens(threshold)         // PATCH /api/inventory

  // Missions (to discover)
  getMissions()                    // GET /api/missions
  claimMission(missionId)          // POST /api/missions/:id/claim

  // Trading (to discover)
  createTrade()                    // POST /api/trade
  addItemsToTrade(tradeId, items)  // POST /api/trade/:id/items
  confirmTrade(tradeId)            // POST /api/trade/:id/confirm

  // Chat (to discover)
  sendChatMessage(message)         // POST /api/chat
  getChatMessages()                // GET /api/chat

  // Rewards (to discover)
  getRewards()                     // GET /api/rewards
  claimReward(rewardId)            // POST /api/rewards/:id/claim

  // Skillmap (to discover)
  getSkillmap()                    // GET /api/skillmap
  setSkillPoint(skillId)           // POST /api/skillmap/:id

  // Home/Clicking (to discover)
  clickToken()                     // POST /api/click (?)
}
```

**Features:**
- Automatic retry on 429 (rate limit)
- Error handling & logging
- Session management (cookies/tokens)

---

### 2. Account Manager (`accountManager.js`)

Manages account state and credentials.

**State Tracking:**
```javascript
{
  accountId: "acc_001",
  username: "bot_account_1",
  sessionToken: "...",
  state: {
    phase: 1,                    // Current phase (1, 2, or 3)
    level: 5,
    rank: "Silver 3",
    tokens: 115624,
    money: 50000,
    tradingUnlocked: false,
    clickFreezeStarted: "2025-12-14T00:00:00Z",
    clickFreezeEnds: "2025-12-16T00:00:00Z",
    missionsClaimed: ["mission_123"],
    skillmapProgress: { ... },
  },
  lastUpdate: "2025-12-14T12:00:00Z"
}
```

**Methods:**
```javascript
class AccountManager {
  loadAccount(accountId)
  saveAccount(account)
  updateState(accountId, updates)
  getPhase(accountId)             // Returns current phase
  isClickFreezeActive(accountId)  // Check if in 2-day freeze
  isTradingUnlocked(accountId)    // Check if MG1+
}
```

---

### 3. State Manager (`stateManager.js`)

Persistent storage using LowDB or SQLite.

**Database Schema:**
```javascript
{
  accounts: [
    { id: "acc_001", ... },
    { id: "acc_002", ... }
  ],
  globalState: {
    activeAccounts: 2,
    clickFreezeQueue: ["acc_001", "acc_003"], // Max 3
    lastSync: "2025-12-14T12:00:00Z"
  }
}
```

---

### 4. Module: Click Farmer (`clickFarmer.js`)

**Phase 1:** Automate 2-day click freeze.

**Logic:**
```javascript
async function runClickFreeze(accountId) {
  const account = accountManager.loadAccount(accountId);

  // Check if freeze period active (2 days from start)
  if (!isClickFreezeActive(account)) {
    logger.info('Click freeze completed');
    return;
  }

  // Click tokens continuously
  while (isClickFreezeActive(account)) {
    await apiClient.clickToken();
    logger.debug('Clicked token');
    await sleep(100); // 100ms between clicks
  }

  // Update phase to 2 after freeze
  accountManager.updateState(accountId, { phase: 2 });
}
```

**Click Freeze Queue:**
- Max 3 accounts clicking simultaneously
- Queue additional accounts
- Start next account when one completes

---

### 5. Module: Case Opener (`caseOpener.js`)

Buy and open Dreams & Nightmares cases with auto-sell + auto-favorite.

**Logic:**
```javascript
async function openCasesWithAutoConfig(accountId, caseId, count) {
  const config = {
    quickOpen: true,
    count: count,
    useEventTickets: false,
    caseOpenMultiplier: 1,
    autoOpenConfig: {
      autosellActivated: true,
      autosellAmount: 100000,      // Custom sell value
      autosellVariant: "money",
      favoriteHighFloats: false,
      favoriteLowFloats: true,      // Favorite low floats
      favoritePatterns: true,       // Favorite patterns
      customHighFloat: 0.99999,
      customLowFloat: 0.0000001,
      customSelectedFloats: ["0.123456", "0.42069"],
      favoriteCustomFloats: true
    }
  };

  // Buy cases if needed
  const ownedCases = await apiClient.getOwnedCases();
  const owned = ownedCases.find(c => c._id === caseId)?.amount || 0;

  if (owned < count) {
    const toBuy = count - owned;
    await apiClient.buyCases(caseId, toBuy);
    logger.info(`Bought ${toBuy} cases`);
  }

  // Open cases
  const result = await apiClient.openCase(caseId, count, config);
  logger.info(`Opened ${count} cases, auto-sold ${result.autoSellInfo.count} items for ${result.autoSellInfo.cost}`);

  return result;
}
```

---

### 6. Module: Mission System (`missionSystem.js`)

Read, evaluate, complete, and claim missions.

**Mission Evaluator:**
```javascript
async function evaluateMission(mission) {
  // Parse mission requirement
  // Example: "Open 300 glove cases"
  const requirement = parseMissionText(mission.description);

  // Determine strategy
  if (requirement.type === 'open_cases') {
    return {
      action: 'openCases',
      caseId: findCaseId(requirement.caseType),
      quantity: requirement.quantity,
      priority: mission.reward.includes('terminal') ? 10 : 5
    };
  }

  // More mission types...
  // - Play games: { action: 'playGame', game: 'blackjack', ... }
  // - Win games: { action: 'winGames', game: 'blackjack', count: 3 }
  // - Click: { action: 'clickTokens', count: 2250 }
  // - Trade: { action: 'trade', ... }
}

async function completeMission(accountId, mission) {
  const strategy = await evaluateMission(mission);

  switch (strategy.action) {
    case 'openCases':
      await caseOpener.openCasesWithAutoConfig(accountId, strategy.caseId, strategy.quantity);
      break;
    case 'playGame':
      await gamePlayer.playGame(accountId, strategy.game, strategy.config);
      break;
    case 'clickTokens':
      await clickFarmer.clickTokens(accountId, strategy.count);
      break;
    // ... more actions
  }

  // Claim reward
  await apiClient.claimMission(mission.id);
  logger.info(`Completed mission: ${mission.description}`);
}
```

**Auto-Favorite Terminals:**
```javascript
async function autoFavoriteTerminals(accountId) {
  const inventory = await apiClient.getInventory();
  const terminals = inventory.filter(item => item.type === 'special_effect' && item.name.includes('Terminal'));

  for (const terminal of terminals) {
    await apiClient.favoriteItem(terminal.id);
    logger.info(`Favorited terminal: ${terminal.name}`);
  }
}
```

---

### 7. Module: Skillmap Manager (`skillmapManager.js`)

**Phase 3:** Progressively unlock skillmap in order.

**Logic:**
```javascript
async function progressSkillmap(accountId) {
  const skillmap = await apiClient.getSkillmap();
  const account = accountManager.loadAccount(accountId);

  // Skill priority order (to be defined based on optimal path)
  const skillOrder = ['skill_1', 'skill_2', 'skill_3', ...];

  for (const skillId of skillOrder) {
    const skill = skillmap.find(s => s.id === skillId);

    if (!skill.unlocked && account.state.skillPoints > 0) {
      await apiClient.setSkillPoint(skillId);
      logger.info(`Unlocked skill: ${skill.name}`);
      account.state.skillPoints--;
    }
  }
}
```

---

## Phase Coordinators

### Phase 1: Click Freeze (`phase1.js`)

```javascript
async function runPhase1(accountId) {
  logger.info(`[Phase 1] Starting click freeze for ${accountId}`);

  // Set freeze start time
  const freezeStart = new Date();
  const freezeEnd = new Date(freezeStart.getTime() + 2 * 24 * 60 * 60 * 1000); // +2 days

  accountManager.updateState(accountId, {
    phase: 1,
    clickFreezeStarted: freezeStart.toISOString(),
    clickFreezeEnds: freezeEnd.toISOString()
  });

  // Run click farmer
  await clickFarmer.runClickFreeze(accountId);

  logger.info(`[Phase 1] Click freeze completed for ${accountId}`);

  // Transition to Phase 2
  accountManager.updateState(accountId, { phase: 2 });
}
```

### Phase 2: Level to MG1 (`phase2.js`)

```javascript
async function runPhase2(accountId) {
  logger.info(`[Phase 2] Leveling to MG1 for ${accountId}`);

  const DREAMS_NIGHTMARES_CASE_ID = "63529100e4821cab2f1c5ed2";

  while (!accountManager.isTradingUnlocked(accountId)) {
    // 1. Open Dreams & Nightmares cases
    await caseOpener.openCasesWithAutoConfig(accountId, DREAMS_NIGHTMARES_CASE_ID, 100);

    // 2. Complete missions
    const missions = await apiClient.getMissions();
    for (const mission of missions) {
      await missionSystem.completeMission(accountId, mission);
    }

    // 3. Auto-favorite terminals
    await missionSystem.autoFavoriteTerminals(accountId);

    // 4. Collect rewards
    await rewardCollector.collectAllRewards(accountId);

    // 5. Update account state
    const me = await apiClient.getMe();
    accountManager.updateState(accountId, {
      level: me.level,
      rank: me.rank,
      tradingUnlocked: me.rank >= 'Master Guardian 1'
    });

    logger.info(`Current rank: ${me.rank}`);

    // Sleep between loops (avoid rate limits)
    await sleep(5000);
  }

  logger.info(`[Phase 2] MG1 reached for ${accountId}`);

  // Transition to Phase 3
  accountManager.updateState(accountId, { phase: 3 });
}
```

### Phase 3: Level to Global (`phase3.js`)

```javascript
async function runPhase3(accountId) {
  logger.info(`[Phase 3] Leveling to Global for ${accountId}`);

  const DREAMS_NIGHTMARES_CASE_ID = "63529100e4821cab2f1c5ed2";
  const TARGET_RANK = "Global Elite";

  while (accountManager.getAccount(accountId).state.rank !== TARGET_RANK) {
    // 1. Open cases (same as Phase 2)
    await caseOpener.openCasesWithAutoConfig(accountId, DREAMS_NIGHTMARES_CASE_ID, 100);

    // 2. Complete missions (same as Phase 2)
    const missions = await apiClient.getMissions();
    for (const mission of missions) {
      await missionSystem.completeMission(accountId, mission);
    }

    // 3. Auto-favorite terminals
    await missionSystem.autoFavoriteTerminals(accountId);

    // 4. Progress skillmap (NEW in Phase 3!)
    await skillmapManager.progressSkillmap(accountId);

    // 5. Collect rewards
    await rewardCollector.collectAllRewards(accountId);

    // 6. Update account state
    const me = await apiClient.getMe();
    accountManager.updateState(accountId, {
      level: me.level,
      rank: me.rank
    });

    logger.info(`Current rank: ${me.rank}, Level: ${me.level}`);

    await sleep(5000);
  }

  logger.info(`[Phase 3] Global Elite reached for ${accountId}!`);
}
```

---

## Main Orchestrator (`orchestrator.js`)

State machine that coordinates all phases.

```javascript
class Orchestrator {
  async run(accountId) {
    const account = accountManager.loadAccount(accountId);

    logger.info(`Starting orchestrator for ${accountId} (Phase ${account.state.phase})`);

    while (true) {
      const currentPhase = accountManager.getPhase(accountId);

      try {
        switch (currentPhase) {
          case 1:
            await phase1.runPhase1(accountId);
            break;
          case 2:
            await phase2.runPhase2(accountId);
            break;
          case 3:
            await phase3.runPhase3(accountId);
            // Phase 3 completes when Global is reached
            logger.info(`${accountId} reached Global! Automation complete.`);
            return;
          default:
            throw new Error(`Unknown phase: ${currentPhase}`);
        }
      } catch (error) {
        logger.error(`Error in Phase ${currentPhase}: ${error.message}`);

        // Error recovery (wait & retry)
        await sleep(60000); // 1 minute
      }
    }
  }
}
```

---

## Entry Point (`index.js`)

```javascript
import { Orchestrator } from './orchestrator.js';
import { logger } from './core/logger.js';
import { accountManager } from './core/accountManager.js';

async function main() {
  const accountId = process.argv[2] || 'acc_001';

  logger.info('=== GetGood Orchestrator Starting ===');
  logger.info(`Target Account: ${accountId}`);

  const orchestrator = new Orchestrator();

  try {
    await orchestrator.run(accountId);
  } catch (error) {
    logger.error(`Fatal error: ${error.message}`);
    process.exit(1);
  }
}

main();
```

**Usage:**
```bash
cd orchestrator
npm install
node src/index.js acc_001
```

---

## API Endpoints to Discover

Currently **unknown** endpoints we need to discover:

- [ ] `GET /api/missions` - Get daily/weekly missions
- [ ] `POST /api/missions/:id/claim` - Claim mission reward
- [ ] `GET /api/inventory` - Get full inventory
- [ ] `POST /api/inventory/:id/favorite` - Favorite an item
- [ ] `GET /api/rewards` - Get rewards tab
- [ ] `POST /api/rewards/:id/claim` - Claim reward
- [ ] `GET /api/skillmap` - Get skillmap state
- [ ] `POST /api/skillmap/:id` - Set skill point
- [ ] `POST /api/click` - Click for tokens (home page)
- [ ] `POST /api/trade` - Create trade
- [ ] `POST /api/trade/:id/items` - Add items to trade
- [ ] `POST /api/chat` - Send chat message
- [ ] `GET /api/chat` - Get chat messages
- [ ] WebSocket endpoints (if any)

**Discovery Method:**
1. Open browser DevTools on case-clicker.com
2. Monitor Network tab while performing actions
3. Document endpoints, payloads, responses
4. Add to `apiClient.js`

---

## Scaling to Multi-Account

Once single-account automation works, extend to multi-account:

### Click Freeze Queue Manager

```javascript
class ClickFreezeQueue {
  constructor(maxConcurrent = 3) {
    this.maxConcurrent = maxConcurrent;
    this.active = [];
    this.queue = [];
  }

  async addAccount(accountId) {
    if (this.active.length < this.maxConcurrent) {
      this.active.push(accountId);
      this.startClickFreeze(accountId);
    } else {
      this.queue.push(accountId);
      logger.info(`${accountId} queued for click freeze (${this.queue.length} in queue)`);
    }
  }

  async startClickFreeze(accountId) {
    logger.info(`Starting click freeze for ${accountId} (${this.active.length}/${this.maxConcurrent} active)`);

    await phase1.runPhase1(accountId);

    // Remove from active, start next in queue
    this.active = this.active.filter(id => id !== accountId);

    if (this.queue.length > 0) {
      const nextAccountId = this.queue.shift();
      this.addAccount(nextAccountId);
    }
  }
}
```

### Multi-Account Orchestrator

```javascript
async function runMultiAccount(accountIds) {
  const orchestrators = accountIds.map(id => new Orchestrator());

  // Run all accounts in parallel
  await Promise.all(
    accountIds.map((id, i) => orchestrators[i].run(id))
  );

  logger.info('All accounts completed!');
}

// Usage
runMultiAccount(['acc_001', 'acc_002', 'acc_003']);
```

---

## Implementation Roadmap

### Step 1: Setup (Week 1)
- [ ] Initialize Node.js project
- [ ] Install dependencies (axios, lowdb, winston, etc.)
- [ ] Create folder structure
- [ ] Setup logger & config system
- [ ] Create account state schema

### Step 2: API Discovery (Week 1-2)
- [ ] Login system (puppeteer for session token)
- [ ] Document all API endpoints
- [ ] Build `apiClient.js` wrapper
- [ ] Test all endpoints with Postman/Insomnia

### Step 3: Phase 1 - Click Freeze (Week 2)
- [ ] Implement `clickFarmer.js`
- [ ] Implement `phase1.js`
- [ ] Test 2-day freeze with 1 account
- [ ] Implement click freeze queue (3 max)

### Step 4: Phase 2 - Level to MG1 (Week 3)
- [ ] Implement `caseOpener.js`
- [ ] Implement `missionSystem.js` (mission evaluator)
- [ ] Implement `autoFavoriter.js`
- [ ] Implement `rewardCollector.js`
- [ ] Implement `phase2.js`
- [ ] Test full MG1 leveling on 1 account

### Step 5: Phase 3 - Level to Global (Week 4)
- [ ] Implement `skillmapManager.js`
- [ ] Implement `phase3.js`
- [ ] Test full Global leveling on 1 account

### Step 6: Multi-Account Scaling (Week 5)
- [ ] Implement `ClickFreezeQueue`
- [ ] Test with 3 accounts simultaneously
- [ ] Scale to 10 accounts
- [ ] Add monitoring dashboard (optional)

---

## Monitoring & Logging

### Logger Configuration (Winston)

```javascript
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(info => `[${info.timestamp}] ${info.level}: ${info.message}`)
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/orchestrator.log' }),
    new winston.transports.Console()
  ]
});
```

### Real-Time Dashboard (Optional)

Express + Socket.io dashboard to monitor all accounts:

```
┌─────────────────────────────────────────────────┐
│          GetGood Orchestrator Dashboard         │
├─────────────────────────────────────────────────┤
│ Active Accounts: 3/10                           │
│ Click Freeze Queue: 2 waiting                   │
├─────────────────────────────────────────────────┤
│ acc_001  │ Phase 3 │ Level 45 │ MG2     │ 🟢   │
│ acc_002  │ Phase 2 │ Level 12 │ Silver  │ 🟢   │
│ acc_003  │ Phase 1 │ Level 2  │ Unranked│ 🟡   │
├─────────────────────────────────────────────────┤
│ Recent Logs:                                    │
│ [12:05] acc_001: Completed mission "Win 3 BJ"  │
│ [12:04] acc_002: Opened 100 D&N cases          │
│ [12:03] acc_003: Click freeze 25% complete     │
└─────────────────────────────────────────────────┘
```

---

## Summary

**Architecture:** Node.js orchestrator manages account lifecycle through 3 phases.

**Single-Account Flow:**
1. **Phase 1:** 2-day click freeze (MoneyClickBonus)
2. **Phase 2:** Level to MG1 (cases + missions)
3. **Phase 3:** Level to Global (cases + missions + skillmap)

**Scaling:** Queue system for click freeze (max 3), parallel orchestrators for Phases 2/3.

**Next Steps:**
1. Discover missing API endpoints
2. Build API client wrapper
3. Implement Phase 1 (click freeze)
4. Test with 1-2 accounts
5. Scale to 10 accounts

---

**Ready to start implementation?** Let me know and we'll begin with API endpoint discovery and project setup!
