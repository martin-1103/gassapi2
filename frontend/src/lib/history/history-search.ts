/**
 * History Search and Filter Utilities
 * Handle search functionality and filtering
 */

import { RequestHistoryItem, HistoryFilter } from './types';

export class HistorySearch {
  /**
   * Filter history berdasarkan kriteria
   */
  static filterHistory(
    history: RequestHistoryItem[],
    filter: HistoryFilter,
  ): RequestHistoryItem[] {
    return history.filter(item => {
      // Method filter
      if (filter.method && item.method !== filter.method) {
        return false;
      }

      // Status filter
      if (filter.status && item.status !== filter.status) {
        return false;
      }

      // Project filter
      if (filter.projectId && item.projectId !== filter.projectId) {
        return false;
      }

      // Collection filter
      if (filter.collectionId && item.collectionId !== filter.collectionId) {
        return false;
      }

      // Environment filter
      if (filter.environment && item.environment !== filter.environment) {
        return false;
      }

      // Date range filter
      if (filter.dateFrom && item.timestamp < filter.dateFrom) {
        return false;
      }
      if (filter.dateTo && item.timestamp > filter.dateTo) {
        return false;
      }

      // Search filter
      if (filter.search) {
        const searchLower = filter.search.toLowerCase();
        const searchableText = [
          item.url,
          item.method,
          item.name,
          JSON.stringify(item.headers),
          JSON.stringify(item.body),
        ]
          .join(' ')
          .toLowerCase();

        if (!searchableText.includes(searchLower)) {
          return false;
        }
      }

      return true;
    });
  }

  /**
   * Search history by query
   */
  static searchHistory(
    history: RequestHistoryItem[],
    query: string,
  ): RequestHistoryItem[] {
    return this.filterHistory(history, { search: query });
  }

  /**
   * Find history item by ID
   */
  static findItemById(
    history: RequestHistoryItem[],
    id: string,
  ): RequestHistoryItem | null {
    return history.find(item => item.id === id) || null;
  }

  /**
   * Get history statistics
   */
  static getStatistics(history: RequestHistoryItem[]): {
    total: number;
    success: number;
    error: number;
    byMethod: Record<string, number>;
    recentActivity: RequestHistoryItem[];
  } {
    const stats = {
      total: history.length,
      success: history.filter(item => item.status === 'success').length,
      error: history.filter(item => item.status === 'error').length,
      byMethod: {} as Record<string, number>,
      recentActivity: history.slice(0, 10),
    };

    // Count by method
    history.forEach(item => {
      stats.byMethod[item.method] = (stats.byMethod[item.method] || 0) + 1;
    });

    return stats;
  }
}
