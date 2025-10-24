/**
 * Type definitions untuk test result components
 * Memastikan konsistensi tipe data di seluruh test components
 */

export interface TestResult {
  name: string;
  status: 'pass' | 'fail' | 'skip' | 'error';
  message?: string;
  duration: number;
  error?: Error;
  assertionResults?: Array<{
    assertion: string;
    status: 'pass' | 'fail';
    message: string;
    actual?: any;
    expected?: any;
  }>;
}

export interface ResponseTestsTabProps {
  testResults: TestResult[];
}

export interface TestStatistics {
  passedTests: number;
  failedTests: number;
  skippedTests: number;
  errorTests: number;
  totalTests: number;
  averageDuration: number;
  successRate: number;
}

export interface PerformanceMetrics {
  fastest: number;
  slowest: number;
  average: number;
  total: number;
}

export interface TestSummary {
  label: string;
  description: string;
  color: string;
  bgColor: string;
}

export interface TestCategories {
  status: TestResult[];
  time: TestResult[];
  data: TestResult[];
}

export interface AssertionCounts {
  passed: number;
  failed: number;
  total: number;
}
