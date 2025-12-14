/**
 * State manager using LowDB
 * Persistent storage for account states
 */

import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = join(__dirname, '../..');

// Database schema
const defaultData = {
  accounts: {},
  globalState: {
    activeAccounts: 0,
    clickFreezeQueue: [],
    activeClickFreezeAccounts: [],
    lastSync: null
  }
};

class StateManager {
  constructor() {
    this.db = null;
  }

  async init() {
    const file = join(ROOT_DIR, 'db', 'state.json');
    const adapter = new JSONFile(file);
    this.db = new Low(adapter, defaultData);

    // Read data from file
    await this.db.read();

    // Initialize if empty
    if (!this.db.data) {
      this.db.data = defaultData;
      await this.db.write();
    }
  }

  /**
   * Get account state
   */
  getAccount(accountId) {
    return this.db.data.accounts[accountId] || null;
  }

  /**
   * Create or update account state
   */
  async updateAccount(accountId, updates) {
    if (!this.db.data.accounts[accountId]) {
      // Create new account state
      this.db.data.accounts[accountId] = {
        id: accountId,
        phase: 1,
        level: 0,
        rank: 'Unranked',
        tokens: 0,
        money: 0,
        tradingUnlocked: false,
        clickFreezeStarted: null,
        clickFreezeEnds: null,
        missionsClaimed: [],
        skillmapProgress: {},
        createdAt: new Date().toISOString(),
        lastUpdate: new Date().toISOString()
      };
    }

    // Update fields
    Object.assign(this.db.data.accounts[accountId], updates);
    this.db.data.accounts[accountId].lastUpdate = new Date().toISOString();

    await this.db.write();
    return this.db.data.accounts[accountId];
  }

  /**
   * Get all accounts
   */
  getAllAccounts() {
    return Object.values(this.db.data.accounts);
  }

  /**
   * Get global state
   */
  getGlobalState() {
    return this.db.data.globalState;
  }

  /**
   * Update global state
   */
  async updateGlobalState(updates) {
    Object.assign(this.db.data.globalState, updates);
    this.db.data.globalState.lastSync = new Date().toISOString();
    await this.db.write();
    return this.db.data.globalState;
  }

  /**
   * Get current phase for account
   */
  getPhase(accountId) {
    const account = this.getAccount(accountId);
    return account ? account.phase : 1;
  }

  /**
   * Check if account is in click freeze
   */
  isClickFreezeActive(accountId) {
    const account = this.getAccount(accountId);
    if (!account || !account.clickFreezeEnds) {
      return false;
    }
    return new Date() < new Date(account.clickFreezeEnds);
  }

  /**
   * Check if trading is unlocked (MG1+)
   */
  isTradingUnlocked(accountId) {
    const account = this.getAccount(accountId);
    return account ? account.tradingUnlocked : false;
  }

  /**
   * Add account to click freeze queue
   */
  async addToClickFreezeQueue(accountId) {
    const globalState = this.getGlobalState();
    if (!globalState.clickFreezeQueue.includes(accountId)) {
      globalState.clickFreezeQueue.push(accountId);
      await this.updateGlobalState(globalState);
    }
  }

  /**
   * Remove account from click freeze queue
   */
  async removeFromClickFreezeQueue(accountId) {
    const globalState = this.getGlobalState();
    globalState.clickFreezeQueue = globalState.clickFreezeQueue.filter(id => id !== accountId);
    await this.updateGlobalState(globalState);
  }

  /**
   * Get accounts currently in active click freeze
   */
  getActiveClickFreezeAccounts() {
    const globalState = this.getGlobalState();
    return globalState.activeClickFreezeAccounts || [];
  }

  /**
   * Set active click freeze accounts
   */
  async setActiveClickFreezeAccounts(accountIds) {
    await this.updateGlobalState({ activeClickFreezeAccounts: accountIds });
  }
}

// Export singleton instance
export const stateManager = new StateManager();
