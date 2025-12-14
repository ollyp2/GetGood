/**
 * Phase 2: Level to MG1
 * Open cases, complete missions, collect rewards
 */

import { logger } from '../core/logger.js';
import { accountManager } from '../core/accountManager.js';
import { stateManager } from '../core/stateManager.js';
import { config } from '../core/config.js';
import { openDreamsAndNightmares } from '../modules/caseOpener.js';

/**
 * Run Phase 2: Level to MG1
 */
export async function runPhase2(accountId) {
  logger.info('=== Starting Phase 2: Level to MG1 ===', accountId);

  const apiClient = accountManager.getAPIClient(accountId);
  const caseBatchSize = config.getSetting('caseBatchSize');

  try {
    while (!accountManager.isTradingUnlocked(accountId)) {
      logger.info('Phase 2 loop iteration starting...', accountId);

      // 1. Open Dreams & Nightmares cases
      logger.info(`Opening ${caseBatchSize} D&N cases`, accountId);
      await openDreamsAndNightmares(apiClient, accountId, caseBatchSize);

      // 2. Complete missions (TO IMPLEMENT - needs API discovery)
      logger.warn('Mission system not yet implemented (API discovery needed)', accountId);
      // TODO: await completeMissions(apiClient, accountId);

      // 3. Auto-favorite terminals (TO IMPLEMENT - needs API discovery)
      logger.warn('Auto-favorite terminals not yet implemented (API discovery needed)', accountId);
      // TODO: await autoFavoriteTerminals(apiClient, accountId);

      // 4. Collect rewards (TO IMPLEMENT - needs API discovery)
      logger.warn('Reward collector not yet implemented (API discovery needed)', accountId);
      // TODO: await collectRewards(apiClient, accountId);

      // 5. Sync account state
      await accountManager.syncAccountState(accountId);
      const accountState = stateManager.getAccount(accountId);

      logger.info(
        `Current progress: Level ${accountState.level}, Rank ${accountState.rank}`,
        accountId
      );

      // Check if MG1 reached
      if (accountManager.isTradingUnlocked(accountId)) {
        logger.info('MG1 reached! Trading unlocked!', accountId);
        break;
      }

      // Wait before next loop
      await sleep(5000);
    }

    logger.info('Phase 2 completed! Transitioning to Phase 3', accountId);
    await stateManager.updateAccount(accountId, { phase: 3 });

    return true;
  } catch (error) {
    logger.error(`Phase 2 failed: ${error.message}`, accountId);
    throw error;
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
