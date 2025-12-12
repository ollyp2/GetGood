# GitHub Project Board Setup

## Board Name
**GetGood - Case Clicker Automation**

## Board Description
Automated system for case-clicker.com: Level up → Complete missions → Auto-trade terminals

## Columns Structure

### 1. 💡 Ideas
Brainstorming and feature ideas that need discussion/approval

### 2. 📋 To Do
Approved tasks ready to be worked on

### 3. 🔨 In Development
Currently being implemented

### 4. 🧪 Testing
Implementation complete, needs testing

### 5. ✅ Done
Completed and tested

### 6. 🚀 Released
Deployed/Released features

---

## Initial Issues to Create

### Epic: Core Infrastructure
- [ ] **#1: Project Setup & Documentation**
  - Labels: `documentation`, `setup`
  - Column: Done
  - Description: Initial README, API docs, project structure

### Epic: Phase 1 - Account Monitoring
- [ ] **#2: Account Monitor Module**
  - Labels: `module`, `phase-1`
  - Column: To Do
  - Description: Track level, tokens, rank, trading unlock status via `/api/me`
  - Acceptance Criteria:
    - Polls /api/me endpoint
    - Detects current rank (MG1 = trading unlocked)
    - Emits events on state changes
    - Exposes: level, tokens, rank, trading_unlocked

### Epic: Phase 2 - Token Farming
- [ ] **#3: Home Clicker Module**
  - Labels: `module`, `phase-2`, `token-farming`
  - Column: To Do
  - Description: Auto-click on home page to collect tokens (for "Click 2250 times" mission)
  - Research Needed:
    - What's the API endpoint for clicking?
    - Is there a rate limit?
  - Acceptance Criteria:
    - Auto-clicks when on home page
    - Tracks click count
    - Respects rate limits

- [ ] **#4: Game Limits Tracker**
  - Labels: `module`, `phase-2`, `tracking`
  - Column: To Do
  - Description: Track 24h game limits and remaining plays
  - Games to track:
    - Casebattle (93 hosted, 291 joined)
    - Coinflip (179 hosted, 397 joined)
    - Upgrade (283 games)
    - Dice (454 games)
    - Guess the Rank (12 games)
    - Jackpot (183 games)
    - Blackjack (0 games - fully used)
    - Plinko (11 games)
  - Acceptance Criteria:
    - Fetches game limits from API or parses from page
    - Calculates remaining plays
    - Prioritizes games with limits remaining

- [ ] **#5: Game Automation - Blackjack**
  - Labels: `module`, `phase-2`, `game-automation`
  - Column: To Do
  - Description: Automate Blackjack gameplay (simplest game, good for missions)
  - Research Needed:
    - Blackjack API endpoints
    - Optimal strategy (basic blackjack strategy)
  - Acceptance Criteria:
    - Plays blackjack automatically
    - Uses basic strategy
    - Tracks wins/losses
    - Stops when daily limit reached

- [ ] **#6: Game Automation - Coinflip**
  - Labels: `module`, `phase-2`, `game-automation`
  - Column: To Do
  - Description: Automate Coinflip (high volume game)
  - Acceptance Criteria:
    - Joins coinflip games
    - Uses minimal bet
    - Stops when daily limit reached

- [ ] **#7: Game Automation - Other Games**
  - Labels: `module`, `phase-2`, `game-automation`, `future`
  - Column: Ideas
  - Description: Automate remaining games (Upgrade, Dice, Plinko, etc.)

### Epic: Phase 3 - Mission System
- [ ] **#8: Mission Tracker**
  - Labels: `module`, `phase-3`
  - Column: To Do
  - Description: Fetch and track daily/weekly missions
  - Research Needed:
    - Missions API endpoint (likely /api/missions)
    - Mission status/progress tracking
  - Acceptance Criteria:
    - Fetches daily missions
    - Fetches weekly missions
    - Tracks progress for each mission
    - Identifies completable missions

