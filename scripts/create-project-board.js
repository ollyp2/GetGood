#!/usr/bin/env node

/**
 * Creates GitHub Project Board for GetGood
 * Requires: GITHUB_TOKEN environment variable
 * Usage: GITHUB_TOKEN=your_token node scripts/create-project-board.js
 */

const https = require('https');

const OWNER = 'ollyp2';
const REPO = 'GetGood';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

if (!GITHUB_TOKEN) {
    console.error('ERROR: GITHUB_TOKEN environment variable not set');
    process.exit(1);
}

// Helper function to make API requests
function apiRequest(method, path, data, useProjectsPreview = false) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'api.github.com',
            port: 443,
            path: path,
            method: method,
            headers: {
                'Authorization': `token ${GITHUB_TOKEN}`,
                'User-Agent': 'GetGood-Project-Creator',
                'Accept': useProjectsPreview
                    ? 'application/vnd.github.inertia-preview+json'
                    : 'application/vnd.github.v3+json',
                'Content-Type': 'application/json',
            }
        };

        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    try {
                        resolve(JSON.parse(body));
                    } catch {
                        resolve(body);
                    }
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

// Project board columns
const COLUMNS = [
    { name: '💡 Ideas', description: 'Brainstorming and feature ideas' },
    { name: '📋 To Do', description: 'Approved tasks ready to be worked on' },
    { name: '🔨 In Development', description: 'Currently being implemented' },
    { name: '🧪 Testing', description: 'Implementation complete, needs testing' },
    { name: '✅ Done', description: 'Completed and tested' },
    { name: '🚀 Released', description: 'Deployed/Released features' }
];

// Issue to column mapping
const ISSUE_ASSIGNMENTS = {
    // Ideas column
    7: '💡 Ideas',  // Game Automation - Other Games (Future)

    // To Do column
    2: '📋 To Do',  // Account Monitor Module
    3: '📋 To Do',  // Home Clicker Module
    4: '📋 To Do',  // Game Limits Tracker
    5: '📋 To Do',  // Game Automation - Blackjack
    6: '📋 To Do',  // Game Automation - Coinflip
    8: '📋 To Do',  // Mission Tracker
    9: '📋 To Do',  // Mission Completion - Blackjack
    10: '📋 To Do', // Mission Completion - Games
    11: '📋 To Do', // Mission Completion - Cases
    12: '📋 To Do', // Mission Completion - Clicks
    13: '📋 To Do', // Rewards System
    14: '📋 To Do', // Inventory Scanner
    15: '📋 To Do', // Trade Creator
    16: '📋 To Do', // Trade Item Manager
    17: '📋 To Do', // Trade Poster
    18: '📋 To Do', // Chat Monitor
    19: '📋 To Do', // Trade Status Tracker
    20: '📋 To Do', // Orchestrator
    21: '📋 To Do', // Configuration System
    22: '📋 To Do', // Logging & Monitoring
    23: '📋 To Do', // Integration Testing
    24: '📋 To Do', // v1.0 Release

    // Done column
    1: '✅ Done'    // Project Setup (already closed)
};

async function main() {
    console.log('======================================');
    console.log('GetGood - Project Board Creator');
    console.log('======================================\n');

    try {
        // Step 1: Create Project Board
        console.log('Creating project board...');
        const project = await apiRequest(
            'POST',
            `/repos/${OWNER}/${REPO}/projects`,
            {
                name: 'GetGood - Case Clicker Automation',
                body: 'Automated system for case-clicker.com: Level up → Complete missions → Auto-trade terminals'
            },
            true // Use projects preview API
        );
        console.log(`  ✓ Created project #${project.number}: ${project.name}`);
        console.log(`  URL: ${project.html_url}\n`);

        // Step 2: Create Columns
        console.log('Creating columns...');
        const columnMap = {};
        for (const col of COLUMNS) {
            const column = await apiRequest(
                'POST',
                `/projects/${project.id}/columns`,
                { name: col.name },
                true
            );
            columnMap[col.name] = column;
            console.log(`  ✓ Created column: ${col.name}`);
            await new Promise(resolve => setTimeout(resolve, 500));
        }

        // Step 3: Get all issues
        console.log('\nFetching issues...');
        const issues = await apiRequest(
            'GET',
            `/repos/${OWNER}/${REPO}/issues?state=all&per_page=100`
        );
        console.log(`  ✓ Found ${issues.length} issues\n`);

        // Step 4: Add issues to columns
        console.log('Adding issues to columns...');
        let added = 0;

        for (const issue of issues) {
            const columnName = ISSUE_ASSIGNMENTS[issue.number];
            if (columnName && columnMap[columnName]) {
                try {
                    await apiRequest(
                        'POST',
                        `/projects/columns/${columnMap[columnName].id}/cards`,
                        {
                            content_id: issue.id,
                            content_type: 'Issue'
                        },
                        true
                    );
                    console.log(`  ✓ Added #${issue.number} to "${columnName}"`);
                    added++;
                    await new Promise(resolve => setTimeout(resolve, 500));
                } catch (err) {
                    console.error(`  ✗ Failed to add #${issue.number}:`, err.message);
                }
            }
        }

        console.log('\n======================================');
        console.log('Summary:');
        console.log(`  Project: ${project.name}`);
        console.log(`  Columns: ${COLUMNS.length}`);
        console.log(`  Issues added: ${added}/${issues.length}`);
        console.log('======================================\n');

        console.log('✓ Project board created successfully!');
        console.log(`\nView it at: ${project.html_url}`);

    } catch (err) {
        console.error('Fatal error:', err.message);
        if (err.message.includes('404')) {
            console.error('\nHint: Make sure the repository exists and the token has "repo" scope.');
        }
        process.exit(1);
    }
}

main();
