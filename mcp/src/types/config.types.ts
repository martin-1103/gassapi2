/**
 * Configuration Type Definitions
 */

export interface GassapiConfig {
  project: GassapiProjectConfig;
  mcpClient: GassapiMcpClientConfig;
  environment: GassapiEnvironmentConfig;
  api?: GassapiApiConfig;
  discovery?: GassapiDiscoveryConfig;
}

export interface GassapiProjectConfig {
  id: string;
  name: string;
  description?: string;
}

export interface GassapiMcpClientConfig {
  token: string;
  serverURL: string;
}

export interface GassapiEnvironmentConfig {
  active: string;
  variables: Record<string, string>;
}

export interface GassapiApiConfig {
  baseURL: string;
  port?: number;
  paths?: string[];
}

export interface GassapiDiscoveryConfig {
  autoScan: boolean;
  ports?: number[];
}

export interface CacheConfig {
  ttlMs: {
    project: number;
    collections: number;
    environments: number;
    tokenValidation: number;
  };
  maxAgeMs: number;
  cleanupIntervalMs: number;
}

export interface McpServerConfig {
  name: string;
  version: string;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
}

export interface ExecutionConfig {
  maxConcurrent: number;
  timeoutMs: number;
  retryAttempts: number;
  retryDelayMs: number;
}