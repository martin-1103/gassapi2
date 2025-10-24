/**
 * History Storage Utilities
 * Handle storage operations (CRUD, persistence, etc.)
 */

import { RequestHistoryItem } from './types';

export class HistoryStorage {
  private storageKey = 'gass-api-request-history';
  private maxHistoryItems = 1000;

  /**
   * Save history ke localStorage
   */
  async saveHistory(history: RequestHistoryItem[]): Promise<void> {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(history));
    } catch (error) {
      // Handle quota exceeded error
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        // Remove oldest items and retry
        const trimmed = history.slice(
          0,
          Math.floor(this.maxHistoryItems * 0.8),
        );
        localStorage.setItem(this.storageKey, JSON.stringify(trimmed));
      } else {
        throw error;
      }
    }
  }

  /**
   * Load history dari localStorage
   */
  async loadHistory(): Promise<RequestHistoryItem[]> {
    try {
      const stored = localStorage.getItem(this.storageKey);
      const history = stored ? JSON.parse(stored) : [];

      // Sort by timestamp (latest first)
      return history.sort(
        (a: RequestHistoryItem, b: RequestHistoryItem) =>
          b.timestamp - a.timestamp,
      );
    } catch (error) {
      console.error('Gagal mengambil history:', error);
      return [];
    }
  }

  /**
   * Clear all history dari storage
   */
  async clearStorage(): Promise<void> {
    try {
      localStorage.removeItem(this.storageKey);
    } catch (error) {
      console.error('Gagal clear history storage:', error);
    }
  }

  /**
   * Get max history items limit
   */
  getMaxHistoryItems(): number {
    return this.maxHistoryItems;
  }

  /**
   * Generate unique ID untuk history item
   */
  generateId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}