- [ ] **#9: Mission Completion - Blackjack**
  - Labels: `module`, `phase-3`, `mission-automation`
  - Column: To Do
  - Description: Auto-complete blackjack-related missions
  - Missions:
    - "Get a natural Blackjack in 1 blackjack game"
    - "Win 3 blackjack games"
  - Acceptance Criteria:
    - Detects blackjack missions
    - Plays until mission complete
    - Claims reward

- [ ] **#10: Mission Completion - Games**
  - Labels: `module`, `phase-3`, `mission-automation`
  - Column: To Do
  - Description: Auto-complete game missions
  - Missions:
    - "Play 4 casebattles"
    - "Lose 2 casebattles"
    - "Win 1 jackpot"
    - "Win 90 plinko games"
    - "Win 2 casebattles"
  - Acceptance Criteria:
    - Detects game missions
    - Executes required games
    - Claims rewards

- [ ] **#11: Mission Completion - Cases**
  - Labels: `module`, `phase-3`, `mission-automation`
  - Column: To Do
  - Description: Auto-complete case opening missions
  - Missions:
    - "Open 300 gloves"
  - Acceptance Criteria:
    - Opens required cases
    - Claims reward

- [ ] **#12: Mission Completion - Clicks**
  - Labels: `module`, `phase-3`, `mission-automation`
  - Column: To Do
  - Description: Auto-complete click mission using Home Clicker
  - Missions:
    - "Click 2250 times"
  - Acceptance Criteria:
    - Uses Home Clicker module
    - Tracks clicks
    - Claims reward when done

- [ ] **#13: Rewards System**
  - Labels: `module`, `phase-3`
  - Column: To Do
  - Description: Claim mission rewards (Special Effects including Terminals)
  - Research Needed:
    - Reward claiming API
    - How to detect terminals in rewards
  - Acceptance Criteria:
    - Claims mission rewards
    - Detects if reward is a Terminal
    - Logs terminal acquisitions

### Epic: Phase 4 - Inventory System
- [ ] **#14: Inventory Scanner**
  - Labels: `module`, `phase-4`
  - Column: To Do
  - Description: Scan inventory for terminals
  - Research Needed:
    - Inventory API endpoint (likely /api/inventory)
    - How terminals are identified (name? type? rarity?)
  - Acceptance Criteria:
    - Fetches full inventory
    - Filters for terminals
    - Returns list of terminal items
    - Tracks terminal count

- [ ] **#15: Special Effects Management**
  - Labels: `module`, `phase-4`, `future`
  - Column: Ideas
  - Description: Activate/manage Special Effects from inventory
  - Note: May not be needed for core automation

### Epic: Phase 5 - Trading System
- [ ] **#16: Trade Creator**
  - Labels: `module`, `phase-5`
  - Column: To Do
  - Description: Create new trade
  - Research Needed:
    - Trade creation API endpoint
    - Trade ID format
  - Acceptance Criteria:
    - Creates new trade
    - Returns trade ID
    - Returns trade link

- [ ] **#17: Trade Item Manager**
  - Labels: `module`, `phase-5`
  - Column: To Do
  - Description: Add items (terminals) to trade
  - Research Needed:
    - Add items to trade API
    - Item ID format
  - Acceptance Criteria:
    - Adds specified items to trade
    - Handles multiple items
    - Confirms items added

- [ ] **#18: Trade Poster**
  - Labels: `module`, `phase-5`
  - Column: To Do
  - Description: Post trade link in global chat with "terminals for chicken"
  - Research Needed:
    - Chat API endpoint
    - Message format
  - Acceptance Criteria:
    - Posts message to global chat
    - Includes trade link
    - Includes "terminals for chicken" text

