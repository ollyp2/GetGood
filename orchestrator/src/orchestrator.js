/**
 * Main Orchestrator
 * State machine that coordinates all phases
 */

import { logger } from './core/logger.js';
import { accountManager } from './core/accountManager.js';
import { stateManager } from './core/stateManager.js';
import { startPhase1, resumePhase1 } from './phases/phase1.js';
import { runPhase2 } from './phases/phase2.js';
import { runPhase3 } from './phases/phase3.js';

export class Orchestrator {
  constructor(accountId) {
    this.accountId = accountId;
  }

  /**
   * Main orchestration loop
   */
  async run() {
    logger.info('='.repeat(60));
    logger.info('GetGood Orchestrator Starting', this.accountId);
    logger.info('='.repeat(60));

    try {
      // Initialize account
      await accountManager.initAccount(this.accountId);
      logger.info('Account initialized', this.accountId);

      // Sync initial state
      await accountManager.syncAccountState(this.accountId);
      const accountState = stateManager.getAccount(this.accountId);

      logger.info(
        `Starting from Phase ${accountState.phase} (Level ${accountState.level}, Rank ${accountState.rank})`,
        this.accountId
      );

      // Run state machine
      let currentPhase = accountState.phase;

      while (true) {
        try {
          switch (currentPhase) {
            case 1:
              // Phase 1: Click Freeze
              if (accountState.clickFreezeStarted) {
                await resumePhase1(this.accountId);
              } else {
                await startPhase1(this.accountId);
              }
              currentPhase = 2;
              break;

            case 2:
              // Phase 2: Level to MG1
              await runPhase2(this.accountId);
              currentPhase = 3;
              break;

            case 3:
              // Phase 3: Level to Global
              await runPhase3(this.accountId);
              // Phase 3 completes when Global is reached
              logger.info('='.repeat(60), this.accountId);
              logger.info('🎉 AUTOMATION COMPLETE! Account reached Global Elite!', this.accountId);
              logger.info('='.repeat(60), this.accountId);
              return;

            default:
              throw new Error(`Unknown phase: ${currentPhase}`);
          }
        } catch (error) {
          logger.error(`Error in Phase ${currentPhase}: ${error.message}`, this.accountId);
          logger.error(`Stack trace: ${error.stack}`, this.accountId);

          // Error recovery: wait and retry
          logger.info('Waiting 60 seconds before retry...', this.accountId);
          await this.sleep(60000);
        }
      }
    } catch (error) {
      logger.error(`Fatal error in orchestrator: ${error.message}`, this.accountId);
      logger.error(`Stack trace: ${error.stack}`, this.accountId);
      throw error;
    }
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
