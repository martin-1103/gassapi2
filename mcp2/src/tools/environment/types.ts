/**
 * Environment Types - Reusable interfaces for environment operations
 * Extracted from environment.ts to improve modularity
 */

import { Environment, EnvironmentListResponse, EnvironmentDetailsResponse } from '../../shared/types/index.js';

// Environment variable operations
export type VariableOperation = 'merge' | 'replace';

export interface EnvironmentVariable {
  key: string;
  value: string;
  description?: string;
}

export interface EnvironmentVariables {
  [key: string]: string;
}

// Environment request/response types
export interface ListEnvironmentsRequest {
  projectId?: string;
  activeOnly?: boolean;
}

export interface ListEnvironmentsResponse {
  success: boolean;
  data?: Environment[];
  message?: string;
  error?: string;
}

export interface GetEnvironmentDetailsRequest {
  environmentId: string;
  includeVariables?: boolean;
}

export interface UpdateEnvironmentVariablesRequest {
  environmentId: string;
  variables: EnvironmentVariables;
  operation?: VariableOperation;
}

export interface UpdateEnvironmentVariablesResponse {
  success: boolean;
  message?: string;
  error?: string;
  data?: {
    updatedVariables: string[];
    removedVariables?: string[];
    totalVariables: number;
  };
}

export interface CreateEnvironmentRequest {
  name: string;
  description?: string;
  variables?: EnvironmentVariables;
  isDefault?: boolean;
  projectId?: string;
}

export interface CreateEnvironmentResponse {
  success: boolean;
  data?: Environment;
  message?: string;
  error?: string;
}

export interface DeleteEnvironmentResponse {
  success: boolean;
  message?: string;
  error?: string;
}

// Environment validation
export interface EnvironmentValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

// Environment service interfaces
export interface EnvironmentService {
  listEnvironments(request: ListEnvironmentsRequest): Promise<ListEnvironmentsResponse>;
  getEnvironmentDetails(request: GetEnvironmentDetailsRequest): Promise<EnvironmentDetailsResponse>;
  updateEnvironmentVariables(request: UpdateEnvironmentVariablesRequest): Promise<UpdateEnvironmentVariablesResponse>;
  createEnvironment(request: CreateEnvironmentRequest): Promise<CreateEnvironmentResponse>;
  deleteEnvironment(environmentId: string): Promise<DeleteEnvironmentResponse>;
}

// Environment management
export interface EnvironmentManager {
  setDefaultEnvironment(environmentId: string): Promise<boolean>;
  duplicateEnvironment(sourceId: string, newName: string): Promise<CreateEnvironmentResponse>;
  exportEnvironment(environmentId: string): Promise<string>;
  importEnvironment(name: string, data: string): Promise<CreateEnvironmentResponse>;
}

// Re-export shared types for convenience
export {
  Environment,
  EnvironmentListResponse,
  EnvironmentDetailsResponse
};