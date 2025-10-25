/**
 * Environment Management Tools for GASSAPI MCP v2
 * Migrated from original environment tools with backend adaptation
 */

import { McpTool, McpToolResponse } from '../types.js';
import { ConfigManager } from '../config.js';
import { BackendClient } from '../client/BackendClient.js';
import { getApiEndpoints } from '../lib/api/endpoints.js';

// API Response Interfaces
interface ListEnvironmentsResponse {
  success: boolean;
  data?: any[];
  message?: string;
}

interface EnvironmentResponse {
  success: boolean;
  data?: {
    id: string;
    name: string;
    description?: string;
    is_default: boolean;
    variables: string;
    created_at: string;
    updated_at: string;
  };
  message?: string;
}

interface EnvironmentUpdateResponse {
  success: boolean;
  message?: string;
}

// Singleton instances for environment tools
let configManager: ConfigManager | null = null;
let backendClient: BackendClient | null = null;

/**
 * Initialize environment dependencies
 */
async function getEnvironmentDependencies() {
  if (!configManager) {
    configManager = new ConfigManager();
  }
  if (!backendClient) {
    const config = await configManager.detectProjectConfig();
    if (!config) {
      throw new Error('No configuration found');
    }
    const token = configManager.getMcpToken(config);
    const serverUrl = configManager.getServerURL(config);
    if (!token || !serverUrl) {
      throw new Error('Missing token or server URL in configuration');
    }
    backendClient = new BackendClient(serverUrl, token);
  }
  return { configManager, backendClient };
}

// Tool: list_environments
export const listEnvironmentsTool: McpTool = {
  name: 'list_environments',
  description: 'List all environments for current project',
  inputSchema: {
    type: 'object',
    properties: {}
  }
};

// Tool: get_environment_details
export const getEnvironmentDetailsTool: McpTool = {
  name: 'get_environment_details',
  description: 'Get detailed environment information including variables',
  inputSchema: {
    type: 'object',
    properties: {
      environment_id: {
        type: 'string',
        description: 'Environment ID to get details for'
      }
    },
    required: ['environment_id']
  }
};

// Tool: update_environment_variables
export const updateEnvironmentVariablesTool: McpTool = {
  name: 'update_environment_variables',
  description: 'Update environment variables (add/update/remove variables)',
  inputSchema: {
    type: 'object',
    properties: {
      environment_id: {
        type: 'string',
        description: 'Environment ID to update variables for'
      },
      variables: {
        type: 'object',
        description: 'Variables object with key-value pairs (overwrites existing variables)',
        additionalProperties: {
          type: 'string',
          description: 'Environment variable value'
        }
      },
      operation: {
        type: 'string',
        description: 'Operation type: "merge" (default) to combine with existing, "replace" to overwrite all',
        enum: ['merge', 'replace'],
        default: 'merge'
      }
    },
    required: ['environment_id']
  }
};

/**
 * Environment tool handlers
 */
