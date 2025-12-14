/**
 * Test Phase 1 in SHORT MODE
 * Runs click freeze for 5 minutes instead of 2 days
 */

import { APIClient } from './src/core/apiClient.js';
import { config } from './src/core/config.js';
import { stateManager } from './src/core/stateManager.js';
import { accountManager } from './src/core/accountManager.js';
import { logger } from './src/core/logger.js';
import { clickTokens } from './src/modules/clickFarmer.js';

async function testPhase1Short() {
  console.log('='.repeat(60));
  console.log('Phase 1 SHORT TEST (5 minutes)');
  console.log('='.repeat(60));

  const accountId = process.argv[2] || 'acc_001';

  try {
    // Initialize
    await stateManager.init();
    logger.info('State manager initialized');

    await accountManager.initAccount(accountId);
    logger.info('Account initialized', accountId);

    const apiClient = accountManager.getAPIClient(accountId);

    // Sync state
    await accountManager.syncAccountState(accountId);
    const accountState = stateManager.getAccount(accountId);
    logger.info(`Current: Level ${accountState.level}, Rank ${accountState.rank}`, accountId);

    // Run short click test (5 minutes)
    const testDuration = 5 * 60 * 1000; // 5 minutes
    const clickDelay = config.getSetting('clickDelay');
    const estimatedClicks = Math.floor(testDuration / clickDelay);

    logger.info(`Starting ${estimatedClicks} clicks (5 minutes)...`, accountId);
    console.log('\n💡 This is a SHORT TEST. Press Ctrl+C to stop early.\n');

    const startTime = Date.now();
    let clickCount = 0;

    // Click for 5 minutes or until target reached
    while (Date.now() - startTime < testDuration) {
      try {
        await apiClient.clickToken();
        clickCount++;

        // Log every 50 clicks
        if (clickCount % 50 === 0) {
          const elapsed = ((Date.now() - startTime) / 1000).toFixed(0);
          const remaining = ((testDuration - (Date.now() - startTime)) / 1000).toFixed(0);
          logger.info(`Clicked ${clickCount} times (${elapsed}s elapsed, ${remaining}s remaining)`, accountId);
        }

        await sleep(clickDelay);
      } catch (error) {
        logger.error(`Click failed: ${error.message}`, accountId);

        // If rate limited, wait longer
        if (error.response?.status === 429) {
          logger.warn('Rate limited, waiting 5 seconds...', accountId);
          await sleep(5000);
        }
      }
    }

    // Final stats
    const totalTime = (Date.now() - startTime) / 1000;
    const clicksPerSecond = (clickCount / totalTime).toFixed(2);

    console.log('\n' + '='.repeat(60));
    console.log('Test Complete!');
    console.log('='.repeat(60));
    logger.info(`Total clicks: ${clickCount}`, accountId);
    logger.info(`Total time: ${totalTime.toFixed(0)} seconds`, accountId);
    logger.info(`Rate: ${clicksPerSecond} clicks/second`, accountId);

    // Sync final state
    await accountManager.syncAccountState(accountId);
    const finalState = stateManager.getAccount(accountId);
    logger.info(`Final: Level ${finalState.level}, Tokens ${finalState.tokens}`, accountId);

    console.log('\n✅ Phase 1 short test completed successfully!');
    console.log('\n✨ Next steps:');
    console.log('   1. If this worked well, run full automation: npm start acc_001');
    console.log('   2. Full Phase 1 will run for 2 days (click freeze)');
    console.log('   3. Monitor with: tail -f logs/orchestrator.log');

  } catch (error) {
    logger.error(`Test failed: ${error.message}`);
    logger.error(`Stack: ${error.stack}`);
    process.exit(1);
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Handle Ctrl+C gracefully
process.on('SIGINT', () => {
  console.log('\n\n⚠️  Test interrupted by user (Ctrl+C)');
  console.log('Exiting...');
  process.exit(0);
});

testPhase1Short();
