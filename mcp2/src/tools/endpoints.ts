/**
 * Endpoint Management Tools for GASSAPI MCP v2
 * Migrated from original endpoint tools with backend adaptation
 */

import { McpTool, McpToolResponse } from '../types.js';
import { ConfigManager } from '../config.js';
import { BackendClient } from '../client/BackendClient.js';
import { getApiEndpoints } from '../lib/api/endpoints.js';

// HTTP Methods type
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';

// API Response Interfaces
interface EndpointListResponse {
  success: boolean;
  data?: Array<{
    id: string;
    collection_id: string;
    name: string;
    method: HttpMethod;
    url: string;
    description?: string;
    headers?: string;
    body?: string;
    created_at: string;
    updated_at: string;
  }>;
  message?: string;
}

interface EndpointDetailsResponse {
  success: boolean;
  data?: {
    id: string;
    collection_id: string;
    name: string;
    method: HttpMethod;
    url: string;
    description?: string;
    headers?: string;
    body?: string;
    created_at: string;
    updated_at: string;
    collection?: {
      id: string;
      name: string;
      description?: string;
    };
  };
  message?: string;
}

interface EndpointCreateResponse {
  success: boolean;
  data?: {
    id: string;
    name: string;
    method: HttpMethod;
    url: string;
    description?: string;
    headers?: string;
    body?: string;
    collection_id: string;
    created_at: string;
    updated_at: string;
  };
  message?: string;
}

interface EndpointUpdateResponse {
  success: boolean;
  data?: {
    id: string;
    name: string;
    method: HttpMethod;
    url: string;
    description?: string;
    headers?: string;
    body?: string;
    collection_id: string;
    created_at: string;
    updated_at: string;
  };
  message?: string;
}

interface EndpointMoveResponse {
  success: boolean;
  message?: string;
}

// Singleton instances for endpoint tools
let configManager: ConfigManager | null = null;
let backendClient: BackendClient | null = null;

/**
 * Initialize endpoint dependencies
 */
async function getEndpointDependencies() {
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
 * Format headers object to string
 */
function formatHeaders(headers: Record<string, string>): string {
  if (!headers || Object.keys(headers).length === 0) {
    return '{}';
  }
  return JSON.stringify(headers, null, 2);
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
 * Format body value
 */
function formatBody(body?: any): string {
  if (!body) {
    return '{}';
  }
  if (typeof body === 'string') {
    return body;
  }
  return JSON.stringify(body, null, 2);
}

// Tool: list_endpoints
export const listEndpointsTool: McpTool = {
  name: 'list_endpoints',
  description: 'List all endpoints with optional filtering by project or collection',
  inputSchema: {
    type: 'object',
    properties: {
      project_id: {
        type: 'string',
        description: 'Optional project ID (uses project from config if not provided)'
      },
      collection_id: {
        type: 'string',
        description: 'Optional collection ID to filter endpoints'
      },
      method: {
        type: 'string',
        description: 'Optional HTTP method filter',
        enum: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS']
      }
    }
  }
};

// Tool: get_endpoint_details
export const getEndpointDetailsTool: McpTool = {
  name: 'get_endpoint_details',
  description: 'Get detailed endpoint configuration with collection information',
  inputSchema: {
    type: 'object',
    properties: {
      endpoint_id: {
        type: 'string',
        description: 'Endpoint ID to get details for (required)'
      }
    },
    required: ['endpoint_id']
  }
};

// Tool: create_endpoint
export const createEndpointTool: McpTool = {
  name: 'create_endpoint',
  description: 'Create a new endpoint in a collection',
  inputSchema: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        description: 'Endpoint name (required)'
      },
      method: {
        type: 'string',
        description: 'HTTP method (required)',
        enum: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS']
      },
      url: {
        type: 'string',
        description: 'Endpoint URL (required)'
      },
      collection_id: {
        type: 'string',
        description: 'Collection ID to create endpoint in (required)'
      },
      description: {
        type: 'string',
        description: 'Endpoint description (optional)'
      },
      headers: {
        type: 'object',
        description: 'Request headers as key-value pairs',
        additionalProperties: {
          type: 'string',
          description: 'Header value'
        }
      },
      body: {
        type: 'string',
        description: 'Request body (JSON string)'
      }
    },
    required: ['name', 'method', 'url', 'collection_id']
  }
};

