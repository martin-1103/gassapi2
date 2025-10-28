/**
 * Dependency management for endpoint tools
 */

import { ConfigManager } from '../../config.js';
import { BackendClient } from '../../client/BackendClient.js';

// Singleton instances for endpoint tools
let configManager: ConfigManager | null = null;
let backendClient: BackendClient | null = null;

/**
 * Initialize endpoint dependencies
 */
export async function getEndpointDependencies() {
  try {
    console.error('[DEPS] Initializing endpoint dependencies...');

    if (!configManager) {
      console.error('[DEPS] Creating new ConfigManager...');
      configManager = new ConfigManager();
    }

    if (!backendClient) {
      console.error('[DEPS] Loading configuration...');
      const config = await configManager.detectProjectConfig();

      if (!config) {
        console.error('[DEPS] No configuration found');
        throw new Error('No configuration found. Please ensure gassapi.json exists in your project directory.');
      }

      console.error('[DEPS] Configuration loaded successfully:', {
        projectId: config.project?.id,
        projectName: config.project?.name,
        hasToken: !!configManager.getMcpToken(config)
      });

      const token = configManager.getMcpToken(config);
      if (!token) {
        console.error('[DEPS] Token missing in configuration');
        throw new Error('Missing token in configuration');
      }

      console.error('[DEPS] Creating BackendClient with token...');
      backendClient = new BackendClient(token);
      console.error('[DEPS] BackendClient created successfully');
    }

    return { configManager, backendClient };
  } catch (error) {
    console.error('[DEPS] Failed to initialize dependencies:', error);
    throw error;
  }
}

/**
 * Reset dependencies (useful for testing)
 */
export function resetDependencies() {
  configManager = null;
  backendClient = null;
}