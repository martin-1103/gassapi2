import { HttpRequestConfig, HttpResponse } from '../types/execution.types.js';
/**
 * HTTP Request Executor
 * Handles direct HTTP request execution with comprehensive error handling
 */
export declare class HttpRequestExecutor {
    private defaultTimeout;
    private maxRedirects;
    /**
     * Execute HTTP request with retry capability
     */
    execute(config: HttpRequestConfig): Promise<HttpResponse>;
    /**
     * Execute HTTP request with retry logic
     */
    executeWithRetry(config: HttpRequestConfig, retries?: number): Promise<HttpResponse>;
    /**
     * Make the actual HTTP request
     */
    private makeRequest;
    /**
     * Prepare request headers
     */
    private prepareHeaders;
    /**
     * Prepare request body
     */
    private prepareBody;
    /**
     * Parse response body based on content type
     */
    private parseBody;
    /**
     * Extract headers from response
     */
    private extractHeaders;
    /**
     * Calculate response time
     */
    private calculateResponseTime;
    /**
     * Handle request errors
     */
    private handleRequestError;
    /**
     * Check if error is non-retryable
     */
    private isNonRetryableError;
    /**
     * Get content type from headers
     */
    private getContentType;
    /**
     * Convert object to URL-encoded string
     */
    private objectToUrlEncoded;
    /**
     * Sleep utility
     */
    private sleep;
}
//# sourceMappingURL=HttpRequestExecutor.d.ts.map