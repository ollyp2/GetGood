/**
 * Logging system using Winston
 * Logs to console and file
 */

import winston from 'winston';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = join(__dirname, '../..');

const { combine, timestamp, printf, colorize } = winston.format;

// Custom log format
const logFormat = printf(({ level, message, timestamp, accountId }) => {
  const accountPrefix = accountId ? `[${accountId}] ` : '';
  return `[${timestamp}] ${level}: ${accountPrefix}${message}`;
});

// Create logger instance
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    logFormat
  ),
  transports: [
    // Write to file
    new winston.transports.File({
      filename: join(ROOT_DIR, 'logs', 'orchestrator.log'),
      maxsize: 10 * 1024 * 1024, // 10MB
      maxFiles: 5,
      tailable: true
    }),
    // Write to console
    new winston.transports.Console({
      format: combine(
        colorize(),
        timestamp({ format: 'HH:mm:ss' }),
        logFormat
      )
    })
  ]
});

/**
 * Create a child logger with account context
 */
export function createAccountLogger(accountId) {
  return logger.child({ accountId });
}

/**
 * Log with account context
 */
export function log(level, message, accountId = null) {
  if (accountId) {
    logger.log({ level, message, accountId });
  } else {
    logger.log({ level, message });
  }
}

// Convenience methods
export const logInfo = (message, accountId) => log('info', message, accountId);
export const logError = (message, accountId) => log('error', message, accountId);
export const logWarn = (message, accountId) => log('warn', message, accountId);
export const logDebug = (message, accountId) => log('debug', message, accountId);
