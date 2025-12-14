/**
 * Configuration loader
 * Loads settings and account credentials
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = join(__dirname, '../..');

/**
 * Load configuration from JSON file
 */
class Config {
  constructor() {
    this.settings = this.loadSettings();
    this.accounts = this.loadAccounts();
  }

  loadSettings() {
    const settingsPath = join(ROOT_DIR, 'config', 'settings.json');
    try {
      const data = readFileSync(settingsPath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      console.warn('settings.json not found, using defaults');
      return this.getDefaultSettings();
    }
  }

  loadAccounts() {
    const accountsPath = join(ROOT_DIR, 'config', 'accounts.json');
    try {
      const data = readFileSync(accountsPath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      console.warn('accounts.json not found, creating empty accounts list');
      return { accounts: [] };
    }
  }

  getDefaultSettings() {
    return {
      apiBase: 'https://case-clicker.com/api',
      clickDelay: 100, // ms between clicks
      loopDelay: 300, // ms between automation loops
      caseBatchSize: 100, // cases to open at once
      clickFreezeMaxConcurrent: 3, // max accounts in click freeze
      clickFreezeDuration: 2 * 24 * 60 * 60 * 1000, // 2 days in ms
      retryAttempts: 3,
      retryDelay: 5000, // ms
      logLevel: 'info',
      dreamsAndNightmaresCaseId: '63529100e4821cab2f1c5ed2',
      customSellThreshold: 100000,
      autoFavoriteConfig: {
        favoriteLowFloats: true,
        favoritePatterns: true,
        customLowFloat: 0.0000001,
        customHighFloat: 0.99999,
        customSelectedFloats: ['0.123456', '0.42069'],
        favoriteCustomFloats: true
      }
    };
  }

  getAccount(accountId) {
    return this.accounts.accounts.find(acc => acc.id === accountId);
  }

  getAllAccounts() {
    return this.accounts.accounts;
  }

  getSetting(key) {
    return this.settings[key];
  }
}

export const config = new Config();
