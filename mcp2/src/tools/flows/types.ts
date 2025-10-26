/**
 * Flow Types - Reusable interfaces for flow operations
 * Extracted from flows.ts to improve modularity
 */

import {
  FlowStep,
  FlowConfig,
  FlowExecutionResult,
  FlowNodeResult,
  FlowDetailsResponse
} from '../../shared/types/index.js';

// Additional flow-specific types
export interface FlowExecutionContext {
  flowId: string;
  variables: Record<string, any>;
  config: FlowConfig;
  startTime: number;
  nodeResults: FlowNodeResult[];
  errors: string[];
  stopped: boolean;
}

export interface FlowValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface FlowStepResult {
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
  response?: any;
  error?: string;
}

export interface FlowCreateRequest {
  name: string;
  description?: string;
  folderId?: string;
  steps: FlowStep[];
  config?: FlowConfig;
  inputs?: string;
}

export interface FlowCreateResponse {
  success: boolean;
  data?: {
    id: string;
    name: string;
    description?: string;
    folder_id?: string;
    flow_data: {
      version: string;
      steps: FlowStep[];
      config: FlowConfig;
    };
    flow_inputs?: string;
    project_id: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
  };
  message?: string;
}

// Flow execution modes
export type FlowExecutionMode = 'sequential' | 'parallel';

export interface FlowExecutionOptions {
  mode?: FlowExecutionMode;
  timeout?: number;
  stopOnError?: boolean;
  maxConcurrency?: number;
  dryRun?: boolean;
  environment?: string;
}

// Flow step validation
export interface FlowStepValidationError {
  stepId: string;
  field: string;
  message: string;
  value?: any;
}

// Flow state management
export interface FlowState {
  id: string;
  status: 'idle' | 'running' | 'completed' | 'failed' | 'stopped';
  currentStep?: number;
  totalSteps: number;
  startTime?: string;
  endTime?: string;
  executionTime?: number;
  variables: Record<string, any>;
  results: FlowNodeResult[];
  errors: string[];
}

// Re-export shared types for convenience
export {
  FlowStep,
  FlowConfig,
  FlowExecutionResult,
  FlowNodeResult,
  FlowDetailsResponse
};