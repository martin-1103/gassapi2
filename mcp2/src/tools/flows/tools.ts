/**
 * Flow Tools Definition
 * MCP tool definitions for flow operations
 */

import { McpTool } from '../../types.js';
import { handleExecuteFlow } from './handlers/executeHandler.js';
import { handleCreateFlow } from './handlers/createHandler.js';
import { handleGetFlowDetails, handleListFlows, handleDeleteFlow } from './handlers/detailsHandler.js';

/**
 * Execute Flow Tool
 */
export const executeFlowTool: McpTool = {
  name: 'execute_flow',
  description: 'Execute a flow with sequential or parallel endpoint testing',
  inputSchema: {
    type: 'object',
    properties: {
      flowId: {
        type: 'string',
        description: 'ID of the flow to execute'
      },
      variables: {
        type: 'string',
        description: 'Variables for flow interpolation (JSON string or object, or comma-separated key=value pairs)'
      },
      mode: {
        type: 'string',
        enum: ['sequential', 'parallel'],
        description: 'Execution mode (sequential or parallel)'
      },
      timeout: {
        type: 'number',
        description: 'Flow timeout in milliseconds'
      },
      stopOnError: {
        type: 'boolean',
        description: 'Stop execution on first error'
      },
      maxConcurrency: {
        type: 'number',
        description: 'Maximum concurrent steps for parallel execution'
      },
      dryRun: {
        type: 'boolean',
        description: 'Run in dry-run mode (no actual HTTP requests)'
      }
    },
    required: ['flowId']
  },
  handler: handleExecuteFlow
};

/**
 * Create Flow Tool
 */
export const createFlowTool: McpTool = {
  name: 'create_flow',
  description: 'Create a new flow in the project using Steps format for API automation\n\nExample format:\n{\n  "name": "User Registration Flow",\n  "description": "Complete user registration with email verification",\n  "folderId": "fld_456",\n  "flow_data": {\n    "version": "1.0",\n    "steps": [\n      {\n        "id": "register_user",\n        "name": "Register New User",\n        "method": "POST",\n        "url": "{{baseUrl}}/api/users/register",\n        "headers": {"Content-Type": "application/json"},\n        "body": "{\\"name\\": \\"{{userName}}\\", \\"email\\": \\"{{userEmail}}\\", \\"password\\": \\"{{password}}\\"}",\n        "outputs": {"userId": "response.body.id", "activationToken": "response.body.token"}\n      },\n      {\n        "id": "verify_email",\n        "name": "Verify Email Address",\n        "method": "POST",\n        "url": "{{baseUrl}}/api/auth/verify",\n        "headers": {"Content-Type": "application/json"},\n        "body": "{\\"token\\": \\"{{register_user.activationToken}}\\"}",\n        "outputs": {"verificationStatus": "response.body.status"}\n      }\n    ],\n    "config": {"delay": 1000, "retryCount": 2, "parallel": false}\n  },\n  "flow_inputs": [\n    {"name": "baseUrl", "type": "string", "required": true, "description": "Base API URL"},\n    {"name": "userName", "type": "string", "required": true, "description": "User full name"},\n    {"name": "userEmail", "type": "email", "required": true, "description": "User email"},\n    {"name": "password", "type": "password", "required": true, "description": "User password"}\n  ]\n}\n\n2-step API Testing Example:\n{\n  "name": "API Integration Test",\n  "description": "Test user creation and retrieval",\n  "flow_data": {\n    "version": "1.0",\n    "steps": [\n      {\n        "id": "create_user",\n        "name": "Create User",\n        "method": "POST",\n        "url": "https://api.example.com/users",\n        "headers": {"Authorization": "Bearer {{apiKey}}"},\n        "body": "{\\"name\\": \\"Test User\\", \\"email\\": \\"test@example.com\\"}",\n        "expectedStatus": 201,\n        "outputs": {"newUserId": "response.body.id"}\n      },\n      {\n        "id": "get_user",\n        "name": "Retrieve Created User",\n        "method": "GET",\n        "url": "https://api.example.com/users/{{create_user.newUserId}}",\n        "headers": {"Authorization": "Bearer {{apiKey}}"},\n        "expectedStatus": 200,\n        "outputs": {"userData": "response.body"}\n      }\n    ]\n  }\n}\n\nCommon mistakes:\n- ❌ Empty steps array\n- ❌ Missing required step fields (id, name, method, url)\n- ❌ Invalid step references (must use {{step.output}})\n- ✅ Use {{input.var}} for flow inputs\n- ✅ Use {{step.output}} for chaining steps\n- ✅ Define outputs to pass data between steps',
  inputSchema: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        description: 'Name of the flow (required)'
      },
      description: {
        type: 'string',
        description: 'Description of the flow (optional)'
      },
      folderId: {
        type: 'string',
        description: 'Folder ID to organize the flow (optional)'
      },
      flow_data: {
        type: 'object',
        description: 'Flow data following backend Steps format',
        properties: {
          version: { type: 'string', description: 'Flow version (default: "1.0")' },
          steps: {
            type: 'array',
            description: 'Array of flow steps',
            items: {
              type: 'object',
              description: 'Flow step configuration',
              properties: {
                id: { type: 'string', description: 'Unique step ID (required)' },
                name: { type: 'string', description: 'Step name (required)' },
                method: {
                  type: 'string',
                  enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'],
                  description: 'HTTP method (required)'
                },
                url: {
                  type: 'string',
                  description: 'Request URL with {{input.var}} references (required)'
                },
                headers: {
                  type: 'object',
                  description: 'Request headers with variable references',
                  additionalProperties: { type: 'string', description: 'Header value' }
                },
                body: {
                  type: 'string',
                  description: 'Request body with {{step.output}} references'
                },
                timeout: { type: 'number', description: 'Request timeout in ms' },
                expectedStatus: { type: 'number', description: 'Expected HTTP status' },
                outputs: {
                  type: 'object',
                  description: 'Define outputs for next steps (e.g., {"userId": "response.body.id"})',
                  additionalProperties: { type: 'string', description: 'Output reference path' }
                }
              },
              required: ['id', 'name', 'method', 'url']
            }
          },
          config: {
            type: 'object',
            description: 'Flow execution configuration',
            properties: {
              delay: { type: 'number', description: 'Delay between steps in ms' },
              retryCount: { type: 'number', description: 'Number of retries per step' },
              parallel: { type: 'boolean', description: 'Execute steps in parallel' },
              timeout: { type: 'number', description: 'Default timeout in ms' },
              stopOnError: { type: 'boolean', description: 'Stop on first error' },
              maxConcurrency: { type: 'number', description: 'Max concurrent steps' }
            }
          }
        },
        required: ['steps']
      },
      flow_inputs: {
        type: 'array',
        description: 'Dynamic input definitions for variable interpolation',
        items: {
          type: 'object',
          description: 'Flow input definition',
          properties: {
            name: { type: 'string', description: 'Input name (required)' },
            type: {
              type: 'string',
              enum: ['string', 'email', 'password', 'number', 'boolean'],
              description: 'Input type (required)'
            },
            required: { type: 'boolean', description: 'Whether input is required (default: false)' },
            validation: {
              type: 'object',
              description: 'Validation rules (min_length, max_length, pattern, etc.)',
              additionalProperties: { type: 'string', description: 'Validation rule value' }
            },
            description: { type: 'string', description: 'Input description' },
            defaultValue: { type: 'string', description: 'Default value' }
          },
          required: ['name', 'type']
        }
      },
      is_active: {
        type: 'boolean',
        description: 'Flow active status (default: true)'
      }
    },
    required: ['name']
  },
  handler: handleCreateFlow
};

