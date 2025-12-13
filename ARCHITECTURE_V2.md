# GetGood Architecture V2 - Complete Account Automation

## Mission Statement
**Automate fresh accounts from creation to terminal trading:**
1. Create fresh account (manual for now)
2. Auto-level to Master Guardian 1 (MG1) - unlocks trading
3. Complete missions to earn terminals
4. Auto-trade all terminals to main account

---

## Core Concept: Modular Function Library + Intelligent Orchestrator

```
┌─────────────────────────────────────────────────────────────┐
│                     ORCHESTRATOR                            │
│  (Decides what to do based on account state & priorities)  │
└────────────────┬────────────────────────────────────────────┘
                 │
                 │ Uses functions from:
                 ↓
┌─────────────────────────────────────────────────────────────┐
│              FUNCTION LIBRARY                               │
│  (Reusable modules for all possible actions)                │
├─────────────────────────────────────────────────────────────┤
│  • Token Farming                                            │
│  • Case Opening (any case type)                             │
│  • Item Extraction (specific items from cases)              │
│  • Games (Blackjack, Coinflip, Plinko, etc.)                │
│  • Trading (create, add items, post, monitor)               │
│  • Up-trading (10 items → 1 better item)                    │
│  • Inventory Management                                     │
│  • Mission Evaluation & Completion                          │
└─────────────────────────────────────────────────────────────┘
                 ↑
                 │ Evaluated by:
                 │
┌─────────────────────────────────────────────────────────────┐
│            MISSION EVALUATOR                                │
│  (Analyzes missions & determines how to complete them)      │
└─────────────────────────────────────────────────────────────┘
```

---

## 1. Mission Evaluator System

### Purpose
Analyze dynamic missions and determine the optimal completion strategy.

### Evaluation Questions
For each mission, the evaluator asks:

1. **What action is required?**
   - Open cases?
   - Extract specific items (knives, gloves, etc.)?
   - Play games?
   - Trade?
   - Up-trade items?
   - Click?
   - Win/lose games?

2. **What resources are needed?**
   - Which case contains the required item?
   - How much money/tokens needed?
   - Which game to play?
   - What items to trade?

3. **Is it automatable?**
   - Do we have a function for this?
   - What's the success probability?
   - What's the cost vs. reward?

4. **What's the priority?**
   - Does it give terminals?
   - Does it give XP for leveling?
   - Is it required for trading unlock?

### Mission Types (Examples)

| Mission Type | Evaluation | Function(s) Needed |
|-------------|------------|-------------------|
| "Open 300 gloves" | Case opening | `openCase('glove-case', 300)` |
| "Get 5 knives" | Item extraction | `extractItem('knife', 5)` → finds cases with knives |
| "Win 3 blackjack" | Game play | `playGame('blackjack', {target: 3, mode: 'win'})` |
| "Play 4 casebattles" | Game play | `playGame('casebattle', {count: 4})` |
| "Trade 10 skins" | Trading | `tradeSkins(10)` |
| "Up-trade 5 times" | Up-trading | `upTrade(5)` → 10 items → 1 better |
| "Click 2250 times" | Token farming | `clickTokens(2250)` |
| "Reach level 50" | XP farming | Orchestrator priority |

### Mission Evaluator Output

```javascript
{
  missionId: "daily_001",
  type: "case_opening",
  requirement: "Open 300 glove cases",
  strategy: {
    action: "openCases",
    caseId: "glove-case-id",
    quantity: 300,
    cost: 15000, // estimated
    estimatedTime: "10 minutes"
  },
  priority: 8, // 1-10 scale
  rewardType: "special_effect", // might be terminal!
  automatable: true
}
```

---

## 2. Modular Function Library

### 2.1 Core Functions

#### Account Management
- `getAccountState()` - level, tokens, rank, trading_unlocked
- `getBalance()` - money, tokens
- `checkTradingUnlocked()` - MG1 rank check

#### Token/Money Farming
- `clickTokens(count)` - home page clicking
- `farmTokens(duration)` - continuous token farming
- `convertTokensToSkins(amount)` - convert tokens

#### Case Operations
- `openCase(caseId, quantity, config)` - open cases
- `buyCases(caseId, quantity)` - buy cases
- `getOwnedCases()` - check owned cases
- `findCaseWithItem(itemType)` - which case has knives/gloves?

