import { promises as fs } from 'fs';
import { ConfigLoader } from './discovery/ConfigLoader';
/**
 * GASSAPI MCP Client Configuration
 * Central configuration management for the MCP client
 */
const DEFAULT_CONFIG = {
    projectId: 'default',
    projectName: 'Default Project',
    serverUrl: 'http://localhost:3000',
    token: 'default-token',
    environmentActive: 'development'
};
export class Config {
    constructor() {
        this._projectConfig = null;
        this.configLoader = new ConfigLoader();
    }
    /**
     * Get singleton instance
     */
    static getInstance() {
        if (!Config.instance) {
            Config.instance = new Config();
        }
        return Config.instance;
    }
    /**
     * Load or detect project configuration
     */
    async loadProjectConfig() {
        try {
            this._projectConfig = await this.configLoader.detectProjectConfig();
            if (this._projectConfig) {
                console.log(`✅ Loaded project configuration: ${this._projectConfig.project.name}`);
                console.log(`📊 Project ID: ${this._projectConfig.project.id}`);
                console.log(`🔗 Server URL: ${this._projectConfig.mcpClient.serverURL}`);
            }
        }
        catch (error) {
            console.warn('⚠️ No project configuration found:', error instanceof Error ? error.message : error);
            this._projectConfig = null;
        }
    }
    /**
     * Get current project configuration
     */
    getProjectConfig() {
        return this._projectConfig;
    }
    /**
     * Check if project is configured
     */
    hasProjectConfig() {
        return this._projectConfig !== null;
    }
    /**
     * Get project ID
     */
    getProjectId() {
        return this._projectConfig?.project?.id || null;
    }
    /**
     * Get project name
     */
    getProjectName() {
        return this._projectConfig?.project?.name || null;
    }
    /**
     * Get MCP token
     */
    getMcpToken() {
        return this._projectConfig?.mcpClient?.token || null;
    }
    /**
     * Get server URL
     */
    getServerURL() {
        return this._projectConfig?.mcpClient?.serverURL || null;
    }
    /**
     * Get active environment
     */
    getActiveEnvironment() {
        return this._projectConfig?.environment?.active || 'development';
    }
    /**
     * Get environment variables
     */
    getEnvironmentVariables() {
        return this._projectConfig?.environment?.variables || {};
    }
    /**
     * Get API base URL
     */
    getApiBaseUrl() {
        return this._projectConfig?.api?.baseURL || this.getServerURL();
    }
    /**
     * Get discovery ports
     */
    getDiscoveryPorts() {
        return [3000, 8000, 8080, 5000];
    }
    /**
     * Should auto-scan for APIs
     */
    shouldAutoScan() {
        return true;
    }
    /**
     * Get cache configuration
     */
    getCacheConfig() {
        return {
            ttlMs: {
                project: 600000, // 10 minutes
                collections: 300000, // 5 minutes
                environments: 600000, // 10 minutes
                tokenValidation: 60000 // 1 minute
            },
            maxAgeMs: 3600000, // 1 hour
            cleanupIntervalMs: 300000 // 5 minutes
        };
    }
    /**
     * Get MCP server configuration
     */
    getMcpServerConfig() {
        return {
            name: DEFAULT_CONFIG.projectName || 'GASSAPI MCP Client',
            version: '1.0.0',
            logLevel: process.env.NODE_ENV === 'development' ? 'debug' : 'info'
        };
    }
    /**
     * Get execution configuration
     */
    getExecutionConfig() {
        return {
            maxConcurrent: 5,
            timeoutMs: 30000, // 30 seconds
            retryAttempts: 3,
            retryDelayMs: 1000
        };
    }
    /**
     * Create default configuration file
     */
    async createSampleConfig(projectName, projectId) {
        try {
            const projectDir = process.cwd();
            await ConfigLoader.createSampleConfig(projectDir, projectId, projectName);
            console.log(`📝 Sample configuration created: ${projectDir}/gassapi.json`);
            console.log('Please edit the file with your actual project details and MCP token.');
        }
        catch (error) {
            console.error('❌ Failed to create sample configuration:', error);
            throw error;
        }
    }
    /**
     * Validate current configuration
     */
    async validateConfiguration() {
        const errors = [];
        const warnings = [];
        if (!this.hasProjectConfig()) {
            errors.push('No project configuration found');
            return { isValid: false, errors, warnings };
        }
        // Check required fields
        const config = this._projectConfig;
        if (!config.project?.id) {
            errors.push('Missing project ID');
        }
        if (!config.project?.name) {
            errors.push('Missing project name');
        }
        if (!config.mcpClient?.token) {
            errors.push('Missing MCP token');
        }
        else if (config.mcpClient.token.length < 10) {
            warnings.push('MCP token seems too short');
        }
        if (!config.mcpClient?.serverURL) {
            errors.push('Missing server URL');
        }
        else {
            try {
                new URL(config.mcpClient.serverURL);
            }
            catch {
                errors.push('Invalid server URL format');
            }
        }
        return {
            isValid: errors.length === 0,
            errors,
            warnings
        };
    }
    /**
     * Get configuration summary
     */
    getConfigurationSummary() {
        const variables = this.getEnvironmentVariables();
        return {
            hasConfig: this.hasProjectConfig(),
            projectId: this.getProjectId() || undefined,
            projectName: this.getProjectName() || undefined,
            serverUrl: this.getServerURL() || undefined,
            environmentActive: this._projectConfig?.environment?.active,
            variableCount: Object.keys(variables).length,
            toolsAvailable: 16 // Total number of MCP tools
        };
    }
    /**
     * Reset configuration (clear caches and reload)
     */
    async reset() {
        try {
            console.log('🔄 Resetting GASSAPI configuration...');
            // Clear caches
            this.configLoader.clearCache();
            // Clear in-memory config
            this._projectConfig = null;
            // Reload configuration
            await this.loadProjectConfig();
            const summary = this.getConfigurationSummary();
            console.log('✅ Configuration reset completed:', summary);
        }
        catch (error) {
            console.error('❌ Failed to reset configuration:', error);
            throw error;
        }
    }
    /**
     * Get configuration for logging
     */
    getLogConfig() {
        return {
            level: this.getMcpServerConfig().logLevel,
            format: 'json',
            timestamp: true
        };
    }
    /**
     * Export configuration to JSON string
     */
    exportConfiguration() {
        if (!this._projectConfig) {
            throw new Error('No project configuration to export');
        }
        return JSON.stringify(this._projectConfig, null, 2);
    }
    /**
     * Import configuration from JSON string
     */
    async importConfiguration(configJson) {
        try {
            const config = JSON.parse(configJson);
            // Validate structure
            this.configLoader.validateConfig(config);
            // Save to file
            const projectDir = process.cwd();
            const configPath = `${projectDir}/gassapi.json`;
            await fs.writeFile(configPath, JSON.stringify(config, null, 2));
            // Reload
            this._projectConfig = null;
            await this.loadProjectConfig();
            console.log('✅ Configuration imported successfully');
        }
        catch (error) {
            console.error('❌ Failed to import configuration:', error);
            throw error;
        }
    }
}
// Export singleton getter
export const config = Config.getInstance();
//# sourceMappingURL=config.js.map