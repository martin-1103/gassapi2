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
  description: 'Create a new flow with sequential endpoint testing steps',
  inputSchema: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        description: 'Name of the flow'
      },
      description: {
        type: 'string',
        description: 'Description of the flow'
      },
      folderId: {
        type: 'string',
        description: 'Folder ID to organize the flow'
      },
      steps: {
        type: 'array',
        description: 'Array of flow steps',
        items: {
          type: 'object',
          description: 'Flow step configuration',
          properties: {
            id: { type: 'string', description: 'Unique step ID' },
            name: { type: 'string', description: 'Step name' },
            endpointId: { type: 'string', description: 'Endpoint reference ID' },
            method: { type: 'string', description: 'HTTP method' },
            url: { type: 'string', description: 'Request URL' },
            headers: { type: 'object', description: 'Request headers' },
            body: { type: 'string', description: 'Request body' },
            timeout: { type: 'number', description: 'Request timeout in ms' },
            expectedStatus: { type: 'number', description: 'Expected HTTP status' },
            description: { type: 'string', description: 'Step description' }
          },
          required: ['id', 'name']
        }
      },
      config: {
        type: 'object',
        description: 'Flow configuration',
        properties: {
          timeout: { type: 'number', description: 'Default timeout in ms' },
          stopOnError: { type: 'boolean', description: 'Stop on first error' },
          parallel: { type: 'boolean', description: 'Execute steps in parallel' },
          maxConcurrency: { type: 'number', description: 'Max concurrent steps' }
        }
      },
      inputs: {
        type: 'string',
        description: 'Flow inputs as JSON string or comma-separated key=value pairs'
      }
    },
    required: ['name', 'steps']
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