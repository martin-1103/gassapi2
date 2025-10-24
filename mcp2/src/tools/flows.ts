/**
 * Flow Tools for GASSAPI MCP v2
 * Simplified flow execution for sequential endpoint testing
 */

import { McpTool, McpToolResponse } from '../types.js';
import { ConfigManager } from '../config.js';
import { BackendClient } from '../client/BackendClient.js';

// Flow Interfaces
interface FlowExecutionResult {
  success: boolean;
  data?: {
    flowId: string;
    status: string;
    executionTime: number;
    nodeResults: any[];
    errors: string[];
    timestamp: string;
  };
  message?: string;
}

interface FlowDetailsResponse {
  success: boolean;
  data?: {
    id: string;
    name: string;
    description?: string;
    nodes: any[];
    edges: any[];
    project_id: string;
  };
  message?: string;
}

// Singleton instances
let configManager: ConfigManager | null = null;
let backendClient: BackendClient | null = null;

/**
 * Initialize flow dependencies
 */
async function getFlowDependencies() {
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

/**
 * Execute HTTP request (reused from testing.ts)
 */
async function executeHttpRequest(
  method: string,
  url: string,
  headers: Record<string, string>,
  body: any,
  timeout: number = 30000
): Promise<any> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const startTime = Date.now();

    const requestHeaders: Record<string, string> = {
      'User-Agent': 'GASSAPI-MCP-Client/2.0',
      ...headers
    };

    const fetchOptions: RequestInit = {
      method,
      headers: requestHeaders,
      signal: controller.signal
    };

    if (body && ['POST', 'PUT', 'PATCH'].includes(method)) {
      if (typeof body === 'object') {
        fetchOptions.body = JSON.stringify(body);
        requestHeaders['Content-Type'] = 'application/json';
      } else {
        fetchOptions.body = body;
      }
    }

    const response = await fetch(url, fetchOptions);
    const responseTime = Date.now() - startTime;
    clearTimeout(timeoutId);

    const responseHeaders: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      responseHeaders[key] = value;
    });

    let responseBody: any = null;
    const contentType = response.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      try {
        responseBody = await response.json();
      } catch (e) {
        responseBody = await response.text();
      }
    } else {
      responseBody = await response.text();
    }

    return {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
      body: responseBody,
      responseTime,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return {
          status: 0,
          statusText: 'Request Timeout',
          headers: {},
          body: null,
          responseTime: timeout,
          timestamp: new Date().toISOString(),
          error: `Request timeout after ${timeout}ms`
        };
      }

      return {
        status: 0,
        statusText: 'Network Error',
        headers: {},
        body: null,
        responseTime: 0,
        timestamp: new Date().toISOString(),
        error: error.message
      };
    }

    return {
      status: 0,
      statusText: 'Unknown Error',
      headers: {},
      body: null,
      responseTime: 0,
      timestamp: new Date().toISOString(),
      error: 'Unknown error occurred'
    };
  }
}

/**
 * Parse headers string to object
 */
function parseHeaders(headersStr?: string): Record<string, string> {
  if (!headersStr || headersStr === '{}') {
    return {};
  }
  try {
    const parsed = JSON.parse(headersStr);
    return typeof parsed === 'object' ? parsed : {};
  } catch (e) {
    return {};
  }
}

/**
 * Parse body value
 */
function parseBody(bodyStr?: string): any {
  if (!bodyStr || bodyStr === 'null') {
    return null;
  }
  if (bodyStr === '{}') {
    return {};
  }
  try {
    return JSON.parse(bodyStr);
  } catch (e) {
    return bodyStr;
  }
}

/**
 * Variable interpolation
 */
function interpolateVariables(text: string, variables: Record<string, string>): string {
  if (!text || !variables || Object.keys(variables).length === 0) {
    return text;
  }

  return text.replace(/\{\{(\w+)\}\}/g, (match, varName) => {
    return variables[varName] !== undefined ? variables[varName] : match;
  });
}

/**
 * Format status with emoji
 */
