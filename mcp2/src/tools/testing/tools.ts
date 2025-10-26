/**
 * Testing Tools Definition
 * MCP tool definitions for testing operations
 */

import { McpTool } from '../../types.js';
import {
  handleTestEndpoint
} from './handlers/testingHandlers.js';

/**
 * Test Endpoint Tool
 */
export const testEndpointTool: McpTool = {
  name: 'test_endpoint',
  description: 'Test a single endpoint with optional environment variables',
  inputSchema: {
    type: 'object',
    properties: {
      endpointId: {
        type: 'string',
        description: 'Endpoint ID to test'
      },
      environmentId: {
        type: 'string',
        description: 'Environment ID for variables (optional)'
      },
      variables: {
        type: 'object',
        oneOf: [
          { type: 'string', description: 'Variables as JSON string' },
          { type: 'object', description: 'Variables as object' }
        ],
        description: 'Variables for interpolation (JSON string, object, or comma-separated key=value pairs)'
      },
      timeout: {
        type: 'number',
        description: 'Request timeout in milliseconds'
      }
    },
    required: ['endpointId']
  },
  handler: handleTestEndpoint
};


/**
 * Export all testing tools
 */
export const testingTools = [
  testEndpointTool
];