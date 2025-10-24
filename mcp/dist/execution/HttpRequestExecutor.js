import fetch from 'node-fetch';
import { AbortController } from 'abort-controller';
import { ExecutionError, ErrorCodes } from '../types/execution.types.js';
import { logger } from '../utils/Logger.js';
/**
 * HTTP Request Executor
 * Handles direct HTTP request execution with comprehensive error handling
 */
export class HttpRequestExecutor {
    constructor() {
        this.defaultTimeout = 30000; // 30 seconds
        this.maxRedirects = 10;
    }
    /**
     * Execute HTTP request with retry capability
     */
    async execute(config) {
        return this.executeWithRetry(config, 0);
    }
    /**
     * Execute HTTP request with retry logic
     */
    async executeWithRetry(config, retries = 3) {
        let lastError;
        for (let attempt = 1; attempt <= retries + 1; attempt++) {
            try {
                return await this.makeRequest(config);
            }
            catch (error) {
                lastError = error;
                // Don't retry on certain errors
                if (this.isNonRetryableError(error)) {
                    throw error;
                }
                // If this was the last attempt, throw the error
                if (attempt > retries) {
                    throw lastError;
                }
                // Exponential backoff
                const delay = Math.min(Math.pow(2, attempt) * 1000, 10000);
                await this.sleep(delay);
                logger.warn(`HTTP request retry ${attempt}/${retries}`, {
                    url: config.url,
                    method: config.method,
                    error: lastError.message,
                    attempt
                }, 'HttpRequestExecutor');
            }
        }
        throw lastError;
    }
    /**
     * Make the actual HTTP request
     */
    async makeRequest(config) {
        const startTime = Date.now();
        const controller = new AbortController();
        const timeout = config.timeout || this.defaultTimeout;
        // Set timeout
        const timeoutId = setTimeout(() => controller.abort(), timeout);
        try {
            logger.debug('Making HTTP request', {
                method: config.method,
                url: config.url,
                timeout,
                hasBody: !!config.body
            }, 'HttpRequestExecutor');
            const response = await fetch(config.url, {
                method: config.method,
                headers: this.prepareHeaders(config),
                body: this.prepareBody(config.body, config.headers),
                signal: controller.signal,
                redirect: config.followRedirects !== false ? 'follow' : 'manual'
            });
            clearTimeout(timeoutId);
            const responseTime = this.calculateResponseTime(startTime);
            const headers = this.extractHeaders(response);
            const body = await this.parseBody(response, headers);
            const httpResponse = {
                status: response.status,
                statusText: response.statusText,
                headers,
                body,
                responseTime,
                timestamp: new Date().toISOString(),
                url: response.url,
                redirected: response.redirected,
                finalUrl: response.url !== config.url ? response.url : undefined
            };
            logger.debug('HTTP request completed', {
                status: response.status,
                responseTime,
                url: response.url
            }, 'HttpRequestExecutor');
            return httpResponse;
        }
        catch (error) {
            clearTimeout(timeoutId);
            const responseTime = this.calculateResponseTime(startTime);
            const executionError = this.handleRequestError(error, config, responseTime);
            logger.error('HTTP request failed', {
                method: config.method,
                url: config.url,
                error: executionError.message,
                responseTime
            }, 'HttpRequestExecutor');
            throw executionError;
        }
    }
    /**
     * Prepare request headers
     */
    prepareHeaders(config) {
        const headers = {
            'User-Agent': config.userAgent || 'gassapi-mcp-client/1.0.0',
            ...config.headers
        };
        // Set Content-Type if body is present and not already set
        if (config.body && !headers['content-type'] && !headers['Content-Type']) {
            if (typeof config.body === 'string') {
                headers['Content-Type'] = 'application/json';
            }
            else if (config.body instanceof FormData) {
                // Let browser set Content-Type for FormData
            }
            else {
                headers['Content-Type'] = 'application/json';
            }
        }
        return headers;
    }
    /**
     * Prepare request body
     */
    prepareBody(body, headers) {
        if (!body)
            return undefined;
        // If body is already a string, return as-is
        if (typeof body === 'string') {
            return body;
        }
        // If body is FormData, return as-is
        if (body instanceof FormData) {
            return body;
        }
        // If Content-Type is form-urlencoded
        const contentType = headers?.['content-type'] || headers?.['Content-Type'];
        if (contentType?.includes('application/x-www-form-urlencoded')) {
            return this.objectToUrlEncoded(body);
        }
        // Default: JSON stringify
        return JSON.stringify(body);
    }
    /**
     * Parse response body based on content type
     */
    async parseBody(response, headers) {
        const contentType = this.getContentType(headers);
        try {
            if (contentType?.includes('application/json')) {
                const text = await response.text();
                return text ? JSON.parse(text) : null;
            }
            else if (contentType?.includes('text/')) {
                return await response.text();
            }
            else {
                // For binary data, return as buffer
                return await response.buffer();
            }
        }
        catch (error) {
            logger.warn('Failed to parse response body', { error: error.message, contentType }, 'HttpRequestExecutor');
            return await response.text();
        }
    }
    /**
     * Extract headers from response
     */
    extractHeaders(response) {
        const headers = {};
        response.headers.forEach((value, key) => {
            headers[key] = value;
        });
        return headers;
    }
    /**
     * Calculate response time
     */
    calculateResponseTime(startTime) {
        return Date.now() - startTime;
    }
    /**
     * Handle request errors
     */
    handleRequestError(error, config, responseTime) {
        if (error.name === 'AbortError') {
            return new ExecutionError(`Request timeout after ${responseTime}ms`, ErrorCodes.TIMEOUT_ERROR, undefined, error, { url: config.url, timeout: config.timeout });
        }
        if (error.message.includes('ENOTFOUND') || error.message.includes('ECONNREFUSED')) {
            return new ExecutionError(`Network error: ${error.message}`, ErrorCodes.NETWORK_ERROR, undefined, error, { url: config.url });
        }
        if (error.message.includes('CERT_HAS_EXPIRED') || error.message.includes('SSL')) {
            return new ExecutionError(`SSL error: ${error.message}`, ErrorCodes.SSL_ERROR, undefined, error, { url: config.url });
        }
        return new ExecutionError(`Request failed: ${error.message}`, ErrorCodes.NETWORK_ERROR, undefined, error, { url: config.url, method: config.method });
    }
    /**
     * Check if error is non-retryable
     */
    isNonRetryableError(error) {
        const nonRetryablePatterns = [
            'ENOTFOUND',
            'ECONNREFUSED',
            'CERT_HAS_EXPIRED',
            'UNABLE_TO_VERIFY_LEAF_SIGNATURE',
            'Invalid URL'
        ];
        return nonRetryablePatterns.some(pattern => error.message.includes(pattern));
    }
    /**
     * Get content type from headers
     */
    getContentType(headers) {
        return headers['content-type'] || headers['Content-Type'];
    }
    /**
     * Convert object to URL-encoded string
     */
    objectToUrlEncoded(obj) {
        const params = new URLSearchParams();
        for (const [key, value] of Object.entries(obj)) {
            if (value !== null && value !== undefined) {
                params.append(key, String(value));
            }
        }
        return params.toString();
    }
    /**
     * Sleep utility
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
//# sourceMappingURL=HttpRequestExecutor.js.map