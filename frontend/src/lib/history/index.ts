/**
 * History Module - Public API
 * Clean exports for history functionality
 */

import { HistoryManager } from './history-manager';
import { HistorySearch } from './history-search';
import { HistoryStorage } from './history-storage';
import { HistoryUtils } from './history-utils';
import {
  RequestHistoryItem,
  HistoryFilter,
  HistoryStatistics,
  HistoryExportData,
  HistoryUpdateAction,
} from './types';

// Create singleton instance
export const requestHistory = HistoryManager.getInstance();

// Re-export types
export type {
  RequestHistoryItem,
  HistoryFilter,
  HistoryStatistics,
  HistoryExportData,
  HistoryUpdateAction,
};

// Export classes for advanced usage
export { HistoryManager, HistoryUtils, HistorySearch, HistoryStorage };
