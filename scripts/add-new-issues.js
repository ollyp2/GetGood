#!/usr/bin/env node

/**
 * Adds new issues for V2 architecture
 * Requires: GITHUB_TOKEN environment variable
 */

const https = require('https');

const OWNER = 'ollyp2';
const REPO = 'GetGood';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

if (!GITHUB_TOKEN) {
    console.error('ERROR: GITHUB_TOKEN environment variable not set');
    process.exit(1);
}

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
        if (data) req.write(JSON.stringify(data));
        req.end();
    });
}

const newIssues = [
    // Mission Evaluator System
    {
        title: "Mission Evaluator - Core System",
        body: `## Description
Intelligent system to analyze dynamic missions and determine optimal completion strategy.

## Purpose
Missions change over time (knives, gloves, games, etc.). We need a system that:
1. Analyzes what a mission requires
2. Determines how to complete it
3. Finds required resources (which case has knives?)
4. Calculates cost vs reward
5. Prioritizes missions (terminals vs XP)

## Evaluation Questions
For each mission:
- ❓ What action is required? (open cases, play games, trade, etc.)
- ❓ What resources are needed?
- ❓ Is it automatable with our functions?
- ❓ What's the priority? (terminal reward = high priority)

## Tasks
- [ ] Define mission type taxonomy
- [ ] Build evaluation engine
- [ ] Create strategy generator
- [ ] Implement resource calculator
- [ ] Build priority scorer

## Example Evaluations

**Mission: "Open 300 gloves"**
\`\`\`javascript
{
  type: "case_opening",
  action: "openCases",
  caseId: "glove-case-id",
  quantity: 300,
  priority: 6,
  automatable: true
}
\`\`\`

**Mission: "Get 5 knives"**
\`\`\`javascript
{
  type: "item_extraction",
  action: "extractKnives",
  quantity: 5,
  bestCase: "knife-case-id", // highest knife drop rate
  estimatedCost: 50000,
  priority: 7,
  automatable: true
}
\`\`\`

## Acceptance Criteria
- [ ] Analyzes any mission type
- [ ] Returns actionable strategy
- [ ] Calculates costs and time
- [ ] Prioritizes correctly (terminals > XP > other)
- [ ] Identifies non-automatable missions

## Dependencies
- Requires: Mission Tracker (#8)
- Requires: Function library (all phases)`,
        labels: ['module', 'phase-4', 'core', 'mission-automation']
    },

    // Item Extraction System
    {
        title: "Item Extraction System",
        body: `## Description
Extract specific items from cases (knives, gloves, specific skins for missions).

## Problem
Missions like "Get 5 knives" require opening cases until we get knives.
We need to:
1. Know which cases contain knives
2. Open cases until we get the required items
3. Track progress
4. Stop when complete

## Tasks
- [ ] Create case database (which cases have which items)
- [ ] Build item extraction engine
- [ ] Implement progress tracker
- [ ] Add specialized extractors (knives, gloves, etc.)

## Functions to Build

\`\`\`javascript
extractSpecificItem(itemType, quantity)
// Opens cases until 'quantity' of 'itemType' found

findCaseWithItem(itemType)
// Returns best case for getting item type

extractKnives(count)
// Specialized for knife missions

extractGloves(count)
// Specialized for glove missions
\`\`\`

## Case Database Example
\`\`\`javascript
{
  "knives": [
    { caseId: "xxx", name: "Knife Case", dropRate: 0.05 },
    { caseId: "yyy", name: "Weapon Case", dropRate: 0.02 }
  ],
  "gloves": [
    { caseId: "zzz", name: "Glove Case", dropRate: 0.08 }
  ]
}
\`\`\`

## Acceptance Criteria
- [ ] Can extract any item type
- [ ] Tracks extraction progress
- [ ] Uses most efficient case
- [ ] Stops when target reached
- [ ] Logs items found

## Dependencies
- Requires: Case operations (#2, existing scripts)
- Requires: Inventory Scanner (#14)`,
        labels: ['module', 'phase-2', 'research']
    },

    // Up-Trading System
    {
        title: "Up-Trading System",
        body: `## Description
Up-trade system: Combine 10 similar-value items into 1 better item.

## Use Case
Some missions require up-trades:
- "Up-trade 5 times"
- "Get X high-value skins"

Up-trading helps consolidate inventory and get better items.

## Research Needed
- [ ] What's the up-trade API endpoint?
- [ ] Can we up-trade any 10 items or must they be similar?
- [ ] What's the value calculation?
- [ ] What's the success rate?

## Tasks
- [ ] Research up-trade API
- [ ] Build similar item finder (find 10 items of ~same value)
- [ ] Implement up-trade executor
- [ ] Add value calculator
- [ ] Track up-trade history

## Functions to Build

\`\`\`javascript
upTrade(items)
// Takes 10 items, returns 1 better item

findSimilarItems(targetValue, count=10)
// Finds 'count' items of similar value

calculateUpTradeValue(items)
// Estimates result value

performUpTrade(items)
// Executes the up-trade
\`\`\`

## Acceptance Criteria
- [ ] Can up-trade 10 items
- [ ] Finds similar-value items automatically
- [ ] Calculates expected value
- [ ] Tracks up-trade count (for missions)
- [ ] Handles failures gracefully

## Dependencies
- Requires: Inventory Scanner (#14)
- Research needed for API`,
        labels: ['module', 'phase-6', 'future', 'research']
    },

    // Function Library Core
    {
        title: "Function Library - Core Infrastructure",
        body: `## Description
Build the core function library that all modules will use.

## Concept
Instead of phase-specific modules, we build a library of reusable functions.
The Orchestrator picks functions based on what needs to be done.

## Core Function Categories

### 1. Account Management
- \`getAccountState()\` - level, tokens, rank
- \`checkTradingUnlocked()\` - MG1 check

### 2. Token/Money Farming
- \`clickTokens(count)\` - home clicker
- \`farmTokens(duration)\` - continuous farming

### 3. Case Operations
- \`openCase(caseId, quantity, config)\`
- \`buyCases(caseId, quantity)\`
- \`findCaseWithItem(itemType)\`

### 4. Item Operations
- \`extractSpecificItem(itemType, quantity)\`
- \`findSimilarItems(value, count)\`

### 5. Game Operations
- \`playGame(gameName, config)\` - universal
- \`playBlackjack(config)\`
- \`playCoinflip(config)\`
- ... (all games)

### 6. Trading
- \`createTrade()\`
- \`addItemsToTrade(tradeId, items)\`
- \`postTradeInChat(tradeId, message)\`

### 7. Inventory
- \`getInventory(filters)\`
- \`findTerminals()\`
- \`sellItems(threshold)\`

### 8. Missions
- \`getMissions()\`
- \`evaluateMission(mission)\`
- \`completeMission(missionId)\`

## Tasks
- [ ] Create function library structure
- [ ] Define function interfaces (TypeScript types?)
- [ ] Implement core utility functions
- [ ] Build API wrapper layer
- [ ] Add error handling
- [ ] Create function registry

## Acceptance Criteria
- [ ] All functions follow consistent interface
- [ ] Functions are composable
- [ ] Error handling is consistent
- [ ] Logging is standardized
- [ ] Functions can be called independently

## Dependencies
- This IS the foundation for everything else`,
        labels: ['module', 'phase-1', 'core', 'infrastructure']
    },

    // Orchestrator V2
    {
        title: "Orchestrator V2 - Complete Account Automation",
        body: `## Description
Enhanced orchestrator for complete account lifecycle automation.

## Goal
Automate from fresh account → level to MG1 → farm terminals → trade to main

## Priority System

**PRIORITY 1: Trading Unlocked + Terminals**
- Trade all terminals to main account
- Continue farming more terminals

**PRIORITY 2: Trading Unlocked + No Terminals**
- Complete missions (prioritize terminal rewards)
- Use 24h game limits for XP
- Check for terminals after each mission

**PRIORITY 3: Trading Locked (below MG1)**
- Farm tokens
- Play games for XP
- Complete missions for XP
- Monitor rank until MG1

**PRIORITY 4: Resource Gathering**
- Farm money/tokens for missions
- Prepare resources

## State Machine
\`\`\`
START → Check Account → MG1?
  NO  → Level to MG1 → loop
  YES → Scan Inventory → Terminals?
    YES → Trade Terminals → loop (farm more)
    NO  → Complete Missions → loop
\`\`\`

## Tasks
- [ ] Implement priority system
- [ ] Build state machine
- [ ] Add decision logic
- [ ] Integrate Mission Evaluator
- [ ] Add resource manager
- [ ] Implement continuous loop

## Acceptance Criteria
- [ ] Runs continuously
- [ ] Makes intelligent decisions
- [ ] Prioritizes correctly
- [ ] Handles errors
- [ ] Can pause/resume
- [ ] Logs all decisions

## Dependencies
- Requires: ALL function library modules
- Requires: Mission Evaluator (#25)`,
        labels: ['module', 'phase-7', 'core']
    },

    // Case Database
    {
        title: "Case Database - Item Drop Rates",
        body: `## Description
Database mapping cases to their possible item drops and rates.

## Purpose
For missions like "Get 5 knives", we need to know which cases drop knives.

## Research Needed
- [ ] What items can each case drop?
- [ ] What are the drop rates?
- [ ] Are drop rates public or do we estimate?

## Data Structure
\`\`\`javascript
{
  "cases": [
    {
      "id": "640c9ae8630b848c02320a64",
      "name": "Revolution Case",
      "price": 3.3,
      "drops": {
        "common": [...],
        "rare": [...],
        "knife": { rate: 0.0026, types: ["..."] },
        "gloves": null
      }
    }
  ]
}
\`\`\`

## Tasks
- [ ] Research case contents
- [ ] Build case database
- [ ] Add query functions
- [ ] Create efficiency calculator (best case for X item)

## Acceptance Criteria
- [ ] Contains all cases
- [ ] Maps items to cases
- [ ] Provides drop rate estimates
- [ ] Can query "best case for knives"

## Dependencies
- Needed by: Item Extraction (#26)
- Needed by: Mission Evaluator (#25)`,
        labels: ['module', 'phase-2', 'research']
    },

    // Multi-Account Manager
    {
        title: "Multi-Account Manager (Future)",
        body: `## Description
Run multiple accounts simultaneously to maximize terminal production.

## Goal
- Create multiple fresh accounts
- Run automation on each
- Coordinate terminal trades
- Scale terminal farming

## Features
- Account creation automation
- Parallel execution
- Resource allocation
- Trade coordination
- Performance monitoring

## Tasks
- [ ] Account creation automation
- [ ] Multi-instance runner
- [ ] Resource manager (don't DDOS the API)
- [ ] Trade queue
- [ ] Statistics dashboard

## Acceptance Criteria
- [ ] Can run N accounts in parallel
- [ ] Coordinates trades efficiently
- [ ] Doesn't overload API
- [ ] Tracks performance per account

## Priority
FUTURE - implement after single account works perfectly

## Dependencies
- Requires: Everything else working first`,
        labels: ['future', 'phase-8']
    }
];

async function main() {
    console.log('======================================');
    console.log('Adding V2 Architecture Issues');
    console.log('======================================\n');

    let created = 0;
    for (let i = 0; i < newIssues.length; i++) {
        const issue = newIssues[i];
        console.log(`[${i+1}/${newIssues.length}] Creating: ${issue.title}`);

        try {
            const result = await apiRequest('POST', `/repos/${OWNER}/${REPO}/issues`, issue);
            console.log(`  ✓ Created #${result.number}`);
            created++;
            await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (err) {
            console.error(`  ✗ Failed: ${err.message}`);
        }
    }

    console.log(`\n✓ Created ${created}/${newIssues.length} new issues`);
    console.log(`View at: https://github.com/${OWNER}/${REPO}/issues`);
}

main();
