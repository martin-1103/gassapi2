import { EndpointExecutionRequest, EndpointExecutionResult } from '../types/execution.types.js';
/**
 * Execution Engine
 * Main orchestrator for direct HTTP execution and endpoint testing
 */
export declare class ExecutionEngine {
    private httpExecutor;
    private envManager;
    constructor();
    /**
     * Execute endpoint directly
     */
    executeEndpoint(request: EndpointExecutionRequest): Promise<EndpointExecutionResult>;
    /**
     * Execute endpoint with retry
     */
    executeEndpointWithRetry(request: EndpointExecutionRequest, retries?: number): Promise<EndpointExecutionResult>;
    /**
     * Validate endpoint execution request
     */
    private validateEndpointRequest;
    /**
     * Build HTTP request configuration from endpoint config
     */
    private buildHttpRequest;
    /**
     * Check if HTTP response is successful
     */
    private isSuccessResponse;
    /**
     * Get execution statistics
     */
    getExecutionStats(): {
        totalExecutions: number;
        successRate: number;
        averageResponseTime: number;
    };
    /**
     * Clear execution cache
     */
    clearCache(): void;
}
//# sourceMappingURL=ExecutionEngine.d.ts.map