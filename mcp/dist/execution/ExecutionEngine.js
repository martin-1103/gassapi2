import { HttpRequestExecutor } from './HttpRequestExecutor.js';
import { EnvironmentManager } from '../environment/EnvironmentManager.js';
import { VariableInterpolator } from '../environment/VariableInterpolator.js';
import { ExecutionError, ErrorCodes } from '../types/execution.types.js';
import { logger } from '../utils/Logger.js';
/**
 * Execution Engine
 * Main orchestrator for direct HTTP execution and endpoint testing
 */
export class ExecutionEngine {
    constructor() {
        this.httpExecutor = new HttpRequestExecutor();
        this.envManager = new EnvironmentManager();
    }
    /**
     * Execute endpoint directly
     */
    async executeEndpoint(request) {
        try {
            logger.info('Starting endpoint execution', {
                endpointId: request.endpointId,
                environmentId: request.environmentId
            }, 'ExecutionEngine');
            // Validate request
            const validation = this.validateEndpointRequest(request);
            if (!validation.isValid) {
                throw new ExecutionError(`Invalid request: ${validation.errors.join(', ')}`, ErrorCodes.INVALID_URL);
            }
            // Load endpoint configuration
            const endpointConfig = await this.envManager.loadEndpointConfig(request.endpointId);
            // Load environment variables
            const baseVariables = await this.envManager.loadEnvironmentVariables(request.environmentId);
            // Merge with overrides
            const variables = this.envManager.mergeVariables(baseVariables, request.overrideVariables || {});
            // Validate variable context
            const varValidation = this.envManager.validateVariableContext(variables);
            if (!varValidation.isValid) {
                throw new ExecutionError(`Invalid variables: ${varValidation.errors.join(', ')}`, ErrorCodes.VARIABLE_INTERPOLATION_ERROR);
            }
            // Build HTTP request configuration
            const httpConfig = this.buildHttpRequest(endpointConfig, variables, request);
            // Execute request
            const response = await this.httpExecutor.execute(httpConfig);
            // Build result
            const result = {
                endpointId: request.endpointId,
                environmentId: request.environmentId,
                request: httpConfig,
                response,
                variables,
                success: this.isSuccessResponse(response),
                timestamp: new Date().toISOString()
            };
            logger.info('Endpoint execution completed', {
                endpointId: request.endpointId,
                status: response.status,
                responseTime: response.responseTime,
                success: result.success
            }, 'ExecutionEngine');
            return result;
        }
        catch (error) {
            logger.error('Endpoint execution failed', {
                endpointId: request.endpointId,
                environmentId: request.environmentId,
                error: error instanceof Error ? error.message : String(error)
            }, 'ExecutionEngine');
            // Return error result
            return {
                endpointId: request.endpointId,
                environmentId: request.environmentId,
                request: {},
                response: {},
                variables: {},
                success: false,
                error: error instanceof Error ? error.message : String(error),
                timestamp: new Date().toISOString()
            };
        }
    }
    /**
     * Execute endpoint with retry
     */
    async executeEndpointWithRetry(request, retries = 3) {
        try {
            // Load endpoint configuration
            const endpointConfig = await this.envManager.loadEndpointConfig(request.endpointId);
            const baseVariables = await this.envManager.loadEnvironmentVariables(request.environmentId);
            const variables = this.envManager.mergeVariables(baseVariables, request.overrideVariables || {});
            const httpConfig = this.buildHttpRequest(endpointConfig, variables, request);
            // Execute with retry
            const response = await this.httpExecutor.executeWithRetry(httpConfig, retries);
            return {
                endpointId: request.endpointId,
                environmentId: request.environmentId,
                request: httpConfig,
                response,
                variables,
                success: this.isSuccessResponse(response),
                timestamp: new Date().toISOString()
            };
        }
        catch (error) {
            return {
                endpointId: request.endpointId,
                environmentId: request.environmentId,
                request: {},
                response: {},
                variables: {},
                success: false,
                error: error instanceof Error ? error.message : String(error),
                timestamp: new Date().toISOString()
            };
        }
    }
    /**
     * Validate endpoint execution request
     */
    validateEndpointRequest(request) {
        const errors = [];
        if (!request.endpointId || typeof request.endpointId !== 'string') {
            errors.push('endpointId is required and must be a string');
        }
        if (!request.environmentId || typeof request.environmentId !== 'string') {
            errors.push('environmentId is required and must be a string');
        }
        if (request.timeout && (typeof request.timeout !== 'number' || request.timeout < 0)) {
            errors.push('timeout must be a positive number');
        }
        if (request.overrideVariables && typeof request.overrideVariables !== 'object') {
            errors.push('overrideVariables must be an object');
        }
        return {
            isValid: errors.length === 0,
            errors
        };
    }
    /**
     * Build HTTP request configuration from endpoint config
     */
    buildHttpRequest(endpointConfig, variables, request) {
        const config = {
            method: endpointConfig.method || 'GET',
            url: VariableInterpolator.interpolateUrl(endpointConfig.url || '', variables),
            headers: VariableInterpolator.interpolateHeaders(endpointConfig.headers || {}, variables),
            timeout: request.timeout || 30000,
            followRedirects: true,
            validateSSL: true
        };
        // Add body if present
        if (endpointConfig.body) {
            config.body = VariableInterpolator.interpolateBody(endpointConfig.body, variables);
        }
        return config;
    }
    /**
     * Check if HTTP response is successful
     */
    isSuccessResponse(response) {
        return response.status >= 200 && response.status < 300;
    }
    /**
     * Get execution statistics
     */
    getExecutionStats() {
        // Placeholder - would track actual metrics
        return {
            totalExecutions: 0,
            successRate: 0,
            averageResponseTime: 0
        };
    }
    /**
     * Clear execution cache
     */
    clearCache() {
        this.envManager.clearCache();
        logger.info('Execution engine cache cleared', {}, 'ExecutionEngine');
    }
}
//# sourceMappingURL=ExecutionEngine.js.map