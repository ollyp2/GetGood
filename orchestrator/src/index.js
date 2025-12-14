/**
 * Entry point for Case Clicker Orchestrator
 */

import { Orchestrator } from './orchestrator.js';
import { logger } from './core/logger.js';
import { stateManager } from './core/stateManager.js';

async function main() {
  // Get account ID from command line args
  const accountId = process.argv[2];

  if (!accountId) {
    console.error('Usage: node src/index.js <account_id>');
    console.error('Example: node src/index.js acc_001');
    process.exit(1);
  }

  try {
    // Initialize state manager
    await stateManager.init();
    logger.info('State manager initialized');

    // Create and run orchestrator
    const orchestrator = new Orchestrator(accountId);
    await orchestrator.run();

  } catch (error) {
    logger.error(`Fatal error: ${error.message}`);
    logger.error(`Stack trace: ${error.stack}`);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  logger.info('Received SIGINT, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  logger.info('Received SIGTERM, shutting down gracefully...');
  process.exit(0);
});

// Run main
main();