// Tool: update_endpoint
export const updateEndpointTool: McpTool = {
  name: 'update_endpoint',
  description: 'Update existing endpoint configuration',
  inputSchema: {
    type: 'object',
    properties: {
      endpoint_id: {
        type: 'string',
        description: 'Endpoint ID to update (required)'
      },
      name: {
        type: 'string',
        description: 'Updated endpoint name (optional)'
      },
      method: {
        type: 'string',
        description: 'Updated HTTP method (optional)',
        enum: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS']
      },
      url: {
        type: 'string',
        description: 'Updated endpoint URL (optional)'
      },
      description: {
        type: 'string',
        description: 'Updated endpoint description (optional)'
      },
      headers: {
        type: 'object',
        description: 'Updated request headers as key-value pairs',
        additionalProperties: {
          type: 'string',
          description: 'Header value'
        }
      },
      body: {
        type: 'string',
        description: 'Updated request body (JSON string)'
      }
    },
    required: ['endpoint_id']
  }
};

// Tool: move_endpoint
export const moveEndpointTool: McpTool = {
  name: 'move_endpoint',
  description: 'Move endpoint to a different collection',
  inputSchema: {
    type: 'object',
    properties: {
      endpoint_id: {
        type: 'string',
        description: 'Endpoint ID to move (required)'
      },
      new_collection_id: {
        type: 'string',
        description: 'Target collection ID (required)'
      }
    },
    required: ['endpoint_id', 'new_collection_id']
  }
};

/**
 * Endpoint tool handlers
 */
