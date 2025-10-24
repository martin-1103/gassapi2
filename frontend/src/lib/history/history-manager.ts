/**
 * History Manager
 * Main class yang encapsulate semua history functionality
 */

import { RequestHistoryItem, HistoryFilter, HistoryStatistics, HistoryUpdateAction } from './types';
import { HistoryStorage } from './history-storage';
import { HistorySearch } from './history-search';
import { HistoryUtils } from './history-utils';

export class HistoryManager {
  private storage: HistoryStorage;
  private static instance: HistoryManager;

  constructor() {
    this.storage = new HistoryStorage();
  }

  /**
   * Singleton pattern
   */
  static getInstance(): HistoryManager {
    if (!HistoryManager.instance) {
      HistoryManager.instance = new HistoryManager();
    }
    return HistoryManager.instance;
  }

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
        id: this.storage.generateId(),
        timestamp: Date.now(),
        duration: item.response?.time || 0,
      };

      // Add ke awal array
      history.unshift(newItem);

      // Limit history size
      const maxItems = this.storage.getMaxHistoryItems();
      if (history.length > maxItems) {
        history.splice(maxItems);
      }

      await this.storage.saveHistory(history);
      this.dispatchUpdate({ action: 'added', item: newItem });
    } catch (error) {
      console.error('Gagal menambah request ke history:', error);
    }
  }

  /**
   * Dapatkan semua history
   */
  async getHistory(limit?: number): Promise<RequestHistoryItem[]> {
    try {
      const history = await this.storage.loadHistory();
      return limit ? history.slice(0, limit) : history;
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
      return HistorySearch.filterHistory(history, filter);
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
      return HistorySearch.findItemById(history, id);
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
      await this.storage.saveHistory(history);
      this.dispatchUpdate({ action: 'updated', item: history[index] });

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

      await this.storage.saveHistory(filtered);
      this.dispatchUpdate({ action: 'deleted', id });

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
      await this.storage.clearStorage();
      this.dispatchUpdate({ action: 'cleared' });
    } catch (error) {
      console.error('Gagal clear history:', error);
    }
  }

  /**
   * Clear history untuk project tertentu
   */
  async clearProjectHistory(projectId: string): Promise<void> {
    try {
      const history = await this.getHistory();
      const filtered = history.filter(item => item.projectId !== projectId);
      await this.storage.saveHistory(filtered);
      this.dispatchUpdate({ action: 'cleared-project', projectId });
    } catch (error) {
      console.error('Gagal clear project history:', error);
    }
  }

  /**
   * Get statistics
   */
  async getStatistics(): Promise<HistoryStatistics> {
    try {
      const history = await this.getHistory();
      return HistorySearch.getStatistics(history);
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
      return HistoryUtils.exportHistory(history);
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
      const importData = HistoryUtils.parseImportData(jsonData);
      const history = await this.getHistory();

      const newItems = importData.history.filter(
        (item: RequestHistoryItem) =>
          !history.find(existing => existing.id === item.id),
      );

      // Add new items to existing history
      const updatedHistory = [...newItems, ...history];
      const maxItems = this.storage.getMaxHistoryItems();
      await this.storage.saveHistory(updatedHistory.slice(0, maxItems));

      this.dispatchUpdate({ action: 'imported', count: newItems.length });
      return newItems.length;
    } catch (error) {
      console.error('Gagal import history:', error);
      throw error;
    }
  }

  /**
   * Dispatch update event untuk UI
   */
  private dispatchUpdate(detail: HistoryUpdateAction): void {
    window.dispatchEvent(
      new CustomEvent('requestHistoryUpdated', { detail }),
    );
  }
}