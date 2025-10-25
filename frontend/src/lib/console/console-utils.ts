import {
  validatePropertyName,
  safePropertyAccess,
  safePropertyAssignment,
} from '@/lib/security/object-injection-utils';
import { ConsoleEntry } from '@/types/console';

export interface ConsoleStats {
  total: number;
  info: number;
  warn: number;
  error: number;
  debug: number;
  log: number;
}

/**
 * Menghitung statistik berdasarkan level console entries
 */
export const calculateConsoleStats = (
  consoleEntries: ConsoleEntry[],
): ConsoleStats => {
  return {
    total: consoleEntries.length,
    info: consoleEntries.filter(e => e.level === 'info').length,
    warn: consoleEntries.filter(e => e.level === 'warn').length,
    error: consoleEntries.filter(e => e.level === 'error').length,
    debug: consoleEntries.filter(e => e.level === 'debug').length,
    log: consoleEntries.filter(e => e.level === 'log').length,
  };
};

/**
 * Format timestamp ke format yang readable
 */
export const formatTimestamp = (timestamp: number): string => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString();
};

/**
 * Format console entry ke teks untuk copy functionality
 */
export const formatConsoleEntryToText = (entry: ConsoleEntry): string => {
  const timestamp = formatTimestamp(entry.timestamp);
  let text = `[${timestamp}] ${entry.level.toUpperCase()}: ${entry.message}`;

  if (entry.data) {
    text += `\nData: ${JSON.stringify(entry.data, null, 2)}`;
  }

  if (entry.stackTrace) {
    text += `\n${entry.stackTrace}`;
  }

  return text;
};

/**
 * Export console logs ke JSON file
 */
export const exportConsoleLogs = (
  consoleEntries: ConsoleEntry[],
  stats: ConsoleStats,
): void => {
  const logsData = {
    logs: consoleEntries,
    exportedAt: new Date().toISOString(),
    stats,
  };

  const blob = new Blob([JSON.stringify(logsData, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `console-logs-${Date.now()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

/**
 * Group console entries by level
 */
export const groupConsoleEntriesByLevel = (
  entries: ConsoleEntry[],
): Record<string, ConsoleEntry[]> => {
  const allowedLevels = ['info', 'warn', 'error', 'debug', 'log'];

  return entries.reduce(
    (acc, entry) => {
      const level = entry.level;
      // Validate level menggunakan security utilities
      const levelValidation = validatePropertyName(level);
      if (allowedLevels.includes(level) && levelValidation.isValid) {
        // Safe property access dan assignment
        const existingEntries = safePropertyAccess(acc, level);
        if (!existingEntries) {
          safePropertyAssignment(acc, level, []);
        }
        const currentEntries = safePropertyAccess(acc, level) as ConsoleEntry[];
        currentEntries.push(entry);
      }
      return acc;
    },
    {} as Record<string, ConsoleEntry[]>,
  );
};

/**
 * Get CSS class untuk warna berdasarkan level
 */
export const getLevelColorClass = (level: string): string => {
  switch (level) {
    case 'info':
      return 'text-blue-600';
    case 'warn':
      return 'text-yellow-600';
    case 'error':
      return 'text-red-600';
    case 'debug':
      return 'text-purple-600';
    case 'log':
      return 'text-gray-600';
    default:
      return 'text-gray-600';
  }
};

/**
 * Get CSS class untuk background dan border berdasarkan level
 */
export const getLevelBackgroundClass = (level: string): string => {
  switch (level) {
    case 'error':
      return 'border-red-200 bg-red-50';
    case 'warn':
      return 'border-yellow-200 bg-yellow-50';
    case 'debug':
      return 'border-purple-200 bg-purple-50';
    case 'info':
      return 'border-blue-200 bg-blue-50';
    case 'log':
    default:
      return 'border-gray-200 bg-gray-50';
  }
};
