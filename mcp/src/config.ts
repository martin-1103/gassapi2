import { promises as fs } from 'fs';
import { ConfigLoader } from './discovery/ConfigLoader';
import { CacheConfig, McpServerConfig, ExecutionConfig } from './types/config.types';

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
  private static instance: Config;
  private configLoader: ConfigLoader;
  private _projectConfig: any = null;

  private constructor() {
    this.configLoader = new ConfigLoader();
  }

  /**
   * Get singleton instance
   */
  static getInstance(): Config {
    if (!Config.instance) {
      Config.instance = new Config();
    }
    return Config.instance;
  }

  /**
   * Load or detect project configuration
   */
  async loadProjectConfig(): Promise<void> {
    try {
      this._projectConfig = await this.configLoader.detectProjectConfig();

      if (this._projectConfig) {
        console.log(`✅ Loaded project configuration: ${this._projectConfig.project.name}`);
        console.log(`📊 Project ID: ${this._projectConfig.project.id}`);
        console.log(`🔗 Server URL: ${this._projectConfig.mcpClient.serverURL}`);
      }
    } catch (error) {
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
  hasProjectConfig(): boolean {
    return this._projectConfig !== null;
  }

  /**
   * Get project ID
   */
  getProjectId(): string | null {
    return this._projectConfig?.project?.id || null;
  }

  /**
   * Get project name
   */
  getProjectName(): string | null {
    return this._projectConfig?.project?.name || null;
  }

  /**
   * Get MCP token
   */
  getMcpToken(): string | null {
    return this._projectConfig?.mcpClient?.token || null;
  }

  /**
   * Get server URL
   */
  getServerURL(): string | null {
    return this._projectConfig?.mcpClient?.serverURL || null;
  }

  /**
   * Get active environment
   */
  getActiveEnvironment(): string {
    return this._projectConfig?.environment?.active || 'development';
  }

  /**
   * Get environment variables
   */
  getEnvironmentVariables(): Record<string, string> {
    return this._projectConfig?.environment?.variables || {};
  }

  /**
   * Get API base URL
   */
  getApiBaseUrl(): string | null {
    return this._projectConfig?.api?.baseURL || this.getServerURL();
  }

  /**
   * Get discovery ports
   */
  getDiscoveryPorts(): number[] {
    return [3000, 8000, 8080, 5000];
  }

  /**
   * Should auto-scan for APIs
   */
  shouldAutoScan(): boolean {
    return true;
  }

  /**
   * Get cache configuration
   */
  getCacheConfig(): CacheConfig {
    return {
      ttlMs: {
        project: 600000,      // 10 minutes
        collections: 300000,   // 5 minutes
        environments: 600000,  // 10 minutes
        tokenValidation: 60000  // 1 minute
      },
      maxAgeMs: 3600000,     // 1 hour
      cleanupIntervalMs: 300000   // 5 minutes
    };
  }

  /**
   * Get MCP server configuration
   */
  getMcpServerConfig(): McpServerConfig {
    return {
      name: DEFAULT_CONFIG.projectName || 'GASSAPI MCP Client',
      version: '1.0.0',
      logLevel: process.env.NODE_ENV === 'development' ? 'debug' : 'info'
    };
  }

  /**
   * Get execution configuration
   */
  getExecutionConfig(): ExecutionConfig {
    return {
      maxConcurrent: 5,
      timeoutMs: 30000,      // 30 seconds
      retryAttempts: 3,
      retryDelayMs: 1000
    };
  }

  /**
   * Create default configuration file
   */
  async createSampleConfig(projectName: string, projectId: string): Promise<void> {
    try {
      const projectDir = process.cwd();
      await ConfigLoader.createSampleConfig(projectDir, projectId, projectName);
      console.log(`📝 Sample configuration created: ${projectDir}/gassapi.json`);
      console.log('Please edit the file with your actual project details and MCP token.');
    } catch (error) {
      console.error('❌ Failed to create sample configuration:', error);
      throw error;
    }
  }

  /**
   * Validate current configuration
   */
  async validateConfiguration(): Promise<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
  }> {
    const errors: string[] = [];
    const warnings: string[] = [];

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
    } else if (config.mcpClient.token.length < 10) {
      warnings.push('MCP token seems too short');
    }

    if (!config.mcpClient?.serverURL) {
      errors.push('Missing server URL');
    } else {
      try {
        new URL(config.mcpClient.serverURL);
      } catch {
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
  getConfigurationSummary(): {
    hasConfig: boolean;
    projectId?: string;
    projectName?: string;
    serverUrl?: string;
    environmentActive?: string;
    variableCount: number;
    toolsAvailable: number;
  } {
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
  async reset(): Promise<void> {
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
    } catch (error) {
      console.error('❌ Failed to reset configuration:', error);
      throw error;
    }
  }

  /**
   * Get configuration for logging
   */
  getLogConfig(): {
    level: string;
    format: string;
    timestamp: boolean;
  } {
    return {
      level: this.getMcpServerConfig().logLevel,
      format: 'json',
      timestamp: true
    };
  }

  /**
   * Export configuration to JSON string
   */
  exportConfiguration(): string {
    if (!this._projectConfig) {
      throw new Error('No project configuration to export');
    }

    return JSON.stringify(this._projectConfig, null, 2);
  }

  /**
   * Import configuration from JSON string
   */
  async importConfiguration(configJson: string): Promise<void> {
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
    } catch (error) {
      console.error('❌ Failed to import configuration:', error);
      throw error;
    }
  }
}

// Export singleton getter
export const config = Config.getInstance();