/**
 * Get Flow Details Tool
 */
export const getFlowDetailsTool: McpTool = {
  name: 'get_flow_details',
  description: 'Get detailed information about a specific flow',
  inputSchema: {
    type: 'object',
    properties: {
      flowId: {
        type: 'string',
        description: 'ID of the flow'
      },
      includeSteps: {
        type: 'boolean',
        description: 'Include flow steps in response (default: true)',
        default: true
      },
      includeConfig: {
        type: 'boolean',
        description: 'Include flow configuration in response (default: true)',
        default: true
      }
    },
    required: ['flowId']
  },
  handler: handleGetFlowDetails
};

/**
 * List Flows Tool
 */
export const listFlowsTool: McpTool = {
  name: 'list_flows',
  description: 'List flows in the current project',
  inputSchema: {
    type: 'object',
    properties: {
      folderId: {
        type: 'string',
        description: 'Filter by folder ID'
      },
      activeOnly: {
        type: 'boolean',
        description: 'Show only active flows',
        default: true
      },
      limit: {
        type: 'number',
        description: 'Maximum number of flows to return',
        default: 50
      },
      offset: {
        type: 'number',
        description: 'Number of flows to skip',
        default: 0
      }
    }
  },
  handler: handleListFlows
};

/**
 * Delete Flow Tool
 */
export const deleteFlowTool: McpTool = {
  name: 'delete_flow',
  description: 'Delete a flow',
  inputSchema: {
    type: 'object',
    properties: {
      flowId: {
        type: 'string',
        description: 'ID of the flow to delete'
      }
    },
    required: ['flowId']
  },
  handler: handleDeleteFlow
};

/**
 * Export all flow tools
 */
export const flowTools = [
  executeFlowTool,
  createFlowTool,
  getFlowDetailsTool,
  listFlowsTool,
  deleteFlowTool
];