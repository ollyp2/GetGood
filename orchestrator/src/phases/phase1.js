/**
 * Phase 1: Click Freeze
 * 2-day clicking period with MoneyClickBonus
 */

import { logger } from '../core/logger.js';
import { accountManager } from '../core/accountManager.js';
import { stateManager } from '../core/stateManager.js';
import { config } from '../core/config.js';
import { runClickFreeze } from '../modules/clickFarmer.js';

/**
 * Start Phase 1: Click Freeze
 */
export async function startPhase1(accountId) {
  logger.info('=== Starting Phase 1: Click Freeze ===', accountId);

  const apiClient = accountManager.getAPIClient(accountId);
  const freezeDuration = config.getSetting('clickFreezeDuration');

  // Set freeze timestamps
  const freezeStart = new Date();
  const freezeEnd = new Date(freezeStart.getTime() + freezeDuration);

  await stateManager.updateAccount(accountId, {
    phase: 1,
    clickFreezeStarted: freezeStart.toISOString(),
    clickFreezeEnds: freezeEnd.toISOString()
  });

  logger.info(`Click freeze: ${freezeStart.toISOString()} → ${freezeEnd.toISOString()}`, accountId);

  // Run click freeze
  try {
    const accountState = stateManager.getAccount(accountId);
    await runClickFreeze(apiClient, accountId, accountState);

    // Mark phase complete
    logger.info('Phase 1 completed! Transitioning to Phase 2', accountId);
    await stateManager.updateAccount(accountId, { phase: 2 });

    return true;
  } catch (error) {
    logger.error(`Phase 1 failed: ${error.message}`, accountId);
    throw error;
  }
}

/**
 * Resume Phase 1 if already started
 */
export async function resumePhase1(accountId) {
  logger.info('Resuming Phase 1: Click Freeze', accountId);

  const accountState = stateManager.getAccount(accountId);
  if (!stateManager.isClickFreezeActive(accountId)) {
    logger.info('Click freeze period ended, transitioning to Phase 2', accountId);
    await stateManager.updateAccount(accountId, { phase: 2 });
    return false;
  }

  // Continue click freeze
  const apiClient = accountManager.getAPIClient(accountId);
  await runClickFreeze(apiClient, accountId, accountState);

  logger.info('Phase 1 completed! Transitioning to Phase 2', accountId);
  await stateManager.updateAccount(accountId, { phase: 2 });

  return true;
}
