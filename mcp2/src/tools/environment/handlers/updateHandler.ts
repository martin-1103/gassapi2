/**
 * Environment Update Handler
 * Handles environment variable update requests
 */

import { McpToolResponse } from '../../../types.js';
import { ConfigManager } from '../../../config.js';
import { BackendClient } from '../../../client/BackendClient.js';
import { EnvironmentService } from '../services/EnvironmentService.js';
import { UpdateEnvironmentVariablesRequest } from '../types.js';

// Initialize services
let configManager: ConfigManager | null = null;
let backendClient: BackendClient | null = null;

/**
 * Get singleton instances
 */
async function getInstances() {
  if (!configManager) {
    configManager = new ConfigManager();
  }
  if (!backendClient) {
    const config = await configManager.detectProjectConfig();
    if (!config) {
      throw new Error('Could not detect project configuration');
    }
    const token = configManager.getMcpToken(config);
    const serverUrl = configManager.getServerURL(config);
    if (!token || !serverUrl) {
      throw new Error('Could not get authentication token or server URL');
    }
    backendClient = new BackendClient(serverUrl, token);
  }
  return { configManager, backendClient };
}

/**
 * Parse variables from various input formats
 */
function parseVariables(variables: any): Record<string, string> {
  if (!variables) return {};

  if (typeof variables === 'string') {
    try {
      return JSON.parse(variables);
    } catch (e) {
      // Try parsing as key=value pairs
      const result: Record<string, string> = {};
      variables.split(',').forEach((pair: string) => {
        const [key, value] = pair.split('=').map(s => s.trim());
        if (key) {
          result[key] = value || '';
        }
      });
      return result;
    }
  }

  if (typeof variables === 'object') {
    const result: Record<string, string> = {};
    for (const [key, value] of Object.entries(variables)) {
      result[key] = String(value);
    }
    return result;
  }

  return {};
}

/**
 * Update environment variables handler
 */
export async function handleUpdateEnvironmentVariables(args: any): Promise<McpToolResponse> {
  try {
    const { environmentId, variables, operation } = args;

    if (!environmentId) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: false,
              error: 'Environment ID is required'
            }, null, 2)
          }
        ]
      };
    }

    if (!variables) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: false,
              error: 'Variables are required'
            }, null, 2)
          }
        ]
      };
    }

    const instances = await getInstances();

    // Parse variables
    const parsedVariables = parseVariables(variables);

    if (Object.keys(parsedVariables).length === 0) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: false,
              error: 'No valid variables provided'
            }, null, 2)
          }
        ]
      };
    }

    // Create environment service
    const envService = new EnvironmentService(
      instances.backendClient.getBaseUrl(),
      instances.backendClient.getToken()
    );

    // Update environment variables
    const request: UpdateEnvironmentVariablesRequest = {
      environmentId,
      variables: parsedVariables,
      operation: operation || 'merge'
    };

    const response = await envService.updateEnvironmentVariables(request);

    if (!response.success) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: false,
              error: response.error || 'Failed to update environment variables'
            }, null, 2)
          }
        ]
      };
    }

    // Format success response
    let updateText = `✅ Environment variables updated successfully\n\n`;
    updateText += `📋 Environment ID: ${environmentId}\n`;
    updateText += `🔄 Operation: ${request.operation}\n`;

    if (response.data) {
      updateText += `📊 Updated variables: ${response.data.updatedVariables.length}\n`;
      if (response.data.updatedVariables.length > 0) {
        updateText += `   ${response.data.updatedVariables.join(', ')}\n`;
      }

      if (response.data.removedVariables && response.data.removedVariables.length > 0) {
        updateText += `🗑️  Removed variables: ${response.data.removedVariables.length}\n`;
        updateText += `   ${response.data.removedVariables.join(', ')}\n`;
      }

      updateText += `📈 Total variables: ${response.data.totalVariables}\n`;
    }

    updateText += `\n🕒 Updated at: ${new Date().toISOString()}`;

    return {
      content: [
        {
          type: 'text',
          text: updateText
        }
      ]
    };

  } catch (error: any) {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: false,
            error: error.message || 'Unknown error occurred while updating environment variables'
          }, null, 2)
        }
      ]
    };
  }
}

/**
 * Set default environment handler
 */
export async function handleSetDefaultEnvironment(args: any): Promise<McpToolResponse> {
  try {
    const { environmentId } = args;

    if (!environmentId) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: false,
              error: 'Environment ID is required'
            }, null, 2)
          }
        ]
      };
    }

    const instances = await getInstances();

    // Create environment service
    const envService = new EnvironmentService(
      instances.backendClient.getBaseUrl(),
      instances.backendClient.getToken()
    );

    // Set as default
    const success = await envService.setDefaultEnvironment(environmentId);

    if (!success) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: false,
              error: 'Failed to set environment as default'
            }, null, 2)
          }
        ]
      };
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            message: 'Environment set as default successfully',
            data: {
              environmentId,
              setAt: new Date().toISOString()
            }
          }, null, 2)
        }
      ]
    };

  } catch (error: any) {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: false,
            error: error.message || 'Unknown error occurred while setting default environment'
          }, null, 2)
        }
      ]
    };
  }
}

/**
 * Duplicate environment handler
 */
export async function handleDuplicateEnvironment(args: any): Promise<McpToolResponse> {
  try {
    const { sourceId, newName } = args;

    if (!sourceId) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: false,
              error: 'Source environment ID is required'
            }, null, 2)
          }
        ]
      };
    }

    if (!newName) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: false,
              error: 'New environment name is required'
            }, null, 2)
          }
        ]
      };
    }

    const instances = await getInstances();

    // Create environment service
    const envService = new EnvironmentService(
      instances.backendClient.getBaseUrl(),
      instances.backendClient.getToken()
    );

    // Duplicate environment
    const response = await envService.duplicateEnvironment(sourceId, newName);

    if (!response.success) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: false,
              error: response.error || 'Failed to duplicate environment'
            }, null, 2)
          }
        ]
      };
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            data: response.data,
            message: 'Environment duplicated successfully'
          }, null, 2)
        }
      ]
    };

  } catch (error: any) {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: false,
            error: error.message || 'Unknown error occurred while duplicating environment'
          }, null, 2)
        }
      ]
    };
  }
}