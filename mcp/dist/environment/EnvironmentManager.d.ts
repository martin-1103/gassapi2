/**
 * Environment Manager
 * Handles loading and managing environment variables and configurations
 */
export declare class EnvironmentManager {
    private configLoader;
    private backendClient;
    private cache;
    private readonly CACHE_TTL;
    constructor();
    /**
     * Load environment variables for a given environment ID
     */
    loadEnvironmentVariables(environmentId: string): Promise<Record<string, string>>;
    /**
     * Load endpoint configuration
     */
    loadEndpointConfig(endpointId: string): Promise<any>;
    /**
     * Load flow configuration
     */
    loadFlowConfig(flowId: string): Promise<any>;
    /**
     * Get backend client instance
     */
    private getBackendClient;
    /**
     * Transform environment variables array to object
     */
    private transformEnvironmentVariables;
    /**
     * Get flow details from backend (temporary implementation)
     */
    private getFlowFromBackend;
    /**
     * Get cached data
     */
    private getCachedData;
    /**
     * Set cached data
     */
    private setCachedData;
    /**
     * Clear cache
     */
    clearCache(): void;
    /**
     * Get cache statistics
     */
    getCacheStats(): {
        size: number;
        keys: string[];
    };
    /**
     * Validate environment configuration
     */
    validateEnvironmentConfig(config: any): {
        isValid: boolean;
        errors: string[];
    };
    /**
     * Merge environment variables with overrides
     */
    mergeVariables(baseVariables: Record<string, string>, overrides: Record<string, string>): Record<string, string>;
    /**
     * Validate variable context for interpolation
     */
    validateVariableContext(variables: Record<string, any>): {
        isValid: boolean;
        errors: string[];
    };
}
//# sourceMappingURL=EnvironmentManager.d.ts.map