#!/usr/bin/env node

/**
 * Creates all GitHub issues from PROJECT_BOARD.md
 * Requires: GITHUB_TOKEN environment variable
 * Usage: GITHUB_TOKEN=your_token node scripts/create-issues.js
 */

const https = require('https');

const OWNER = 'ollyp2';
const REPO = 'GetGood';
const API_BASE = 'https://api.github.com';

// GitHub Personal Access Token from environment
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

if (!GITHUB_TOKEN) {
    console.error('ERROR: GITHUB_TOKEN environment variable not set');
    console.error('Create a token at: https://github.com/settings/tokens');
    console.error('Required scopes: repo');
    process.exit(1);
}

// All issues to create
const issues = [
    // Epic: Core Infrastructure
    {
        title: "Project Setup & Documentation",
        body: `## Description
Initial README, API docs, project structure

## Tasks
- [x] Create README.md with API documentation
- [x] Create PROJECT_BOARD.md with issue templates
- [x] Set up repository structure
- [x] Add materials folder with screenshots
- [x] Document screenshot discoveries

## Status
✅ COMPLETED`,
        labels: ['documentation', 'setup'],
        state: 'closed'
    },

    // Epic: Phase 1 - Account Monitoring
    {
        title: "Account Monitor Module",
        body: `## Description
Track level, tokens, rank, trading unlock status via \`/api/me\`

## Tasks
- [ ] Create \`modules/account-monitor.js\`
- [ ] Poll \`/api/me\` endpoint
- [ ] Parse and expose: level, tokens, rank, trading_unlocked
- [ ] Implement event emitter for state changes
- [ ] Add error handling and retry logic

## API Endpoints
- ✅ \`GET /api/me\` - Already documented

## Acceptance Criteria
- [ ] Polls /api/me endpoint every N seconds
- [ ] Detects current rank (MG1 = trading unlocked)
- [ ] Emits events on state changes
- [ ] Exposes: level, tokens, rank, trading_unlocked
- [ ] Handles API errors gracefully

## Technical Notes
- Use EventEmitter for state changes
- Configurable poll interval
- Detect rank changes (especially MG1 for trading)`,
        labels: ['module', 'phase-1']
    },

    // Epic: Phase 2 - Token Farming
    {
        title: "Home Clicker Module",
        body: `## Description
Auto-click on home page to collect tokens (for "Click 2250 times" weekly mission)

## Research Needed
- [ ] What's the API endpoint for clicking?
- [ ] Is there a rate limit?
- [ ] How many tokens per click?

## Tasks
- [ ] Research click API endpoint
- [ ] Implement auto-clicker
- [ ] Track click count
- [ ] Respect rate limits
- [ ] Log token earnings

## Acceptance Criteria
- [ ] Auto-clicks when on home page
- [ ] Tracks click count (for 2250 clicks mission)
- [ ] Respects rate limits
- [ ] Emits events for milestones (1000, 2250 clicks)

## Related Mission
Weekly Mission: "Click 2250 times"`,
        labels: ['module', 'phase-2', 'token-farming', 'research']
    },

    {
        title: "Game Limits Tracker",
        body: `## Description
Track 24h game limits and remaining plays

## Games to Track
From screenshots analysis:
- Casebattle: 93 hosted, 291 joined
- Coinflip: 179 hosted, 397 joined / 100m max bet
- Upgrade: 283 games
- Dice: 454 games / 10m max bet
- Guess the Rank: 12 games / 1m total bet
- Jackpot: 183 games
- Blackjack: 0 games (USED UP) / 100m max bet
- Plinko: 11 games / 1m max bet

## Research Needed
- [ ] API endpoint to fetch game limits
- [ ] Or parse from page HTML

## Tasks
- [ ] Fetch game limits from API or page
- [ ] Calculate remaining plays for each game
- [ ] Prioritize games with most plays remaining
- [ ] Track 24h reset timer

## Acceptance Criteria
- [ ] Fetches current game limits
- [ ] Calculates remaining plays
- [ ] Provides priority queue (most plays first)
- [ ] Tracks when limits reset (24h timer)`,
        labels: ['module', 'phase-2', 'tracking', 'research']
    },

    {
        title: "Game Automation - Blackjack",
        body: `## Description
Automate Blackjack gameplay using basic strategy

## Research Needed
- [ ] Blackjack API endpoints
- [ ] Game flow (start, hit, stand, etc.)
- [ ] Bet limits

## Tasks
- [ ] Research Blackjack API
- [ ] Implement basic blackjack strategy
- [ ] Auto-play until daily limit reached
- [ ] Track wins/losses
- [ ] Detect mission completion (natural blackjack, 3 wins)

## Acceptance Criteria
- [ ] Plays blackjack automatically
- [ ] Uses basic strategy (optimal play)
- [ ] Tracks wins/losses/naturals
- [ ] Stops when daily limit reached
- [ ] Detects mission completions

## Related Missions
Daily:
- "Get a natural Blackjack in 1 blackjack game"
- "Win 3 blackjack games"`,
        labels: ['module', 'phase-2', 'game-automation', 'research']
    },

    {
        title: "Game Automation - Coinflip",
        body: `## Description
Automate Coinflip (high volume game with 397 join limit)

## Research Needed
- [ ] Coinflip API endpoints
- [ ] Join existing games vs host
- [ ] Min/max bet

## Tasks
- [ ] Research Coinflip API
- [ ] Join coinflip games automatically
- [ ] Use minimal bet to maximize plays
- [ ] Track results
- [ ] Stop when daily limit reached

## Acceptance Criteria
- [ ] Joins coinflip games automatically
- [ ] Uses minimal bet
- [ ] Stops at daily limit (397 joins)
- [ ] Tracks win/loss rate`,
        labels: ['module', 'phase-2', 'game-automation', 'research']
    },

    {
        title: "Game Automation - Other Games (Future)",
        body: `## Description
Automate remaining games for complete 24h limit utilization

## Games
- Upgrade (283 games)
- Dice (454 games)
- Guess the Rank (12 games)
- Jackpot (183 games)
- Plinko (11 games)
- Casebattle (93 hosted, 291 joined)

## Priority
Lower priority - implement after core automation works

## Tasks
- [ ] Research each game's API
- [ ] Implement automation
- [ ] Integrate with game limits tracker`,
        labels: ['module', 'phase-2', 'game-automation', 'future']
    },

    // Epic: Phase 3 - Mission System
    {
        title: "Mission Tracker",
        body: `## Description
Fetch and track daily/weekly missions

## Research Needed
- [ ] Missions API endpoint (likely \`/api/missions\`)
- [ ] Mission structure/format
- [ ] Progress tracking

## Tasks
- [ ] Research missions API
- [ ] Fetch daily missions
- [ ] Fetch weekly missions
- [ ] Track progress for each mission
- [ ] Identify completable missions
- [ ] Detect mission completion

## Acceptance Criteria
- [ ] Fetches daily missions
- [ ] Fetches weekly missions
- [ ] Tracks progress (e.g., "Win 3/3 blackjack games")
- [ ] Identifies missions that can be automated
- [ ] Emits events when missions complete

## Mission Types from Screenshots
**Daily:**
- Get a natural Blackjack in 1 blackjack game
- Play 4 casebattles
- Open 300 gloves
- Win 3 blackjack games
- Lose 2 casebattles

**Weekly:**
- Lose 2 casebattles
- Win 1 jackpot
- Click 2250 times
- Win 90 plinko games
- Play 2 guess the rank games
- Win 2 casebattles`,
        labels: ['module', 'phase-3', 'research']
    },

    {
        title: "Mission Completion - Blackjack",
        body: `## Description
Auto-complete blackjack-related missions

## Missions
Daily:
- "Get a natural Blackjack in 1 blackjack game"
- "Win 3 blackjack games"

## Tasks
- [ ] Integrate with Blackjack automation module
- [ ] Detect blackjack missions
- [ ] Play until mission complete
- [ ] Claim reward

## Acceptance Criteria
- [ ] Detects blackjack missions from mission tracker
- [ ] Plays blackjack until requirements met
- [ ] Claims reward automatically

## Dependencies
- Requires: Mission Tracker (#8)
- Requires: Blackjack Automation (#5)`,
        labels: ['module', 'phase-3', 'mission-automation']
    },

    {
        title: "Mission Completion - Games",
        body: `## Description
Auto-complete game missions (casebattle, jackpot, plinko, etc.)

## Missions from Screenshots
- "Play 4 casebattles"
- "Lose 2 casebattles"
- "Win 1 jackpot"
- "Win 90 plinko games"
- "Play 2 guess the rank games"
- "Win 2 casebattles"

## Tasks
- [ ] Integrate with game automation modules
- [ ] Detect game missions
- [ ] Execute required games
- [ ] Claim rewards

## Acceptance Criteria
- [ ] Detects game missions
- [ ] Executes games until completion
- [ ] Claims rewards

## Dependencies
- Requires: Mission Tracker (#8)
- Requires: Game automation modules`,
        labels: ['module', 'phase-3', 'mission-automation']
    },

    {
        title: "Mission Completion - Cases",
        body: `## Description
Auto-complete case opening missions

## Missions
- "Open 300 gloves"

## Tasks
- [ ] Detect case opening missions
- [ ] Open required cases
- [ ] Claim reward

## Acceptance Criteria
- [ ] Opens required cases
- [ ] Claims reward when done

## Dependencies
- Requires: Mission Tracker (#8)
- Can reuse existing case opener script`,
        labels: ['module', 'phase-3', 'mission-automation']
    },

    {
        title: "Mission Completion - Clicks",
        body: `## Description
Auto-complete click mission using Home Clicker

## Mission
Weekly: "Click 2250 times"

## Tasks
- [ ] Detect click mission
- [ ] Use Home Clicker module
- [ ] Track progress (2250 clicks)
- [ ] Claim reward

## Acceptance Criteria
- [ ] Uses Home Clicker module
- [ ] Tracks clicks toward 2250
- [ ] Claims reward when done

## Dependencies
- Requires: Mission Tracker (#8)
- Requires: Home Clicker (#3)`,
        labels: ['module', 'phase-3', 'mission-automation']
    },

    {
        title: "Rewards System",
        body: `## Description
Claim mission rewards (Special Effects including Terminals)

## Research Needed
- [ ] Reward claiming API endpoint
- [ ] How to detect terminals in rewards
- [ ] Reward types

## Tasks
- [ ] Research reward claiming API
- [ ] Claim mission rewards automatically
- [ ] Detect if reward is a Terminal
- [ ] Log terminal acquisitions
- [ ] Emit event when terminal acquired

## Acceptance Criteria
- [ ] Claims mission rewards automatically
- [ ] Detects terminals in rewards
- [ ] Logs all terminal acquisitions
- [ ] Emits terminal_acquired event

## Important
Terminals are Special Effects worth ~25k each!`,
        labels: ['module', 'phase-3', 'research']
    },

    // Epic: Phase 4 - Inventory System
    {
        title: "Inventory Scanner",
        body: `## Description
Scan inventory for terminals

## Research Needed
- [ ] Inventory API endpoint (likely \`/api/inventory\`)
- [ ] How terminals are identified
- [ ] Pagination handling (69 pages in screenshot)

## Tasks
- [ ] Research inventory API
- [ ] Fetch full inventory (handle pagination)
- [ ] Filter for terminals (Special Effects tab)
- [ ] Track terminal count
- [ ] Emit events when terminals found

## Acceptance Criteria
- [ ] Fetches complete inventory (all pages)
- [ ] Filters for terminals in Special Effects
- [ ] Returns list of terminal items with IDs
- [ ] Tracks terminal count
- [ ] Handles pagination correctly

## Technical Notes
From screenshots:
- Inventory has pagination (69 pages)
- Terminals appear in "Special Effects" tab
- Items have IDs needed for trading`,
        labels: ['module', 'phase-4', 'research']
    },

    // Epic: Phase 5 - Trading System
    {
        title: "Trade Creator",
        body: `## Description
Create new trade

## Research Needed
- [ ] Trade creation API endpoint
- [ ] Request format
- [ ] Trade ID format

## Tasks
- [ ] Research trade creation API
- [ ] Create new trade
- [ ] Get trade ID
- [ ] Get trade link
- [ ] Handle "only 1 trade at a time" limitation

## Acceptance Criteria
- [ ] Creates new trade successfully
- [ ] Returns trade ID
- [ ] Returns trade link (shareable)
- [ ] Handles existing trade error

## Technical Notes
From screenshots:
- Trade IDs are long hex strings (e.g., 695c5d8811f62d5bf1a850235)
- "You can only host 1 trade at a time"`,
        labels: ['module', 'phase-5', 'research']
    },

    {
        title: "Trade Item Manager",
        body: `## Description
Add items (terminals) to trade

## Research Needed
- [ ] Add items to trade API
- [ ] Item ID format
- [ ] Can add multiple items at once?

## Tasks
- [ ] Research trade item API
- [ ] Add terminals to trade
- [ ] Verify items added
- [ ] Handle errors

## Acceptance Criteria
- [ ] Adds specified items to trade
- [ ] Handles multiple items
- [ ] Confirms items added successfully
- [ ] Provides clear error messages

## Dependencies
- Requires: Trade Creator (#15)
- Requires: Inventory Scanner (#14) for item IDs`,
        labels: ['module', 'phase-5', 'research']
    },

    {
        title: "Trade Poster",
        body: `## Description
Post trade link in global chat with "terminals for chicken"

## Research Needed
- [ ] Chat API endpoint
- [ ] Message format
- [ ] Rate limits

## Tasks
- [ ] Research chat API
- [ ] Post message to global chat
- [ ] Include trade link
- [ ] Format: "[Trade Link] terminals for chicken"

## Acceptance Criteria
- [ ] Posts message to global chat
- [ ] Includes correct trade link
- [ ] Uses exact format: "terminals for chicken"
- [ ] Handles rate limits

## Important
This is how terminals are traded to the target account!

## Dependencies
- Requires: Trade Creator (#15)`,
        labels: ['module', 'phase-5', 'research']
    },

    // Epic: Phase 6 - Chat System
    {
        title: "Chat Monitor",
        body: `## Description
Monitor global chat for messages

## Research Needed
- [ ] Chat polling API or WebSocket
- [ ] Message format
- [ ] Polling interval

## Tasks
- [ ] Research chat API (polling vs WebSocket)
- [ ] Monitor global chat
- [ ] Detect new messages
- [ ] Emit chat events
- [ ] Filter relevant messages

## Acceptance Criteria
- [ ] Monitors global chat
- [ ] Detects new messages
- [ ] Emits chat_message events
- [ ] Handles API errors

## Technical Notes
From screenshots:
- Global Chat on right side
- Shows: Player name, message, timestamp`,
        labels: ['module', 'phase-6', 'research']
    },

    {
        title: "Trade Status Tracker",
        body: `## Description
Track trade status (accepted/rejected/completed)

## Research Needed
- [ ] Trade status API
- [ ] Trade completion events
- [ ] How to confirm terminal transfer

## Tasks
- [ ] Research trade status API
- [ ] Monitor active trades
- [ ] Detect trade acceptance
- [ ] Detect trade completion
- [ ] Confirm terminal transfer

## Acceptance Criteria
- [ ] Monitors active trade status
- [ ] Detects when trade is accepted
- [ ] Detects when trade completes
- [ ] Confirms terminals transferred
- [ ] Emits trade completion events

## Dependencies
- Requires: Trade Creator (#15)
- Requires: Chat Monitor (#19)`,
        labels: ['module', 'phase-6', 'research']
    },

    // Epic: Phase 7 - Orchestration
    {
        title: "Orchestrator - State Machine",
        body: `## Description
Main coordinator implementing state machine

## State Machine Flow
\`\`\`
START
  ↓
[Monitor Account]
  ↓
Trading Unlocked? (MG1 rank)
  ├─ NO → [Farm Tokens] → [Complete Missions] → loop
  ├─ YES ↓
[Scan Inventory for Terminals]
  ↓
Terminals Found?
  ├─ NO → [Complete Missions] → loop
  ├─ YES ↓
[Create Trade]
  ↓
[Add Terminals to Trade]
  ↓
[Post in Chat: "terminals for chicken"]
  ↓
[Monitor Trade]
  ↓
[Wait for Completion]
  ↓
START (loop)
\`\`\`

## Tasks
- [ ] Implement state machine
- [ ] Coordinate all modules
- [ ] Handle state transitions
- [ ] Error recovery
- [ ] Logging

## Acceptance Criteria
- [ ] Implements complete state machine
- [ ] Coordinates all modules correctly
- [ ] Handles errors gracefully
- [ ] Logs all state transitions
- [ ] Can pause/resume

## Dependencies
Requires ALL previous modules`,
        labels: ['module', 'phase-7', 'core']
    },

    {
        title: "Configuration System",
        body: `## Description
Central configuration for all modules

## Configuration Items
- Target account for terminal trades
- Game automation priorities
- Mission priorities
- Token farming settings
- Rate limits
- Polling intervals

## Tasks
- [ ] Create config file format (JSON/YAML)
- [ ] Load configuration
- [ ] Validate config
- [ ] Share config with all modules
- [ ] Support environment variables

## Acceptance Criteria
- [ ] Loads config from file
- [ ] Validates all required fields
- [ ] Provides defaults
- [ ] Shared across all modules
- [ ] Environment variable overrides`,
        labels: ['module', 'phase-7']
    },

    {
        title: "Logging & Monitoring",
        body: `## Description
Centralized logging and monitoring

## Features
- Log levels (debug, info, warn, error)
- Module-specific logs
- API request/response logging
- Statistics tracking
- Performance metrics

## Tasks
- [ ] Implement logging system
- [ ] Log all major events
- [ ] Log API requests/responses
- [ ] Track statistics (missions completed, terminals traded, etc.)
- [ ] Performance monitoring

## Acceptance Criteria
- [ ] Logs all major events with timestamps
- [ ] Logs API requests/responses
- [ ] Tracks automation statistics
- [ ] Configurable log levels
- [ ] Can write to file and console`,
        labels: ['module', 'phase-7', 'infrastructure']
    },

    // Epic: Testing & Release
    {
        title: "Integration Testing",
        body: `## Description
Test all modules working together

## Test Scenarios
- Full flow: farming → missions → terminals → trading
- Error handling
- Rate limiting
- State persistence
- Recovery from failures

## Tasks
- [ ] Create test environment
- [ ] Test full automation flow
- [ ] Test error scenarios
- [ ] Test edge cases
- [ ] Performance testing

## Acceptance Criteria
- [ ] All modules work together
- [ ] Error handling works correctly
- [ ] Graceful degradation
- [ ] No data loss on failure`,
        labels: ['testing']
    },

    {
        title: "v1.0 Release",
        body: `## Description
First production release

## Includes
- All core modules (Phases 1-7)
- Basic automation working
- Complete documentation
- Installation guide
- Configuration examples

## Release Checklist
- [ ] All modules implemented
- [ ] Integration tests passing
- [ ] Documentation complete
- [ ] README updated
- [ ] Installation guide written
- [ ] Example config provided
- [ ] Security review
- [ ] Performance optimization

## Acceptance Criteria
- [ ] Complete automation pipeline works
- [ ] Can level up account
- [ ] Can complete missions
- [ ] Can trade terminals
- [ ] Well documented`,
        labels: ['release']
    }
];

