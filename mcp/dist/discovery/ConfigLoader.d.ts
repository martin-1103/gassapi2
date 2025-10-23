import { GassapiConfig } from '../types/config.types';
/**
 * GASSAPI Configuration Loader
 * Auto-detects and parses gassapi.json configuration files
 */
export declare class ConfigLoader {
    private cacheManager;
    private configCache;
    constructor();
    /**
     * Auto-detect gassapi.json file by scanning parent directories
     */
    detectProjectConfig(): Promise<GassapiConfig | null>;
    /**
     * Scan for gassapi.json in current and parent directories
     */
    private scanForConfig;
    /**
     * Load specific gassapi.json configuration file
     */
    loadConfig(configPath: string): Promise<GassapiConfig>;
    /**
     * Validate GASSAPI configuration structure
     */
    validateConfig(config: any): asserts config is GassapiConfig;
    /**
     * Get default configuration template
     */
    static getDefaultConfig(): Partial<GassapiConfig>;
    /**
     * Create sample configuration file
     */
    static createSampleConfig(projectDir: string, projectId: string, projectName: string): Promise<void>;
    /**
     * Reload configuration (clear cache and reload)
     */
    reloadConfig(configPath: string): Promise<GassapiConfig>;
    /**
     * Get configuration with caching
     */
    getCachedConfig(configPath: string): Promise<GassapiConfig | null>;
    /**
     * Clear all configuration caches
     */
    clearCache(): void;
    /**
     * Validate configuration file exists
     */
    configExists(configPath?: string): Promise<boolean>;
    /**
     * Get project directory from configuration
     */
    getProjectDirectory(configPath?: string): Promise<string | null>;
    /**
     * Check if file exists
     */
    private fileExists;
    /**
     * Normalize environment variables
     */
    normalizeEnvironmentVariables(variables: Record<string, any>): Record<string, string>;
    /**
     * Extract environment variables for a specific environment
     */
    extractEnvironmentVariables(config: GassapiConfig, environmentName?: string): Record<string, string>;
    /**
     * Get active environment name
     */
    getActiveEnvironment(config: GassapiConfig): string;
    /**
     * Get project information
     */
    getProjectInfo(config: GassapiConfig): {
        id: string;
        name: string;
        description?: string;
    };
    /**
     * Get server URL
     */
    getServerURL(config: GassapiConfig): string;
    /**
     * Get MCP token
     */
    getMcpToken(config: GassapiConfig): string;
    /**
     * Get API base URL
     */
    getApiBaseUrl(config: GassapiConfig): string;
    /**
     * Get discovery ports
     */
    getDiscoveryPorts(config: GassapiConfig): number[];
    /**
     * Should auto-scan for APIs
     */
    shouldAutoScan(config: GassapiConfig): boolean;
}
//# sourceMappingURL=ConfigLoader.d.ts.map