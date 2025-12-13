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
                'User-Agent': 'GetGood-Issue-Updater',
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

const UPDATES = [
    {
        number: 5,
        title: "Game Automation - Blackjack",
        description: "Automate Blackjack using basic strategy. Research API endpoints, implement optimal play strategy, track wins/losses/naturals for mission completion."
    },
    {
        number: 6,
        title: "Game Automation - Coinflip",
        description: "Automate Coinflip (high-volume game, 397 join limit). Join games automatically with minimal bet to maximize plays and mission completion."
    },
    {
        number: 15,
        title: "Trade Creator",
        description: "Create new trades via API. Research trade creation endpoint, handle 'only 1 trade at a time' limitation, return trade ID and shareable link."
    },
    {
        number: 16,
        title: "Trade Item Manager",
        description: "Add items (terminals) to existing trade. Research item addition API, batch add multiple terminals, verify items added successfully before posting."
    },
    {
        number: 17,
        title: "Trade Poster",
        description: "Post trade link in global chat with 'terminals for chicken' message. Research chat API, format message correctly, handle rate limits."
    },
    {
        number: 18,
        title: "Chat Monitor",
        description: "Monitor global chat for messages (polling or WebSocket). Detect new messages, filter relevant ones, emit events for trade responses and other activity."
    },
    {
        number: 19,
        title: "Trade Status Tracker",
        description: "Monitor active trade status (pending/accepted/completed). Poll trade status API, detect acceptance, confirm terminal transfer, emit completion events."
    },
    {
        number: 21,
        title: "Configuration System",
        description: "Central config for all modules (target account, priorities, rate limits). Load from JSON/YAML, validate settings, support environment variable overrides."
    },
    {
        number: 22,
        title: "Logging & Monitoring",
        description: "Centralized logging system with levels (debug/info/warn/error). Log all major events, API calls, track statistics (missions completed, terminals traded)."
    },
    {
        number: 23,
        title: "Integration Testing",
        description: "Test complete automation flow end-to-end. Test error handling, rate limiting, state persistence, recovery from failures."
    },
    {
        number: 24,
        title: "v1.0 Release",
        description: "First production release with complete automation pipeline. All modules working, documentation complete, installation guide ready."
    }
];

async function main() {
    console.log('======================================');
    console.log('Adding Solution Descriptions');
    console.log('======================================\n');

    for (const update of UPDATES) {
        try {
            // Get current issue body
            const issue = await apiRequest('GET', `/repos/${OWNER}/${REPO}/issues/${update.number}`);

            // Add solution description at the top if not already there
            let newBody = issue.body;
            if (!newBody.includes('**Solution:**')) {
                // Find the first ## Description
                const descMatch = newBody.match(/## Description\n/);
                if (descMatch) {
                    const insertPos = descMatch.index + descMatch[0].length;
                    newBody = newBody.slice(0, insertPos) +
                             `**Solution:** ${update.description}\n\n` +
                             newBody.slice(insertPos);
                }
            }

            // Update the issue
            await apiRequest('PATCH', `/repos/${OWNER}/${REPO}/issues/${update.number}`, {
                body: newBody
            });

            console.log(`  ✓ Updated #${update.number}: ${update.title}`);
            await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (err) {
            console.error(`  ✗ Failed #${update.number}:`, err.message);
        }
    }

    console.log('\n✓ All issues updated with solution descriptions!');
}

main();
