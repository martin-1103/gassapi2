/**
 * Tool definitions for endpoint management
 */

import { McpTool } from '../../types.js';
import { HttpMethod } from './types.js';

// Tool: list_endpoints
export const listEndpointsTool: McpTool = {
  name: 'list_endpoints',
  description: 'List all endpoints with optional filtering by folder',
  inputSchema: {
    type: 'object',
    properties: {
      folder_id: {
        type: 'string',
        description: 'Optional folder ID to filter endpoints'
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
  description: 'Get detailed endpoint configuration with folder information',
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
  description: 'Create a new endpoint in a folder',
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
      folder_id: {
        type: 'string',
        description: 'Folder ID to create endpoint in (required)'
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
    required: ['name', 'method', 'url', 'folder_id']
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


// Export all tools as array
export const ENDPOINT_TOOLS: McpTool[] = [
  listEndpointsTool,
  getEndpointDetailsTool,
  createEndpointTool,
  updateEndpointTool
];