### Epic: Phase 6 - Chat System
- [ ] **#19: Chat Monitor**
  - Labels: `module`, `phase-6`
  - Column: To Do
  - Description: Monitor global chat for messages
  - Research Needed:
    - Chat polling API or WebSocket
    - Message format
  - Acceptance Criteria:
    - Monitors global chat
    - Detects new messages
    - Emits chat events

- [ ] **#20: Trade Status Tracker**
  - Labels: `module`, `phase-6`
  - Column: To Do
  - Description: Track trade status (accepted/rejected/completed)
  - Research Needed:
    - Trade status API
    - Trade completion events
  - Acceptance Criteria:
    - Monitors active trades
    - Detects trade acceptance
    - Detects trade completion
    - Confirms terminal transfer

### Epic: Phase 7 - Orchestration
- [ ] **#21: Orchestrator - State Machine**
  - Labels: `module`, `phase-7`, `core`
  - Column: To Do
  - Description: Main coordinator implementing state machine
  - States:
    1. Monitor Account
    2. Check Trading Unlocked (MG1 rank)
    3. Farm Tokens (if trading locked)
    4. Complete Missions
    5. Scan Inventory for Terminals
    6. Create Trade (if terminals found)
    7. Post in Chat
    8. Monitor Trade
    9. Loop
  - Acceptance Criteria:
    - Implements state machine
    - Coordinates all modules
    - Handles errors gracefully
    - Logs all state transitions

- [ ] **#22: Configuration System**
  - Labels: `module`, `phase-7`
  - Column: To Do
  - Description: Central configuration for all modules
  - Config Items:
    - Target account for terminal trades
    - Game automation priorities
    - Mission priorities
    - Token farming settings
    - Rate limits
  - Acceptance Criteria:
    - Loads config from file
    - Validates config
    - Shares config with all modules

- [ ] **#23: Logging & Monitoring**
  - Labels: `module`, `phase-7`, `infrastructure`
  - Column: To Do
  - Description: Centralized logging and monitoring
  - Acceptance Criteria:
    - Logs all major events
    - Logs API requests/responses
    - Logs errors
    - Tracks statistics (missions completed, terminals traded, etc.)

### Epic: Testing & Release
- [ ] **#24: Integration Testing**
  - Labels: `testing`
  - Column: To Do
  - Description: Test all modules working together
  - Test Scenarios:
    - Full flow from farming to trading
    - Error handling
    - Rate limiting
    - State persistence

- [ ] **#25: v1.0 Release**
  - Labels: `release`
  - Column: To Do
  - Description: First production release
  - Includes:
    - All core modules
    - Basic automation
    - Documentation
    - Installation guide

---

## Labels to Create

- `documentation` - Documentation tasks
- `setup` - Setup and configuration
- `module` - Module implementation
- `phase-1` - Phase 1 tasks
- `phase-2` - Phase 2 tasks
- `phase-3` - Phase 3 tasks
- `phase-4` - Phase 4 tasks
- `phase-5` - Phase 5 tasks
- `phase-6` - Phase 6 tasks
- `phase-7` - Phase 7 tasks
- `token-farming` - Token farming related
- `game-automation` - Game automation
- `mission-automation` - Mission automation
- `tracking` - Tracking/monitoring features
- `core` - Core functionality
- `infrastructure` - Infrastructure tasks
- `testing` - Testing tasks
- `release` - Release tasks
- `future` - Future enhancements
- `research` - Needs research/investigation
- `bug` - Bug fixes

---

## How to Create the Board

1. Go to https://github.com/ollyp2/GetGood
2. Click "Projects" tab
3. Click "New project"
4. Choose "Board" template
5. Name it: **GetGood - Case Clicker Automation**
6. Add columns as listed above
7. Create issues using the templates above
8. Organize issues into appropriate columns

---

## Maintenance

This board will be updated throughout development:
- Move issues between columns as work progresses
- Add new issues as features are discovered
- Update issue descriptions with research findings
- Link pull requests to issues
- Track velocity and progress
