/**
 * GASSAPI MCP Direct Execution Types
 * Type definitions for direct HTTP and flow execution
 */
import { HttpMethod } from './api.types.js';
/**
 * HTTP Request Configuration
 */
export interface HttpRequestConfig {
    method: HttpMethod;
    url: string;
    headers?: Record<string, string>;
    body?: any;
    timeout?: number;
    followRedirects?: boolean;
    validateSSL?: boolean;
    userAgent?: string;
    maxRedirects?: number;
}
/**
 * HTTP Response
 */
export interface HttpResponse {
    status: number;
    statusText: string;
    headers: Record<string, string>;
    body: any;
    responseTime: number;
    timestamp: string;
    url: string;
    redirected?: boolean;
    finalUrl?: string;
}
/**
 * Endpoint Execution Request
 */
export interface EndpointExecutionRequest {
    endpointId: string;
    environmentId: string;
    overrideVariables?: Record<string, string>;
    saveResult?: boolean;
    timeout?: number;
}
/**
 * Endpoint Execution Result
 */
export interface EndpointExecutionResult {
    endpointId: string;
    environmentId: string;
    request: HttpRequestConfig;
    response: HttpResponse;
    variables: Record<string, string>;
    success: boolean;
    error?: string;
    timestamp: string;
}
/**
 * Flow Execution Request
 */
export interface FlowExecutionRequest {
    flowId: string;
    environmentId: string;
    overrideVariables?: Record<string, string>;
    maxExecutionTime?: number;
    saveResult?: boolean;
    debugMode?: boolean;
}
/**
 * Flow Execution Result
 */
export interface FlowExecutionResult {
    flowId: string;
    status: 'completed' | 'completed_with_errors' | 'failed' | 'timeout';
    executionTime: number;
    nodeResults: NodeExecutionResult[];
    errors: ExecutionError[];
    variables: Record<string, any>;
    executionPath: string[];
    timestamp: string;
    debugInfo?: DebugInfo;
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
}
/**
 * Execution Error
 */
export declare class ExecutionError extends Error {
    readonly code: string;
    readonly statusCode?: number;
    readonly cause?: Error;
    readonly context?: any;
    constructor(message: string, code: string, statusCode?: number, cause?: Error, context?: any);
}
/**
 * Debug Information
 */
export interface DebugInfo {
    executionId: string;
    startTime: number;
    endTime: number;
    nodeExecutionTimes: Record<string, number>;
    variableChanges: Array<{
        timestamp: number;
        variable: string;
        oldValue: any;
        newValue: any;
    }>;
    requestDetails: Array<{
        nodeId: string;
        request: HttpRequestConfig;
        response: HttpResponse;
        duration: number;
    }>;
    errorStack: ExecutionError[];
    memoryUsage: Array<{
        timestamp: number;
        heapUsed: number;
        heapTotal: number;
    }>;
}
/**
 * Performance Metrics
 */
export interface PerformanceMetrics {
    requestCount: number;
    averageResponseTime: number;
    minResponseTime: number;
    maxResponseTime: number;
    successRate: number;
    errorRate: number;
    timeoutRate: number;
    bytesTransferred: number;
    executionTime: number;
}
/**
 * Validation Result
 */
export interface ValidationResult {
    isValid: boolean;
    errors: string[];
}
/**
 * Execution Context
 */
export interface ExecutionContext {
    variables: Record<string, any>;
    nodeResults: Map<string, NodeExecutionResult>;
    executionPath: string[];
    startTime: number;
    errors: ExecutionError[];
    maxExecutionTime?: number;
}
/**
 * Error Codes
 */
export declare enum ErrorCodes {
    NETWORK_ERROR = "NETWORK_ERROR",
    TIMEOUT_ERROR = "TIMEOUT_ERROR",
    SSL_ERROR = "SSL_ERROR",
    DNS_ERROR = "DNS_ERROR",
    INVALID_URL = "INVALID_URL",
    INVALID_METHOD = "INVALID_METHOD",
    INVALID_HEADERS = "INVALID_HEADERS",
    INVALID_BODY = "INVALID_BODY",
    VARIABLE_INTERPOLATION_ERROR = "VARIABLE_INTERPOLATION_ERROR",
    FLOW_VALIDATION_ERROR = "FLOW_VALIDATION_ERROR",
    FLOW_CIRCULAR_DEPENDENCY = "FLOW_CIRCULAR_DEPENDENCY",
    FLOW_TIMEOUT = "FLOW_TIMEOUT",
    CONDITION_EVALUATION_ERROR = "CONDITION_EVALUATION_ERROR",
    UNSAFE_EXPRESSION = "UNSAFE_EXPRESSION"
}
//# sourceMappingURL=execution.types.d.ts.map