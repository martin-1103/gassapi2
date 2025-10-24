import { HttpResponse, PerformanceMetrics } from '../types/execution.types.js';
/**
 * Performance Monitor
 * Tracks and analyzes execution performance metrics
 */
export declare class PerformanceMonitor {
    private metrics;
    private requestHistory;
    private maxHistorySize;
    /**
     * Record HTTP request performance
     */
    recordHttpRequest(executionId: string, method: string, url: string, response: HttpResponse): void;
    /**
     * Record flow execution performance
     */
    recordFlowExecution(flowId: string, executionTime: number, nodeCount: number, errorCount: number): void;
    /**
     * Record error
     */
    recordError(executionId: string, errorType: string): void;
    /**
     * Get performance metrics for execution
     */
    getMetrics(executionId: string): PerformanceMetrics;
    /**
     * Get overall performance statistics
     */
    getOverallStats(): {
        totalRequests: number;
        averageResponseTime: number;
        successRate: number;
        errorRate: number;
        topSlowRequests: Array<{
            url: string;
            time: number;
        }>;
        mostFrequentErrors: Array<{
            status: number;
            count: number;
        }>;
    };
    /**
     * Get performance report
     */
    getPerformanceReport(timeRange?: {
        start: number;
        end: number;
    }): {
        summary: any;
        trends: Array<{
            timestamp: number;
            responseTime: number;
            success: boolean;
        }>;
        recommendations: string[];
    };
    /**
     * Clear metrics for execution
     */
    clearMetrics(executionId: string): void;
    /**
     * Reset all metrics
     */
    resetAllMetrics(): void;
    /**
     * Export metrics to JSON
     */
    exportMetrics(): string;
    /**
     * Update response time statistics
     */
    private updateResponseTimeStats;
    /**
     * Estimate response size in bytes
     */
    private estimateResponseSize;
    /**
     * Add request to history
     */
    private addToHistory;
    /**
     * Sanitize URL for logging
     */
    private sanitizeUrl;
    /**
     * Generate performance recommendations
     */
    private generateRecommendations;
}
//# sourceMappingURL=PerformanceMonitor.d.ts.map