export function createEndpointToolHandlers(): Record<string, (args: any) => Promise<McpToolResponse>> {
  return {
    [listEndpointsTool.name]: async (args: Record<string, any>) => {
      try {
        const { configManager, backendClient } = await getEndpointDependencies();

        // Get project ID from args or config
        let projectId = args.project_id as string | undefined;
        if (!projectId) {
          const config = await configManager.detectProjectConfig();
          projectId = config?.project?.id;
          if (!projectId) {
            throw new Error('Project ID not found in config and not provided in arguments');
          }
        }

        const collectionId = args.collection_id as string | undefined;
        const method = args.method as HttpMethod | undefined;

        // Build query parameters for endpoint_list
        const apiEndpoints = getApiEndpoints();
        const endpoint = collectionId
          ? apiEndpoints.getEndpoint('endpointList', { collection_id: collectionId })
          : '/gassapi2/backend/?act=endpoints'; // Fallback for project-wide listing
        const fullUrl = `${backendClient.getBaseUrl()}${endpoint}`;

        console.error(`[EndpointTools] Requesting endpoints from: ${fullUrl}`);

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

        const data = await result.json() as EndpointListResponse;

        if (data.success && data.data) {
          const endpoints = Array.isArray(data.data) ? data.data : [];

          let endpointText = `🔗 Endpoints List (${endpoints.length}):\n\n`;

          if (endpoints.length === 0) {
            endpointText += 'No endpoints found';
            if (collectionId) endpointText += ' in this collection';
            if (method) endpointText += ` with method ${method}`;
            endpointText += '.\n';
            endpointText += 'Use create_endpoint tool to add your first endpoint.\n';
          } else {
            // Group by collection if no collection filter
            if (!collectionId) {
              const byCollection: Record<string, typeof endpoints> = {};
              endpoints.forEach(endpoint => {
                const collId = endpoint.collection_id || 'unknown';
                if (!byCollection[collId]) byCollection[collId] = [];
                byCollection[collId].push(endpoint);
              });

              Object.entries(byCollection).forEach(([collId, collEndpoints]) => {
                endpointText += `📁 Collection ${collId}:\n`;
                collEndpoints.forEach((endpoint, index) => {
                  endpointText += `  ${index + 1}. ${endpoint.method} ${endpoint.name} (${endpoint.id})\n`;
                  endpointText += `     ${endpoint.url}\n`;
                  if (endpoint.description) {
                    endpointText += `     📝 ${endpoint.description}\n`;
                  }
                  endpointText += '\n';
                });
              });
            } else {
              // Simple list when collection is specified
              endpoints.forEach((endpoint, index) => {
                endpointText += `${index + 1}. ${endpoint.method} ${endpoint.name} (${endpoint.id})\n`;
                endpointText += `   ${endpoint.url}\n`;
                if (endpoint.description) {
                  endpointText += `   📝 ${endpoint.description}\n`;
                }
                endpointText += '\n';
              });
            }
          }

          endpointText += `📊 Total endpoints: ${endpoints.length}`;

          return {
            content: [
              {
                type: 'text',
                text: endpointText
              }
            ]
          };
        } else {
          return {
            content: [
              {
                type: 'text',
                text: `❌ Failed to list endpoints: ${data.message || 'Unknown error'}`
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
              text: `❌ Endpoints list error: ${error instanceof Error ? error.message : 'Unknown error'}`
            }
          ],
          isError: true
        };
      }
    },

    [getEndpointDetailsTool.name]: async (args: Record<string, any>) => {
      try {
        const { configManager, backendClient } = await getEndpointDependencies();

        const endpointId = args.endpoint_id as string;
        if (!endpointId) {
          throw new Error('Endpoint ID is required');
        }

        // Get endpoint details
        const apiEndpoints = getApiEndpoints();
        const endpoint = apiEndpoints.getEndpoint('endpointDetails', { id: endpointId });
        const fullUrl = `${backendClient.getBaseUrl()}${endpoint}`;

        console.error(`[EndpointTools] Requesting endpoint details from: ${fullUrl}`);

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

        const data = await result.json() as EndpointDetailsResponse;

        if (data.success && data.data) {
          const endpoint = data.data;

          // Parse headers and body
          const headers = parseHeaders(endpoint.headers);
          const body = endpoint.body;

          let detailsText = `🔗 Endpoint Details\n\n`;
          detailsText += `🏷️  Name: ${endpoint.name}\n`;
          detailsText += `🆔 ID: ${endpoint.id}\n`;
          detailsText += `📡 Method: ${endpoint.method}\n`;
          detailsText += `🌐 URL: ${endpoint.url}\n`;
          detailsText += `📝 Description: ${endpoint.description || 'No description'}\n`;

          if (endpoint.collection) {
            detailsText += `📁 Collection: ${endpoint.collection.name} (${endpoint.collection.id})\n`;
          }

          if (Object.keys(headers).length > 0) {
            detailsText += `\n📋 Headers (${Object.keys(headers).length}):\n`;
            Object.entries(headers).forEach(([key, value], index) => {
              detailsText += `   ${index + 1}. ${key}: ${value}\n`;
            });
          }

          if (body && body !== '{}') {
            detailsText += `\n💾 Body:\n`;
            detailsText += `   ${body}\n`;
          }

          detailsText += `\n📅 Created: ${endpoint.created_at}\n`;
          detailsText += `🔄 Updated: ${endpoint.updated_at}\n`;

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
                text: `❌ Failed to get endpoint details: ${data.message || 'Unknown error'}`
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
              text: `❌ Endpoint details error: ${error instanceof Error ? error.message : 'Unknown error'}`
            }
          ],
          isError: true
        };
      }
    },

    [createEndpointTool.name]: async (args: Record<string, any>) => {
      try {
        const { configManager, backendClient } = await getEndpointDependencies();

        const name = args.name as string;
        const method = args.method as HttpMethod;
        const url = args.url as string;
        const collectionId = args.collection_id as string;
        const description = args.description as string | undefined;
        const headers = args.headers as Record<string, string> | undefined;
        const body = args.body as string | undefined;

        if (!name || name.trim() === '') {
          throw new Error('Endpoint name is required');
        }
        if (!method) {
          throw new Error('HTTP method is required');
        }
        if (!url || url.trim() === '') {
          throw new Error('URL is required');
        }
        if (!collectionId) {
          throw new Error('Collection ID is required');
        }

        // Create endpoint
        const apiEndpoints = getApiEndpoints();
        const endpoint = apiEndpoints.getEndpoint('endpointCreate', { id: collectionId });
        const fullUrl = `${backendClient.getBaseUrl()}${endpoint}`;

        console.error(`[EndpointTools] Creating endpoint at: ${fullUrl}`);

        const result = await fetch(fullUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${backendClient.getToken()}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: name.trim(),
            method,
            url: url.trim(),
            description: description?.trim() || null,
            headers: formatHeaders(headers || {}),
            body: formatBody(body) || null
          })
        });

        if (!result.ok) {
          throw new Error(`Failed to create endpoint: HTTP ${result.status}`);
        }

        const data = await result.json() as EndpointCreateResponse;

        if (data.success && data.data) {
          const endpoint = data.data;

          let createText = `✅ Endpoint Created Successfully\n\n`;
          createText += `🏷️  Name: ${endpoint.name}\n`;
          createText += `🆔 ID: ${endpoint.id}\n`;
          createText += `📡 Method: ${endpoint.method}\n`;
          createText += `🌐 URL: ${endpoint.url}\n`;
          createText += `📝 Description: ${endpoint.description || 'No description'}\n`;
          createText += `📁 Collection: ${endpoint.collection_id}\n`;
          createText += `📅 Created: ${endpoint.created_at}\n`;

          return {
            content: [
              {
                type: 'text',
                text: createText
              }
            ]
          };
        } else {
          return {
            content: [
              {
                type: 'text',
                text: `❌ Failed to create endpoint: ${data.message || 'Unknown error'}`
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
              text: `❌ Endpoint creation error: ${error instanceof Error ? error.message : 'Unknown error'}`
            }
          ],
          isError: true
        };
      }
    },

    [updateEndpointTool.name]: async (args: Record<string, any>) => {
      try {
        const { configManager, backendClient } = await getEndpointDependencies();

        const endpointId = args.endpoint_id as string;
        const name = args.name as string | undefined;
        const method = args.method as HttpMethod | undefined;
        const url = args.url as string | undefined;
        const description = args.description as string | undefined;
        const headers = args.headers as Record<string, string> | undefined;
        const body = args.body as string | undefined;

        if (!endpointId) {
          throw new Error('Endpoint ID is required');
        }

        // Build update data
        const updateData: any = {};
        if (name !== undefined) updateData.name = name.trim();
        if (method !== undefined) updateData.method = method;
        if (url !== undefined) updateData.url = url.trim();
        if (description !== undefined) updateData.description = description.trim() || null;
        if (headers !== undefined) updateData.headers = formatHeaders(headers);
        if (body !== undefined) updateData.body = formatBody(body);

        if (Object.keys(updateData).length === 0) {
          throw new Error('At least one field to update is required');
        }

        // Update endpoint
        const apiEndpoints = getApiEndpoints();
        const endpoint = apiEndpoints.getEndpoint('endpointUpdate', { id: endpointId });
        const fullUrl = `${backendClient.getBaseUrl()}${endpoint}`;

        console.error(`[EndpointTools] Updating endpoint at: ${fullUrl}`);

        const result = await fetch(fullUrl, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${backendClient.getToken()}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(updateData)
        });

        if (!result.ok) {
          throw new Error(`Failed to update endpoint: HTTP ${result.status}`);
        }

        const data = await result.json() as EndpointUpdateResponse;

        if (data.success && data.data) {
          const endpoint = data.data;

          let updateText = `✅ Endpoint Updated Successfully\n\n`;
          updateText += `🏷️  Name: ${endpoint.name}\n`;
          updateText += `🆔 ID: ${endpoint.id}\n`;
          updateText += `📡 Method: ${endpoint.method}\n`;
          updateText += `🌐 URL: ${endpoint.url}\n`;
          updateText += `📝 Description: ${endpoint.description || 'No description'}\n`;
          updateText += `📁 Collection: ${endpoint.collection_id}\n`;
          updateText += `🔄 Updated: ${endpoint.updated_at}\n`;

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
                text: `❌ Failed to update endpoint: ${data.message || 'Unknown error'}`
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
              text: `❌ Endpoint update error: ${error instanceof Error ? error.message : 'Unknown error'}`
            }
          ],
          isError: true
        };
      }
    },

    [moveEndpointTool.name]: async (args: Record<string, any>) => {
      try {
        const { configManager, backendClient } = await getEndpointDependencies();

        const endpointId = args.endpoint_id as string;
        const newCollectionId = args.new_collection_id as string;

        if (!endpointId) {
          throw new Error('Endpoint ID is required');
        }
        if (!newCollectionId) {
          throw new Error('New collection ID is required');
        }

        // Move endpoint (using update endpoint with collection_id)
        const apiEndpoints = getApiEndpoints();
        const endpoint = apiEndpoints.getEndpoint('endpointUpdate', { id: endpointId });
        const fullUrl = `${backendClient.getBaseUrl()}${endpoint}`;

        console.error(`[EndpointTools] Moving endpoint at: ${fullUrl}`);

        const result = await fetch(fullUrl, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${backendClient.getToken()}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            collection_id: newCollectionId
          })
        });

        if (!result.ok) {
          throw new Error(`Failed to move endpoint: HTTP ${result.status}`);
        }

        const data = await result.json() as EndpointUpdateResponse;

        if (data.success && data.data) {
          const endpoint = data.data;

          let moveText = `✅ Endpoint Moved Successfully\n\n`;
          moveText += `🏷️  Name: ${endpoint.name}\n`;
          moveText += `🆔 ID: ${endpoint.id}\n`;
          moveText += `📁 New Collection: ${endpoint.collection_id}\n`;
          moveText += `📡 Method: ${endpoint.method}\n`;
          moveText += `🌐 URL: ${endpoint.url}\n`;

          return {
            content: [
              {
                type: 'text',
                text: moveText
              }
            ]
          };
        } else {
          return {
            content: [
              {
                type: 'text',
                text: `❌ Failed to move endpoint: ${data.message || 'Unknown error'}`
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
              text: `❌ Endpoint move error: ${error instanceof Error ? error.message : 'Unknown error'}`
            }
          ],
          isError: true
        };
      }
    }
  };
}

