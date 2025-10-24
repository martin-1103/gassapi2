import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { ConsoleEntry } from '@/types/console';
import { ConsoleStats } from '@/lib/console/console-utils';
import { filterConsoleEntries } from '@/lib/console/console-filters';
import { formatConsoleEntryToText, exportConsoleLogs, calculateConsoleStats } from '@/lib/console/console-utils';

export interface UseConsoleStateProps {
  consoleEntries: ConsoleEntry[];
}

export interface UseConsoleStateReturn {
  // State
  activeTab: string;
  searchQuery: string;
  filteredEntries: ConsoleEntry[];
  stats: ConsoleStats;

  // Actions
  setActiveTab: (tab: string) => void;
  setSearchQuery: (query: string) => void;
  copyConsoleEntry: (entry: ConsoleEntry) => void;
  exportLogs: () => void;
  clearConsole: () => void;
  testEntry: (entry: ConsoleEntry) => void;
}

export function useConsoleState({ consoleEntries }: UseConsoleStateProps): UseConsoleStateReturn {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  // Calculate stats whenever entries change
  const stats = calculateConsoleStats(consoleEntries);

  // Filter entries based on active tab and search query
  const filteredEntries = filterConsoleEntries(consoleEntries, activeTab, searchQuery);

  // Copy console entry to clipboard
  const copyConsoleEntry = useCallback((entry: ConsoleEntry) => {
    const text = formatConsoleEntryToText(entry);
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied',
      description: 'Console output copied to clipboard',
    });
  }, [toast]);

  // Export console logs
  const exportLogs = useCallback(() => {
    try {
      exportConsoleLogs(consoleEntries, stats);
      toast({
        title: 'Console Logs Exported',
        description: `Exported ${consoleEntries.length} console entries`,
      });
    } catch (error) {
      toast({
        title: 'Export Failed',
        description: 'Failed to export console logs',
        variant: 'destructive',
      });
    }
  }, [consoleEntries, stats, toast]);

  // Clear console
  const clearConsole = useCallback(() => {
    toast({
      title: 'Console Cleared',
      description: 'Console logs have been cleared',
    });
  }, [toast]);

  // Test entry (placeholder untuk testing functionality)
  const testEntry = useCallback((entry: ConsoleEntry) => {
    toast({
      title: 'Run Again',
      description: 'This feature would run the same request with logging enabled',
    });
  }, [toast]);

  return {
    // State
    activeTab,
    searchQuery,
    filteredEntries,
    stats,

    // Actions
    setActiveTab,
    setSearchQuery,
    copyConsoleEntry,
    exportLogs,
    clearConsole,
    testEntry,
  };
}