/**
 * Testing Types - Reusable interfaces for testing operations
 * Extracted from testing.ts to improve modularity
 */

import { TestSuite, TestConfig, TestResult, TestExecutionResult } from '../../shared/types/index.js';

// HTTP Methods
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';

// Endpoint testing types
export interface EndpointTestRequest {
  endpointId: string;
  environmentId?: string;
  variables?: Record<string, string>;
  timeout?: number;
}

export interface EndpointTestResponse {
  success: boolean;
  data?: TestResult;
  message?: string;
  error?: string;
}

// Batch testing types
export interface BatchTestRequest {
  endpointIds: string[];
  environmentId?: string;
  variables?: Record<string, string>;
  config?: TestConfig;
}

export interface BatchTestResponse {
  success: boolean;
  data?: TestExecutionResult;
  message?: string;
  error?: string;
  details?: string[];
}

// Test suite management
export interface CreateTestSuiteRequest {
  name: string;
  description?: string;
  endpointIds: string[];
  environmentId?: string;
  config?: TestConfig;
}

export interface CreateTestSuiteResponse {
  success: boolean;
  data?: TestSuite;
  message?: string;
  error?: string;
  details?: string[];
}

export interface ListTestSuitesRequest {
  projectId?: string;
  activeOnly?: boolean;
}

export interface ListTestSuitesResponse {
  success: boolean;
  data?: TestSuite[];
  message?: string;
  error?: string;
}

// Test validation
export interface TestValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

// Test service interfaces
export interface TestingService {
  testEndpoint(request: EndpointTestRequest): Promise<EndpointTestResponse>;
  testMultipleEndpoints(request: BatchTestRequest): Promise<BatchTestResponse>;
  createTestSuite(request: CreateTestSuiteRequest): Promise<CreateTestSuiteResponse>;
  listTestSuites(request: ListTestSuitesRequest): Promise<ListTestSuitesResponse>;
  executeTestSuite(suiteId: string, variables?: Record<string, string>): Promise<TestExecutionResult>;
}

// Test reporting
export interface TestReport {
  suiteId: string;
  suiteName: string;
  executionTime: number;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  skippedTests: number;
  successRate: number;
  averageResponseTime: number;
  results: TestResult[];
  timestamp: string;
}

export interface TestComparison {
  baseline: TestReport;
  current: TestReport;
  performanceDelta: number;
  successRateDelta: number;
  regression: boolean;
}

// Re-export shared types for convenience
export {
  TestSuite,
  TestConfig,
  TestResult,
  TestExecutionResult
};