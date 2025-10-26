/**
 * Flow Execute Handler
 * Handles flow execution requests
 */

import { McpToolResponse } from '../../../types.js';
import { ConfigManager } from '../../../config.js';
import { BackendClient } from '../../../client/BackendClient.js';
import { StatefulInterpolator } from '../../../utils/StatefulInterpolator.js';
import { FlowExecutor } from '../services/FlowExecutor.js';
import { FlowStateManager } from '../services/FlowStateManager.js';
import { FlowExecutionOptions, FlowExecutionResult } from '../types.js';
import { container, getService, HttpClient } from '../../../shared/index.js';

// Initialize services
let configManager: ConfigManager | null = null;
let backendClient: BackendClient | null = null;
let statefulInterpolator: StatefulInterpolator | null = null;

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
  if (!statefulInterpolator) {
    statefulInterpolator = new StatefulInterpolator();
  }
  return { configManager, backendClient, statefulInterpolator };
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
 * Execute flow tool handler
 */
export async function handleExecuteFlow(args: any): Promise<McpToolResponse> {
  try {
    const { flowId, variables, mode, timeout, stopOnError, maxConcurrency, dryRun } = args;

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
    const flowDetails = await instances.backendClient.getFlowDetails(flowId);

    if (!flowDetails.success || !flowDetails.data) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: false,
              error: flowDetails.message || 'Failed to get flow details'
            }, null, 2)
          }
        ]
      };
    }

    const flowData = flowDetails.data;
    if (!flowData.flow_data || !flowData.flow_data.steps) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: false,
              error: 'Flow has no steps to execute'
            }, null, 2)
          }
        ]
      };
    }

    // Skip endpoints resolution for direct execution (steps have complete URLs)
    const endpoints: any[] = [];

    // Build flow steps
    const steps = flowData.flow_data.steps.map((step: any) => {
      if (step.endpointId) {
        const endpoint = endpoints.find((ep: any) => ep.id === step.endpointId);
        if (endpoint) {
          return {
            id: step.id,
            name: step.name || endpoint.name,
            method: endpoint.method,
            url: endpoint.url,
            headers: parseHeaders(endpoint.headers),
            body: parseBody(endpoint.body),
            timeout: step.timeout || flowData.flow_data.config?.timeout,
            expectedStatus: step.expectedStatus,
            description: step.description
          };
        }
      }

      return {
        id: step.id,
        name: step.name,
        method: step.method,
        url: step.url,
        headers: parseHeaders(step.headers),
        body: parseBody(step.body),
        timeout: step.timeout || flowData.flow_data.config?.timeout,
        expectedStatus: step.expectedStatus,
        description: step.description
      };
    });

    // Initialize variables
    let flowVariables: Record<string, any> = {};

    // Parse flow inputs if provided
    if (flowData.flow_inputs) {
      try {
        flowVariables = JSON.parse(flowData.flow_inputs);
      } catch (e) {
        // Try parsing as key=value pairs
        const inputVars: Record<string, string> = {};
        flowData.flow_inputs.split(',').forEach((pair: string) => {
          const [key, value] = pair.split('=').map(s => s.trim());
          if (key) {
            inputVars[key] = value || '';
          }
        });
        flowVariables = inputVars;
      }
    }

    // Merge with provided variables
    if (variables) {
      if (typeof variables === 'string') {
        try {
          const parsedVars = JSON.parse(variables);
          flowVariables = { ...flowVariables, ...parsedVars };
        } catch (e) {
          // Try parsing as key=value pairs
          const inputVars: Record<string, string> = {};
          variables.split(',').forEach((pair: string) => {
            const [key, value] = pair.split('=').map(s => s.trim());
            if (key) {
              inputVars[key] = value || '';
            }
          });
          flowVariables = { ...flowVariables, ...inputVars };
        }
      } else {
        flowVariables = { ...flowVariables, ...variables };
      }
    }

    // Apply interpolation to variables
    for (const [key, value] of Object.entries(flowVariables)) {
      if (typeof value === 'string') {
        flowVariables[key] = interpolateVariables(value, flowVariables);
      }
    }

    // Create execution options
    const options: FlowExecutionOptions = {
      mode: mode || (flowData.flow_data.config?.parallel ? 'parallel' : 'sequential'),
      timeout: timeout || flowData.flow_data.config?.timeout,
      stopOnError: stopOnError !== undefined ? stopOnError : flowData.flow_data.config?.stopOnError,
      maxConcurrency: maxConcurrency || flowData.flow_data.config?.maxConcurrency,
      dryRun: dryRun || false
    };

    // Execute flow
    const httpClient = new HttpClient();
    const executor = new FlowExecutor(httpClient);
    const stateManager = new FlowStateManager();

    // Create flow state
    const flowState = stateManager.createFlowState(flowId, steps);
    stateManager.startFlow(flowId);

    if (dryRun) {
      // Return dry run results
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              data: {
                flowId,
                status: 'dry_run',
                executionTime: 0,
                nodeResults: steps.map((step: any) => ({
                  stepId: step.id,
                  stepName: step.name,
                  success: true,
                  executionTime: 0,
                  request: {
                    method: step.method,
                    url: interpolateVariables(step.url || '', flowVariables),
                    headers: step.headers,
                    body: step.body
                  }
                })),
                errors: [],
                timestamp: new Date().toISOString(),
                dryRun: true
              }
            }, null, 2)
          }
        ]
      };
    }

    // Execute actual flow
    const executionResult = await executor.executeFlow(steps, flowVariables, options);

    // Update flow state
    if (executionResult.success) {
      stateManager.completeFlow(flowId, true);
    } else {
      stateManager.completeFlow(flowId, false);
    }

    const result: FlowExecutionResult = {
      success: executionResult.success,
      data: {
        flowId,
        status: executionResult.success ? 'completed' : 'failed',
        executionTime: executionResult.executionTime,
        nodeResults: executionResult.results,
        errors: executionResult.errors,
        timestamp: new Date().toISOString()
      },
      message: executionResult.success ? 'Flow executed successfully' : 'Flow execution failed'
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
            error: error.message || 'Unknown error occurred during flow execution'
          }, null, 2)
        }
      ]
    };
  }
}