function formatStatus(status: number): string {
  if (status >= 200 && status < 300) {
    return `🟢 ${status} (Success)`;
  } else if (status >= 300 && status < 400) {
    return `🟡 ${status} (Redirect)`;
  } else if (status >= 400 && status < 500) {
    return `🟠 ${status} (Client Error)`;
  } else if (status >= 500) {
    return `🔴 ${status} (Server Error)`;
  }
  return `❓ ${status} (Unknown)`;
}

/**
 * Format time duration
 */
function formatDuration(ms: number): string {
  if (ms < 1000) {
    return `${ms}ms`;
  } else {
    return `${(ms / 1000).toFixed(2)}s`;
  }
}

// Flow Management Interfaces
interface FlowCreateData {
  name: string;
  description?: string;
  collection_id?: string;
  flow_data: {
    nodes: Array<{
      id: string;
      type: 'http_request' | 'delay' | 'condition' | 'variable_set';
      data: any;
      position: { x: number; y: number };
    }>;
    edges: Array<{
      id: string;
      source: string;
      target: string;
      type: 'success' | 'error' | 'true' | 'false' | 'always';
      label?: string;
    }>;
  };
  is_active?: boolean;
}

interface FlowUpdateData {
  name?: string;
  description?: string;
  collection_id?: string;
  flow_data?: any;
  is_active?: boolean;
}

// Tool: create_flow
export const createFlowTool: McpTool = {
  name: 'create_flow',
  description: 'Create a new flow in the project',
  inputSchema: {
    type: 'object',
    properties: {
      project_id: {
        type: 'string',
        description: 'Project ID where the flow will be created (required)'
      },
      name: {
        type: 'string',
        description: 'Flow name (required)'
      },
      description: {
        type: 'string',
        description: 'Flow description (optional)'
      },
      collection_id: {
        type: 'string',
        description: 'Collection ID to associate with this flow (optional)'
      },
      flow_data: {
        type: 'object',
        description: 'Flow configuration with nodes and edges',
        properties: {
          nodes: {
            type: 'array',
            description: 'Array of flow nodes',
            items: {
              type: 'object',
              description: 'Flow node configuration',
              properties: {
                id: { type: 'string', description: 'Unique node identifier' },
                type: { type: 'string', enum: ['http_request', 'delay', 'condition', 'variable_set'], description: 'Node type' },
                data: { type: 'object', description: 'Node-specific configuration' },
                position: {
                  type: 'object',
                  description: 'Node position in canvas',
                  properties: {
                    x: { type: 'number', description: 'X coordinate' },
                    y: { type: 'number', description: 'Y coordinate' }
                  }
                }
              },
              required: ['id', 'type', 'data', 'position']
            }
          },
          edges: {
            type: 'array',
            description: 'Array of flow edges/connections',
            items: {
              type: 'object',
              description: 'Flow edge configuration',
              properties: {
                id: { type: 'string', description: 'Unique edge identifier' },
                source: { type: 'string', description: 'Source node ID' },
                target: { type: 'string', description: 'Target node ID' },
                type: { type: 'string', enum: ['success', 'error', 'true', 'false', 'always'], description: 'Connection type' },
                label: { type: 'string', description: 'Edge label (optional)' }
              },
              required: ['id', 'source', 'target', 'type']
            }
          }
        },
        required: ['nodes', 'edges']
      },
      is_active: {
        type: 'boolean',
        description: 'Set flow as active (default: true)',
        default: true
      }
    },
    required: ['project_id', 'name']
  }
};

// Tool: list_flows
export const listFlowsTool: McpTool = {
  name: 'list_flows',
  description: 'List all flows in a project with filtering options',
  inputSchema: {
    type: 'object',
    properties: {
      project_id: {
        type: 'string',
        description: 'Project ID to list flows from (required)'
      },
      active_only: {
        type: 'boolean',
        description: 'List only active flows (default: false)',
        default: false
      },
      include_inactive: {
        type: 'boolean',
        description: 'Include inactive flows in results (default: true)',
        default: true
      },
      collection_id: {
        type: 'string',
        description: 'Filter flows by collection ID (optional)'
      }
    },
    required: ['project_id']
  }
};

