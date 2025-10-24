/**
 * Request History Management (Refactored)
 * @deprecated Import from './index' instead for the new modular API
 *
 * This file maintains backward compatibility while the new modular structure is available at:
 * - types.ts: Type definitions
 * - history-storage.ts: Storage operations
 * - history-search.ts: Search and filtering
 * - history-utils.ts: Utility functions
 * - history-manager.ts: Main manager class
 * - index.ts: Clean public API
 */

// Re-export dari module baru untuk backward compatibility
export {
  RequestHistoryItem,
  HistoryFilter,
  HistoryManager as RequestHistory,
  requestHistory,
  type HistoryStatistics,
  type HistoryExportData,
  type HistoryUpdateAction,
} from './index';

// Export utilities juga untuk backward compatibility
export { HistoryUtils } from './history-utils';
