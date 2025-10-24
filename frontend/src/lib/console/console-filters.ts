import { ConsoleEntry } from '@/types/console';

/**
 * Filter console entries berdasarkan level dan search query
 */
export const filterConsoleEntries = (
  entries: ConsoleEntry[],
  activeTab: string,
  searchQuery: string
): ConsoleEntry[] => {
  return entries.filter(entry => {
    // Filter by level
    if (activeTab !== 'all' && entry.level !== activeTab) {
      return false;
    }

    // Filter by search query
    if (searchQuery) {
      return entry.message.toLowerCase().includes(searchQuery.toLowerCase());
    }

    return true;
  });
};

/**
 * Filter entries by specific level
 */
export const filterByLevel = (entries: ConsoleEntry[], level: string): ConsoleEntry[] => {
  if (level === 'all') return entries;
  return entries.filter(entry => entry.level === level);
};

/**
 * Search entries by message content
 */
export const searchByMessage = (entries: ConsoleEntry[], query: string): ConsoleEntry[] => {
  if (!query.trim()) return entries;

  const searchTerm = query.toLowerCase();
  return entries.filter(entry =>
    entry.message.toLowerCase().includes(searchTerm)
  );
};

/**
 * Get unique levels from entries
 */
export const getUniqueLevels = (entries: ConsoleEntry[]): string[] => {
  return Array.from(new Set(entries.map(entry => entry.level)));
};

/**
 * Filter entries with data
 */
export const filterEntriesWithData = (entries: ConsoleEntry[]): ConsoleEntry[] => {
  return entries.filter(entry => entry.data !== undefined && entry.data !== null);
};

/**
 * Filter entries with stack trace
 */
export const filterEntriesWithStackTrace = (entries: ConsoleEntry[]): ConsoleEntry[] => {
  return entries.filter(entry => entry.stackTrace && entry.stackTrace.trim().length > 0);
};

/**
 * Filter entries by duration threshold
 */
export const filterEntriesByDuration = (
  entries: ConsoleEntry[],
  minDuration?: number,
  maxDuration?: number
): ConsoleEntry[] => {
  return entries.filter(entry => {
    if (entry.duration === undefined) return false;

    if (minDuration !== undefined && entry.duration < minDuration) return false;
    if (maxDuration !== undefined && entry.duration > maxDuration) return false;

    return true;
  });
};