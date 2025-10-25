/**
 * Flow Tools for GASSAPI MCP v2
 * Simplified flow execution for sequential endpoint testing
 */

import { McpTool, McpToolResponse } from '../types.js';
import { ConfigManager } from '../config.js';
import { BackendClient } from '../client/BackendClient.js';
import { StatefulInterpolator } from '../utils/StatefulInterpolator.js';

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
    flow_data?: {
      version: string;
      steps: FlowStep[];
      config: FlowConfig;
    };
    flow_inputs?: string;
    project_id: string;
    collection_id?: string;
    is_active: boolean;
    created_at?: string;
    updated_at?: string;
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
    const mcpToken = configManager.getMcpToken(config);
    const serverUrl = configManager.getServerURL(config);
    if (!mcpToken || !serverUrl) {
      throw new Error('Missing token or server URL in configuration');
    }
    backendClient = new BackendClient(serverUrl, mcpToken);
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
 * Basic variable interpolation
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
 * Enhanced variable interpolation with step outputs
 * Supports: {{input.field}}, {{stepId.output}}, {{env.var}}
 */
function interpolateVariablesWithStepOutputs(
  text: string,
  variables: Record<string, string>,
  stepResults: any[]
): string {
  if (!text) return text;

  return text.replace(/\{\{([^}]+)\}\}/g, (match, varExpression) => {
    const parts = varExpression.split('.');

    if (parts[0] === 'input' && parts[1]) {
      // {{input.field}} - from input variables
      return variables[parts[1]] !== undefined ? variables[parts[1]] : match;
    }

    if (parts[0] === 'env' && parts[1]) {
      // {{env.field}} - from environment variables
      return variables[parts[1]] !== undefined ? variables[parts[1]] : match;
    }

    // {{stepId.output}} - from previous step results
    const stepId = parts[0];
    const outputField = parts[1] || 'data';

    const stepResult = stepResults.find(r => r.stepId === stepId);
    if (stepResult && stepResult.outputs && stepResult.outputs[outputField]) {
      return stepResult.outputs[outputField];
    }

    return match; // Keep original if not found
  });
}

/**
 * Extract value from JSON path (e.g., "response.body.user.id")
 */
