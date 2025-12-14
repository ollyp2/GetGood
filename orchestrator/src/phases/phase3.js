/**
 * Phase 3: Level to Global
 * Same as Phase 2 + Skillmap progression
 */

import { logger } from '../core/logger.js';
import { accountManager } from '../core/accountManager.js';
import { stateManager } from '../core/stateManager.js';
import { config } from '../core/config.js';
import { openDreamsAndNightmares } from '../modules/caseOpener.js';

const TARGET_RANK = 'Global Elite';

/**
 * Run Phase 3: Level to Global
 */
export async function runPhase3(accountId) {
  logger.info('=== Starting Phase 3: Level to Global ===', accountId);

  const apiClient = accountManager.getAPIClient(accountId);
  const caseBatchSize = config.getSetting('caseBatchSize');

  try {
    while (true) {
      logger.info('Phase 3 loop iteration starting...', accountId);

      // 1. Open Dreams & Nightmares cases
      logger.info(`Opening ${caseBatchSize} D&N cases`, accountId);
      await openDreamsAndNightmares(apiClient, accountId, caseBatchSize);

      // 2. Complete missions (TO IMPLEMENT)
      logger.warn('Mission system not yet implemented (API discovery needed)', accountId);
      // TODO: await completeMissions(apiClient, accountId);

      // 3. Auto-favorite terminals (TO IMPLEMENT)
      logger.warn('Auto-favorite terminals not yet implemented (API discovery needed)', accountId);
      // TODO: await autoFavoriteTerminals(apiClient, accountId);

      // 4. Progress skillmap (NEW in Phase 3!) (TO IMPLEMENT)
      logger.warn('Skillmap progression not yet implemented (API discovery needed)', accountId);
      // TODO: await progressSkillmap(apiClient, accountId);

      // 5. Collect rewards (TO IMPLEMENT)
      logger.warn('Reward collector not yet implemented (API discovery needed)', accountId);
      // TODO: await collectRewards(apiClient, accountId);

      // 6. Sync account state
      await accountManager.syncAccountState(accountId);
      const accountState = stateManager.getAccount(accountId);

      logger.info(
        `Current progress: Level ${accountState.level}, Rank ${accountState.rank}`,
        accountId
      );

      // Check if Global Elite reached
      if (accountState.rank === TARGET_RANK) {
        logger.info('🎉 Global Elite reached! Phase 3 completed!', accountId);
        break;
      }

      // Wait before next loop
      await sleep(5000);
    }

    logger.info('Phase 3 completed! Account fully automated to Global!', accountId);
    return true;
  } catch (error) {
    logger.error(`Phase 3 failed: ${error.message}`, accountId);
    throw error;
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
