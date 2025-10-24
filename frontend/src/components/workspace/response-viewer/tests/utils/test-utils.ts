/**
 * Utility functions untuk kalkulasi test statistics
 * Fungsi-fungsi ini membantu menghitung metrik-metrik penting dari hasil test
 */

import { TestResult } from '../../types/test-types';

// Interface untuk test statistics
export interface TestStatistics {
  passedTests: number;
  failedTests: number;
  skippedTests: number;
  errorTests: number;
  totalTests: number;
  averageDuration: number;
  successRate: number;
}

// Interface untuk performance metrics
export interface PerformanceMetrics {
  fastest: number;
  slowest: number;
  average: number;
  total: number;
}

/**
 * Menghitung statistik lengkap dari array test results
 * @param testResults Array dari hasil test
 * @returns Object dengan semua statistik yang dihitung
 */
export const calculateTestStatistics = (
  testResults: TestResult[],
): TestStatistics => {
  const passedTests = testResults.filter(t => t.status === 'pass').length;
  const failedTests = testResults.filter(t => t.status === 'fail').length;
  const skippedTests = testResults.filter(t => t.status === 'skip').length;
  const errorTests = testResults.filter(t => t.status === 'error').length;
  const totalTests = testResults.length;

  const averageDuration =
    totalTests > 0
      ? testResults.reduce((sum, test) => sum + test.duration, 0) / totalTests
      : 0;

  const successRate = totalTests > 0 ? (passedTests / totalTests) * 100 : 0;

  return {
    passedTests,
    failedTests,
    skippedTests,
    errorTests,
    totalTests,
    averageDuration,
    successRate,
  };
};

/**
 * Menghitung metrik performa dari test results
 * @param testResults Array dari hasil test
 * @returns Object dengan metrik performa
 */
export const calculatePerformanceMetrics = (
  testResults: TestResult[],
): PerformanceMetrics => {
  if (testResults.length === 0) {
    return {
      fastest: 0,
      slowest: 0,
      average: 0,
      total: 0,
    };
  }

  const durations = testResults.map(t => t.duration);
  const fastest = Math.min(...durations);
  const slowest = Math.max(...durations);
  const total = durations.reduce((sum, duration) => sum + duration, 0);
  const average = total / durations.length;

  return {
    fastest,
    slowest,
    average,
    total,
  };
};

/**
 * Mengelompokkan test berdasarkan kategori
 * @param testResults Array dari hasil test
 * @returns Object dengan test yang dikelompokkan per kategori
 */
export const categorizeTests = (testResults: TestResult[]) => {
  const statusTests = testResults.filter(t =>
    t.name.toLowerCase().includes('status'),
  );

  const timeTests = testResults.filter(
    t =>
      t.name.toLowerCase().includes('time') ||
      t.name.toLowerCase().includes('duration'),
  );

  const dataTests = testResults.filter(
    t =>
      t.name.toLowerCase().includes('data') ||
      t.name.toLowerCase().includes('validation'),
  );

  return {
    status: statusTests,
    time: timeTests,
    data: dataTests,
  };
};

/**
 * Menghitung success rate untuk kategori tertentu
 * @param tests Array test dalam kategori
 * @returns Persentase success rate (0-100)
 */
export const calculateCategorySuccessRate = (tests: TestResult[]): number => {
  if (tests.length === 0) return 0;

  const passedTests = tests.filter(t => t.status === 'pass').length;
  return (passedTests / tests.length) * 100;
};

/**
 * Format durasi waktu agar lebih mudah dibaca
 * @param duration Durasi dalam milidetik
 * @returns String durasi yang sudah diformat
 */
export const formatDuration = (duration: number): string => {
  if (duration < 1000) {
    return `${Math.round(duration)}ms`;
  } else if (duration < 60000) {
    return `${(duration / 1000).toFixed(1)}s`;
  } else {
    const minutes = Math.floor(duration / 60000);
    const seconds = Math.round((duration % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  }
};

/**
 * Menentukan warna untuk performa berdasarkan durasi
 * @param duration Durasi dalam milidetik
 * @returns String CSS class untuk warna
 */
export const getPerformanceColor = (duration: number): string => {
  if (duration < 100) return 'text-green-600 bg-green-50';
  if (duration < 500) return 'text-yellow-600 bg-yellow-50';
  return 'text-red-600 bg-red-50';
};
