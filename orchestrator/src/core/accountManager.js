/**
 * Account Manager
 * High-level account management and state tracking
 */

import { stateManager } from './stateManager.js';
import { config } from './config.js';
import { logger } from './logger.js';
import { APIClient } from './apiClient.js';

class AccountManager {
  constructor() {
    this.apiClients = {}; // Map of accountId -> APIClient
  }

  /**
   * Initialize account (load credentials, create API client)
   */
  async initAccount(accountId) {
    const credentials = config.getAccount(accountId);
    if (!credentials) {
      throw new Error(`Account ${accountId} not found in config/accounts.json`);
    }

    // Create API client with session token
    const apiClient = new APIClient(credentials.sessionToken);
    this.apiClients[accountId] = apiClient;

    // Load or create state
    let accountState = stateManager.getAccount(accountId);
    if (!accountState) {
      accountState = await stateManager.updateAccount(accountId, {
        username: credentials.username,
        phase: 1,
        level: 0,
        rank: 'Unranked',
        tokens: 0,
        money: 0,
        tradingUnlocked: false
      });
      logger.info(`Created new account state for ${accountId}`, accountId);
    }

    return accountState;
  }

  /**
   * Get API client for account
   */
  getAPIClient(accountId) {
    return this.apiClients[accountId];
  }

  /**
   * Update account state from /api/me
   */
  async syncAccountState(accountId) {
    const apiClient = this.getAPIClient(accountId);
    if (!apiClient) {
      throw new Error(`Account ${accountId} not initialized`);
    }

    try {
      const me = await apiClient.getMe();

      // Determine if trading is unlocked (MG1+)
      const rankOrder = [
        'Unranked', 'Silver 1', 'Silver 2', 'Silver 3', 'Silver 4',
        'Silver Elite', 'Silver Elite Master', 'Gold Nova 1', 'Gold Nova 2',
        'Gold Nova 3', 'Gold Nova Master', 'Master Guardian 1', 'Master Guardian 2',
        'Master Guardian Elite', 'Distinguished Master Guardian', 'Legendary Eagle',
        'Legendary Eagle Master', 'Supreme Master First Class', 'Global Elite'
      ];

      const currentRankIndex = rankOrder.indexOf(me.rank || 'Unranked');
      const mg1Index = rankOrder.indexOf('Master Guardian 1');
      const tradingUnlocked = currentRankIndex >= mg1Index;

      const updates = {
        level: me.level,
        tokens: me.tokens,
        rank: me.rank || 'Unranked',
        tradingUnlocked
      };

      await stateManager.updateAccount(accountId, updates);
      logger.debug(`Synced account state: Level ${me.level}, Rank ${me.rank}`, accountId);

      return updates;
    } catch (error) {
      logger.error(`Failed to sync account state: ${error.message}`, accountId);
      throw error;
    }
  }

  /**
   * Get current phase
   */
  getPhase(accountId) {
    return stateManager.getPhase(accountId);
  }

  /**
   * Check if in click freeze
   */
  isClickFreezeActive(accountId) {
    return stateManager.isClickFreezeActive(accountId);
  }

  /**
   * Check if trading unlocked
   */
  isTradingUnlocked(accountId) {
    return stateManager.isTradingUnlocked(accountId);
  }

  /**
   * Get account state
   */
  getAccountState(accountId) {
    return stateManager.getAccount(accountId);
  }

  /**
   * Update account state
   */
  async updateAccountState(accountId, updates) {
    return stateManager.updateAccount(accountId, updates);
  }
}

export const accountManager = new AccountManager();
