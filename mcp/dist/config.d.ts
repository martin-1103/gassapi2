import { CacheConfig, McpServerConfig, ExecutionConfig, GassapiConfig } from './types/config.types';
export declare class Config {
    private static instance;
    private configLoader;
    private _projectConfig;
    private constructor();
    /**
     * Get singleton instance
     */
    static getInstance(): Config;
    /**
     * Load or detect project configuration
     */
    loadProjectConfig(): Promise<void>;
    /**
     * Get current project configuration
     */
    getProjectConfig(): GassapiConfig;
    /**
     * Check if project is configured
     */
    hasProjectConfig(): boolean;
    /**
     * Get project ID
     */
    getProjectId(): string | null;
    /**
     * Get project name
     */
    getProjectName(): string | null;
    /**
     * Get MCP token
     */
    getMcpToken(): string | null;
    /**
     * Get server URL
     */
    getServerURL(): string | null;
    /**
     * Get active environment
     */
    getActiveEnvironment(): string;
    /**
     * Get environment variables
     */
    getEnvironmentVariables(): Record<string, string>;
    /**
     * Get API base URL
     */
    getApiBaseUrl(): string | null;
    /**
     * Get discovery ports
     */
    getDiscoveryPorts(): number[];
    /**
     * Should auto-scan for APIs
     */
    shouldAutoScan(): boolean;
    /**
     * Get cache configuration
     */
    getCacheConfig(): CacheConfig;
    /**
     * Get MCP server configuration
     */
    getMcpServerConfig(): McpServerConfig;
    /**
     * Get execution configuration
     */
    getExecutionConfig(): ExecutionConfig;
    /**
     * Create default configuration file
     */
    createSampleConfig(projectName: string, projectId: string): Promise<void>;
    /**
     * Validate current configuration
     */
    validateConfiguration(): Promise<{
        isValid: boolean;
        errors: string[];
        warnings: string[];
    }>;
    /**
     * Get configuration summary
     */
    getConfigurationSummary(): {
        hasConfig: boolean;
        projectId?: string;
        projectName?: string;
        serverUrl?: string;
        environmentActive?: string;
        variableCount: number;
        toolsAvailable: number;
    };
    /**
     * Reset configuration (clear caches and reload)
     */
    reset(): Promise<void>;
    /**
     * Get configuration for logging
     */
    getLogConfig(): {
        level: string;
        format: string;
        timestamp: boolean;
    };
    /**
     * Export configuration to JSON string
     */
    exportConfiguration(): string;
    /**
     * Import configuration from JSON string
     */
    importConfiguration(configJson: string): Promise<void>;
}
export declare const config: Config;
//# sourceMappingURL=config.d.ts.map