import { ExecutionError, HttpResponse } from './execution.types.js';

/**
 * GASSAPI MCP Flow Types
 * Type definitions for flow execution and node processing
 */

/**
 * Flow Node Types
 */
export type FlowNode = HttpRequestNode | DelayNode | ConditionNode | VariableSetNode;

/**
 * HTTP Request Node
 */
export interface HttpRequestNode {
  id: string;
  type: 'http_request';
  data: {
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';
    url: string;
    headers?: Record<string, string>;
    body?: any;
    timeout?: number;
    saveResponse?: boolean;
    responseVariable?: string;
    description?: string;
  };
  position: { x: number; y: number };
}

/**
 * Delay Node
 */
export interface DelayNode {
  id: string;
  type: 'delay';
  data: {
    duration: number; // milliseconds
    description?: string;
  };
  position: { x: number; y: number };
}

/**
 * Condition Node
 */
export interface ConditionNode {
  id: string;
  type: 'condition';
  data: {
    condition: string; // JavaScript expression
    truePath?: string; // edge type for true condition
    falsePath?: string; // edge type for false condition
    description?: string;
  };
  position: { x: number; y: number };
}

/**
 * Variable Set Node
 */
export interface VariableSetNode {
  id: string;
  type: 'variable_set';
  data: {
    variable: string;
    value: string; // can be template with variables
    description?: string;
  };
  position: { x: number; y: number };
}

/**
 * Flow Edge
 */
export interface FlowEdge {
  id: string;
  source: string;
  target: string;
  type: 'success' | 'error' | 'true' | 'false' | 'always';
  label?: string;
}

/**
 * Flow Configuration
 */
export interface FlowConfig {
  id: string;
  name: string;
  description?: string;
  nodes: FlowNode[];
  edges: FlowEdge[];
  projectId: string;
  collectionId?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Flow Validation Result
 */
export interface FlowValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  orphanedNodes: string[];
  circularDependencies: string[][];
}

/**
 * Flow Execution Context
 */
export interface FlowExecutionContext {
  flowId: string;
  environmentId: string;
  variables: Record<string, any>;
  nodeResults: Map<string, NodeExecutionResult>;
  executionPath: string[];
  startTime: number;
  errors: ExecutionError[];
  maxExecutionTime?: number;
  debugMode?: boolean;
}

/**
 * Node Execution Result
 */
export interface NodeExecutionResult {
  nodeId: string;
  status: 'success' | 'error' | 'skipped';
  response?: HttpResponse;
  data?: any;
  error?: string;
  executionTime: number;
  timestamp: string;
  debugInfo?: any;
}

/**
 * Flow Execution State
 */
export interface FlowExecutionState {
  currentNodeId?: string;
  visitedNodes: Set<string>;
  pendingNodes: string[];
  completedNodes: string[];
  failedNodes: string[];
  skippedNodes: string[];
}

/**
 * Flow Graph Analysis
 */
export interface FlowGraphAnalysis {
  startNodes: string[];
  endNodes: string[];
  isolatedNodes: string[];
  hasCycles: boolean;
  cycles: string[][];
  longestPath: string[];
  complexity: number;
}

/**
 * Flow Template
 */
export interface FlowTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  nodes: FlowNode[];
  edges: FlowEdge[];
  variables: Record<string, string>;
  tags: string[];
}

/**
 * Flow Execution Options
 */
export interface FlowExecutionOptions {
  maxExecutionTime?: number;
  maxRetries?: number;
  retryDelay?: number;
  parallelExecution?: boolean;
  failFast?: boolean;
  debugMode?: boolean;
  saveIntermediateResults?: boolean;
}

/**
 * Flow Result Summary
 */
export interface FlowResultSummary {
  flowId: string;
  totalNodes: number;
  executedNodes: number;
  successfulNodes: number;
  failedNodes: number;
  skippedNodes: number;
  executionTime: number;
  successRate: number;
  hasErrors: boolean;
  criticalErrors: string[];
}

/**
 * Flow Node Dependencies
 */
export interface NodeDependencies {
  nodeId: string;
  dependsOn: string[];
  dependedBy: string[];
  depth: number;
  canExecuteInParallel: boolean;
}

/**
 * Flow Execution Plan
 */
export interface FlowExecutionPlan {
  flowId: string;
  executionOrder: string[][];
  parallelGroups: string[][];
  estimatedExecutionTime: number;
  resourceRequirements: {
    maxConcurrentRequests: number;
    estimatedMemoryUsage: number;
  };
  riskAssessment: {
    hasCycles: boolean;
    hasLongRunningNodes: boolean;
    hasExternalDependencies: boolean;
  };
}