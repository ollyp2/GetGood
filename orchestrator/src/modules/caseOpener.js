/**
 * Case Opener Module
 * Buy and open cases with auto-sell and auto-favorite
 */

import { logger } from '../core/logger.js';
import { config } from '../core/config.js';

/**
 * Open cases with auto-config (sell + favorite)
 */
export async function openCasesWithAutoConfig(apiClient, accountId, caseId, count) {
  logger.info(`Opening ${count} cases (ID: ${caseId})`, accountId);

  try {
    // 1. Check owned cases
    const ownedCases = await apiClient.getOwnedCases();
    const ownedCase = ownedCases.find(c => c._id === caseId);
    const owned = ownedCase?.amount || 0;

    // 2. Buy if needed
    if (owned < count) {
      const toBuy = count - owned;
      logger.info(`Buying ${toBuy} cases`, accountId);
      await apiClient.buyCases(caseId, toBuy);
    } else {
      logger.debug(`Already own ${owned} cases`, accountId);
    }

    // 3. Open cases
    const result = await apiClient.openCase(caseId, count);

    // 4. Log results
    if (result.autoSellInfo) {
      logger.info(
        `Opened ${count} cases, auto-sold ${result.autoSellInfo.count} items for $${result.autoSellInfo.cost.toFixed(2)}`,
        accountId
      );
    } else {
      logger.info(`Opened ${count} cases`, accountId);
    }

    return result;
  } catch (error) {
    logger.error(`Case opening error: ${error.message}`, accountId);
    throw error;
  }
}

/**
 * Open Dreams & Nightmares cases (default for leveling)
 */
export async function openDreamsAndNightmares(apiClient, accountId, count) {
  const caseId = config.getSetting('dreamsAndNightmaresCaseId');
  return openCasesWithAutoConfig(apiClient, accountId, caseId, count);
}
