/**
 * Testing Tools for GASSAPI MCP v2
 * Migrated from original testing tools with backend adaptation
 */

import { McpTool, McpToolResponse } from '../types.js';
import { ConfigManager } from '../config.js';
import { BackendClient } from '../client/BackendClient.js';
import { getApiEndpoints } from '../lib/api/endpoints.js';

// HTTP Methods type
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';

// API Response Interfaces
interface EndpointDetailsResponse {
  success: boolean;
  data?: {
    id: string;
    collection_id: string;
    name: string;
    method: HttpMethod;
    url: string;
    headers?: string;
    body?: string;
    description?: string;
    collection?: {
      id: string;
      name: string;
    };
  };
  message?: string;
}

interface EnvironmentVariablesResponse {
  success: boolean;
  data?: {
    variables: Record<string, string>;
  };
  message?: string;
}

interface HttpRequestResult {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: any;
  responseTime: number;
  timestamp: string;
  error?: string;
}

// Singleton instances for testing tools
let configManager: ConfigManager | null = null;
let backendClient: BackendClient | null = null;

/**
 * Initialize testing dependencies
 */
async function getTestingDependencies() {
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
    return bodyStr; // Return as-is if not valid JSON
  }
}

/**
 * Simple variable interpolation
 */
function interpolateVariables(text: string, variables: Record<string, string>): string {
  if (!text || !variables || Object.keys(variables).length === 0) {
    return text;
  }

  return text.replace(/\{\{(\w+\.?\w*)\}\}/g, (match, varName) => {
    // Handle {{env.variable}} pattern by removing the "env." prefix
    const cleanVarName = varName.startsWith('env.') ? varName.substring(4) : varName;
    return variables[cleanVarName] !== undefined ? variables[cleanVarName] : match;
  });
}

/**
 * Execute HTTP request with timeout
 */
async function executeHttpRequest(
  method: HttpMethod,
  url: string,
  headers: Record<string, string>,
  body: any,
  timeout: number = 30000
): Promise<HttpRequestResult> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const startTime = Date.now();

    // Prepare fetch options
    const requestHeaders: Record<string, string> = {
      'User-Agent': 'GASSAPI-MCP-Client/2.0',
      ...headers
    };

    const fetchOptions: RequestInit = {
      method,
      headers: requestHeaders,
      signal: controller.signal
    };

    // Add body for methods that support it
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

    // Parse headers
    const responseHeaders: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      responseHeaders[key] = value;
    });

    // Parse body
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
 * Format HTTP status with emoji
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