// Helper function to make API requests
function apiRequest(method, path, data) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'api.github.com',
            port: 443,
            path: path,
            method: method,
            headers: {
                'Authorization': `token ${GITHUB_TOKEN}`,
                'User-Agent': 'GetGood-Issue-Creator',
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json',
            }
        };

        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    resolve(JSON.parse(body));
                } else {
                    reject(new Error(`API Error ${res.statusCode}: ${body}`));
                }
            });
        });

        req.on('error', reject);

        if (data) {
            req.write(JSON.stringify(data));
        }

        req.end();
    });
}

// Create all labels first
async function createLabels() {
    const labels = [
        { name: 'documentation', color: '0075ca', description: 'Documentation tasks' },
        { name: 'setup', color: '0075ca', description: 'Setup and configuration' },
        { name: 'module', color: '1d76db', description: 'Module implementation' },
        { name: 'phase-1', color: 'd93f0b', description: 'Phase 1 tasks' },
        { name: 'phase-2', color: 'fbca04', description: 'Phase 2 tasks' },
        { name: 'phase-3', color: 'fbca04', description: 'Phase 3 tasks' },
        { name: 'phase-4', color: 'fbca04', description: 'Phase 4 tasks' },
        { name: 'phase-5', color: 'fbca04', description: 'Phase 5 tasks' },
        { name: 'phase-6', color: 'fbca04', description: 'Phase 6 tasks' },
        { name: 'phase-7', color: 'fbca04', description: 'Phase 7 tasks' },
        { name: 'token-farming', color: '5319e7', description: 'Token farming related' },
        { name: 'game-automation', color: '5319e7', description: 'Game automation' },
        { name: 'mission-automation', color: '5319e7', description: 'Mission automation' },
        { name: 'tracking', color: '1d76db', description: 'Tracking/monitoring features' },
        { name: 'core', color: 'b60205', description: 'Core functionality' },
        { name: 'infrastructure', color: '0075ca', description: 'Infrastructure tasks' },
        { name: 'testing', color: '0e8a16', description: 'Testing tasks' },
        { name: 'release', color: 'b60205', description: 'Release tasks' },
        { name: 'future', color: 'c2e0c6', description: 'Future enhancements' },
        { name: 'research', color: 'd876e3', description: 'Needs research/investigation' },
    ];

    console.log('Creating labels...');
    for (const label of labels) {
        try {
            await apiRequest('POST', `/repos/${OWNER}/${REPO}/labels`, label);
            console.log(`  ✓ Created label: ${label.name}`);
        } catch (err) {
            if (err.message.includes('already_exists')) {
                console.log(`  ⊘ Label already exists: ${label.name}`);
            } else {
                console.error(`  ✗ Failed to create label ${label.name}:`, err.message);
            }
        }
    }
}

