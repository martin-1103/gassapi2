import type { PerformanceData, TestResult } from '@/components/workspace/response-tabs/types';

/**
 * Library untuk processing test results
 * Menyediakan fungsi-fungsi untuk analisis dan agregasi hasil test
 */

/**
 * Menghitung statistik test dari array test results
 */
export function calculateTestStats(testResults: TestResult[]) {
  const passedTests = testResults.filter(t => t.status === 'pass').length;
  const failedTests = testResults.filter(t => t.status === 'fail').length;
  const skippedTests = testResults.filter(t => t.status === 'skip').length;
  const errorTests = testResults.filter(t => t.status === 'error').length;
  const totalTests = testResults.length;

  const averageDuration =
    testResults.length > 0
      ? testResults.reduce((sum, test) => sum + test.duration, 0) /
        testResults.length
      : 0;

  return {
    passedTests,
    failedTests,
    skippedTests,
    errorTests,
    totalTests,
    averageDuration,
  };
}

/**
 * Mendapatkan data performa dari test results
 */
export function getPerformanceData(testResults: TestResult[]): PerformanceData | null {
  if (testResults.length === 0) return null;

  const durations = testResults.map(t => t.duration);
  const fastest = Math.min(...durations);
  const slowest = Math.max(...durations);
  const total = durations.reduce((sum, d) => sum + d, 0);
  const average = total / testResults.length;

  return {
    fastest,
    slowest,
    total,
    average,
    testCount: testResults.length,
  };
}

/**
 * Filter test results berdasarkan status
 */
export function filterTestsByStatus(
  testResults: TestResult[],
  status: TestResult['status']
): TestResult[] {
  return testResults.filter(test => test.status === status);
}

/**
 * Sort test results berdasarkan durasi
 */
export function sortTestsByDuration(
  testResults: TestResult[],
  order: 'asc' | 'desc' = 'desc'
): TestResult[] {
  return [...testResults].sort((a, b) =>
    order === 'desc' ? b.duration - a.duration : a.duration - b.duration
  );
}

/**
 * Mendapatkan test yang paling lambat
 */
export function getSlowestTests(testResults: TestResult[], limit: number = 5): TestResult[] {
  return sortTestsByDuration(testResults, 'desc').slice(0, limit);
}

/**
 * Mendapatkan test yang paling cepat
 */
export function getFastestTests(testResults: TestResult[], limit: number = 5): TestResult[] {
  return sortTestsByDuration(testResults, 'asc').slice(0, limit);
}