/**
 * Environment Details Handler
 * Handles environment details retrieval requests
 */

import { McpToolResponse } from '../../../types.js';
import { ConfigManager } from '../../../config.js';
import { BackendClient } from '../../../client/BackendClient.js';
import { EnvironmentService } from '../services/EnvironmentService.js';
import { GetEnvironmentDetailsRequest } from '../types.js';

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
    if (!token) {
      throw new Error('Could not get authentication token');
    }
    backendClient = new BackendClient(token);
  }
  return { configManager, backendClient };
}

/**
 * Parse variables from JSON string
 */
function parseVariables(variablesStr?: string): Record<string, string> {
  if (!variablesStr || variablesStr === '{}') {
    return {};
  }
  try {
    const parsed = JSON.parse(variablesStr);
    return typeof parsed === 'object' ? parsed : {};
  } catch (e) {
    return {};
  }
}

/**
 * Get environment details handler
 */
export async function handleGetEnvironmentDetails(args: any): Promise<McpToolResponse> {
  try {
    const { environmentId, includeVariables } = args;

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

    // Get environment details
    const request: GetEnvironmentDetailsRequest = {
      environmentId,
      includeVariables: includeVariables !== false // default to true
    };

    const response = await envService.getEnvironmentDetails(request);

    if (!response.success) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: false,
              error: response.error || 'Failed to get environment details'
            }, null, 2)
          }
        ]
      };
    }

    const env = response.data;

    // Parse variables
    const variables = parseVariables(env.variables);

    // Format response
    let detailsText = `📋 Environment Details\n\n`;
    detailsText += `🏷️  Name: ${env.name}\n`;
    detailsText += `🆔 ID: ${env.id}\n`;
    detailsText += `📝 Description: ${env.description || 'No description'}\n`;
    detailsText += `🎯 Default: ${env.is_default ? 'Yes' : 'No'}\n`;
    detailsText += `📊 Variables: ${Object.keys(variables).length}\n\n`;

    if (Object.keys(variables).length > 0 && includeVariables !== false) {
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

  } catch (error: any) {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: false,
            error: error.message || 'Unknown error occurred while getting environment details'
          }, null, 2)
        }
      ]
    };
  }
}

/**
 * Create environment handler
 */
export async function handleCreateEnvironment(args: any): Promise<McpToolResponse> {
  try {
    const { name, description, variables, isDefault, projectId } = args;

    if (!name) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: false,
              error: 'Environment name is required'
            }, null, 2)
          }
        ]
      };
    }

    const instances = await getInstances();

    // Get project ID if not provided
    let targetProjectId = projectId;
    if (!targetProjectId) {
      const config = await instances.configManager.detectProjectConfig();
      targetProjectId = config?.project?.id;
      if (!targetProjectId) {
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: false,
                error: 'Project ID not found in config and not provided in arguments'
              }, null, 2)
            }
          ]
        };
      }
    }

    // Parse variables
    let parsedVariables: Record<string, string> = {};
    if (variables) {
      if (typeof variables === 'string') {
        try {
          parsedVariables = JSON.parse(variables);
        } catch (e) {
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  success: false,
                  error: 'Variables must be valid JSON string or object'
                }, null, 2)
              }
            ]
          };
        }
      } else if (typeof variables === 'object') {
        parsedVariables = variables as Record<string, string>;
      }
    }

    // Create environment service
    const envService = new EnvironmentService(
      instances.backendClient.getBaseUrl(),
      instances.backendClient.getToken()
    );

    // Create environment
    const createRequest = {
      name: name.trim(),
      description: description?.trim(),
      variables: parsedVariables,
      isDefault: isDefault || false,
      projectId: targetProjectId
    };

    const response = await envService.createEnvironment(createRequest);

    if (!response.success) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: false,
              error: response.error || 'Failed to create environment'
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
            message: 'Environment created successfully'
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
            error: error.message || 'Unknown error occurred while creating environment'
          }, null, 2)
        }
      ]
    };
  }
}

/**
 * Delete environment handler
 */
export async function handleDeleteEnvironment(args: any): Promise<McpToolResponse> {
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

    // Delete environment
    const response = await envService.deleteEnvironment(environmentId);

    if (!response.success) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: false,
              error: response.error || 'Failed to delete environment'
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
            message: 'Environment deleted successfully'
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
            error: error.message || 'Unknown error occurred while deleting environment'
          }, null, 2)
        }
      ]
    };
  }
}