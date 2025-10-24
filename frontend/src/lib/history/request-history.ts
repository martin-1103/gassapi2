/**
 * Request History Management
 * Menyimpan history request/response untuk debugging dan dokumentasi
 */

import { DirectResponse } from '../api/direct-client';

export interface RequestHistoryItem {
  id: string;
  name?: string;
  method: string;
  url: string;
  headers: Record<string, string>;
  body?: any;
  response?: DirectResponse;
  timestamp: number;
  duration: number;
  status: 'success' | 'error' | 'pending';
  projectId?: string;
  collectionId?: string;
  endpointId?: string;
  environment?: string;
  tags?: string[];
}

export interface HistoryFilter {
  method?: string;
  status?: 'success' | 'error' | 'pending';
  projectId?: string;
  collectionId?: string;
  environment?: string;
  dateFrom?: number;
  dateTo?: number;
  search?: string;
}

export class RequestHistory {
  private storageKey = 'gass-api-request-history';
  private maxHistoryItems = 1000;

  /**
   * Tambah request ke history
   */
  async addToHistory(
    item: Omit<RequestHistoryItem, 'id' | 'timestamp'>,
  ): Promise<void> {
    try {
      const history = await this.getHistory();
      const newItem: RequestHistoryItem = {
        ...item,
        id: this.generateId(),
        timestamp: Date.now(),
        duration: item.response?.time || 0,
      };

      // Add ke awal array
      history.unshift(newItem);

      // Limit history size
      if (history.length > this.maxHistoryItems) {
        history.splice(this.maxHistoryItems);
      }

      await this.saveHistory(history);

      // Dispatch event untuk UI update
      window.dispatchEvent(
        new CustomEvent('requestHistoryUpdated', {
          detail: { action: 'added', item: newItem },
        }),
      );
    } catch (error) {
      console.error('Gagal menambah request ke history:', error);
    }
  }

  /**
   * Dapatkan semua history
   */
  async getHistory(limit?: number): Promise<RequestHistoryItem[]> {
    try {
      const stored = localStorage.getItem(this.storageKey);
      const history = stored ? JSON.parse(stored) : [];

      // Sort by timestamp (latest first)
      const sorted = history.sort(
        (a: RequestHistoryItem, b: RequestHistoryItem) =>
          b.timestamp - a.timestamp,
      );

      return limit ? sorted.slice(0, limit) : sorted;
    } catch (error) {
      console.error('Gagal mengambil history:', error);
      return [];
    }
  }

  /**
   * Filter history berdasarkan kriteria
   */
  async filterHistory(filter: HistoryFilter): Promise<RequestHistoryItem[]> {
    try {
      const history = await this.getHistory();

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
    } catch (error) {
      console.error('Gagal filter history:', error);
      return [];
    }
  }

  /**
   * Search history
   */
  async searchHistory(query: string): Promise<RequestHistoryItem[]> {
    return this.filterHistory({ search: query });
  }

  /**
   * Dapatkan item by ID
   */
  async getHistoryItem(id: string): Promise<RequestHistoryItem | null> {
    try {
      const history = await this.getHistory();
      return history.find(item => item.id === id) || null;
    } catch (error) {
      console.error('Gagal mengambil history item:', error);
      return null;
    }
  }

  /**
   * Update history item
   */
  async updateHistoryItem(
    id: string,
    updates: Partial<RequestHistoryItem>,
  ): Promise<boolean> {
    try {
      const history = await this.getHistory();
      const index = history.findIndex(item => item.id === id);

      if (index === -1) return false;

      history[index] = { ...history[index], ...updates };
      await this.saveHistory(history);

      // Dispatch event untuk UI update
      window.dispatchEvent(
        new CustomEvent('requestHistoryUpdated', {
          detail: { action: 'updated', item: history[index] },
        }),
      );

      return true;
    } catch (error) {
      console.error('Gagal update history item:', error);
      return false;
    }
  }

  /**
   * Delete history item
   */
  async deleteHistoryItem(id: string): Promise<boolean> {
    try {
      const history = await this.getHistory();
      const filtered = history.filter(item => item.id !== id);

      if (filtered.length === history.length) return false;

      await this.saveHistory(filtered);

      // Dispatch event untuk UI update
      window.dispatchEvent(
        new CustomEvent('requestHistoryUpdated', {
          detail: { action: 'deleted', id },
        }),
      );

      return true;
    } catch (error) {
      console.error('Gagal delete history item:', error);
      return false;
    }
  }