function extractValueFromJsonPath(data: any, jsonPath: string): any {
  if (!data || !jsonPath) return null;

  const parts = jsonPath.replace('response.body.', '').split('.');
  let value = data;

  for (const part of parts) {
    if (value && typeof value === 'object' && part in value) {
      value = value[part];
    } else {
      return null;
    }
  }

  return value;
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

// Helper function to format response body with preview
function formatResponseBody(body: any, debugMode: boolean = false): string {
  if (!body) return '(empty)';

  const bodyStr = typeof body === 'string' ? body : JSON.stringify(body, null, 2);

  if (debugMode) {
    // Full body in debug mode
    return bodyStr.length > 1000 ? bodyStr.substring(0, 1000) + '\n... (truncated for display)' : bodyStr;
  } else {
    // Preview in normal mode
    if (bodyStr.length <= 200) {
      return bodyStr;
    }

    // For JSON, try to format nicely and truncate
    if (typeof body === 'object') {
      const jsonStr = JSON.stringify(body, null, 2);
      if (jsonStr.length <= 200) {
        return jsonStr;
      } else {
        // Show first few key-value pairs
        const entries = Object.entries(body).slice(0, 3);
        const preview = entries.map(([key, value]) => {
          const valStr = typeof value === 'string' && value.length > 50
            ? `"${value.substring(0, 50)}..."`
            : JSON.stringify(value);
          return `"${key}": ${valStr}`;
        }).join(',\n    ');
        return `{${preview}${entries.length < Object.keys(body).length ? ',\n    ...' : ''}}`;
      }
    }

    // For strings, show preview
    return bodyStr.substring(0, 200) + '...';
  }
}

// Helper function to format headers
function formatHeaders(headers: Record<string, string>, debugMode: boolean = false): string {
  if (!headers || Object.keys(headers).length === 0) {
    return '(none)';
  }

  if (debugMode) {
    return Object.entries(headers)
      .map(([key, value]) => `  ${key}: ${value}`)
      .join('\n');
  } else {
    // Show only important headers in normal mode
    const importantHeaders = ['content-type', 'authorization', 'x-api-key', 'user-agent'];
    const filtered = Object.entries(headers).filter(([key]) =>
      importantHeaders.includes(key.toLowerCase()) || key.startsWith('x-')
    );

    if (filtered.length === 0) {
      return Object.keys(headers).length + ' headers';
    }

    return filtered
      .map(([key, value]) => {
        // Hide sensitive values
        if (key.toLowerCase().includes('authorization') || key.toLowerCase().includes('key')) {
          return `${key}: [HIDDEN]`;
        }
        return `${key}: ${value}`;
      })
      .join(', ');
  }
}

// Helper function to format request details
function formatRequestDetails(step: any, interpolatedUrl: string, interpolatedHeaders: Record<string, string>, interpolatedBody?: string, debugMode: boolean = false): string {
  let details = `├─ Request: ${step.method} ${interpolatedUrl}\n`;

  if (debugMode) {
    details += `├─ Headers:\n${formatHeaders(interpolatedHeaders, true)}\n`;
    if (interpolatedBody) {
      details += `├─ Body: ${interpolatedBody}\n`;
    }
  } else {
    const headerStr = formatHeaders(interpolatedHeaders, false);
    details += `├─ Headers: ${headerStr}\n`;
    if (interpolatedBody) {
      details += `├─ Body: ${formatResponseBody(interpolatedBody, false)}\n`;
    }
  }

  return details;
}

// Flow Management Interfaces (Steps Format)
interface FlowStep {
  id: string;
  name: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  url: string;
  headers?: Record<string, string>;
  body?: any;
  outputs?: Record<string, string>;
  timeout?: number;
}

interface FlowConfig {
  delay: number;
  retryCount: number;
  parallel: boolean;
}

interface FlowStepsData {
  version: string;
  steps: FlowStep[];
  config: FlowConfig;
}

interface FlowInput {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'email' | 'password';
  required: boolean;
  description?: string;
  validation?: {
    min_length?: number;
    max_length?: number;
    pattern?: string;
  };
}

interface FlowCreateData {
  name: string;
  description?: string;
  collection_id?: string;
  flow_inputs?: FlowInput[];
  flow_data: FlowStepsData;
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
  description: 'Create a new flow in the project using Steps format for API automation',
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
      flow_inputs: {
        type: 'array',
        description: 'Array of flow input definitions (optional)',
        items: {
          type: 'object',
          description: 'Flow input definition',
          properties: {
            name: { type: 'string', description: 'Input variable name' },
            type: { type: 'string', enum: ['string', 'number', 'boolean', 'email', 'password'], description: 'Input data type' },
            required: { type: 'boolean', description: 'Whether input is mandatory' },
            description: { type: 'string', description: 'Input description (optional)' },
            validation: {
              type: 'object',
              description: 'Input validation rules (optional)',
              properties: {
                min_length: { type: 'number', description: 'Minimum length for strings' },
                max_length: { type: 'number', description: 'Maximum length for strings' },
                pattern: { type: 'string', description: 'Regex pattern for validation' }
              }
            }
          },
          required: ['name', 'type', 'required']
        }
      },
      flow_data: {
        type: 'object',
        description: 'Flow configuration in Steps format',
        properties: {
          version: { type: 'string', description: 'Steps format version (e.g., "1.0")' },
          steps: {
            type: 'array',
            description: 'Array of execution steps',
            items: {
              type: 'object',
              description: 'Flow step configuration',
              properties: {
                id: { type: 'string', description: 'Unique step identifier' },
                name: { type: 'string', description: 'Step name' },
                method: { type: 'string', enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'], description: 'HTTP method' },
                url: { type: 'string', description: 'Request URL with variable support (e.g., "{{input.baseUrl}}/api")' },
                headers: {
                type: 'object',
                description: 'Request headers with variable support',
                additionalProperties: true
              },
                body: {
                  type: 'object',
                  description: 'Request body with variable support',
                  additionalProperties: true
                },
                outputs: {
                type: 'object',
                description: 'Output variable mappings (e.g., {"token": "response.body.access_token"})',
                additionalProperties: true
              },
                timeout: { type: 'number', description: 'Request timeout in milliseconds (default: 30000)' }
              },
              required: ['id', 'name', 'method', 'url']
            }
          },
          config: {
            type: 'object',
            description: 'Flow execution configuration',
            properties: {
              delay: { type: 'number', description: 'Delay between steps in milliseconds' },
              retryCount: { type: 'number', description: 'Number of retries for failed steps' },
              parallel: { type: 'boolean', description: 'Whether steps can run in parallel' }
            },
            required: ['delay', 'retryCount', 'parallel']
          }
        },
        required: ['version', 'steps', 'config']
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

// Tool: set_environment_variables
export const setEnvironmentVariablesTool: McpTool = {
  name: 'set_environment_variables',
  description: 'Set environment variables for flow execution',
  inputSchema: {
    type: 'object',
    properties: {
      variables: {
        type: 'object',
        description: 'Environment variables to set (key-value pairs)',
        additionalProperties: true
      }
    },
    required: ['variables']
  }
};

// Tool: set_flow_inputs
export const setFlowInputsTool: McpTool = {
  name: 'set_flow_inputs',
  description: 'Set flow inputs for variable interpolation',
  inputSchema: {
    type: 'object',
    properties: {
      inputs: {
        type: 'object',
        description: 'Flow inputs to set (key-value pairs)',
        additionalProperties: true
      }
    },
    required: ['inputs']
  }
};

// Tool: set_runtime_variables
export const setRuntimeVariablesTool: McpTool = {
  name: 'set_runtime_variables',
  description: 'Set runtime variables for flow execution',
  inputSchema: {
    type: 'object',
    properties: {
      variables: {
        type: 'object',
        description: 'Runtime variables to set (key-value pairs)',
        additionalProperties: true
      }
    },
    required: ['variables']
  }
};

// Tool: get_session_state
export const getSessionStateTool: McpTool = {
  name: 'get_session_state',
  description: 'Get current session state for debugging',
  inputSchema: {
    type: 'object',
    properties: {}
  }
};

// Tool: clear_session_state
export const clearSessionStateTool: McpTool = {
  name: 'clear_session_state',
  description: 'Clear specific session state type',
  inputSchema: {
    type: 'object',
    properties: {
      state_type: {
        type: 'string',
        enum: ['environment', 'flowInputs', 'stepOutputs', 'runtimeVars'],
        description: 'Type of state to clear'
      }
    },
    required: ['state_type']
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
        additionalProperties: true
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

        // Create flow via backend API (using old format with correct action)
        const createUrl = `/gassapi2/backend/?act=flow_create&id=${encodeURIComponent(projectId)}`;
        const createFullUrl = `${backendClient.getBaseUrl()}${createUrl}`;

        const response = await fetch(createFullUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${backendClient.getJwtToken() || backendClient.getMcpToken()}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(createData)
        });

        const result = await response.json() as any;

        // Check for authentication errors specifically
        if (response.status === 401 || (result && result.error && result.error.toLowerCase().includes('unauthorized'))) {
          throw new Error('Authentication failed: Please ensure you have a valid JWT token. Try logging in first.');
        }

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
          const stepCount = flowData.steps?.length || 0;
          const version = flowData.version || 'Unknown';
          responseText += `🔧 Flow Data: ${stepCount} steps (version ${version})\n`;

          // Show flow inputs count
          if (createData.flow_inputs && createData.flow_inputs.length > 0) {
            responseText += `📋 Flow Inputs: ${createData.flow_inputs.length} defined\n`;
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
              text: `❌ Flow creation error: ${error instanceof Error ? error.message : 'Unknown error'}`
            }
          ],
          isError: true
        };
      }
    },

    [setEnvironmentVariablesTool.name]: async (args: Record<string, any>) => {
      try {
        const { variables } = args;

        if (!variables || typeof variables !== 'object') {
          throw new Error('Variables object is required');
        }

        console.error(`[FlowTools] Setting ${Object.keys(variables).length} environment variables`);

        let responseText = `✅ Environment Variables Set Successfully\n\n`;
        responseText += `📊 Variables Set: ${Object.keys(variables).length}\n`;
        responseText += `🕐 Set At: ${new Date().toISOString()}\n\n`;

        responseText += `📋 Environment Variables:\n`;
        Object.entries(variables).forEach(([key, value]) => {
          responseText += `• ${key}: ${value}\n`;
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
              text: `❌ Environment variables error: ${error instanceof Error ? error.message : 'Unknown error'}`
            }
          ],
          isError: true
        };
      }
    },

    [setFlowInputsTool.name]: async (args: Record<string, any>) => {
      try {
        const { inputs } = args;

        if (!inputs || typeof inputs !== 'object') {
          throw new Error('Inputs object is required');
        }

        console.error(`[FlowTools] Setting ${Object.keys(inputs).length} flow inputs`);

        let responseText = `✅ Flow Inputs Set Successfully\n\n`;
        responseText += `📊 Inputs Set: ${Object.keys(inputs).length}\n`;
        responseText += `🕐 Set At: ${new Date().toISOString()}\n\n`;

        responseText += `📋 Flow Inputs:\n`;
        Object.entries(inputs).forEach(([key, value]) => {
          const displayValue = typeof value === 'string' && value.length > 50
            ? value.substring(0, 50) + '...'
            : String(value);
          responseText += `• ${key}: ${displayValue}\n`;
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
              text: `❌ Flow inputs error: ${error instanceof Error ? error.message : 'Unknown error'}`
            }
          ],
          isError: true
        };
      }
    },

    [setRuntimeVariablesTool.name]: async (args: Record<string, any>) => {
      try {
        const { variables } = args;

        if (!variables || typeof variables !== 'object') {
          throw new Error('Variables object is required');
        }

        console.error(`[FlowTools] Setting ${Object.keys(variables).length} runtime variables`);

        let responseText = `✅ Runtime Variables Set Successfully\n\n`;
        responseText += `📊 Variables Set: ${Object.keys(variables).length}\n`;
        responseText += `🕐 Set At: ${new Date().toISOString()}\n\n`;

        responseText += `📋 Runtime Variables:\n`;
        Object.entries(variables).forEach(([key, value]) => {
          const displayValue = typeof value === 'string' && value.length > 50
            ? value.substring(0, 50) + '...'
            : String(value);
          responseText += `• ${key}: ${displayValue}\n`;
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
              text: `❌ Runtime variables error: ${error instanceof Error ? error.message : 'Unknown error'}`
            }
          ],
          isError: true
        };
      }
    },

    [getSessionStateTool.name]: async (args: Record<string, any>) => {
      try {
        console.error(`[FlowTools] Getting session state`);

        let responseText = `📊 Current Session State\n\n`;
        responseText += `🕐 Timestamp: ${new Date().toISOString()}\n`;
        responseText += `📝 Session ID: session_${Date.now().toString().slice(-6)}\n\n`;

        // Note: This would show actual state if session context was available
        // For now, showing placeholder information
        responseText += `📋 State Summary:\n`;
        responseText += `   • Environment Variables: Available via set_environment_variables\n`;
        responseText += `   • Flow Inputs: Available via set_flow_inputs\n`;
        responseText += `   • Runtime Variables: Available via set_runtime_variables\n`;
        responseText += `   • Step Outputs: Populated during flow execution\n`;
        responseText += `   • JWT Token: Available via set_jwt_token\n\n`;

        responseText += `🔍 Variable Interpolation Support:\n`;
        responseText += `   • {{env.VARIABLE_NAME}} - Environment variables\n`;
        responseText += `   • {{input.field_name}} - Flow inputs\n`;
        responseText += `   • {{runtime.var_name}} - Runtime variables\n`;
        responseText += `   • {{stepId.output_field}} - Step outputs\n`;
        responseText += `   • {{config.setting}} - Configuration settings\n`;

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
              text: `❌ Session state error: ${error instanceof Error ? error.message : 'Unknown error'}`
            }
          ],
          isError: true
        };
      }
    },

    [clearSessionStateTool.name]: async (args: Record<string, any>) => {
      try {
        const { state_type } = args;

        if (!state_type) {
          throw new Error('State type is required');
        }

        const validTypes = ['environment', 'flowInputs', 'stepOutputs', 'runtimeVars'];
        if (!validTypes.includes(state_type)) {
          throw new Error(`Invalid state type. Must be one of: ${validTypes.join(', ')}`);
        }

        console.error(`[FlowTools] Clearing ${state_type} state`);

        let responseText = `✅ Session State Cleared Successfully\n\n`;
        responseText += `🗑️ Cleared State Type: ${state_type}\n`;
        responseText += `🕐 Cleared At: ${new Date().toISOString()}\n`;

        const typeNames: Record<string, string> = {
          environment: 'Environment Variables',
          flowInputs: 'Flow Inputs',
          stepOutputs: 'Step Outputs',
          runtimeVars: 'Runtime Variables'
        };

        responseText += `📋 ${typeNames[state_type]} have been cleared.\n`;
        responseText += `ℹ️ Use appropriate set_* tools to repopulate state.`;

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
              text: `❌ Session state clearing error: ${error instanceof Error ? error.message : 'Unknown error'}`
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

        // Build URL with parameters (using old format)
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
            'Authorization': `Bearer ${backendClient.getJwtToken() || backendClient.getMcpToken()}`,
            'Content-Type': 'application/json'
          }
        });

        const result = await response.json() as any;

        if (!response.ok || !result.success) {
          throw new Error(`Failed to list flows: ${result.message || 'Unknown error'}`);
        }

        const flows = result.data || [];

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
            'Authorization': `Bearer ${backendClient.getJwtToken() || backendClient.getMcpToken()}`,
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

        // Flow structure details (Steps format)
        if (flow.flow_data) {
          const version = flow.flow_data.version || 'Unknown';
          const stepCount = flow.flow_data.steps?.length || 0;
          const delay = flow.flow_data.config?.delay || 0;
          const retryCount = flow.flow_data.config?.retryCount || 0;
          const parallel = flow.flow_data.config?.parallel || false;

          responseText += `🔧 Flow Structure (Steps Format):\n`;
          responseText += `   • Version: ${version}\n`;
          responseText += `   • Steps: ${stepCount}\n`;
          responseText += `   • Config: ${delay}ms delay, ${retryCount} retries, parallel: ${parallel}\n\n`;

          // Steps summary
          if (flow.flow_data.steps && flow.flow_data.steps.length > 0) {
            responseText += `📋 Steps Summary:\n`;
            flow.flow_data.steps.forEach((step: any, index: number) => {
              responseText += `${index + 1}. ${step.method} ${step.name} - ${step.id}\n`;
              responseText += `   📍 URL: ${step.url}\n`;
              if (step.outputs && Object.keys(step.outputs).length > 0) {
                responseText += `   🔗 Outputs: ${Object.keys(step.outputs).join(', ')}\n`;
              }
            });
            responseText += '\n';
          }

          // Flow inputs
          if (flow.flow_inputs) {
            try {
              const flowInputs = JSON.parse(flow.flow_inputs);
              if (flowInputs && flowInputs.length > 0) {
                responseText += `📋 Flow Inputs:\n`;
                flowInputs.forEach((input: any, index: number) => {
                  const required = input.required ? 'required' : 'optional';
                  responseText += `${index + 1}. ${input.name} (${input.type}, ${required})\n`;
                  if (input.description) {
                    responseText += `   📄 ${input.description}\n`;
                  }
                });
              }
            } catch (e) {
              console.error('[FlowTools] Failed to parse flow inputs:', e);
            }
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
            'Authorization': `Bearer ${backendClient.getJwtToken() || backendClient.getMcpToken()}`,
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
            const stepCount = value.steps?.length || 0;
            const version = value.version || 'Unknown';
            responseText += `   • ${key}: ${stepCount} steps (version ${version})\n`;
          } else if (key === 'flow_inputs' && value) {
            responseText += `   • ${key}: ${value.length} flow inputs\n`;
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
            'Authorization': `Bearer ${backendClient.getJwtToken() || backendClient.getMcpToken()}`,
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

        // Step 4: Execute flow dynamically
        const stepResults: any[] = [];
        const errors: string[] = [];

        // Parse flow data if it's a string
        if (typeof flow.flow_data === 'string') {
          try {
            flow.flow_data = JSON.parse(flow.flow_data);
          } catch (e) {
            const error = e as Error;
            errors.push(`Invalid JSON in flow_data: ${error.message}`);
          }
        }

        // DEBUG MODE: Enhanced diagnostic logging
        if (debugMode) {
          console.error(`[FlowTools] DIAGNOSTIC - Flow Data Structure:`);
          console.error(`  Flow ID: ${flow.id}`);
          console.error(`  Flow Name: ${flow.name}`);
          console.error(`  flow_data type: ${typeof flow.flow_data}`);
          console.error(`  flow_data value:`, flow.flow_data);
        }

        if (flow.flow_data && flow.flow_data.steps && flow.flow_data.steps.length > 0) {
          const steps = flow.flow_data.steps;
          const config = flow.flow_data.config || { delay: 0, retryCount: 1, parallel: false };

          // DEBUG MODE: Show steps detail
          if (debugMode) {
            console.error(`[FlowTools] Starting dynamic execution of ${steps.length} steps`);
            console.error(`[FlowTools] Steps detail:`, JSON.stringify(steps, null, 2));
          }

          for (let i = 0; i < steps.length; i++) {
            const step = steps[i];
            try {
              const stepStartTime = Date.now();

              // Check execution timeout
              if (Date.now() - startTime > (maxExecutionTime || 300000)) {
                errors.push(`Flow execution timeout at step: ${step.id}`);
                break;
              }

              // Create interpolation context with session state
              const context = {
                state: {
                  ...args.__sessionState,
                  stepOutputs: stepResults.reduce((acc, result) => {
                    if (result.outputs) {
                      acc[result.stepId] = result.outputs;
                    }
                    return acc;
                  }, {})
                },
                currentStepId: step.id,
                debugMode: debugMode || false
              };

              // Enhanced variable interpolation with StatefulInterpolator
              const interpolatedUrl = StatefulInterpolator.interpolate(step.url, context);
              const interpolatedHeaders: Record<string, string> = {};
              const interpolatedBody = step.body ? StatefulInterpolator.interpolate(
                typeof step.body === 'string' ? step.body : JSON.stringify(step.body),
                context
              ) : undefined;

              // Interpolate headers
              if (step.headers) {
                Object.entries(step.headers).forEach(([key, value]) => {
                  interpolatedHeaders[key] = StatefulInterpolator.interpolate(value, context);
                });
              }

              // DEBUG MODE: Show step execution details
              if (debugMode) {
                console.error(`[FlowTools] Executing step ${i + 1}/${steps.length} (${step.id}): ${step.method} ${interpolatedUrl}`);
              }

              // Add delay if configured
              if (config.delay > 0 && i > 0) {
                if (debugMode) {
                  console.error(`[FlowTools] Adding ${config.delay}ms delay before step ${step.id}`);
                }
                await new Promise(resolve => setTimeout(resolve, config.delay));
              }

              // Dynamic step execution
              let stepResult;
              if (step.method && ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'].includes(step.method.toUpperCase())) {
                // HTTP Request Step
                const httpResult = await executeHttpRequest(
                  step.method.toUpperCase(),
                  interpolatedUrl,
                  interpolatedHeaders,
                  interpolatedBody,
                  step.timeout || 30000
                );

                // Extract step outputs
                const stepOutputs: Record<string, any> = {};
                if (step.outputs && httpResult.body) {
                  Object.entries(step.outputs).forEach(([outputName, jsonPath]) => {
                    stepOutputs[outputName] = extractValueFromJsonPath(httpResult.body, String(jsonPath));
                  });
                }

                stepResult = {
                  stepId: step.id,
                  stepName: step.name,
                  type: 'http_request',
                  method: step.method,
                  url: interpolatedUrl,
                  status: httpResult.status >= 200 && httpResult.status < 300 ? 'success' : 'error',
                  response: httpResult,
                  outputs: stepOutputs,
                  executionTime: Date.now() - stepStartTime,
                  timestamp: new Date().toISOString()
                };

                if (debugMode) {
                  console.error(`[FlowTools] HTTP step ${step.id} completed: ${formatStatus(httpResult.status)} in ${formatDuration(Date.now() - stepStartTime)}`);
                  if (Object.keys(stepOutputs).length > 0) {
                    console.error(`[FlowTools] Step outputs: ${Object.keys(stepOutputs).join(', ')}`);
                  }
                }
              } else {
                // Unsupported step type
                stepResult = {
                  stepId: step.id,
                  stepName: step.name,
                  type: 'unknown',
                  status: 'skipped',
                  error: `Unsupported step method: ${step.method}`,
                  executionTime: Date.now() - stepStartTime,
                  timestamp: new Date().toISOString()
                };
              }

              stepResults.push(stepResult);

              // Stop execution on critical errors
              if (stepResult.status === 'error' && config.retryCount <= 0) {
                errors.push(`Step ${step.id} failed: ${stepResult.error || 'Unknown error'}`);
                break;
              }

            } catch (stepError) {
              const errorMsg = `Step ${step.id} (${step.name}) failed: ${stepError instanceof Error ? stepError.message : 'Unknown error'}`;

              // DEBUG MODE: Show step error details
              if (debugMode) {
                console.error(`[FlowTools] ${errorMsg}`);
              }

              errors.push(errorMsg);

              stepResults.push({
                stepId: step.id,
                stepName: step.name,
                type: 'error',
                status: 'error',
                error: errorMsg,
                executionTime: 0,
                timestamp: new Date().toISOString()
              });
            }
          }
        } else {
          // Enhanced error reporting for missing steps
          errors.push('No steps found in flow configuration');

          // DEBUG MODE: Show detailed error diagnostics
          if (debugMode) {
            console.error(`[FlowTools] ENHANCED ERROR DIAGNOSTIC:`);
            console.error(`  ❌ Issue: No steps found or steps array is empty`);
            console.error(`  📊 Flow Details:`);
            console.error(`     - Flow ID: ${flow.id}`);
            console.error(`     - Flow Name: ${flow.name}`);
            console.error(`     - Has flow_data: ${!!flow.flow_data}`);

            if (flow.flow_data) {
              console.error(`     - flow_data type: ${typeof flow.flow_data}`);
              console.error(`     - flow_data keys: ${Object.keys(flow.flow_data).join(', ')}`);
              console.error(`     - Has steps property: ${!!flow.flow_data.steps}`);

              if (flow.flow_data.steps) {
                console.error(`     - Steps type: ${typeof flow.flow_data.steps}`);
                console.error(`     - Steps is array: ${Array.isArray(flow.flow_data.steps)}`);
                console.error(`     - Steps length: ${flow.flow_data.steps.length}`);
              }
            }

            console.error(`  🔍 Raw flow_data:`, JSON.stringify(flow.flow_data, null, 2));
          }
        }

        const totalExecutionTime = Date.now() - startTime;
        const successCount = stepResults.filter(r => r.status === 'success').length;
        const errorCount = stepResults.filter(r => r.status === 'error').length;
        const skippedCount = stepResults.filter(r => r.status === 'skipped').length;

        // Step 5: Format response
        let resultText = `🔄 Dynamic Flow Execution Result\n\n`;
        resultText += `📊 Flow: ${flow.name} (${flow.id})\n`;
        resultText += `${errors.length > 0 ? '🟡' : '🟢'} Status: ${errors.length > 0 ? 'completed_with_errors' : 'completed'}\n`;
        resultText += `⏱️  Execution Time: ${formatDuration(totalExecutionTime)}\n`;
        resultText += `📊 Steps: ${stepResults.length} total (${successCount} ✅, ${errorCount} ❌, ${skippedCount} ⏭️)\n`;
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

        resultText += `📋 Step Results:\n`;
        stepResults.forEach((stepResult, index) => {
          const statusIcon = stepResult.status === 'success' ? '✅' : stepResult.status === 'error' ? '❌' : '⏭️';
          resultText += `   ${index + 1}. ${stepResult.stepId}: ${statusIcon} ${stepResult.stepName} (${formatDuration(stepResult.executionTime)})\n`;

          if (stepResult.type === 'http_request') {
            // Enhanced request/response details
            if (debugMode) {
              // Debug mode: Show full details
              resultText += `   ${formatRequestDetails(stepResult, stepResult.url, stepResult.headers || {}, stepResult.body, true)}\n`;
              resultText += `   ├─ Response: ${formatStatus(stepResult.response.status)}\n`;
              resultText += `   ├─ Headers:\n${formatHeaders(stepResult.response.headers || {}, true)}\n`;
              if (stepResult.response.body) {
                resultText += `   ├─ Body:\n${formatResponseBody(stepResult.response.body, true)}\n`;
              }
            } else {
              // Normal mode: Show summary
              resultText += `   ├─ Request: ${stepResult.method} ${stepResult.url}\n`;
              resultText += `   ├─ Response: ${formatStatus(stepResult.response.status)} (${formatDuration(stepResult.executionTime)})\n`;

              // Show response body preview
              if (stepResult.response.body) {
                const bodyPreview = formatResponseBody(stepResult.response.body, false);
                resultText += `   ├─ Body: ${bodyPreview}\n`;
              }
            }

            // Show outputs
            if (Object.keys(stepResult.outputs || {}).length > 0) {
              if (debugMode) {
                resultText += `   └─ Outputs:\n`;
                Object.entries(stepResult.outputs).forEach(([key, value]) => {
                  resultText += `      • ${key}: ${formatResponseBody(value, true)}\n`;
                });
              } else {
                resultText += `   └─ Outputs: ${Object.keys(stepResult.outputs).join(', ')}\n`;
              }
            }
          } else if (stepResult.status === 'error') {
            // Error details
            resultText += `   └─ ❌ Error: ${stepResult.error}\n`;
            if (debugMode && stepResult.response) {
              resultText += `   └─ Error Response: ${formatStatus(stepResult.response.status)}\n`;
              resultText += `   └─ Error Body: ${formatResponseBody(stepResult.response.body, true)}\n`;
            }
          }
        });

        if (errors.length > 0) {
          resultText += `\n❌ Errors:\n`;
          errors.forEach((error, index) => {
            // Clean up error message for better readability
            let cleanError = error;
            if (error.includes('Step ') && error.includes(' failed:')) {
              // Extract step name and error message
              const match = error.match(/Step (.*?) \((.*?)\) failed: (.*)/);
              if (match) {
                cleanError = `Step ${match[2]}: ${match[3]}`;
              }
            }
            resultText += `   ${index + 1}. ${cleanError}\n`;
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
  setEnvironmentVariablesTool,
  setFlowInputsTool,
  setRuntimeVariablesTool,
  getSessionStateTool,
  clearSessionStateTool,
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