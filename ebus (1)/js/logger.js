/**
 * Ebus Management - Centralized Logging Utility
 * Uses JavaScript console with structured logging for all actions.
 * Safe, testable, and portable across environments.
 */

const Logger = (function () {
  'use strict';

  const LEVELS = {
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3,
  };

  let currentLevel = LEVELS.INFO;

  function formatMessage(level, module, message, data) {
    const timestamp = new Date().toISOString();
    const payload = {
      timestamp,
      level,
      module: module || 'app',
      message,
    };
    if (data !== undefined) payload.data = data;
    return payload;
  }

  function log(level, levelLabel, module, message, data) {
    if (LEVELS[levelLabel] < currentLevel) return;
    const payload = formatMessage(levelLabel, module, message, data);
    const prefix = `[${payload.timestamp}] [${payload.level}] [${payload.module}]`;
    if (data !== undefined) {
      console[level](prefix, message, data);
    } else {
      console[level](prefix, message);
    }
  }

  return {
    setLevel(level) {
      if (LEVELS[level] !== undefined) currentLevel = LEVELS[level];
    },

    debug(module, message, data) {
      log('debug', 'DEBUG', module, message, data);
    },

    info(module, message, data) {
      log('info', 'INFO', module, message, data);
    },

    warn(module, message, data) {
      log('warn', 'WARN', module, message, data);
    },

    error(module, message, data) {
      log('error', 'ERROR', module, message, data);
    },

    LEVELS,
  };
})();

// Export for modules (IIFE keeps global namespace clean)
if (typeof window !== 'undefined') window.EbusLogger = Logger;