// Tool: get_flow_detail
export const getFlowDetailTool: McpTool = {
  name: 'get_flow_detail',
  description: 'Get detailed information about a specific flow',
  inputSchema: {
    type: 'object',
    properties: {
      flow_id: {
        type: 'string',
        description: 'Flow ID to get details for (required)'
      }
    },
    required: ['flow_id']
  }
};

// Tool: update_flow
export const updateFlowTool: McpTool = {
  name: 'update_flow',
  description: 'Update an existing flow configuration',
  inputSchema: {
    type: 'object',
    properties: {
      flow_id: {
        type: 'string',
        description: 'Flow ID to update (required)'
      },
      name: {
        type: 'string',
        description: 'Updated flow name (optional)'
      },
      description: {
        type: 'string',
        description: 'Updated flow description (optional)'
      },
      collection_id: {
        type: 'string',
        description: 'Updated collection ID (optional)'
      },
      flow_data: {
        type: 'object',
        description: 'Updated flow configuration (optional)',
        properties: {
          nodes: { type: 'array', description: 'Array of flow nodes' },
          edges: { type: 'array', description: 'Array of flow edges' }
        }
      },
      is_active: {
        type: 'boolean',
        description: 'Update flow active status (optional)'
      }
    },
    required: ['flow_id']
  }
};

// Tool: delete_flow
export const deleteFlowTool: McpTool = {
  name: 'delete_flow',
  description: 'Delete a flow from the project',
  inputSchema: {
    type: 'object',
    properties: {
      flow_id: {
        type: 'string',
        description: 'Flow ID to delete (required)'
      }
    },
    required: ['flow_id']
  }
};

// Tool: execute_flow
export const executeFlowTool: McpTool = {
  name: 'execute_flow',
  description: 'Execute a simple flow with sequential endpoint testing',
  inputSchema: {
    type: 'object',
    properties: {
      flow_id: {
        type: 'string',
        description: 'Flow ID to execute (required)'
      },
      environment_id: {
        type: 'string',
        description: 'Environment ID for variables (required)'
      },
      override_variables: {
        type: 'object',
        description: 'Override environment variables',
        additionalProperties: {
          type: 'string',
          description: 'Variable value'
        }
      },
      max_execution_time: {
        type: 'number',
        description: 'Maximum execution time in milliseconds (default: 300000)',
        default: 300000
      },
      debug_mode: {
        type: 'boolean',
        description: 'Enable debug mode for detailed logging (default: false)',
        default: false
      }
    },
    required: ['flow_id', 'environment_id']
  }
};

/**
 * Flow tool handlers
 */