// Tool: test_endpoint
export const testEndpointTool: McpTool = {
  name: 'test_endpoint',
  description: 'Execute HTTP request to test endpoint with environment variables',
  inputSchema: {
    type: 'object',
    properties: {
      endpoint_id: {
        type: 'string',
        description: 'Endpoint ID to test (required)'
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
      timeout: {
        type: 'number',
        description: 'Request timeout in milliseconds (default: 30000)',
        default: 30000
      }
    },
    required: ['endpoint_id', 'environment_id']
  }
};

/**
 * Testing tool handlers
 */
export function createTestingToolHandlers(): Record<string, (args: any) => Promise<McpToolResponse>> {
  return {
    [testEndpointTool.name]: async (args: Record<string, any>) => {
      try {
        const { configManager, backendClient } = await getTestingDependencies();

        const endpointId = args.endpoint_id as string;
        const environmentId = args.environment_id as string;
        const overrideVariables = args.override_variables as Record<string, string> | undefined;
        const timeout = args.timeout as number | undefined;

        if (!endpointId) {
          throw new Error('Endpoint ID is required');
        }
        if (!environmentId) {
          throw new Error('Environment ID is required');
        }

        console.error(`[TestingTools] Starting endpoint test: ${endpointId} with environment: ${environmentId}`);

        // Step 1: Get endpoint configuration
        const apiEndpoints = getApiEndpoints();
        const endpointUrl = apiEndpoints.getEndpoint('endpointTestDirect', { id: endpointId });
        const endpointFullUrl = `${backendClient.getBaseUrl()}${endpointUrl}`;

        console.error(`[TestingTools] Fetching endpoint config from: ${endpointFullUrl}`);

        const endpointResult = await fetch(endpointFullUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${backendClient.getToken()}`,
            'Content-Type': 'application/json'
          }
        });

        if (!endpointResult.ok) {
          throw new Error(`Failed to get endpoint configuration: HTTP ${endpointResult.status}`);
        }

        const endpointData = await endpointResult.json() as EndpointDetailsResponse;

        if (!endpointData.success || !endpointData.data) {
          throw new Error('Endpoint not found or invalid response');
        }

        const endpoint = endpointData.data;

        // Step 2: Get environment variables
        const envVarsUrl = apiEndpoints.getEndpoint('environmentVariablesDirect', { id: environmentId });
        const envVarsFullUrl = `${backendClient.getBaseUrl()}${envVarsUrl}`;

        console.error(`[TestingTools] Fetching environment variables from: ${envVarsFullUrl}`);

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
            const envData = await envVarsResult.json() as EnvironmentVariablesResponse;
            if (envData.success && envData.data) {
              environmentVariables = envData.data.variables || {};
            }
          } catch (e) {
            console.error('[TestingTools] Failed to parse environment variables JSON:', e);
          }
        }

        // Step 3: Merge override variables
        const finalVariables = { ...environmentVariables, ...overrideVariables };

        // Step 4: Prepare request with variable interpolation
        const parsedHeaders = parseHeaders(endpoint.headers);
        const parsedBody = parseBody(endpoint.body);

        const interpolatedUrl = interpolateVariables(endpoint.url, finalVariables);
        const interpolatedHeaders: Record<string, string> = {};
        const interpolatedBody = parsedBody ? interpolateVariables(
          typeof parsedBody === 'string' ? parsedBody : JSON.stringify(parsedBody),
          finalVariables
        ) : undefined;

        // Interpolate headers
        Object.entries(parsedHeaders).forEach(([key, value]) => {
          interpolatedHeaders[key] = interpolateVariables(value, finalVariables);
        });

        console.error(`[TestingTools] Executing request: ${endpoint.method} ${interpolatedUrl}`);
        console.error(`[TestingTools] Variables used:`, Object.keys(finalVariables));

        // Step 5: Execute HTTP request
        const httpResult = await executeHttpRequest(
          endpoint.method as HttpMethod,
          interpolatedUrl,
          interpolatedHeaders,
          interpolatedBody,
          timeout || 30000
        );

        // Step 6: Format response
        let resultText = `🧪 Direct Endpoint Test Result\n\n`;
        resultText += `${formatStatus(httpResult.status)} ${httpResult.statusText}\n`;
        resultText += `⏱️  Response Time: ${formatDuration(httpResult.responseTime)}\n`;
        resultText += `📊 Timestamp: ${httpResult.timestamp}\n\n`;

        resultText += `📍 Request Details:\n`;
        resultText += `- Method: ${endpoint.method}\n`;
        resultText += `- URL: ${endpoint.url}\n`;
        resultText += `- Interpolated URL: ${interpolatedUrl}\n`;
        resultText += `- Timeout: ${formatDuration(timeout || 30000)}\n\n`;

        if (Object.keys(finalVariables).length > 0) {
          resultText += `🔧 Environment Variables (${Object.keys(finalVariables).length}):\n`;
          Object.entries(finalVariables).forEach(([key, value], index) => {
            resultText += `   ${index + 1}. ${key}: ${value}\n`;
          });
          resultText += '\n';
        }

        if (Object.keys(interpolatedHeaders).length > 0) {
          resultText += `📤 Request Headers (${Object.keys(interpolatedHeaders).length}):\n`;
          Object.entries(interpolatedHeaders).forEach(([key, value], index) => {
            resultText += `   ${index + 1}. ${key}: ${value}\n`;
          });
          resultText += '\n';
        }

        if (interpolatedBody) {
          resultText += `💾 Request Body:\n`;
          if (typeof interpolatedBody === 'string') {
            resultText += `   ${interpolatedBody.substring(0, 500)}${interpolatedBody.length > 500 ? '...' : ''}\n`;
          } else {
            resultText += `   ${JSON.stringify(interpolatedBody, null, 2)}\n`;
          }
          resultText += '\n';
        }

        resultText += `📥 Response Status: ${formatStatus(httpResult.status)}\n`;
        resultText += `⏱️  Response Time: ${formatDuration(httpResult.responseTime)}\n\n`;

        if (Object.keys(httpResult.headers).length > 0) {
          resultText += `📤 Response Headers (${Object.keys(httpResult.headers).length}):\n`;
          Object.entries(httpResult.headers).slice(0, 10).forEach(([key, value], index) => {
            resultText += `   ${index + 1}. ${key}: ${value}\n`;
          });
          if (Object.keys(httpResult.headers).length > 10) {
            resultText += `   ... and ${Object.keys(httpResult.headers).length - 10} more headers\n`;
          }
          resultText += '\n';
        }

        resultText += `📄 Response Body:\n`;
        if (httpResult.body) {
          if (typeof httpResult.body === 'string') {
            resultText += `   ${httpResult.body.substring(0, 1000)}${httpResult.body.length > 1000 ? '...' : ''}\n`;
          } else {
            resultText += `   ${JSON.stringify(httpResult.body, null, 2)}\n`;
          }
        } else {
          resultText += `   (empty response)\n`;
        }

        resultText += `\n✅ Direct test completed!`;

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
              text: `❌ Endpoint test error: ${error instanceof Error ? error.message : 'Unknown error'}`
            }
          ],
          isError: true
        };
      }
    }
  };
}

// Export for server integration
export const TESTING_TOOLS: McpTool[] = [
  testEndpointTool
];

// Legacy compatibility
export const TOOLS: McpTool[] = TESTING_TOOLS;
export class ToolHandlers {
  static async handleTestEndpoint(args: {
    endpoint_id: string;
    environment_id: string;
    override_variables?: Record<string, string>;
    timeout?: number;
  }): Promise<McpToolResponse> {
    const handlers = createTestingToolHandlers();
    return handlers.test_endpoint(args);
  }
}

export function createToolHandlers(config: any): Record<string, (args: any) => Promise<McpToolResponse>> {
  return createTestingToolHandlers();
}