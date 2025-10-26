/**
 * Shared types for MCP2 Tools
 * Common interfaces and types used across modules
 */

import { McpToolResponse } from '../../types.js';

// Export actual implementations, not just types
export const MCP_TOOL_RESPONSE_SYMBOL = Symbol('McpToolResponse');

// Base response types
export interface BaseResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export interface DataResponse<T = any> extends BaseResponse {
  data?: T;
}

// API related types
export interface ApiEndpoint {
  id: string;
  name: string;
  method: string;
  url: string;
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
  description?: string;
}

export interface ApiExecutionResult {
  success: boolean;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  data: any;
  responseTime: number;
  error?: string;
}

// Flow related types
export interface FlowStep {
  id: string;
  name: string;
  endpointId?: string;
  method?: string;
  url?: string;
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
  expectedStatus?: number;
  description?: string;
}

export interface FlowConfig {
  timeout?: number;
  stopOnError?: boolean;
  parallel?: boolean;
  maxConcurrency?: number;
}

export interface FlowExecutionResult {
  success: boolean;
  data?: {
    flowId: string;
    status: string;
    executionTime: number;
    nodeResults: FlowNodeResult[];
    errors: string[];
    timestamp: string;
  };
  message?: string;
}

export interface FlowNodeResult {
  stepId: string;
  stepName: string;
  success: boolean;
  executionTime: number;
  request?: {
    method: string;
    url: string;
    headers: Record<string, string>;
    body?: any;
  };
  response?: ApiExecutionResult;
  error?: string;
}

export interface FlowDetailsResponse {
  success: boolean;
  data?: {
    id: string;
    name: string;
    description?: string;
    flow_data?: {
      version: string;
      steps: FlowStep[];
      config: FlowConfig;
    };
    flow_inputs?: string;
    project_id: string;
    folder_id?: string;
    is_active: boolean;
    created_at?: string;
    updated_at?: string;
  };
  message?: string;
}

// Environment related types
export interface Environment {
  id: string;
  name: string;
  baseUrl: string;
  headers?: Record<string, string>;
  variables?: Record<string, string>;
  description?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface EnvironmentListResponse {
  success: boolean;
  data?: Environment[];
  message?: string;
}

export interface EnvironmentDetailsResponse extends DataResponse<Environment> {}

// Folder related types
export interface Folder {
  id: string;
  name: string;
  description?: string;
  project_id: string;
  folder_id?: string; // Parent folder ID
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface FolderListResponse {
  success: boolean;
  data?: Folder[];
  message?: string;
}

export interface FolderDetailsResponse extends DataResponse<Folder> {}

// Testing related types
export interface TestSuite {
  id: string;
  name: string;
  description?: string;
  endpoints: string[];
  environment?: string;
  config?: TestConfig;
}

export interface TestConfig {
  timeout?: number;
  parallel?: boolean;
  retries?: number;
  stopOnError?: boolean;
}

export interface TestResult {
  endpointId: string;
  endpointName: string;
  success: boolean;
  executionTime: number;
  request: {
    method: string;
    url: string;
    headers: Record<string, string>;
    body?: any;
  };
  response: ApiExecutionResult;
  error?: string;
}

export interface TestExecutionResult {
  success: boolean;
  data?: {
    suiteId: string;
    totalTests: number;
    passedTests: number;
    failedTests: number;
    executionTime: number;
    results: TestResult[];
    timestamp: string;
  };
  message?: string;
}

// MCP Tool types
export interface ToolResponse extends McpToolResponse {}

// Error types
export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

export interface APIError {
  code: string;
  message: string;
  details?: any;
}