// Create all issues
async function createIssues() {
    console.log('\nCreating issues...');
    let created = 0;
    let failed = 0;

    for (let i = 0; i < issues.length; i++) {
        const issue = issues[i];
        console.log(`  [${i+1}/${issues.length}] Creating: ${issue.title}`);

        try {
            const data = {
                title: issue.title,
                body: issue.body,
                labels: issue.labels || []
            };

            const result = await apiRequest('POST', `/repos/${OWNER}/${REPO}/issues`, data);
            console.log(`    ✓ Created #${result.number}`);

            // Close if marked as closed
            if (issue.state === 'closed') {
                await apiRequest('PATCH', `/repos/${OWNER}/${REPO}/issues/${result.number}`, {
                    state: 'closed'
                });
                console.log(`    ✓ Closed #${result.number}`);
            }

            created++;
            // Rate limiting: wait a bit between requests
            await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (err) {
            console.error(`    ✗ Failed: ${err.message}`);
            failed++;
        }
    }

    return { created, failed };
}

// Main function
async function main() {
    console.log('======================================');
    console.log('GetGood - GitHub Issue Creator');
    console.log('======================================\n');

    try {
        await createLabels();
        const stats = await createIssues();

        console.log('\n======================================');
        console.log('Summary:');
        console.log(`  Created: ${stats.created} issues`);
        console.log(`  Failed:  ${stats.failed} issues`);
        console.log('======================================\n');

        if (stats.failed === 0) {
            console.log('✓ All issues created successfully!');
            console.log(`\nView them at: https://github.com/${OWNER}/${REPO}/issues`);
        }
    } catch (err) {
        console.error('Fatal error:', err.message);
        process.exit(1);
    }
}

main();
