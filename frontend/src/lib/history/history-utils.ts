/**
 * History Utilities
 * Utility functions untuk date formatting, data transformation, etc.
 */

import { RequestHistoryItem, HistoryExportData } from './types';

export class HistoryUtils {
  /**
   * Sanitize headers untuk export (remove sensitive data)
   */
  static sanitizeHeaders(
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

  /**
   * Sanitize body untuk export (remove sensitive data)
   */
  static sanitizeBody(body: unknown): unknown {
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

  /**
   * Format timestamp ke readable string
   */
  static formatTimestamp(timestamp: number): string {
    return new Date(timestamp).toLocaleString('id-ID');
  }

  /**
   * Format duration ke readable string
   */
  static formatDuration(duration: number): string {
    if (duration < 1000) {
      return `${duration}ms`;
    } else if (duration < 60000) {
      return `${(duration / 1000).toFixed(2)}s`;
    } else {
      return `${(duration / 60000).toFixed(2)}m`;
    }
  }

  /**
   * Export history ke JSON format
   */
  static exportHistory(history: RequestHistoryItem[]): string {
    const exportData: HistoryExportData = {
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
  }

  /**
   * Parse dan validate imported history data
   */
  static parseImportData(jsonData: string): HistoryExportData {
    const importData = JSON.parse(jsonData);

    if (!importData.history || !Array.isArray(importData.history)) {
      throw new Error('Invalid import data format');
    }

    return importData;
  }

  /**
   * Get status color untuk UI
   */
  static getStatusColor(status: RequestHistoryItem['status']): string {
    switch (status) {
      case 'success':
        return '#10b981'; // green
      case 'error':
        return '#ef4444'; // red
      case 'pending':
        return '#f59e0b'; // yellow
      default:
        return '#6b7280'; // gray
    }
  }

  /**
   * Get method color untuk UI
   */
  static getMethodColor(method: string): string {
    const colors: Record<string, string> = {
      GET: '#3b82f6', // blue
      POST: '#10b981', // green
      PUT: '#f59e0b', // yellow
      DELETE: '#ef4444', // red
      PATCH: '#8b5cf6', // purple
      HEAD: '#6b7280', // gray
      OPTIONS: '#6b7280', // gray
    };

    return colors[method.toUpperCase()] || '#6b7280';
  }
}
