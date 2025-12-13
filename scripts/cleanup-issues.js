#!/usr/bin/env node

const https = require('https');

const OWNER = 'ollyp2';
const REPO = 'GetGood';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

function apiRequest(method, path, data) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'api.github.com',
            port: 443,
            path: path,
            method: method,
            headers: {
                'Authorization': `token ${GITHUB_TOKEN}`,
                'User-Agent': 'GetGood-Issue-Cleanup',
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
        if (data) req.write(JSON.stringify(data));
        req.end();
    });
}

// Issues to close (superseded by V2 architecture)
const TO_CLOSE = [
    { number: 9, reason: "Replaced by Mission Evaluator #29" },
    { number: 10, reason: "Replaced by Mission Evaluator #29" },
    { number: 11, reason: "Replaced by Mission Evaluator #29" },
    { number: 12, reason: "Replaced by Mission Evaluator #29" },
    { number: 20, reason: "Replaced by Orchestrator V2 #33" },
];

// Issues to update with better descriptions
const TO_UPDATE = [
    {
        number: 2,
        updates: {
            body: `## Description
Track account state (level, tokens, rank, trading unlock status) via \`/api/me\`.

**Solution:** Poll \`/api/me\` every N seconds, parse response, emit events on state changes. Core function for orchestrator to make decisions.

## Tasks
- [ ] Create \`modules/account-monitor.js\`
- [ ] Poll \`/api/me\` endpoint (configurable interval)
- [ ] Parse and expose: level, tokens, rank, trading_unlocked
- [ ] Implement EventEmitter for state changes
- [ ] Add error handling and retry logic
- [ ] Detect MG1 rank (trading unlock)

## API Endpoints
- ✅ \`GET /api/me\` - Already documented

## Acceptance Criteria
- [ ] Polls /api/me endpoint every N seconds
- [ ] Detects current rank (MG1 = trading unlocked)
- [ ] Emits events on state changes (level up, rank change, etc.)
- [ ] Exposes: level, tokens, rank, trading_unlocked
- [ ] Handles API errors gracefully

## Part of
Phase 1: Core Infrastructure - Foundation for all automation`
        }
    },
    {
        number: 3,
        updates: {
            body: `## Description
Auto-click on home page to collect tokens (for "Click 2250 times" weekly mission).

**Solution:** Find click endpoint/button, automate clicking with rate limiting. Track count for mission progress.

## Research Needed
- [ ] What's the API endpoint for clicking?
- [ ] Is there a rate limit?
- [ ] How many tokens per click?

## Tasks
- [ ] Research click API endpoint or DOM element
- [ ] Implement auto-clicker
- [ ] Track click count
- [ ] Respect rate limits
- [ ] Log token earnings
- [ ] Emit milestones (1000, 2250 clicks)

## Acceptance Criteria
- [ ] Auto-clicks when on home page
- [ ] Tracks click count (for 2250 clicks mission)
- [ ] Respects rate limits
- [ ] Emits events for milestones

## Related Mission
Weekly Mission: "Click 2250 times"

## Part of
Phase 1: Token Farming - Resource generation for account progression`
        }
    },
    {
        number: 8,
        updates: {
            body: `## Description
Fetch and track daily/weekly missions from API.

**Solution:** Poll missions endpoint, parse mission data, track progress. Feed missions to Mission Evaluator (#29) for intelligent completion.

## Research Needed
- [ ] Missions API endpoint (likely \`/api/missions\`)
- [ ] Mission structure/format
- [ ] Progress tracking format

## Tasks
- [ ] Research missions API
- [ ] Fetch daily missions
- [ ] Fetch weekly missions
- [ ] Track progress for each mission
- [ ] Identify completable missions
- [ ] Detect mission completion
- [ ] Integrate with Mission Evaluator (#29)

## Acceptance Criteria
- [ ] Fetches daily missions
- [ ] Fetches weekly missions
- [ ] Tracks progress (e.g., "Win 3/3 blackjack games")
- [ ] Identifies missions that can be automated
- [ ] Emits events when missions complete
- [ ] Provides mission data to Mission Evaluator

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
- Win 2 casebattles

## Part of
Phase 4: Mission System - Works with Mission Evaluator (#29) for intelligent completion`
        }
    },
    {
        number: 13,
        updates: {
            body: `## Description
Claim mission rewards and detect terminals in rewards (Special Effects).

**Solution:** Call reward claim API after mission completion, parse response to detect if reward contains terminals. Emit event for orchestrator.

## Research Needed
- [ ] Reward claiming API endpoint
- [ ] How to detect terminals in rewards
- [ ] Reward types and structure

## Tasks
- [ ] Research reward claiming API
- [ ] Claim mission rewards automatically
- [ ] Detect if reward is a Terminal (Special Effect)
- [ ] Log terminal acquisitions
- [ ] Emit \`terminal_acquired\` event
- [ ] Track all rewards for statistics

## Acceptance Criteria
- [ ] Claims mission rewards automatically
- [ ] Detects terminals in rewards (they appear in Special Effects)
- [ ] Logs all terminal acquisitions
- [ ] Emits terminal_acquired event for orchestrator
- [ ] Tracks reward history

## Important
Terminals are Special Effects worth ~25k each! This is THE goal - detect and trade them.

## Part of
Phase 4: Mission System - Critical for terminal detection and trading trigger`
        }
    },
    {
        number: 14,
        updates: {
            body: `## Description
Scan inventory for terminals and other valuable items.

**Solution:** Poll inventory API with pagination, filter for Special Effects tab to find terminals. Track count and item IDs for trading.

## Research Needed
- [ ] Inventory API endpoint (likely \`/api/inventory\`)
- [ ] How terminals are identified in response
- [ ] Pagination handling (69 pages in screenshot)

## Tasks
- [ ] Research inventory API
- [ ] Fetch full inventory (handle pagination)
- [ ] Filter for terminals in Special Effects tab
- [ ] Track terminal count
- [ ] Get terminal item IDs (needed for trading)
- [ ] Emit events when terminals found

## Acceptance Criteria
- [ ] Fetches complete inventory (all pages)
- [ ] Filters for terminals in Special Effects
- [ ] Returns list of terminal items with IDs
- [ ] Tracks terminal count
- [ ] Handles pagination correctly (69+ pages)
- [ ] Emits \`terminals_found\` event

## Technical Notes
From screenshots:
- Inventory has pagination (69 pages)
- Terminals appear in "Special Effects" tab
- Items have IDs needed for trading

## Part of
Phase 4: Inventory System - Critical for knowing when we have terminals to trade`
        }
    },
    {
        number: 4,
        updates: {
            body: `## Description
Track 24h game limits and remaining plays for optimal resource usage.

**Solution:** Parse game limits from API/page, maintain countdown timers, provide priority queue of games with most plays remaining.

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
- [ ] Provide priority queue to orchestrator

## Acceptance Criteria
- [ ] Fetches current game limits
- [ ] Calculates remaining plays
- [ ] Provides priority queue (most plays first)
- [ ] Tracks when limits reset (24h timer)
- [ ] Updates in real-time as games are played

## Part of
Phase 2: Token Farming - Maximize XP gain by using all 24h limits efficiently`
        }
    }
];