#### Item Extraction (NEW!)
- `extractSpecificItem(itemType, quantity)` - keeps opening until found
- `identifyRequiredCase(itemType)` - finds best case for item type
- `extractKnives(count)` - specialized for knife missions
- `extractGloves(count)` - specialized for glove missions

#### Game Automation
- `playGame(gameName, config)` - universal game player
- `playBlackjack(config)` - {target: wins, strategy: 'basic'}
- `playCoinflip(config)` - {count: games, bet: amount}
- `playCasebattle(config)` - {count: games, mode: 'join/host'}
- `playPlinko(config)`
- `playJackpot(config)`
- `playUpgrade(config)`
- `playDice(config)`
- `playGuessTheRank(config)`

#### Trading
- `createTrade()` - create new trade
- `addItemsToTrade(tradeId, itemIds)` - add items
- `postTradeInChat(tradeId, message)` - post trade link
- `monitorTrade(tradeId)` - watch for acceptance
- `confirmTradeComplete(tradeId)` - verify transfer

#### Up-Trading (NEW!)
- `upTrade(items)` - 10 similar items → 1 better item
- `findSimilarItems(targetValue)` - find 10 items of same value
- `calculateUpTradeValue(items)` - estimate result
- `performUpTrade(items)` - execute up-trade

#### Inventory
- `getInventory(filters)` - get inventory with filters
- `findTerminals()` - scan for terminals
- `findItemsByType(type)` - knives, gloves, etc.
- `sellItems(threshold)` - bulk sell
- `favoriteItems(criteria)` - protect valuable items

#### Missions
- `getMissions()` - get daily/weekly missions
- `evaluateMission(mission)` - run through evaluator
- `completeMission(missionId)` - auto-complete
- `claimReward(missionId)` - claim mission reward
- `checkForTerminals(reward)` - detect if reward is terminal

---

## 3. Orchestrator Logic

### Priority System

The orchestrator works in priority order:

```
PRIORITY 1: Trading Unlocked + Terminals Available
  → Create trade
  → Add all terminals
  → Post in chat: "terminals for chicken"
  → Monitor trade
  → Complete trade
  → LOOP (continue farming more terminals)

PRIORITY 2: Trading Unlocked + No Terminals
  → Complete missions (prioritize terminal rewards)
  → Farm 24h game limits for XP
  → Check inventory after each mission
  → If terminals found → PRIORITY 1

PRIORITY 3: Trading Locked (below MG1)
  → Farm tokens (home clicker)
  → Play games for XP (use 24h limits)
  → Open cases for XP
  → Complete missions for XP
  → Monitor rank
  → If MG1 reached → PRIORITY 2

PRIORITY 4: Resource Gathering
  → Farm money/tokens as needed for missions
  → Prepare resources for mission completion
```

### State Machine

```
START
  ↓
[Check Account State]
  ↓
Trading Unlocked? (MG1)
  ├─ NO ──→ [Level to MG1]
  │          ├─ Farm Tokens
  │          ├─ Play Games (24h limits)
  │          ├─ Open Cases for XP
  │          ├─ Complete XP Missions
  │          └─ LOOP until MG1
  │
  └─ YES ──→ [Scan Inventory for Terminals]
              ↓
         Terminals Found?
              ├─ YES ──→ [Trade Terminals to Main]
              │          ├─ Create Trade
              │          ├─ Add Terminals
              │          ├─ Post in Chat
              │          ├─ Monitor Trade
              │          └─ Confirm Complete
              │
              └─ NO ──→ [Farm Terminals]
                         ├─ Get Active Missions
                         ├─ Evaluate Each Mission
                         ├─ Complete High Priority Missions
                         ├─ Claim Rewards
                         ├─ Check for Terminals
                         └─ LOOP
```

---

## 4. Mission Completion Flow

```
[Get Active Missions]
  ↓
[For Each Mission]
  ↓
[Evaluate Mission] ← Mission Evaluator
  ↓
What's required?
  ├─ Open Cases ──→ Use openCase()
  ├─ Extract Items ──→ Use extractSpecificItem()
  ├─ Play Games ──→ Use playGame()
  ├─ Trade ──→ Use tradeSkins()
  ├─ Up-Trade ──→ Use upTrade()
  └─ Click ──→ Use clickTokens()
  ↓
[Execute Function]
  ↓
[Check Progress]
  ↓
Complete? ──→ [Claim Reward] ──→ [Check for Terminal]
  │
  └─ NO ──→ [Continue Execution]
```

