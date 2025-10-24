import { useMemo } from 'react';

import {
  calculateTestStats,
  getPerformanceData,
  filterTestsByStatus,
  sortTestsByDuration
} from '@/lib/testing/test-results-processor';
import {
  getTestIcon,
  getStatusColor,
  getConsoleIcon,
  getConsoleColor,
  formatConsoleMessage
} from '@/components/workspace/response-tabs/utils';

import type { ConsoleEntry, PerformanceData, TestResult } from '@/components/workspace/response-tabs/types';

/**
 * Custom hook untuk mengelola state dan logika test results
 * Menyediakan fungsi-fungsi untuk processing dan display test results
 */
export function useTestResultsState(testResults: TestResult[], console: ConsoleEntry[] = []) {
  // Hitung statistik test
  const testStats = useMemo(() => {
    return calculateTestStats(testResults);
  }, [testResults]);

  // Dapatkan data performa
  const performanceData = useMemo((): PerformanceData | null => {
    return getPerformanceData(testResults);
  }, [testResults]);

  // Utility functions
  const utils = useMemo(() => ({
    getTestIcon,
    getStatusColor,
    getConsoleIcon,
    getConsoleColor,
    formatConsoleMessage,
  }), []);

  // Filter functions
  const filters = useMemo(() => ({
    getPassedTests: () => filterTestsByStatus(testResults, 'pass'),
    getFailedTests: () => filterTestsByStatus(testResults, 'fail'),
    getSkippedTests: () => filterTestsByStatus(testResults, 'skip'),
    getErrorTests: () => filterTestsByStatus(testResults, 'error'),
    getSlowestTests: (limit?: number) => sortTestsByDuration(testResults, 'desc').slice(0, limit),
    getFastestTests: (limit?: number) => sortTestsByDuration(testResults, 'asc').slice(0, limit),
  }), [testResults]);

  return {
    // Computed values
    ...testStats,
    performanceData,

    // Utility functions
    ...utils,

    // Filter functions
    ...filters,

    // Raw data
    testResults,
    console,
  };
}