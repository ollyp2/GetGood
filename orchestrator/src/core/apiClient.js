/**
 * API Client for case-clicker.com
 * Handles all HTTP requests with retry logic and error handling
 */

import axios from 'axios';
import { config } from './config.js';
import { logger } from './logger.js';

class APIClient {
  constructor(sessionToken = null) {
    this.baseURL = config.getSetting('apiBase');
    this.sessionToken = sessionToken;
    this.retryAttempts = config.getSetting('retryAttempts');
    this.retryDelay = config.getSetting('retryDelay');

    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Content-Type': 'application/json',
        ...(sessionToken && { 'Authorization': `Bearer ${sessionToken}` })
      },
      withCredentials: true
    });
  }

  /**
   * Set session token (after login)
   */
  setSessionToken(token) {
    this.sessionToken = token;
    this.client.defaults.headers['Authorization'] = `Bearer ${token}`;
  }

  /**
   * Generic request with retry logic
   */
  async request(method, endpoint, data = null, retries = 0) {
    try {
      const response = await this.client.request({
        method,
        url: endpoint,
        data
      });
      return response.data;
    } catch (error) {
      // Handle rate limiting (429)
      if (error.response?.status === 429 && retries < this.retryAttempts) {
        const waitTime = this.retryDelay * Math.pow(2, retries); // Exponential backoff
        logger.warn(`Rate limited. Retrying in ${waitTime}ms... (attempt ${retries + 1}/${this.retryAttempts})`);
        await this.sleep(waitTime);
        return this.request(method, endpoint, data, retries + 1);
      }

      // Handle other errors
      logger.error(`API Error: ${method} ${endpoint} - ${error.message}`);
      if (error.response) {
        logger.error(`Response: ${JSON.stringify(error.response.data)}`);
      }
      throw error;
    }
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // ==================== ACCOUNT ====================

  /**
   * Get user stats (level, tokens, rank, etc.)
   * GET /api/me
   */
  async getMe() {
    return this.request('GET', '/me');
  }

  // ==================== CASES ====================

  /**
   * Buy cases
   * POST /api/cases
   */
  async buyCases(caseId, amount) {
    return this.request('POST', '/cases', {
      id: caseId,
      type: 'case',
      amount
    });
  }

  /**
   * Get owned cases
   * GET /api/cases
   */
  async getOwnedCases() {
    return this.request('GET', '/cases');
  }

  /**
   * Open cases with auto-sell and auto-favorite config
   * POST /api/open/case
   */
  async openCase(caseId, count, autoOpenConfig = null) {
    const defaultConfig = {
      autosellActivated: true,
      autosellAmount: config.getSetting('customSellThreshold'),
      autosellVariant: 'money',
      ...config.getSetting('autoFavoriteConfig')
    };

    return this.request('POST', '/open/case', {
      id: caseId,
      quickOpen: true,
      count: count.toString(),
      useEventTickets: false,
      caseOpenMultiplier: 1,
      autoOpenConfig: autoOpenConfig || defaultConfig
    });
  }

  // ==================== INVENTORY ====================

  /**
   * Bulk sell items for money
   * DELETE /api/inventory
   */
  async sellForMoney(threshold) {
    return this.request('DELETE', '/inventory', {
      type: 'price',
      value: threshold,
      currency: 'money'
    });
  }

  /**
   * Bulk sell items for tokens
   * PATCH /api/inventory
   */
  async sellForTokens(threshold) {
    return this.request('PATCH', '/inventory', {
      type: 'price',
      value: threshold,
      currency: 'money'
    });
  }

  /**
   * Get inventory (TO DISCOVER)
   * Expected: GET /api/inventory
   */
  async getInventory() {
    // TODO: Discover endpoint
    logger.warn('getInventory() - API endpoint not yet discovered');
    throw new Error('API endpoint not discovered: GET /api/inventory');
  }

  /**
   * Favorite an item (TO DISCOVER)
   * Expected: POST /api/inventory/:id/favorite
   */
  async favoriteItem(itemId) {
    // TODO: Discover endpoint
    logger.warn('favoriteItem() - API endpoint not yet discovered');
    throw new Error('API endpoint not discovered: POST /api/inventory/:id/favorite');
  }

  // ==================== MISSIONS ====================

  /**
   * Get active missions (TO DISCOVER)
   * Expected: GET /api/missions
   */
  async getMissions() {
    // TODO: Discover endpoint
    logger.warn('getMissions() - API endpoint not yet discovered');
    throw new Error('API endpoint not discovered: GET /api/missions');
  }

  /**
   * Claim mission reward (TO DISCOVER)
   * Expected: POST /api/missions/:id/claim
   */
  async claimMission(missionId) {
    // TODO: Discover endpoint
    logger.warn('claimMission() - API endpoint not yet discovered');
    throw new Error('API endpoint not discovered: POST /api/missions/:id/claim');
  }

  // ==================== REWARDS ====================

  /**
   * Get rewards tab (TO DISCOVER)
   * Expected: GET /api/rewards
   */
  async getRewards() {
    // TODO: Discover endpoint
    logger.warn('getRewards() - API endpoint not yet discovered');
    throw new Error('API endpoint not discovered: GET /api/rewards');
  }

  /**
   * Claim reward (TO DISCOVER)
   * Expected: POST /api/rewards/:id/claim
   */
  async claimReward(rewardId) {
    // TODO: Discover endpoint
    logger.warn('claimReward() - API endpoint not yet discovered');
    throw new Error('API endpoint not discovered: POST /api/rewards/:id/claim');
  }

  // ==================== SKILLMAP ====================

  /**
   * Get skillmap state (TO DISCOVER)
   * Expected: GET /api/skillmap or /api/skills
   */
  async getSkillmap() {
    // TODO: Discover endpoint
    logger.warn('getSkillmap() - API endpoint not yet discovered');
    throw new Error('API endpoint not discovered: GET /api/skillmap');
  }

  /**
   * Set skill point (TO DISCOVER)
   * Expected: POST /api/skillmap/:id or PATCH /api/skills
   */
  async setSkillPoint(skillId) {
    // TODO: Discover endpoint
    logger.warn('setSkillPoint() - API endpoint not yet discovered');
    throw new Error('API endpoint not discovered: POST /api/skillmap/:id');
  }

  // ==================== CLICKING ====================

  /**
   * Click for tokens (home page) (TO DISCOVER)
   * Expected: POST /api/click or /api/home/click
   */
  async clickToken() {
    // TODO: Discover endpoint
    logger.warn('clickToken() - API endpoint not yet discovered');
    throw new Error('API endpoint not discovered: POST /api/click');
  }

  // ==================== TRADING ====================

  /**
   * Create new trade (TO DISCOVER)
   * Expected: POST /api/trade
   */
  async createTrade() {
    // TODO: Discover endpoint
    logger.warn('createTrade() - API endpoint not yet discovered');
    throw new Error('API endpoint not discovered: POST /api/trade');
  }

  /**
   * Add items to trade (TO DISCOVER)
   * Expected: POST /api/trade/:id/items
   */
  async addItemsToTrade(tradeId, itemIds) {
    // TODO: Discover endpoint
    logger.warn('addItemsToTrade() - API endpoint not yet discovered');
    throw new Error('API endpoint not discovered: POST /api/trade/:id/items');
  }

  /**
   * Confirm/accept trade (TO DISCOVER)
   * Expected: POST /api/trade/:id/confirm
   */
  async confirmTrade(tradeId) {
    // TODO: Discover endpoint
    logger.warn('confirmTrade() - API endpoint not yet discovered');
    throw new Error('API endpoint not discovered: POST /api/trade/:id/confirm');
  }

  /**
   * Get trade status (TO DISCOVER)
   * Expected: GET /api/trade/:id
   */
  async getTradeStatus(tradeId) {
    // TODO: Discover endpoint
    logger.warn('getTradeStatus() - API endpoint not yet discovered');
    throw new Error('API endpoint not discovered: GET /api/trade/:id');
  }

  // ==================== CHAT ====================

  /**
   * Send chat message (TO DISCOVER)
   * Expected: POST /api/chat
   */
  async sendChatMessage(message) {
    // TODO: Discover endpoint
    logger.warn('sendChatMessage() - API endpoint not yet discovered');
    throw new Error('API endpoint not discovered: POST /api/chat');
  }

  /**
   * Get chat messages (TO DISCOVER)
   * Expected: GET /api/chat
   */
  async getChatMessages(limit = 50) {
    // TODO: Discover endpoint
    logger.warn('getChatMessages() - API endpoint not yet discovered');
    throw new Error('API endpoint not discovered: GET /api/chat');
  }

  // ==================== GAMES ====================

  /**
   * Play game (generic) (TO DISCOVER)
   * Will be implemented once we discover game endpoints
   */
  async playGame(gameName, config) {
    // TODO: Discover game endpoints (blackjack, coinflip, etc.)
    logger.warn(`playGame(${gameName}) - API endpoint not yet discovered`);
    throw new Error(`API endpoint not discovered: Game ${gameName}`);
  }
}

export { APIClient };
