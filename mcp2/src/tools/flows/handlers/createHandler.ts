/**
 * Flow Create Handler
 * Handles flow creation requests
 */

import { McpToolResponse } from '../../../types.js';
import { ConfigManager } from '../../../config.js';
import { BackendClient } from '../../../client/BackendClient.js';
import { FlowCreateRequest, FlowCreateResponse } from '../types.js';
import { ValidationUtils, ErrorUtils } from '../../../shared/index.js';

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
 * Validate flow creation request
 */
function validateFlowRequest(request: FlowCreateRequest): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!request.name || request.name.trim().length === 0) {
    errors.push('Flow name is required');
  }

  if (!request.steps || request.steps.length === 0) {
    errors.push('Flow must have at least one step');
  } else {
    const stepIds = new Set<string>();

    for (let i = 0; i < request.steps.length; i++) {
      const step = request.steps[i];

      if (!step.id) {
        errors.push(`Step ${i + 1} must have an ID`);
      } else if (stepIds.has(step.id)) {
        errors.push(`Duplicate step ID: ${step.id}`);
      } else {
        stepIds.add(step.id);
      }

      if (!step.name || step.name.trim().length === 0) {
        errors.push(`Step ${step.id} must have a name`);
      }

      // Validate step has either endpointId or method+url
      if (!step.endpointId && (!step.method || !step.url)) {
        errors.push(`Step ${step.id} must have either endpointId or both method and url`);
      }

      if (step.method && !ValidationUtils.validateHttpMethod(step.method)) {
        errors.push(`Step ${step.id} has invalid HTTP method: ${step.method}`);
      }

      if (step.url && !ValidationUtils.validateUrl(step.url)) {
        errors.push(`Step ${step.id} has invalid URL: ${step.url}`);
      }

      if (step.timeout && !ValidationUtils.validateTimeout(step.timeout)) {
        errors.push(`Step ${step.id} has invalid timeout: ${step.timeout}`);
      }
    }
  }

  // Validate config
  if (request.config) {
    if (request.config.timeout && !ValidationUtils.validateTimeout(request.config.timeout)) {
      errors.push(`Invalid flow timeout: ${request.config.timeout}`);
    }

    if (request.config.maxConcurrency && (request.config.maxConcurrency < 1 || request.config.maxConcurrency > 20)) {
      errors.push(`Max concurrency must be between 1 and 20, got: ${request.config.maxConcurrency}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Create flow tool handler
 */
export async function handleCreateFlow(args: any): Promise<McpToolResponse> {
  try {
    const { name, description, folderId, steps, config, inputs } = args;

    if (!name) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: false,
              error: 'Flow name is required'
            }, null, 2)
          }
        ]
      };
    }

    if (!steps || !Array.isArray(steps) || steps.length === 0) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: false,
              error: 'Flow steps are required and must be a non-empty array'
            }, null, 2)
          }
        ]
      };
    }

    const instances = await getInstances();

    // Parse and validate steps
    let parsedSteps: any[] = [];

    if (typeof steps === 'string') {
      try {
        parsedSteps = JSON.parse(steps);
      } catch (e) {
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: false,
                error: 'Invalid steps format - must be valid JSON'
              }, null, 2)
            }
          ]
        };
      }
    } else {
      parsedSteps = steps;
    }

    // Build flow request
    const request: FlowCreateRequest = {
      name: name.trim(),
      description: description?.trim(),
      folderId,
      steps: parsedSteps,
      config: config ? {
        timeout: config.timeout,
        stopOnError: config.stopOnError,
        parallel: config.parallel,
        maxConcurrency: config.maxConcurrency
      } : undefined,
      inputs: inputs
    };

    // Validate request
    const validation = validateFlowRequest(request);
    if (!validation.valid) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: false,
              error: 'Validation failed',
              details: validation.errors
            }, null, 2)
          }
        ]
      };
    }

    // Get current project using project ID from config
    const instancesResolved = await instances;
    const projectConfig = await instancesResolved.configManager.detectProjectConfig();
    const projectId = projectConfig?.project?.id;

    // Debug: Check if we have valid config
    if (!projectConfig || !projectId) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: false,
              error: 'Configuration error',
              debug: {
                config: projectConfig,
                projectId: projectId
              }
            }, null, 2)
          }
        ]
      };
    }

    const projectResponse = await instancesResolved.backendClient.getProjectContext(projectId);
    if (!projectResponse.success || !projectResponse.data) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: false,
              error: 'Failed to get current project',
              debug: {
                projectId: projectId,
                configProjectId: projectConfig?.project?.id,
                projectResponse: projectResponse
              }
            }, null, 2)
          }
        ]
      };
    }

    // Prepare flow data for API
    const flowData = {
      name: request.name,
      description: request.description,
      folder_id: request.folderId,
      flow_data: {
        version: '1.0',
        steps: request.steps.map(step => ({
          id: step.id,
          name: step.name,
          endpointId: step.endpointId,
          method: step.method,
          url: step.url,
          headers: step.headers,
          body: step.body,
          timeout: step.timeout,
          expectedStatus: step.expectedStatus,
          description: step.description
        })),
        config: request.config || {
          timeout: 30000,
          stopOnError: true,
          parallel: false,
          maxConcurrency: 5
        }
      },
      flow_inputs: request.inputs,
      project_id: projectId,
      is_active: true
    };

    // Create flow via API
    const createResponse = await instancesResolved.backendClient.createFlow(flowData);

    if (!createResponse.success || !createResponse.data) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: false,
              error: createResponse.message || 'Failed to create flow'
            }, null, 2)
          }
        ]
      };
    }

    const result: FlowCreateResponse = {
      success: true,
      data: {
        id: createResponse.data.id,
        name: createResponse.data.name,
        description: createResponse.data.description,
        folder_id: createResponse.data.folder_id,
        flow_data: createResponse.data.flow_data,
        flow_inputs: createResponse.data.flow_inputs,
        project_id: createResponse.data.project_id,
        is_active: createResponse.data.is_active,
        created_at: createResponse.data.created_at,
        updated_at: createResponse.data.updated_at
      },
      message: 'Flow created successfully'
    };

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2)
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
            error: error.message || 'Unknown error occurred during flow creation'
          }, null, 2)
          }
        ]
      };
  }
}
