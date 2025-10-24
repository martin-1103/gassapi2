import { ConfigLoader } from '../discovery/ConfigLoader.js';
import { BackendClient } from '../client/BackendClient.js';
import { VariableInterpolator } from './VariableInterpolator.js';
import { logger } from '../utils/Logger.js';
/**
 * Environment Manager
 * Handles loading and managing environment variables and configurations
 */
export class EnvironmentManager {
    constructor() {
        this.backendClient = null;
        this.cache = new Map();
        this.CACHE_TTL = 5 * 60 * 1000; // 5 minutes
        this.configLoader = new ConfigLoader();
    }
    /**
     * Load environment variables for a given environment ID
     */
    async loadEnvironmentVariables(environmentId) {
        try {
            // Check cache first
            const cached = this.getCachedData(`env_vars_${environmentId}`);
            if (cached) {
                return cached;
            }
            // Load from backend
            const config = await this.configLoader.detectProjectConfig();
            if (!config) {
                throw new Error('No GASSAPI configuration found');
            }
            const client = await this.getBackendClient();
            const response = await client.getEnvironmentVariables(environmentId);
            if (!response.variables || !Array.isArray(response.variables)) {
                logger.warn('Invalid environment variables response', { environmentId }, 'EnvironmentManager');
                return {};
            }
            // Transform array to object and validate
            const variables = this.transformEnvironmentVariables(response.variables);
            // Cache the result
            this.setCachedData(`env_vars_${environmentId}`, variables);
            return variables;
        }
        catch (error) {
            logger.error('Failed to load environment variables', {
                error: error instanceof Error ? error.message : String(error),
                environmentId
            }, 'EnvironmentManager');
            // Return empty object as fallback
            return {};
        }
    }
    /**
     * Load endpoint configuration
     */
    async loadEndpointConfig(endpointId) {
        try {
            // Check cache first
            const cached = this.getCachedData(`endpoint_${endpointId}`);
            if (cached) {
                return cached;
            }
            const client = await this.getBackendClient();
            const endpointDetails = await client.getEndpointDetails(endpointId);
            // Cache the result
            this.setCachedData(`endpoint_${endpointId}`, endpointDetails);
            return endpointDetails;
        }
        catch (error) {
            logger.error('Failed to load endpoint config', {
                error: error instanceof Error ? error.message : String(error),
                endpointId
            }, 'EnvironmentManager');
            throw error;
        }
    }
    /**
     * Load flow configuration
     */
    async loadFlowConfig(flowId) {
        try {
            // Check cache first
            const cached = this.getCachedData(`flow_${flowId}`);
            if (cached) {
                return cached;
            }
            const client = await this.getBackendClient();
            // Note: This assumes backend has a getFlowDetails method
            // For now, we'll use a mock implementation
            const flowDetails = await this.getFlowFromBackend(flowId);
            // Cache the result
            this.setCachedData(`flow_${flowId}`, flowDetails);
            return flowDetails;
        }
        catch (error) {
            logger.error('Failed to load flow config', {
                error: error instanceof Error ? error.message : String(error),
                flowId
            }, 'EnvironmentManager');
            throw error;
        }
    }
    /**
     * Get backend client instance
     */
    async getBackendClient() {
        if (this.backendClient) {
            return this.backendClient;
        }
        const config = await this.configLoader.detectProjectConfig();
        if (!config) {
            throw new Error('No GASSAPI configuration found');
        }
        this.backendClient = new BackendClient(this.configLoader.getServerURL(config), this.configLoader.getMcpToken(config));
        return this.backendClient;
    }
    /**
     * Transform environment variables array to object
     */
    transformEnvironmentVariables(variables) {
        const result = {};
        for (const variable of variables) {
            if (!variable || typeof variable !== 'object') {
                logger.warn('Invalid variable format, skipping', { variable }, 'EnvironmentManager');
                continue;
            }
            if (!variable.key || typeof variable.key !== 'string') {
                logger.warn('Variable missing key, skipping', { variable }, 'EnvironmentManager');
                continue;
            }
            if (!variable.enabled) {
                continue; // Skip disabled variables
            }
            const key = variable.key.trim();
            if (!key) {
                continue;
            }
            // Validate variable name
            if (!VariableInterpolator.isValidVariableName(key)) {
                logger.warn(`Invalid variable name: ${key}, skipping`, { key }, 'EnvironmentManager');
                continue;
            }
            // Get value
            let value = '';
            if (variable.value !== null && variable.value !== undefined) {
                value = String(variable.value);
            }
            result[key] = value;
        }
        return result;
    }
    /**
     * Get flow details from backend (temporary implementation)
     */
    async getFlowFromBackend(flowId) {
        // This is a placeholder - need to implement getFlowDetails in BackendClient
        // For now, return a mock flow config
        logger.warn('Using mock flow config - getFlowDetails not implemented in BackendClient', { flowId }, 'EnvironmentManager');
        return {
            id: flowId,
            name: 'Mock Flow',
            nodes: [],
            edges: [],
            projectId: 'mock',
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
    }
    /**
     * Get cached data
     */
    getCachedData(key) {
        const cached = this.cache.get(key);
        if (!cached)
            return null;
        const now = Date.now();
        if (now - cached.timestamp > this.CACHE_TTL) {
            this.cache.delete(key);
            return null;
        }
        return cached.data;
    }
    /**
     * Set cached data
     */
    setCachedData(key, data) {
        this.cache.set(key, {
            data,
            timestamp: Date.now()
        });
    }
    /**
     * Clear cache
     */
    clearCache() {
        this.cache.clear();
        logger.info('Environment cache cleared', {}, 'EnvironmentManager');
    }
    /**
     * Get cache statistics
     */
    getCacheStats() {
        return {
            size: this.cache.size,
            keys: Array.from(this.cache.keys())
        };
    }
    /**
     * Validate environment configuration
     */
    validateEnvironmentConfig(config) {
        const errors = [];
        if (!config) {
            errors.push('Configuration is null or undefined');
            return { isValid: false, errors };
        }
        if (!config.id || typeof config.id !== 'string') {
            errors.push('Environment ID is required and must be a string');
        }
        if (!config.name || typeof config.name !== 'string') {
            errors.push('Environment name is required and must be a string');
        }
        return {
            isValid: errors.length === 0,
            errors
        };
    }
    /**
     * Merge environment variables with overrides
     */
    mergeVariables(baseVariables, overrides) {
        return { ...baseVariables, ...overrides };
    }
    /**
     * Validate variable context for interpolation
     */
    validateVariableContext(variables) {
        return VariableInterpolator.validateContext(variables);
    }
}
//# sourceMappingURL=EnvironmentManager.js.map