  /**
   * Clear all history
   */
  async clearHistory(): Promise<void> {
    try {
      localStorage.removeItem(this.storageKey);

      // Dispatch event untuk UI update
      window.dispatchEvent(
        new CustomEvent('requestHistoryUpdated', {
          detail: { action: 'cleared' },
        }),
      );
    } catch (error) {
      console.error('Gagal clear history:', error);
    }
  }

  /**
   * Clear history for specific project
   */
  async clearProjectHistory(projectId: string): Promise<void> {
    try {
      const history = await this.getHistory();
      const filtered = history.filter(item => item.projectId !== projectId);
      await this.saveHistory(filtered);

      // Dispatch event untuk UI update
      window.dispatchEvent(
        new CustomEvent('requestHistoryUpdated', {
          detail: { action: 'cleared-project', projectId },
        }),
      );
    } catch (error) {
      console.error('Gagal clear project history:', error);
    }
  }

  /**
   * Get statistics
   */
  async getStatistics(): Promise<{
    total: number;
    success: number;
    error: number;
    byMethod: Record<string, number>;
    recentActivity: RequestHistoryItem[];
  }> {
    try {
      const history = await this.getHistory();

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
    } catch (error) {
      console.error('Gagal get statistics:', error);
      return {
        total: 0,
        success: 0,
        error: 0,
        byMethod: {},
        recentActivity: [],
      };
    }
  }

  /**
   * Export history ke JSON
   */
  async exportHistory(): Promise<string> {
    try {
      const history = await this.getHistory();
      const exportData = {
        version: '1.0',
        exportedAt: new Date().toISOString(),
        totalItems: history.length,
        history: history.map(item => ({
          ...item,
          // Remove sensitive data
          headers: this.sanitizeHeaders(item.headers),
          body: this.sanitizeBody(item.body),
          response: item.response
            ? {
                ...item.response,
                headers: this.sanitizeHeaders(item.response.headers),
              }
            : undefined,
        })),
      };

      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      console.error('Gagal export history:', error);
      throw error;
    }
  }

  /**
   * Import history dari JSON
   */
  async importHistory(jsonData: string): Promise<number> {
    try {
      const importData = JSON.parse(jsonData);

      if (!importData.history || !Array.isArray(importData.history)) {
        throw new Error('Invalid import data format');
      }

      const history = await this.getHistory();
      const newItems = importData.history.filter(
        (item: RequestHistoryItem) =>
          !history.find(existing => existing.id === item.id),
      );

      // Add new items to existing history
      const updatedHistory = [...newItems, ...history];
      await this.saveHistory(updatedHistory.slice(0, this.maxHistoryItems));

      // Dispatch event untuk UI update
      window.dispatchEvent(
        new CustomEvent('requestHistoryUpdated', {
          detail: { action: 'imported', count: newItems.length },
        }),
      );

      return newItems.length;
    } catch (error) {
      console.error('Gagal import history:', error);
      throw error;
    }
  }

  private async saveHistory(history: RequestHistoryItem[]): Promise<void> {
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

  private generateId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private sanitizeHeaders(
    headers: Record<string, string>,
  ): Record<string, string> {
    const sanitized: Record<string, string> = {};

    for (const [key, value] of Object.entries(headers)) {
      // Mask sensitive headers
      if (
        key.toLowerCase().includes('authorization') ||
        key.toLowerCase().includes('token') ||
        key.toLowerCase().includes('password') ||
        key.toLowerCase().includes('secret')
      ) {
        sanitized[key] = '***masked***';
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }

  private sanitizeBody(body: any): any {
    if (!body || typeof body !== 'object') return body;

    try {
      const bodyStr = JSON.stringify(body);
      // Mask common sensitive fields
      return JSON.parse(
        bodyStr
          .replace(/"password":\s*"[^"]*"/g, '"password":"***"')
          .replace(/"token":\s*"[^"]*"/g, '"token":"***"')
          .replace(/"secret":\s*"[^"]*"/g, '"secret":"***"')
          .replace(/"key":\s*"[^"]*"/g, '"key":"***"'),
      );
    } catch {
      return body;
    }
  }
}

// Global instance
export const requestHistory = new RequestHistory();
