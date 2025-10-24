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