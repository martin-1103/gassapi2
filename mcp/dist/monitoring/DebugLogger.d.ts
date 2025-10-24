import { DebugInfo, ExecutionError } from '../types/execution.types.js';
/**
 * Debug Logger
 * Provides detailed execution tracing and debugging capabilities
 */
export declare class DebugLogger {
    private debugInfo;
    private logFilePath?;
    private maxMemorySamples;
    constructor(executionId: string, logFilePath?: string);
    /**
     * Start execution logging
     */
    startExecution(): void;
    /**
     * End execution logging
     */
    endExecution(): void;
    /**
     * Log node execution start
     */
    logNodeStart(nodeId: string): void;
    /**
     * Log node execution end
     */
    logNodeEnd(nodeId: string, executionTime: number, result?: any): void;
    /**
     * Log variable change
     */
    logVariableChange(variable: string, oldValue: any, newValue: any): void;
    /**
     * Log HTTP request details
     */
    logHttpRequest(nodeId: string, method: string, url: string, response: any): void;
    /**
     * Log error
     */
    logError(error: ExecutionError): void;
    /**
     * Get current debug information
     */
    getDebugInfo(): DebugInfo;
    /**
     * Export debug information as JSON string
     */
    exportDebugInfo(): string;
    /**
     * Get execution summary
     */
    getExecutionSummary(): {
        executionId: string;
        duration: number;
        totalNodes: number;
        totalRequests: number;
        totalErrors: number;
        averageNodeTime: number;
        peakMemoryUsage: number;
    };
    /**
     * Clear debug information
     */
    clear(): void;
    /**
     * Log memory usage
     */
    private logMemoryUsage;
    /**
     * Write debug info to file
     */
    private writeToFile;
    /**
     * Sanitize value for logging
     */
    private sanitizeValue;
    /**
     * Truncate value for logging
     */
    private truncateValue;
    /**
     * Sanitize URL for logging
     */
    private sanitizeUrl;
    /**
     * Truncate headers for logging
     */
    private truncateHeaders;
    /**
     * Calculate body size
     */
    private calculateBodySize;
    /**
     * Generate execution summary
     */
    private generateSummary;
}
//# sourceMappingURL=DebugLogger.d.ts.map