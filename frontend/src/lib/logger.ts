/**
 * Centralized logger utility untuk mengganti console statements
 * Terintegrasi dengan existing ConsoleEntry system
 */

import { ConsoleEntry } from '@/types/api';

type LogLevel = 'info' | 'warn' | 'error' | 'debug' | 'log';

export interface Logger {
  info(message: string, data?: unknown, source?: string): void;
  warn(message: string, data?: unknown, source?: string): void;
  error(message: string, error?: Error | unknown, source?: string): void;
  debug(message: string, data?: unknown, source?: string): void;
  log(message: string, data?: unknown, source?: string): void;
}

class ConsoleLogger implements Logger {
  private entries: ConsoleEntry[] = [];

  private createEntry(
    level: LogLevel,
    message: string,
    data?: unknown,
    source?: string,
  ): ConsoleEntry {
    return {
      level,
      message,
      timestamp: Date.now(),
      source: source || 'app',
      data,
      stackTrace:
        level === 'error' && data instanceof Error ? data.stack : undefined,
    };
  }

  private storeEntry(entry: ConsoleEntry): void {
    this.entries.push(entry);

    // Emit custom event untuk UI components
    window.dispatchEvent(
      new CustomEvent('loggerEntry', {
        detail: entry,
      }),
    );
  }

  info(message: string, data?: unknown, source?: string): void {
    const entry = this.createEntry('info', message, data, source);
    this.storeEntry(entry);

    // Fallback ke native console untuk development
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.info(`[${entry.source}] ${message}`, data);
    }
  }

  warn(message: string, data?: unknown, source?: string): void {
    const entry = this.createEntry('warn', message, data, source);
    this.storeEntry(entry);

    // Fallback ke native console untuk development
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.warn(`[${entry.source}] ${message}`, data);
    }
  }

  error(message: string, error?: Error | unknown, source?: string): void {
    const entry = this.createEntry('error', message, error, source);
    this.storeEntry(entry);

    // Fallback ke native console untuk development
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.error(`[${entry.source}] ${message}`, error);
    }
  }

  debug(message: string, data?: unknown, source?: string): void {
    const entry = this.createEntry('debug', message, data, source);
    this.storeEntry(entry);

    // Fallback ke native console untuk development
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.debug(`[${entry.source}] ${message}`, data);
    }
  }

  log(message: string, data?: unknown, source?: string): void {
    const entry = this.createEntry('log', message, data, source);
    this.storeEntry(entry);

    // Fallback ke native console untuk development
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.log(`[${entry.source}] ${message}`, data);
    }
  }

  /**
   * Get all log entries
   */
  getEntries(): ConsoleEntry[] {
    return [...this.entries];
  }

  /**
   * Get log entries by level
   */
  getEntriesByLevel(level: LogLevel): ConsoleEntry[] {
    return this.entries.filter(entry => entry.level === level);
  }

  /**
   * Clear all log entries
   */
  clearEntries(): void {
    this.entries = [];
  }

  /**
   * Get log entries by source
   */
  getEntriesBySource(source: string): ConsoleEntry[] {
    return this.entries.filter(entry => entry.source === source);
  }
}

// Singleton instance
export const logger = new ConsoleLogger();

/**
 * Hook untuk React components yang mau listen ke log entries
 */
export function useLogger() {
  // This would typically be implemented with useState and useEffect
  // Untuk sekarang, kita return entries langsung
  return {
    entries: logger.getEntries(),
    clearEntries: () => logger.clearEntries(),
    getEntriesByLevel: (level: LogLevel) => logger.getEntriesByLevel(level),
    getEntriesBySource: (source: string) => logger.getEntriesBySource(source),
  };
}