async function main() {
    console.log('======================================');
    console.log('Cleaning Up Old Issues');
    console.log('======================================\n');

    // Close superseded issues
    console.log('Closing superseded issues...');
    for (const item of TO_CLOSE) {
        try {
            // Add comment explaining why
            await apiRequest('POST', `/repos/${OWNER}/${REPO}/issues/${item.number}/comments`, {
                body: `Closing this issue as it has been superseded by V2 architecture.\n\n**Reason:** ${item.reason}\n\nSee ARCHITECTURE_V2.md for the new modular approach.`
            });

            // Close the issue
            await apiRequest('PATCH', `/repos/${OWNER}/${REPO}/issues/${item.number}`, {
                state: 'closed'
            });

            console.log(`  ✓ Closed #${item.number}: ${item.reason}`);
            await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (err) {
            console.error(`  ✗ Failed to close #${item.number}:`, err.message);
        }
    }

    // Update important issues
    console.log('\nUpdating issues with better descriptions...');
    for (const item of TO_UPDATE) {
        try {
            await apiRequest('PATCH', `/repos/${OWNER}/${REPO}/issues/${item.number}`, item.updates);
            console.log(`  ✓ Updated #${item.number}`);
            await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (err) {
            console.error(`  ✗ Failed to update #${item.number}:`, err.message);
        }
    }

    console.log('\n======================================');
    console.log('Cleanup Complete!');
    console.log(`  Closed: ${TO_CLOSE.length} issues`);
    console.log(`  Updated: ${TO_UPDATE.length} issues`);
    console.log('======================================\n');
}

main();
