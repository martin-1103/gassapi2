/**
 * Simplified Configuration Manager for GASSAPI MCP v2
 * Migrated from original ConfigLoader but simplified
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';

export interface GassapiConfig {
  project: {
    id: string;
    name: string;
    description?: string;
  };
  mcpClient?: {
    token: string;
  };
  api?: {
    baseURL: string;
  };
  // Legacy support
  server?: {
    url: string;
    timeout?: number;
  };
  token?: string;
  environments?: Record<string, {
    id: string;
    name: string;
    description?: string;
    variables?: Record<string, string>;
  }>;
}

/**
 * Simple configuration manager
 * Detects and loads gassapi.json configuration
 */
export class ConfigManager {
  private config: GassapiConfig | null = null;
  private configPath: string | null = null;

  constructor(configPath?: string) {
    if (configPath) {
      this.configPath = path.resolve(configPath);
    }
  }

  /**
   * Detect and load configuration from parent directories
   */
  async detectProjectConfig(): Promise<GassapiConfig | null> {
    if (this.config) {
      return this.config;
    }

    const configPath = await this.findConfigFile();
    if (!configPath) {
      return null;
    }

    try {
      const configData = await fs.readFile(configPath, 'utf-8');
      this.config = JSON.parse(configData);
      this.configPath = configPath;
      return this.config;
    } catch (error) {
      console.error(`[CONFIG] Failed to load config from ${configPath}:`, error);
      return null;
    }
  }

  /**
   * Find gassapi.json file in parent directories
   */
  private async findConfigFile(): Promise<string | null> {
    const currentDir = process.cwd();
    let searchDir = currentDir;

    // Search up to 5 levels up
    for (let i = 0; i < 5; i++) {
      const configFiles = [
        path.join(searchDir, 'gassapi.json'),
        path.join(searchDir, 'gassapi-mcp.json'),
        path.join(searchDir, '.gassapi.json')
      ];

      for (const configFile of configFiles) {
        try {
          await fs.access(configFile);
          return configFile;
        } catch {
          // File doesn't exist, continue searching
        }
      }

      const parentDir = path.dirname(searchDir);
      if (parentDir === searchDir) {
        break; // Reached root
      }
      searchDir = parentDir;
    }

    return null;
  }

  /**
   * Get MCP token from config
   */
  getMcpToken(config?: GassapiConfig): string | null {
    const cfg = config || this.config;

    // Try new format first
    if (cfg?.mcpClient?.token) {
      return cfg.mcpClient.token;
    }

    // Fallback to legacy format
    return cfg?.token || null;
  }

  /**
   * Get server URL from config
   */
  getServerURL(config?: GassapiConfig): string | null {
    const cfg = config || this.config;

    // Try new format first
    if (cfg?.api?.baseURL) {
      return cfg.api.baseURL;
    }

    // Fallback to legacy format
    return cfg?.server?.url || null;
  }

  /**
   * Get project info
   */
  getProjectInfo(config?: GassapiConfig): { id: string; name: string; description?: string } {
    const cfg = config || this.config;
    return cfg?.project || { id: 'unknown', name: 'Unknown Project' };
  }

  /**
   * Check if config file exists
   */
  hasConfigFile(): boolean {
    return this.configPath !== null;
  }

  /**
   * Get config file path
   */
  getConfigPath(): string {
    return this.configPath || 'Not found';
  }

  /**
   * Get auth token
   */
  getAuthToken(): string | null {
    return this.getMcpToken();
  }

  /**
   * Check if token is expired (simple check)
   */
  isTokenExpired(): boolean {
    // Simple implementation - in real app would check expiry date
    return !this.getAuthToken();
  }

  /**
   * Validate configuration
   */
  validate(): { isValid: boolean; errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!this.config) {
      errors.push('No configuration file found');
      return { isValid: false, errors, warnings };
    }

    // Validate required fields
    if (!this.config.project?.id) {
      errors.push('Project ID is required');
    }

    if (!this.config.project?.name) {
      errors.push('Project name is required');
    }

    const token = this.config.token || this.config.mcpClient?.token;
    if (!token) {
      errors.push('Token is required');
    }

    const serverUrl = this.config.server?.url || this.config.api?.baseURL;
    if (!serverUrl) {
      errors.push('Server URL is required');
    }

    // Validate URL format
    try {
      new URL(serverUrl!);
    } catch {
      errors.push('Invalid server URL format');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Create sample configuration
   */
  createSampleConfig(projectName?: string, projectId?: string): void {
    const sampleConfig: GassapiConfig = {
      project: {
        id: projectId || 'project-' + Math.random().toString(36).substr(2, 9),
        name: projectName || 'My GASSAPI Project',
        description: 'GASSAPI MCP Project Configuration'
      },
      server: {
        url: 'https://api.gassapi.com',
        timeout: 30000
      },
      token: 'your-gassapi-api-token-here'
    };

    const configPath = path.join(process.cwd(), 'gassapi.json');
    const configData = JSON.stringify(sampleConfig, null, 2);

    fs.writeFile(configPath, configData, 'utf-8')
      .then(() => {
        console.log(`[CONFIG] Created sample config at: ${configPath}`);
      })
      .catch((error) => {
        console.error(`[CONFIG] Failed to create config:`, error);
      });
  }

  /**
   * Clear cached configuration
   */
  clearCache(): void {
    this.config = null;
    this.configPath = null;
  }
}