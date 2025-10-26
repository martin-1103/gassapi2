/**
 * Environment Tools Definition
 * MCP tool definitions for environment operations
 */

import { McpTool } from '../../types.js';
import { handleListEnvironments } from './handlers/listHandler.js';
import { handleGetEnvironmentDetails, handleCreateEnvironment, handleDeleteEnvironment } from './handlers/detailsHandler.js';
import { handleUpdateEnvironmentVariables, handleSetDefaultEnvironment } from './handlers/updateHandler.js';

/**
 * List Environments Tool
 */
export const listEnvironmentsTool: McpTool = {
  name: 'list_environments',
  description: 'List all environments for current project',
  inputSchema: {
    type: 'object',
    properties: {
      projectId: {
        type: 'string',
        description: 'Project ID (optional, will use current project if not provided)'
      },
      activeOnly: {
        type: 'boolean',
        description: 'Show only active environments',
        default: true
      }
    }
  },
  handler: handleListEnvironments
};

/**
 * Get Environment Details Tool
 */
export const getEnvironmentDetailsTool: McpTool = {
  name: 'get_environment_details',
  description: 'Get detailed environment information including variables',
  inputSchema: {
    type: 'object',
    properties: {
      environmentId: {
        type: 'string',
        description: 'Environment ID to get details for'
      },
      includeVariables: {
        type: 'boolean',
        description: 'Include environment variables in response',
        default: true
      }
    },
    required: ['environmentId']
  },
  handler: handleGetEnvironmentDetails
};

/**
 * Create Environment Tool
 */
export const createEnvironmentTool: McpTool = {
  name: 'create_environment',
  description: 'Create a new environment with variables',
  inputSchema: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        description: 'Environment name'
      },
      description: {
        type: 'string',
        description: 'Environment description'
      },
      variables: {
        type: 'string',
        description: 'Environment variables (JSON string, object, or comma-separated key=value pairs)'
      },
      isDefault: {
        type: 'boolean',
        description: 'Set as default environment',
        default: false
      },
      projectId: {
        type: 'string',
        description: 'Project ID (optional, will use current project if not provided)'
      }
    },
    required: ['name']
  },
  handler: handleCreateEnvironment
};

/**
 * Update Environment Variables Tool
 */
export const updateEnvironmentVariablesTool: McpTool = {
  name: 'update_environment_variables',
  description: 'Update environment variables (add/update/remove variables)',
  inputSchema: {
    type: 'object',
    properties: {
      environmentId: {
        type: 'string',
        description: 'Environment ID to update variables for'
      },
      variables: {
        type: 'string',
        description: 'Variables object with key-value pairs (JSON string, object, or comma-separated key=value pairs)'
      },
      operation: {
        type: 'string',
        description: 'Operation type: "merge" (default) to combine with existing, "replace" to overwrite all',
        enum: ['merge', 'replace'],
        default: 'merge'
      }
    },
    required: ['environmentId', 'variables']
  },
  handler: handleUpdateEnvironmentVariables
};

/**
 * Set Default Environment Tool
 */
export const setDefaultEnvironmentTool: McpTool = {
  name: 'set_default_environment',
  description: 'Set an environment as the default for the project',
  inputSchema: {
    type: 'object',
    properties: {
      environmentId: {
        type: 'string',
        description: 'Environment ID to set as default'
      }
    },
    required: ['environmentId']
  },
  handler: handleSetDefaultEnvironment
};


/**
 * Delete Environment Tool
 */
export const deleteEnvironmentTool: McpTool = {
  name: 'delete_environment',
  description: 'Delete an environment',
  inputSchema: {
    type: 'object',
    properties: {
      environmentId: {
        type: 'string',
        description: 'Environment ID to delete'
      }
    },
    required: ['environmentId']
  },
  handler: handleDeleteEnvironment
};

/**
 * Export all environment tools
 */
export const environmentTools = [
  listEnvironmentsTool,
  getEnvironmentDetailsTool,
  createEnvironmentTool,
  updateEnvironmentVariablesTool,
  setDefaultEnvironmentTool,
  deleteEnvironmentTool
];