---

## 5. Implementation Phases (REVISED)

### Phase 1: Core Infrastructure
**Goal:** Basic account monitoring and token farming

**Modules:**
1. Account Monitor - track state
2. Token Farmer (home clicker)
3. API wrapper - all endpoints
4. Config system - settings
5. Logging system

**Deliverable:** Can monitor account and farm tokens

---

### Phase 2: Case Operations & Item Extraction
**Goal:** Open cases and extract specific items

**Modules:**
1. Case Opener - universal case opening
2. Case Database - which cases have which items
3. Item Extractor - get specific items (knives, gloves, etc.)
4. Inventory Scanner - track what we have

**Deliverable:** Can complete case-related missions

---

### Phase 3: Game Automation
**Goal:** Play all games for XP and missions

**Modules:**
1. Game Limits Tracker - 24h limits
2. Blackjack Bot - basic strategy
3. Coinflip Bot - high volume game
4. Other Game Bots - as needed
5. Game Scheduler - optimal order

**Deliverable:** Can complete game missions and use 24h limits

---

### Phase 4: Mission System
**Goal:** Intelligent mission evaluation and completion

**Modules:**
1. Mission Tracker - get missions
2. **Mission Evaluator** - analyze and strategize
3. Mission Executor - dispatch to correct functions
4. Reward Claimer - claim rewards
5. Terminal Detector - identify terminals in rewards

**Deliverable:** Can auto-complete any mission type

---

### Phase 5: Trading System
**Goal:** Auto-trade terminals to main account

**Modules:**
1. Trade Creator - create trades
2. Item Manager - add items to trades
3. Chat Poster - post trade links
4. Trade Monitor - watch for acceptance
5. Trade Verifier - confirm completion

**Deliverable:** Can auto-trade terminals

---

### Phase 6: Up-Trading & Advanced Features
**Goal:** Complete advanced mission types

**Modules:**
1. Up-Trader - 10→1 upgrades
2. Similar Item Finder - group items by value
3. Advanced Trading - complex trade scenarios

**Deliverable:** Can complete up-trade missions

---

### Phase 7: Orchestrator & Full Automation
**Goal:** Coordinate everything into full automation

**Modules:**
1. **Orchestrator** - main coordinator
2. Priority System - decide what to do
3. State Machine - manage transitions
4. Error Recovery - handle failures
5. Multi-Account Manager - run multiple accounts

**Deliverable:** Fully automated account → terminal farming → trading

---

### Phase 8: Account Creation (Future)
**Goal:** Automate account creation too

**Tasks:**
- Captcha solving
- Email verification
- Initial setup
- First login

**Note:** Manual for now, automate later

---

## 6. Key Differences from V1

| Aspect | V1 (Old) | V2 (New) |
|--------|----------|----------|
| **Goal** | Single account automation | Fresh account → terminal farm → trade |
| **Missions** | Hardcoded for specific missions | Dynamic evaluator for any mission |
| **Architecture** | Phase-based modules | Modular function library |
| **Functions** | Specific to each phase | Reusable across all phases |
| **Item Handling** | Generic case opening | Specific item extraction |
| **Trading** | One-time terminal trade | Continuous farming + trading loop |
| **Scope** | Get to trading, trade once | Complete automation cycle |

---

## 7. Success Metrics

### Account Lifecycle
- Fresh Account Created ✓
- Leveled to MG1 ✓
- First Terminal Earned ✓
- First Terminal Traded ✓
- Continuous Terminal Farming ✓

### Performance
- Time to MG1: Target < 24h
- Terminals per day: Target 5+
- Mission completion rate: Target 80%+
- Trade success rate: Target 100%

---

## 8. Next Steps

### Immediate (This Session)
1. ✅ Understand new architecture
2. Update GitHub issues to match V2
3. Create Mission Evaluator design doc
4. Start Phase 1: Core Infrastructure

### Short Term
- Build function library incrementally
- Test each function in isolation
- API endpoint discovery as we go

### Long Term
- Complete all 8 phases
- Multi-account support
- Account creation automation
