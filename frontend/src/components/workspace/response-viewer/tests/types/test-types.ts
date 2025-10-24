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
    actual?: unknown;
    expected?: unknown;
  }>;
}

export interface ResponseTestsTabProps {
  testResults: TestResult[];
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