// Export for server integration
export const ENDPOINT_TOOLS: McpTool[] = [
  listEndpointsTool,
  getEndpointDetailsTool,
  createEndpointTool,
  updateEndpointTool,
  moveEndpointTool
];

// Legacy compatibility
export const TOOLS: McpTool[] = ENDPOINT_TOOLS;
export class ToolHandlers {
  static async handleListEndpoints(args?: {
    project_id?: string;
    collection_id?: string;
    method?: HttpMethod;
  }): Promise<McpToolResponse> {
    const handlers = createEndpointToolHandlers();
    return handlers.list_endpoints(args || {});
  }

  static async handleGetEndpointDetails(args: { endpoint_id: string }): Promise<McpToolResponse> {
    const handlers = createEndpointToolHandlers();
    return handlers.get_endpoint_details(args);
  }

  static async handleCreateEndpoint(args: {
    name: string;
    method: HttpMethod;
    url: string;
    collection_id: string;
    description?: string;
    headers?: Record<string, string>;
    body?: string;
  }): Promise<McpToolResponse> {
    const handlers = createEndpointToolHandlers();
    return handlers.create_endpoint(args);
  }

  static async handleUpdateEndpoint(args: {
    endpoint_id: string;
    name?: string;
    method?: HttpMethod;
    url?: string;
    description?: string;
    headers?: Record<string, string>;
    body?: string;
  }): Promise<McpToolResponse> {
    const handlers = createEndpointToolHandlers();
    return handlers.update_endpoint(args);
  }

  static async handleMoveEndpoint(args: {
    endpoint_id: string;
    new_collection_id: string;
  }): Promise<McpToolResponse> {
    const handlers = createEndpointToolHandlers();
    return handlers.move_endpoint(args);
  }
}

export function createToolHandlers(config: any): Record<string, (args: any) => Promise<McpToolResponse>> {
  return createEndpointToolHandlers();
}