export function createFlowToolHandlers(): Record<string, (args: any) => Promise<McpToolResponse>> {
  return {
    [createFlowTool.name]: async (args: Record<string, any>) => {
      try {
        const { configManager, backendClient } = await getFlowDependencies();

        const projectId = args.project_id as string;
        const name = args.name as string;
        const description = args.description as string | undefined;
        const collectionId = args.collection_id as string | undefined;
        const flowData = args.flow_data as any;
        const isActive = args.is_active as boolean | undefined;

        if (!projectId || !name) {
          throw new Error('Project ID and name are required');
        }

        console.error(`[FlowTools] Creating flow: ${name} in project: ${projectId}`);

        // Prepare create data
        const createData: any = {
          name,
          description: description || '',
          is_active: isActive !== undefined ? isActive : true
        };

        if (collectionId) {
          createData.collection_id = collectionId;
        }

        if (flowData) {
          createData.flow_data = flowData;
        }

        // Create flow via backend API
        const createUrl = `/gassapi2/backend/?act=flow_create&id=${encodeURIComponent(projectId)}`;
        const createFullUrl = `${backendClient.getBaseUrl()}${createUrl}`;

        const response = await fetch(createFullUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${backendClient.getToken()}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(createData)
        });

        const result = await response.json() as any;

        if (!response.ok || !result.success) {
          throw new Error(`Failed to create flow: ${result.message || 'Unknown error'}`);
        }

        let responseText = `✅ Flow Created Successfully\n\n`;
        responseText += `📝 Name: ${result.data?.name || name}\n`;
        responseText += `🆔 ID: ${result.data?.id || 'Unknown'}\n`;
        responseText += `📁 Project: ${projectId}\n`;
        responseText += `🔗 Collection: ${collectionId || 'None'}\n`;
        responseText += `🟢 Active: ${isActive !== undefined ? isActive : true}\n`;
        responseText += `📅 Created: ${new Date().toISOString()}\n`;

        if (description) {
          responseText += `📄 Description: ${description}\n`;
        }

        if (flowData) {
          const nodeCount = flowData.nodes?.length || 0;
          const edgeCount = flowData.edges?.length || 0;
          responseText += `🔧 Flow Data: ${nodeCount} nodes, ${edgeCount} edges\n`;
        }

        return {
          content: [
            {
              type: 'text',
              text: responseText
            }
          ]
        };

      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `❌ Flow creation error: ${error instanceof Error ? error.message : 'Unknown error'}`
            }
          ],
          isError: true
        };
      }
    },

    [listFlowsTool.name]: async (args: Record<string, any>) => {
      try {
        const { configManager, backendClient } = await getFlowDependencies();

        const projectId = args.project_id as string;
        const activeOnly = args.active_only as boolean | undefined;
        const includeInactive = args.include_inactive as boolean | undefined;
        const collectionId = args.collection_id as string | undefined;

        if (!projectId) {
          throw new Error('Project ID is required');
        }

        console.error(`[FlowTools] Listing flows for project: ${projectId}`);

        // Build URL with parameters
        let listUrl = `/gassapi2/backend/?act=flows&id=${encodeURIComponent(projectId)}`;

        if (activeOnly) {
          listUrl = `/gassapi2/backend/?act=flows_active&id=${encodeURIComponent(projectId)}`;
        }

        if (collectionId) {
          listUrl += `&collection_id=${encodeURIComponent(collectionId)}`;
        }

        const listFullUrl = `${backendClient.getBaseUrl()}${listUrl}`;

        const response = await fetch(listFullUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${backendClient.getToken()}`,
            'Content-Type': 'application/json'
          }
        });

        const result = await response.json() as any;

        if (!response.ok || !result.success) {
          throw new Error(`Failed to list flows: ${result.message || 'Unknown error'}`);
        }

        const flows = result.data?.flows || [];

        let responseText = `📋 Flow List\n\n`;
        responseText += `📁 Project: ${projectId}\n`;
        responseText += `📊 Total flows: ${flows.length}\n`;

        if (collectionId) {
          responseText += `🔗 Collection: ${collectionId}\n`;
        }

        if (activeOnly) {
          responseText += `🟢 Filter: Active flows only\n`;
        }

        responseText += `🕐 Retrieved: ${new Date().toISOString()}\n\n`;

        if (flows.length === 0) {
          responseText += `No flows found matching the criteria.`;
        } else {
          responseText += `📝 Flow Details:\n`;
          flows.forEach((flow: any, index: number) => {
            const statusIcon = flow.is_active ? '🟢' : '🔴';
            responseText += `${index + 1}. ${statusIcon} ${flow.name}\n`;
            responseText += `   🆔 ID: ${flow.id}\n`;
            responseText += `   📄 Description: ${flow.description || 'No description'}\n`;
            responseText += `   🔗 Collection: ${flow.collection_id || 'None'}\n`;
            responseText += `   📅 Created: ${flow.created_at || 'Unknown'}\n`;
            responseText += `   ✏️ Updated: ${flow.updated_at || 'Unknown'}\n\n`;
          });
        }

        return {
          content: [
            {
              type: 'text',
              text: responseText
            }
          ]
        };

      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `❌ Flow listing error: ${error instanceof Error ? error.message : 'Unknown error'}`
            }
          ],
          isError: true
        };
      }
    },

    [getFlowDetailTool.name]: async (args: Record<string, any>) => {
      try {
        const { configManager, backendClient } = await getFlowDependencies();

        const flowId = args.flow_id as string;

        if (!flowId) {
          throw new Error('Flow ID is required');
        }

        console.error(`[FlowTools] Getting flow details: ${flowId}`);

        const detailUrl = `/gassapi2/backend/?act=flow&id=${encodeURIComponent(flowId)}`;
        const detailFullUrl = `${backendClient.getBaseUrl()}${detailUrl}`;

        const response = await fetch(detailFullUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${backendClient.getToken()}`,
            'Content-Type': 'application/json'
          }
        });

        const result = await response.json() as any;

        if (!response.ok || !result.success) {
          throw new Error(`Failed to get flow details: ${result.message || 'Unknown error'}`);
        }

        const flow = result.data;

        let responseText = `📄 Flow Details\n\n`;
        responseText += `📝 Name: ${flow.name}\n`;
        responseText += `🆔 ID: ${flow.id}\n`;
        responseText += `📄 Description: ${flow.description || 'No description'}\n`;
        responseText += `📁 Project: ${flow.project_id}\n`;
        responseText += `🔗 Collection: ${flow.collection_id || 'None'}\n`;
        responseText += `🟢 Active: ${flow.is_active ? 'Yes' : 'No'}\n`;
        responseText += `📅 Created: ${flow.created_at || 'Unknown'}\n`;
        responseText += `✏️ Updated: ${flow.updated_at || 'Unknown'}\n\n`;

        // Flow structure details
        if (flow.flow_data) {
          const nodeCount = flow.flow_data.nodes?.length || 0;
          const edgeCount = flow.flow_data.edges?.length || 0;

          responseText += `🔧 Flow Structure:\n`;
          responseText += `   • Nodes: ${nodeCount}\n`;
          responseText += `   • Edges: ${edgeCount}\n\n`;

          // Node summary
          if (flow.flow_data.nodes && flow.flow_data.nodes.length > 0) {
            responseText += `📦 Node Summary:\n`;
            flow.flow_data.nodes.forEach((node: any, index: number) => {
              responseText += `${index + 1}. ${node.type} - ${node.id}\n`;
              if (node.data?.url) {
                responseText += `   📍 URL: ${node.data.url}\n`;
              }
              if (node.data?.method) {
                responseText += `   🔧 Method: ${node.data.method}\n`;
              }
            });
            responseText += '\n';
          }

          // Edge summary
          if (flow.flow_data.edges && flow.flow_data.edges.length > 0) {
            responseText += `🔗 Connections:\n`;
            flow.flow_data.edges.forEach((edge: any, index: number) => {
              responseText += `${index + 1}. ${edge.source} → ${edge.target} (${edge.type})\n`;
            });
          }
        }

        return {
          content: [
            {
              type: 'text',
              text: responseText
            }
          ]
        };

      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `❌ Flow detail error: ${error instanceof Error ? error.message : 'Unknown error'}`
            }
          ],
          isError: true
        };
      }
    },

    [updateFlowTool.name]: async (args: Record<string, any>) => {
      try {
        const { configManager, backendClient } = await getFlowDependencies();

        const flowId = args.flow_id as string;
        const updateData: FlowUpdateData = {};

        // Collect optional fields
        if (args.name !== undefined) updateData.name = args.name as string;
        if (args.description !== undefined) updateData.description = args.description as string;
        if (args.collection_id !== undefined) updateData.collection_id = args.collection_id as string;
        if (args.flow_data !== undefined) updateData.flow_data = args.flow_data;
        if (args.is_active !== undefined) updateData.is_active = args.is_active as boolean;

        if (!flowId) {
          throw new Error('Flow ID is required');
        }

        if (Object.keys(updateData).length === 0) {
          throw new Error('At least one field must be provided for update');
        }

        console.error(`[FlowTools] Updating flow: ${flowId}`);

        const updateUrl = `/gassapi2/backend/?act=flow_update&id=${encodeURIComponent(flowId)}`;
        const updateFullUrl = `${backendClient.getBaseUrl()}${updateUrl}`;

        const response = await fetch(updateFullUrl, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${backendClient.getToken()}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(updateData)
        });

        const result = await response.json() as any;

        if (!response.ok || !result.success) {
          throw new Error(`Failed to update flow: ${result.message || 'Unknown error'}`);
        }

        let responseText = `✅ Flow Updated Successfully\n\n`;
        responseText += `🆔 Flow ID: ${flowId}\n`;
        responseText += `🕐 Updated: ${new Date().toISOString()}\n\n`;

        responseText += `📝 Updated Fields:\n`;
        Object.entries(updateData).forEach(([key, value]) => {
          if (key === 'flow_data' && value) {
            const nodeCount = value.nodes?.length || 0;
            const edgeCount = value.edges?.length || 0;
            responseText += `   • ${key}: ${nodeCount} nodes, ${edgeCount} edges\n`;
          } else {
            const displayValue = typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value);
            responseText += `   • ${key}: ${displayValue}\n`;
          }
        });

        return {
          content: [
            {
              type: 'text',
              text: responseText
            }
          ]
        };

      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `❌ Flow update error: ${error instanceof Error ? error.message : 'Unknown error'}`
            }
          ],
          isError: true
        };
      }
    },

    [deleteFlowTool.name]: async (args: Record<string, any>) => {
      try {
        const { configManager, backendClient } = await getFlowDependencies();

        const flowId = args.flow_id as string;

        if (!flowId) {
          throw new Error('Flow ID is required');
        }

        console.error(`[FlowTools] Deleting flow: ${flowId}`);

        const deleteUrl = `/gassapi2/backend/?act=flow_delete&id=${encodeURIComponent(flowId)}`;
        const deleteFullUrl = `${backendClient.getBaseUrl()}${deleteUrl}`;

        const response = await fetch(deleteFullUrl, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${backendClient.getToken()}`,
            'Content-Type': 'application/json'
          }
        });

        const result = await response.json() as any;

        if (!response.ok || !result.success) {
          throw new Error(`Failed to delete flow: ${result.message || 'Unknown error'}`);
        }

        let responseText = `✅ Flow Deleted Successfully\n\n`;
        responseText += `🆔 Flow ID: ${flowId}\n`;
        responseText += `🕐 Deleted: ${new Date().toISOString()}\n`;
        responseText += `⚠️ Note: This action cannot be undone`;

        return {
          content: [
            {
              type: 'text',
              text: responseText
            }
          ]
        };

      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `❌ Flow deletion error: ${error instanceof Error ? error.message : 'Unknown error'}`
            }
          ],
          isError: true
        };
      }
    },

    [executeFlowTool.name]: async (args: Record<string, any>) => {
      try {
        const { configManager, backendClient } = await getFlowDependencies();

        const flowId = args.flow_id as string;
        const environmentId = args.environment_id as string;
        const overrideVariables = args.override_variables as Record<string, string> | undefined;
        const maxExecutionTime = args.max_execution_time as number | undefined;
        const debugMode = args.debug_mode as boolean | undefined;

        if (!flowId) {
          throw new Error('Flow ID is required');
        }
        if (!environmentId) {
          throw new Error('Environment ID is required');
        }

        console.error(`[FlowTools] Starting flow execution: ${flowId} with environment: ${environmentId}`);

        const startTime = Date.now();

        // Step 1: Get flow configuration
        const flowUrl = `/gassapi2/backend/?act=flow&id=${encodeURIComponent(flowId)}`;
        const flowFullUrl = `${backendClient.getBaseUrl()}${flowUrl}`;

        console.error(`[FlowTools] Fetching flow config from: ${flowFullUrl}`);

        const flowResult = await fetch(flowFullUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${backendClient.getToken()}`,
            'Content-Type': 'application/json'
          }
        });

        if (!flowResult.ok) {
          throw new Error(`Failed to get flow configuration: HTTP ${flowResult.status}`);
        }

        const flowData = await flowResult.json() as FlowDetailsResponse;

        if (!flowData.success || !flowData.data) {
          throw new Error('Flow not found or invalid response');
        }

        const flow = flowData.data;

        // Step 2: Get environment variables
        const envVarsUrl = `/gassapi2/backend/?act=environment_variables&id=${encodeURIComponent(environmentId)}`;
        const envVarsFullUrl = `${backendClient.getBaseUrl()}${envVarsUrl}`;

        console.error(`[FlowTools] Fetching environment variables from: ${envVarsFullUrl}`);

        const envVarsResult = await fetch(envVarsFullUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${backendClient.getToken()}`,
            'Content-Type': 'application/json'
          }
        });

        let environmentVariables: Record<string, string> = {};
        if (envVarsResult.ok) {
          try {
            const envData = await envVarsResult.json() as any;
            if (envData.success && envData.data) {
              environmentVariables = envData.data.variables || {};
            }
          } catch (e) {
            console.error('[FlowTools] Failed to parse environment variables JSON:', e);
          }
        }

        // Step 3: Merge override variables
        const finalVariables = { ...environmentVariables, ...overrideVariables };

        // Step 4: Execute flow (simplified - just process HTTP request nodes sequentially)
        const nodeResults: any[] = [];
        const errors: string[] = [];

        if (flow.nodes && flow.nodes.length > 0) {
          // Sort nodes by basic order (simplified approach)
          const sortedNodes = flow.nodes.sort((a, b) => {
            const aOrder = a.position?.y || 0;
            const bOrder = b.position?.y || 0;
            return aOrder - bOrder;
          });

          for (const node of sortedNodes) {
            if (node.type === 'http_request') {
              try {
                const nodeStartTime = Date.now();

                // Check execution timeout
                if (Date.now() - startTime > (maxExecutionTime || 300000)) {
                  errors.push(`Flow execution timeout at node: ${node.id}`);
                  break;
                }

                // Prepare HTTP request
                const parsedHeaders = parseHeaders(node.data?.headers);
                const parsedBody = parseBody(node.data?.body);

                const interpolatedUrl = interpolateVariables(node.data?.url || '', finalVariables);
                const interpolatedHeaders: Record<string, string> = {};
                const interpolatedBody = parsedBody ? interpolateVariables(
                  typeof parsedBody === 'string' ? parsedBody : JSON.stringify(parsedBody),
                  finalVariables
                ) : undefined;

                Object.entries(parsedHeaders).forEach(([key, value]) => {
                  interpolatedHeaders[key] = interpolateVariables(value, finalVariables);
                });

                console.error(`[FlowTools] Executing node ${node.id}: ${node.data?.method} ${interpolatedUrl}`);

                // Execute HTTP request
                const httpResult = await executeHttpRequest(
                  node.data?.method || 'GET',
                  interpolatedUrl,
                  interpolatedHeaders,
                  interpolatedBody,
                  node.data?.timeout || 30000
                );

                const nodeExecutionTime = Date.now() - nodeStartTime;

                // Save response to variable if specified
                if (node.data?.saveResponse && node.data?.responseVariable) {
                  finalVariables[node.data.responseVariable] = JSON.stringify(httpResult.body);
                }

                nodeResults.push({
                  nodeId: node.id,
                  status: httpResult.status >= 200 && httpResult.status < 300 ? 'success' : 'error',
                  response: httpResult,
                  executionTime: nodeExecutionTime,
                  timestamp: new Date().toISOString()
                });

                if (debugMode) {
                  console.error(`[FlowTools] Node ${node.id} completed: ${formatStatus(httpResult.status)} in ${formatDuration(nodeExecutionTime)}`);
                }

              } catch (nodeError) {
                const errorMsg = `Node ${node.id} failed: ${nodeError instanceof Error ? nodeError.message : 'Unknown error'}`;
                console.error(`[FlowTools] ${errorMsg}`);
                errors.push(errorMsg);

                nodeResults.push({
                  nodeId: node.id,
                  status: 'error',
                  error: errorMsg,
                  executionTime: 0,
                  timestamp: new Date().toISOString()
                });
              }
            } else {
              // Skip non-HTTP request nodes for now
              nodeResults.push({
                nodeId: node.id,
                status: 'skipped',
                error: `Node type ${node.type} not supported in simplified flow execution`,
                executionTime: 0,
                timestamp: new Date().toISOString()
              });
            }
          }
        } else {
          errors.push('No nodes found in flow configuration');
        }

        const totalExecutionTime = Date.now() - startTime;
        const successCount = nodeResults.filter(r => r.status === 'success').length;
        const errorCount = nodeResults.filter(r => r.status === 'error').length;
        const skippedCount = nodeResults.filter(r => r.status === 'skipped').length;

        // Step 5: Format response
        let resultText = `🔄 Flow Execution Result\n\n`;
        resultText += `📊 Flow: ${flow.name} (${flow.id})\n`;
        resultText += `${errors.length > 0 ? '🟡' : '🟢'} Status: ${errors.length > 0 ? 'completed_with_errors' : 'completed'}\n`;
        resultText += `⏱️  Execution Time: ${formatDuration(totalExecutionTime)}\n`;
        resultText += `📊 Nodes: ${nodeResults.length} total (${successCount} ✅, ${errorCount} ❌, ${skippedCount} ⏭️)\n`;
        resultText += `🕐 Timestamp: ${new Date().toISOString()}\n\n`;

        if (Object.keys(finalVariables).length > 0) {
          resultText += `🔧 Final Variables:\n`;
          Object.entries(finalVariables).slice(0, 10).forEach(([key, value]) => {
            const displayValue = typeof value === 'string' && value.length > 50
              ? value.substring(0, 50) + '...'
              : String(value);
            resultText += `   • ${key}: ${displayValue}\n`;
          });
          if (Object.keys(finalVariables).length > 10) {
            resultText += `   ... and ${Object.keys(finalVariables).length - 10} more variables\n`;
          }
          resultText += '\n';
        }

        resultText += `📋 Node Results:\n`;
        nodeResults.forEach((nodeResult, index) => {
          const statusIcon = nodeResult.status === 'success' ? '✅' : nodeResult.status === 'error' ? '❌' : '⏭️';
          resultText += `   ${index + 1}. ${nodeResult.nodeId}: ${statusIcon} ${formatDuration(nodeResult.executionTime)}\n`;
          if (debugMode && nodeResult.response) {
            resultText += `      └─ ${formatStatus(nodeResult.response.status)}\n`;
          }
        });

        if (errors.length > 0) {
          resultText += `\n❌ Errors:\n`;
          errors.forEach((error, index) => {
            resultText += `   ${index + 1}. ${error}\n`;
          });
        }

        resultText += `\n✅ Flow execution completed!`;

        return {
          content: [
            {
              type: 'text',
              text: resultText
            }
          ]
        };

      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `❌ Flow execution error: ${error instanceof Error ? error.message : 'Unknown error'}`
            }
          ],
          isError: true
        };
      }
    }
  };
}

// Export for server integration
export const FLOW_TOOLS: McpTool[] = [
  createFlowTool,
  listFlowsTool,
  getFlowDetailTool,
  updateFlowTool,
  deleteFlowTool,
  executeFlowTool
];

// Legacy compatibility
export const TOOLS: McpTool[] = FLOW_TOOLS;
export class ToolHandlers {
  static async handleExecuteFlow(args: {
    flow_id: string;
    environment_id: string;
    override_variables?: Record<string, string>;
    max_execution_time?: number;
    debug_mode?: boolean;
  }): Promise<McpToolResponse> {
    const handlers = createFlowToolHandlers();
    return handlers.execute_flow(args);
  }
}

export function createToolHandlers(config: any): Record<string, (args: any) => Promise<McpToolResponse>> {
  return createFlowToolHandlers();
}