export function createEnvironmentToolHandlers(): Record<string, (args: any) => Promise<McpToolResponse>> {
  return {
    [listEnvironmentsTool.name]: async (args: Record<string, any>) => {
      try {
        const { configManager, backendClient } = await getEnvironmentDependencies();

        // Get project ID from args or config
        let projectId = args.project_id as string | undefined;
        if (!projectId) {
          const config = await configManager.detectProjectConfig();
          projectId = config?.project?.id;
          if (!projectId) {
            throw new Error('Project ID not found in config and not provided in arguments');
          }
        }

        // Call backend to get environments
        const apiEndpoints = getApiEndpoints();
        const endpoint = apiEndpoints.getEndpoint('projectEnvironments', { id: projectId });
        const fullUrl = `${backendClient.getBaseUrl()}${endpoint}`;

        console.error(`[EnvironmentTools] Requesting environments from: ${fullUrl}`);

        const result = await fetch(fullUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${backendClient.getToken()}`,
            'Content-Type': 'application/json'
          }
        });

        if (!result.ok) {
          throw new Error(`HTTP ${result.status}: ${result.statusText}`);
        }

        const data = await result.json() as ListEnvironmentsResponse;

        if (data.success && data.data) {
          const environments = Array.isArray(data.data) ? data.data : [];

          let envText = `🌍 Environments List (${environments.length}):\n\n`;

          if (environments.length === 0) {
            envText += 'No environments found for this project.\n';
            envText += 'Use create_environment tool to add your first environment.\n';
          } else {
            environments.forEach((env: any, index: number) => {
              const isDefault = env.is_default ? ' [Default]' : '';
              const varCount = env.variable_count || 0;
              envText += `${index + 1}. ${env.name} (${env.id})${isDefault}\n`;
              envText += `   - ${varCount} variables\n`;
              if (env.description) {
                envText += `   - ${env.description}\n`;
              }
              envText += '\n';
            });
          }

          return {
            content: [
              {
                type: 'text',
                text: envText
              }
            ]
          };
        } else {
          return {
            content: [
              {
                type: 'text',
                text: `❌ Failed to list environments: ${data.message || 'Unknown error'}`
              }
            ],
            isError: true
          };
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `❌ Environment list error: ${error instanceof Error ? error.message : 'Unknown error'}`
            }
          ],
          isError: true
        };
      }
    },

    [getEnvironmentDetailsTool.name]: async (args: Record<string, any>) => {
      try {
        const { configManager, backendClient } = await getEnvironmentDependencies();

        const environmentId = args.environment_id as string;
        if (!environmentId) {
          throw new Error('Environment ID is required');
        }

        // Call backend to get environment details
        const apiEndpoints = getApiEndpoints();
        const endpoint = apiEndpoints.getEndpoint('environmentDetails', { id: environmentId });
        const fullUrl = `${backendClient.getBaseUrl()}${endpoint}`;

        console.error(`[EnvironmentTools] Requesting environment details from: ${fullUrl}`);

        const result = await fetch(fullUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${backendClient.getToken()}`,
            'Content-Type': 'application/json'
          }
        });

        if (!result.ok) {
          throw new Error(`HTTP ${result.status}: ${result.statusText}`);
        }

        const data = await result.json() as EnvironmentResponse;

        if (data.success && data.data) {
          const env = data.data;

          // Parse variables from JSON string
          let variables: Record<string, string> = {};
          try {
            variables = JSON.parse(env.variables || '{}');
          } catch (e) {
            console.error('[EnvironmentTools] Failed to parse variables JSON:', e);
          }

          let detailsText = `📋 Environment Details\n\n`;
          detailsText += `🏷️  Name: ${env.name}\n`;
          detailsText += `🆔 ID: ${env.id}\n`;
          detailsText += `📝 Description: ${env.description || 'No description'}\n`;
          detailsText += `🎯 Default: ${env.is_default ? 'Yes' : 'No'}\n`;
          detailsText += `📊 Variables: ${Object.keys(variables).length}\n\n`;

          if (Object.keys(variables).length > 0) {
            detailsText += `🔧 Variables:\n`;
            Object.entries(variables).forEach(([key, value], index) => {
              detailsText += `   ${index + 1}. ${key}: ${value}\n`;
            });
            detailsText += '\n';
          } else {
            detailsText += `🔧 No variables configured\n\n`;
          }

          detailsText += `📅 Created: ${env.created_at}\n`;
          detailsText += `🔄 Updated: ${env.updated_at}\n`;

          return {
            content: [
              {
                type: 'text',
                text: detailsText
              }
            ]
          };
        } else {
          return {
            content: [
              {
                type: 'text',
                text: `❌ Failed to get environment details: ${data.message || 'Unknown error'}`
              }
            ],
            isError: true
          };
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `❌ Environment details error: ${error instanceof Error ? error.message : 'Unknown error'}`
            }
          ],
          isError: true
        };
      }
    },

    [updateEnvironmentVariablesTool.name]: async (args: Record<string, any>) => {
      try {
        const { configManager, backendClient } = await getEnvironmentDependencies();

        const environmentId = args.environment_id as string;
        const variables = args.variables as Record<string, string> | undefined;
        const operation = args.operation as 'merge' | 'replace' || 'merge';

        if (!environmentId) {
          throw new Error('Environment ID is required');
        }

        if (!variables || Object.keys(variables).length === 0) {
          throw new Error('Variables object is required');
        }

        // Get current environment details first
        const apiEndpoints = getApiEndpoints();
        const getEndpoint = apiEndpoints.getEndpoint('environmentDetails', { id: environmentId });
        const getFullUrl = `${backendClient.getBaseUrl()}${getEndpoint}`;

        const getResult = await fetch(getFullUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${backendClient.getToken()}`,
            'Content-Type': 'application/json'
          }
        });

        if (!getResult.ok) {
          throw new Error(`Failed to get current environment: HTTP ${getResult.status}`);
        }

        const getData = await getResult.json() as EnvironmentResponse;

        if (!getData.success || !getData.data) {
          throw new Error('Environment not found');
        }

        const currentEnv = getData.data;

        // Parse current variables
        let currentVariables: Record<string, string> = {};
        try {
          currentVariables = JSON.parse(currentEnv.variables || '{}');
        } catch (e) {
          console.error('[EnvironmentTools] Failed to parse current variables JSON:', e);
          currentVariables = {};
        }

        // Apply operation
        let newVariables: Record<string, string>;
        if (operation === 'replace') {
          newVariables = variables;
        } else {
          // Merge operation
          newVariables = { ...currentVariables, ...variables };
        }

        // Update environment with new variables
        const updateEndpoint = apiEndpoints.getEndpoint('environmentUpdate', { id: environmentId });
        const updateFullUrl = `${backendClient.getBaseUrl()}${updateEndpoint}`;

        console.error(`[EnvironmentTools] Updating environment variables at: ${updateFullUrl}`);
        console.error(`[EnvironmentTools] Operation: ${operation}, Variables count: ${Object.keys(newVariables).length}`);

        const updateResult = await fetch(updateFullUrl, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${backendClient.getToken()}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: currentEnv.name,
            description: currentEnv.description,
            variables: JSON.stringify(newVariables),
            is_default: currentEnv.is_default
          })
        });

        if (!updateResult.ok) {
          throw new Error(`Failed to update environment: HTTP ${updateResult.status}`);
        }

        const updateData = await updateResult.json() as EnvironmentUpdateResponse;

        if (updateData.success) {
          let updateText = `✅ Environment Variables Updated\n\n`;
          updateText += `🏷️  Environment: ${currentEnv.name}\n`;
          updateText += `🆔 ID: ${environmentId}\n`;
          updateText += `🔧 Operation: ${operation}\n`;
          updateText += `📊 Variables: ${Object.keys(newVariables).length}\n\n`;

          if (operation === 'replace') {
            updateText += `🔄 Replaced all variables with new set.\n`;
          } else {
            updateText += `🔀 Merged ${Object.keys(variables).length} new variables.\n`;
            updateText += `📊 Total variables after update: ${Object.keys(newVariables).length}\n`;
          }

          return {
            content: [
              {
                type: 'text',
                text: updateText
              }
            ]
          };
        } else {
          return {
            content: [
              {
                type: 'text',
                text: `❌ Failed to update environment variables: ${updateData.message || 'Unknown error'}`
              }
            ],
            isError: true
          };
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `❌ Environment variables update error: ${error instanceof Error ? error.message : 'Unknown error'}`
            }
          ],
          isError: true
        };
      }
    }
  };
}

// Export for server integration
export const ENVIRONMENT_TOOLS: McpTool[] = [
  listEnvironmentsTool,
  getEnvironmentDetailsTool,
  updateEnvironmentVariablesTool
];

// Legacy compatibility
export const TOOLS: McpTool[] = ENVIRONMENT_TOOLS;
export class ToolHandlers {
  static async handleListEnvironments(args?: { project_id?: string }): Promise<McpToolResponse> {
    const handlers = createEnvironmentToolHandlers();
    return handlers.list_environments(args || {});
  }

  static async handleGetEnvironmentDetails(args: { environment_id: string }): Promise<McpToolResponse> {
    const handlers = createEnvironmentToolHandlers();
    return handlers.get_environment_details(args);
  }

  static async handleUpdateEnvironmentVariables(args: {
    environment_id: string;
    variables: Record<string, string>;
    operation?: 'merge' | 'replace';
  }): Promise<McpToolResponse> {
    const handlers = createEnvironmentToolHandlers();
    return handlers.update_environment_variables(args);
  }
}

export function createToolHandlers(config: any): Record<string, (args: any) => Promise<McpToolResponse>> {
  return createEnvironmentToolHandlers();
}