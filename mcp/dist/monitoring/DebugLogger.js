import { logger } from '../utils/Logger.js';
import * as fs from 'fs';
import * as path from 'path';
/**
 * Debug Logger
 * Provides detailed execution tracing and debugging capabilities
 */
export class DebugLogger {
    constructor(executionId, logFilePath) {
        this.maxMemorySamples = 100;
        this.logFilePath = logFilePath;
        this.debugInfo = {
            executionId,
            startTime: Date.now(),
            endTime: 0,
            nodeExecutionTimes: {},
            variableChanges: [],
            requestDetails: [],
            errorStack: [],
            memoryUsage: []
        };
    }
    /**
     * Start execution logging
     */
    startExecution() {
        logger.debug('Started debug logging', { executionId: this.debugInfo.executionId }, 'DebugLogger');
        // Log initial memory usage
        this.logMemoryUsage();
    }
    /**
     * End execution logging
     */
    endExecution() {
        this.debugInfo.endTime = Date.now();
        this.logMemoryUsage();
        logger.debug('Ended debug logging', {
            executionId: this.debugInfo.executionId,
            duration: this.debugInfo.endTime - this.debugInfo.startTime
        }, 'DebugLogger');
        // Write to file if configured
        if (this.logFilePath) {
            this.writeToFile();
        }
    }
    /**
     * Log node execution start
     */
    logNodeStart(nodeId) {
        logger.debug('Node execution started', {
            executionId: this.debugInfo.executionId,
            nodeId
        }, 'DebugLogger');
    }
    /**
     * Log node execution end
     */
    logNodeEnd(nodeId, executionTime, result) {
        this.debugInfo.nodeExecutionTimes[nodeId] = executionTime;
        logger.debug('Node execution completed', {
            executionId: this.debugInfo.executionId,
            nodeId,
            executionTime,
            hasResult: !!result
        }, 'DebugLogger');
        this.logMemoryUsage();
    }
    /**
     * Log variable change
     */
    logVariableChange(variable, oldValue, newValue) {
        const change = {
            timestamp: Date.now(),
            variable,
            oldValue: this.sanitizeValue(oldValue),
            newValue: this.sanitizeValue(newValue)
        };
        this.debugInfo.variableChanges.push(change);
        logger.debug('Variable changed', {
            executionId: this.debugInfo.executionId,
            variable,
            oldValue: this.truncateValue(oldValue),
            newValue: this.truncateValue(newValue)
        }, 'DebugLogger');
    }
    /**
     * Log HTTP request details
     */
    logHttpRequest(nodeId, method, url, response) {
        const requestDetail = {
            nodeId,
            request: {
                method: method, // Cast to HttpMethod
                url: this.sanitizeUrl(url),
                headers: {},
                timeout: 30000
            },
            response: {
                status: response.status,
                statusText: response.statusText || '',
                headers: this.truncateHeaders(response.headers || {}),
                body: response.body,
                responseTime: response.responseTime,
                timestamp: new Date().toISOString(),
                url: response.url || url
            },
            duration: response.responseTime
        };
        this.debugInfo.requestDetails.push(requestDetail);
        logger.debug('HTTP request logged', {
            executionId: this.debugInfo.executionId,
            nodeId,
            method,
            url: this.sanitizeUrl(url),
            status: response.status,
            responseTime: response.responseTime
        }, 'DebugLogger');
    }
    /**
     * Log error
     */
    logError(error) {
        const errorInfo = {
            timestamp: Date.now(),
            code: error.code,
            message: error.message,
            statusCode: error.statusCode,
            context: error.context
        };
        this.debugInfo.errorStack.push(error);
        logger.error('Execution error logged', {
            executionId: this.debugInfo.executionId,
            errorCode: error.code,
            errorMessage: error.message,
            context: error.context
        }, 'DebugLogger');
    }
    /**
     * Get current debug information
     */
    getDebugInfo() {
        return { ...this.debugInfo };
    }
    /**
     * Export debug information as JSON string
     */
    exportDebugInfo() {
        const exportData = {
            ...this.debugInfo,
            summary: this.generateSummary()
        };
        return JSON.stringify(exportData, null, 2);
    }
    /**
     * Get execution summary
     */
    getExecutionSummary() {
        const duration = this.debugInfo.endTime - this.debugInfo.startTime;
        const totalNodes = Object.keys(this.debugInfo.nodeExecutionTimes).length;
        const totalRequests = this.debugInfo.requestDetails.length;
        const totalErrors = this.debugInfo.errorStack.length;
        const nodeTimes = Object.values(this.debugInfo.nodeExecutionTimes);
        const averageNodeTime = nodeTimes.length > 0
            ? nodeTimes.reduce((sum, time) => sum + time, 0) / nodeTimes.length
            : 0;
        const peakMemoryUsage = this.debugInfo.memoryUsage.length > 0
            ? Math.max(...this.debugInfo.memoryUsage.map(m => m.heapUsed))
            : 0;
        return {
            executionId: this.debugInfo.executionId,
            duration,
            totalNodes,
            totalRequests,
            totalErrors,
            averageNodeTime,
            peakMemoryUsage
        };
    }
    /**
     * Clear debug information
     */
    clear() {
        this.debugInfo = {
            executionId: this.debugInfo.executionId,
            startTime: Date.now(),
            endTime: 0,
            nodeExecutionTimes: {},
            variableChanges: [],
            requestDetails: [],
            errorStack: [],
            memoryUsage: []
        };
        logger.debug('Debug information cleared', { executionId: this.debugInfo.executionId }, 'DebugLogger');
    }
    /**
     * Log memory usage
     */
    logMemoryUsage() {
        try {
            // Note: In Node.js, we would use process.memoryUsage()
            // For now, we'll use a placeholder
            const memoryUsage = {
                timestamp: Date.now(),
                heapUsed: 0, // Would be: process.memoryUsage().heapUsed
                heapTotal: 0, // Would be: process.memoryUsage().heapTotal
                external: 0 // Would be: process.memoryUsage().external
            };
            this.debugInfo.memoryUsage.push(memoryUsage);
            // Maintain max samples
            if (this.debugInfo.memoryUsage.length > this.maxMemorySamples) {
                this.debugInfo.memoryUsage = this.debugInfo.memoryUsage.slice(-this.maxMemorySamples);
            }
        }
        catch (error) {
            logger.warn('Failed to log memory usage', { error: error.message }, 'DebugLogger');
        }
    }
    /**
     * Write debug info to file
     */
    writeToFile() {
        try {
            const dir = path.dirname(this.logFilePath);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            const debugData = this.exportDebugInfo();
            fs.writeFileSync(this.logFilePath, debugData, 'utf8');
            logger.debug('Debug information written to file', {
                executionId: this.debugInfo.executionId,
                filePath: this.logFilePath
            }, 'DebugLogger');
        }
        catch (error) {
            logger.error('Failed to write debug information to file', {
                executionId: this.debugInfo.executionId,
                filePath: this.logFilePath,
                error: error.message
            }, 'DebugLogger');
        }
    }
    /**
     * Sanitize value for logging
     */
    sanitizeValue(value) {
        if (typeof value === 'string' && value.length > 100) {
            return value.substring(0, 100) + '...';
        }
        if (typeof value === 'object' && value !== null) {
            // Remove sensitive fields
            const sanitized = { ...value };
            const sensitiveFields = ['password', 'token', 'key', 'secret'];
            sensitiveFields.forEach(field => {
                if (sanitized[field]) {
                    sanitized[field] = '***';
                }
            });
            return sanitized;
        }
        return value;
    }
    /**
     * Truncate value for logging
     */
    truncateValue(value) {
        const str = String(value);
        return str.length > 50 ? str.substring(0, 50) + '...' : str;
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
     * Truncate headers for logging
     */
    truncateHeaders(headers) {
        const truncated = {};
        for (const [key, value] of Object.entries(headers)) {
            truncated[key] = value.length > 100 ? value.substring(0, 100) + '...' : value;
        }
        return truncated;
    }
    /**
     * Calculate body size
     */
    calculateBodySize(body) {
        if (typeof body === 'string') {
            return Buffer.byteLength(body, 'utf8');
        }
        if (Buffer.isBuffer(body)) {
            return body.length;
        }
        try {
            return Buffer.byteLength(JSON.stringify(body), 'utf8');
        }
        catch {
            return 0;
        }
    }
    /**
     * Generate execution summary
     */
    generateSummary() {
        const summary = this.getExecutionSummary();
        return {
            ...summary,
            successRate: summary.totalNodes > 0
                ? ((summary.totalNodes - summary.totalErrors) / summary.totalNodes) * 100
                : 0,
            requestsPerSecond: summary.duration > 0
                ? (summary.totalRequests / (summary.duration / 1000))
                : 0,
            memoryEfficiency: summary.peakMemoryUsage > 0
                ? (summary.totalNodes / summary.peakMemoryUsage) * 1000
                : 0
        };
    }
}
//# sourceMappingURL=DebugLogger.js.map