import { logger } from '../utils/Logger.js';
/**
 * Performance Monitor
 * Tracks and analyzes execution performance metrics
 */
export class PerformanceMonitor {
    constructor() {
        this.metrics = new Map();
        this.requestHistory = [];
        this.maxHistorySize = 1000;
    }
    /**
     * Record HTTP request performance
     */
    recordHttpRequest(executionId, method, url, response) {
        // Update metrics
        const metrics = this.getMetrics(executionId);
        metrics.requestCount++;
        metrics.bytesTransferred += this.estimateResponseSize(response);
        if (response.status >= 200 && response.status < 300) {
            metrics.successRate = ((metrics.successRate * (metrics.requestCount - 1)) + 1) / metrics.requestCount;
        }
        else {
            metrics.errorRate = ((metrics.errorRate * (metrics.requestCount - 1)) + 1) / metrics.requestCount;
        }
        // Update response time statistics
        this.updateResponseTimeStats(metrics, response.responseTime);
        // Add to history
        this.addToHistory({
            id: executionId,
            timestamp: Date.now(),
            url: this.sanitizeUrl(url),
            method,
            responseTime: response.responseTime,
            status: response.status,
            success: response.status >= 200 && response.status < 300
        });
        logger.debug('Recorded HTTP request performance', {
            executionId,
            method,
            url: this.sanitizeUrl(url),
            responseTime: response.responseTime,
            status: response.status
        }, 'PerformanceMonitor');
    }
    /**
     * Record flow execution performance
     */
    recordFlowExecution(flowId, executionTime, nodeCount, errorCount) {
        const metrics = this.getMetrics(flowId);
        metrics.executionTime += executionTime;
        logger.debug('Recorded flow execution performance', {
            flowId,
            executionTime,
            nodeCount,
            errorCount
        }, 'PerformanceMonitor');
    }
    /**
     * Record error
     */
    recordError(executionId, errorType) {
        const metrics = this.getMetrics(executionId);
        switch (errorType) {
            case 'timeout':
                metrics.timeoutRate = ((metrics.timeoutRate * metrics.requestCount) + 1) / (metrics.requestCount + 1);
                break;
            case 'network':
                metrics.errorRate = ((metrics.errorRate * metrics.requestCount) + 1) / (metrics.requestCount + 1);
                break;
        }
        logger.debug('Recorded error performance', {
            executionId,
            errorType
        }, 'PerformanceMonitor');
    }
    /**
     * Get performance metrics for execution
     */
    getMetrics(executionId) {
        if (!this.metrics.has(executionId)) {
            this.metrics.set(executionId, {
                requestCount: 0,
                averageResponseTime: 0,
                minResponseTime: Infinity,
                maxResponseTime: 0,
                successRate: 0,
                errorRate: 0,
                timeoutRate: 0,
                bytesTransferred: 0,
                executionTime: 0
            });
        }
        return this.metrics.get(executionId);
    }
    /**
     * Get overall performance statistics
     */
    getOverallStats() {
        const allRequests = Array.from(this.requestHistory);
        const totalRequests = allRequests.length;
        if (totalRequests === 0) {
            return {
                totalRequests: 0,
                averageResponseTime: 0,
                successRate: 0,
                errorRate: 0,
                topSlowRequests: [],
                mostFrequentErrors: []
            };
        }
        const averageResponseTime = allRequests.reduce((sum, req) => sum + req.responseTime, 0) / totalRequests;
        const successCount = allRequests.filter(req => req.success).length;
        const successRate = (successCount / totalRequests) * 100;
        // Top slow requests
        const topSlowRequests = allRequests
            .sort((a, b) => b.responseTime - a.responseTime)
            .slice(0, 10)
            .map(req => ({ url: req.url, time: req.responseTime }));
        // Most frequent errors
        const errorCounts = new Map();
        allRequests.filter(req => !req.success).forEach(req => {
            errorCounts.set(req.status, (errorCounts.get(req.status) || 0) + 1);
        });
        const mostFrequentErrors = Array.from(errorCounts.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([status, count]) => ({ status, count }));
        return {
            totalRequests,
            averageResponseTime: Math.round(averageResponseTime * 100) / 100,
            successRate: Math.round(successRate * 100) / 100,
            errorRate: Math.round((100 - successRate) * 100) / 100,
            topSlowRequests,
            mostFrequentErrors
        };
    }
    /**
     * Get performance report
     */
    getPerformanceReport(timeRange) {
        const allRequests = timeRange
            ? this.requestHistory.filter(req => req.timestamp >= timeRange.start && req.timestamp <= timeRange.end)
            : this.requestHistory;
        const summary = this.getOverallStats();
        // Performance trends (last 50 requests)
        const trends = allRequests
            .slice(-50)
            .map(req => ({
            timestamp: req.timestamp,
            responseTime: req.responseTime,
            success: req.success
        }));
        // Generate recommendations
        const recommendations = this.generateRecommendations(summary);
        return {
            summary,
            trends,
            recommendations
        };
    }
    /**
     * Clear metrics for execution
     */
    clearMetrics(executionId) {
        this.metrics.delete(executionId);
        logger.debug('Cleared performance metrics', { executionId }, 'PerformanceMonitor');
    }
    /**
     * Reset all metrics
     */
    resetAllMetrics() {
        this.metrics.clear();
        this.requestHistory = [];
        logger.info('Reset all performance metrics', {}, 'PerformanceMonitor');
    }
    /**
     * Export metrics to JSON
     */
    exportMetrics() {
        const data = {
            metrics: Object.fromEntries(this.metrics),
            history: this.requestHistory,
            timestamp: new Date().toISOString()
        };
        return JSON.stringify(data, null, 2);
    }
    /**
     * Update response time statistics
     */
    updateResponseTimeStats(metrics, responseTime) {
        metrics.minResponseTime = Math.min(metrics.minResponseTime, responseTime);
        metrics.maxResponseTime = Math.max(metrics.maxResponseTime, responseTime);
        // Calculate running average
        const count = metrics.requestCount;
        metrics.averageResponseTime = ((metrics.averageResponseTime * (count - 1)) + responseTime) / count;
    }
    /**
     * Estimate response size in bytes
     */
    estimateResponseSize(response) {
        if (typeof response.body === 'string') {
            return Buffer.byteLength(response.body, 'utf8');
        }
        if (Buffer.isBuffer(response.body)) {
            return response.body.length;
        }
        try {
            return Buffer.byteLength(JSON.stringify(response.body), 'utf8');
        }
        catch {
            return 0;
        }
    }
    /**
     * Add request to history
     */
    addToHistory(request) {
        this.requestHistory.push(request);
        // Maintain max history size
        if (this.requestHistory.length > this.maxHistorySize) {
            this.requestHistory = this.requestHistory.slice(-this.maxHistorySize);
        }
    }
    /**
     * Sanitize URL for logging
     */
    sanitizeUrl(url) {
        try {
            const urlObj = new URL(url);
            // Remove sensitive query parameters
            const sensitiveParams = ['token', 'key', 'password', 'secret'];
            const params = new URLSearchParams(urlObj.search);
            sensitiveParams.forEach(param => {
                if (params.has(param)) {
                    params.set(param, '***');
                }
            });
            urlObj.search = params.toString();
            return urlObj.toString();
        }
        catch {
            return url;
        }
    }
    /**
     * Generate performance recommendations
     */
    generateRecommendations(stats) {
        const recommendations = [];
        if (stats.averageResponseTime > 5000) {
            recommendations.push('Consider optimizing slow endpoints (>5s average response time)');
        }
        if (stats.successRate < 95) {
            recommendations.push('Investigate high error rate - check endpoint stability');
        }
        if (stats.topSlowRequests.length > 0) {
            const slowest = stats.topSlowRequests[0];
            if (slowest.time > 10000) {
                recommendations.push(`Optimize slowest endpoint: ${slowest.url} (${slowest.time}ms)`);
            }
        }
        if (stats.totalRequests < 10) {
            recommendations.push('Collect more performance data for better analysis');
        }
        return recommendations;
    }
}
//# sourceMappingURL=PerformanceMonitor.js.map