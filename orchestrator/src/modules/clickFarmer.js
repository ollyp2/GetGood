/**
 * Click Farmer Module
 * Phase 1: Automate 2-day click freeze
 */

import { logger } from '../core/logger.js';
import { config } from '../core/config.js';

/**
 * Click for tokens continuously
 */
export async function clickTokens(apiClient, accountId, targetClicks = null) {
  const clickDelay = config.getSetting('clickDelay');
  let clickCount = 0;

  logger.info(`Starting token clicking${targetClicks ? ` (target: ${targetClicks})` : ''}`, accountId);

  try {
    while (true) {
      // Click token
      await apiClient.clickToken();
      clickCount++;

      if (clickCount % 100 === 0) {
        logger.debug(`Clicked ${clickCount} times`, accountId);
      }

      // Check if target reached
      if (targetClicks && clickCount >= targetClicks) {
        logger.info(`Reached target of ${targetClicks} clicks`, accountId);
        break;
      }

      // Delay between clicks
      await sleep(clickDelay);
    }

    return clickCount;
  } catch (error) {
    logger.error(`Click farming error after ${clickCount} clicks: ${error.message}`, accountId);
    throw error;
  }
}

/**
 * Run click freeze for 2 days
 */
export async function runClickFreeze(apiClient, accountId, accountState) {
  const freezeEnd = new Date(accountState.clickFreezeEnds);

  logger.info(`Click freeze active until ${freezeEnd.toISOString()}`, accountId);

  try {
    while (new Date() < freezeEnd) {
      const remainingMs = freezeEnd - new Date();
      const remainingHours = (remainingMs / (1000 * 60 * 60)).toFixed(1);

      logger.info(`Click freeze running... ${remainingHours} hours remaining`, accountId);

      // Click for 10 minutes, then check time
      const tenMinutes = 10 * 60 * 1000;
      const clickDuration = Math.min(tenMinutes, remainingMs);
      const estimatedClicks = Math.floor(clickDuration / config.getSetting('clickDelay'));

      await clickTokens(apiClient, accountId, estimatedClicks);

      // Check if freeze period ended
      if (new Date() >= freezeEnd) {
        break;
      }
    }

    logger.info('Click freeze completed!', accountId);
    return true;
  } catch (error) {
    logger.error(`Click freeze error: ${error.message}`, accountId);
    throw error;
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
