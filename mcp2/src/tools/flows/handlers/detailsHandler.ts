/**
 * Flow Details Handler
 * Handles flow details retrieval requests
 */

import { McpToolResponse } from '../../../types.js';
import { ConfigManager } from '../../../config.js';
import { BackendClient } from '../../../client/BackendClient.js';
import { FlowDetailsResponse } from '../types.js';
import { StringUtils, ErrorUtils } from '../../../shared/index.js';

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
 * Format flow steps for display
 */
function formatFlowSteps(steps: any[]): any[] {
  return steps.map(step => ({
    id: step.id,
    name: step.name,
    method: step.method,
    url: step.url,
    headers: step.headers,
    body: step.body,
    timeout: step.timeout,
    expectedStatus: step.expectedStatus,
    description: step.description,
    endpointId: step.endpointId
  }));
}

/**
 * Format flow config for display
 */
function formatFlowConfig(config: any): any {
  return {
    timeout: config.timeout || 30000,
    stopOnError: config.stopOnError !== false,
    parallel: config.parallel || false,
    maxConcurrency: config.maxConcurrency || 5
  };
}

/**
 * Get flow details tool handler
 */
export async function handleGetFlowDetails(args: any): Promise<McpToolResponse> {
  try {
    const { flowId, includeSteps, includeConfig } = args;

    if (!flowId) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: false,
              error: 'Flow ID is required'
            }, null, 2)
          }
        ]
      };
    }

    const instances = await getInstances();
    const flowResponse = await instances.backendClient.getFlowDetails(flowId);

    if (!flowResponse.success || !flowResponse.data) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: false,
              error: flowResponse.message || 'Failed to get flow details'
            }, null, 2)
          }
        ]
      };
    }

    const flowData = flowResponse.data;

    // Build response data
    const responseData: any = {
      id: flowData.id,
      name: flowData.name,
      description: flowData.description,
      project_id: flowData.project_id,
      folder_id: flowData.folder_id,
      is_active: flowData.is_active,
      created_at: flowData.created_at,
      updated_at: flowData.updated_at
    };

    // Include flow data if requested
    if (flowData.flow_data) {
      // Handle nested flow_data structure (string vs object)
      let parsedFlowData;
      if (typeof flowData.flow_data === 'string') {
        try {
          parsedFlowData = JSON.parse(flowData.flow_data);
        } catch (e) {
          parsedFlowData = { version: '1.0', steps: [] };
        }
      } else {
        parsedFlowData = flowData.flow_data;
      }

      responseData.flow_data = {
        version: parsedFlowData.version || '1.0',
        ...parsedFlowData.steps && { steps: formatFlowSteps(parsedFlowData.steps) },
        ...parsedFlowData.config && { config: formatFlowConfig(parsedFlowData.config) }
      };

      if (includeSteps === false) {
        delete responseData.flow_data.steps;
      }

      if (includeConfig === false) {
        delete responseData.flow_data.config;
      }
    }

    if (flowData.flow_inputs) {
      responseData.flow_inputs = flowData.flow_inputs;
    }

    const result: FlowDetailsResponse = {
      success: true,
      data: responseData,
      message: 'Flow details retrieved successfully'
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
            error: error.message || 'Unknown error occurred while retrieving flow details'
          }, null, 2)
          }
        ]
      };
  }
}

/**
 * List flows handler
 */
export async function handleListFlows(args: any): Promise<McpToolResponse> {
  try {
    const { folderId, activeOnly, limit, offset } = args;

    const instances = await getInstances();

    // Get project ID from config
    const config = await instances.configManager.detectProjectConfig();
    const projectId = config?.project?.id;
    if (!projectId) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: false,
              error: 'Project ID not found in config'
            }, null, 2)
          }
        ]
      };
    }
    const projectResponse = await instances.backendClient.getProjectContext(projectId);
    if (!projectResponse.success || !projectResponse.data) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: false,
              error: 'Failed to get current project'
            }, null, 2)
          }
        ]
      };
    }

    // Get flows from API
    const flowsResponse = await instances.backendClient.getFlows({
      project_id: projectId,
      folder_id: folderId,
      is_active: activeOnly,
      limit: limit || 50,
      offset: offset || 0
    });

    if (!flowsResponse.success) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: false,
              error: flowsResponse.message || 'Failed to retrieve flows'
            }, null, 2)
          }
        ]
      };
    }

    // Format flows for display
    const flows = (flowsResponse.data || []).map((flow: any) => ({
      id: flow.id,
      name: flow.name,
      description: flow.description,
      folder_id: flow.folder_id,
      project_id: flow.project_id,
      is_active: flow.is_active,
      step_count: flow.flow_data?.steps?.length || 0,
      created_at: flow.created_at,
      updated_at: flow.updated_at
    }));

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            data: flows,
            total: flows.length,
            message: `Retrieved ${flows.length} flows`
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
            error: error.message || 'Unknown error occurred while listing flows'
          }, null, 2)
          }
        ]
      };
  }
}

/**
 * Delete flow handler
 */
export async function handleDeleteFlow(args: any): Promise<McpToolResponse> {
  try {
    const { flowId } = args;

    if (!flowId) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: false,
              error: 'Flow ID is required'
            }, null, 2)
          }
        ]
      };
    }

    const instances = await getInstances();
    const deleteResponse = await instances.backendClient.deleteFlow(flowId);

    if (!deleteResponse.success) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: false,
              error: deleteResponse.message || 'Failed to delete flow'
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
            message: 'Flow deleted successfully'
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
            error: error.message || 'Unknown error occurred while deleting flow'
          }, null, 2)
          }
        ]
      };
  }
}