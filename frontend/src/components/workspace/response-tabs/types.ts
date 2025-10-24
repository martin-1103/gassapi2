/**
 * Type definitions untuk test results
 */

export interface TestResult {
  id: string;
  name: string;
  status: 'pass' | 'fail' | 'skip' | 'error';
  message?: string;
  duration: number;
  error?: Error;
  assertionResults?: AssertionResult[];
}

export interface AssertionResult {
  assertion: string;
  status: 'pass' | 'fail';
  message: string;
  actual?: unknown;
  expected?: unknown;
}

export interface ConsoleEntry {
  level: 'log' | 'info' | 'warn' | 'error' | 'debug';
  message: string;
  timestamp: number;
  data?: unknown;
}

export interface PerformanceData {
  fastest: number;
  slowest: number;
  total: number;
  average: number;
  testCount: number;
}
