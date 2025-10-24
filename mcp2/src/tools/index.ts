/**
 * Tool Definitions for GASSAPI MCP v2
 * Integration with migrated server framework
 */

import { McpTool, McpToolResponse } from '../types.js';
import { AUTH_TOOLS, createAuthToolHandlers } from './auth.js';
import { ENVIRONMENT_TOOLS, createEnvironmentToolHandlers } from './environment.js';
import { COLLECTION_TOOLS, createCollectionToolHandlers } from './collections.js';
import { ENDPOINT_TOOLS, createEndpointToolHandlers } from './endpoints.js';
import { TESTING_TOOLS, createTestingToolHandlers } from './testing.js';
import { FLOW_TOOLS, createFlowToolHandlers } from './flows.js';

// Basic health check tool (migrated from server)
export const healthCheckTool: McpTool = {
  name: 'health_check',
  description: 'Check if the MCP server is running properly',
  inputSchema: {
    type: 'object',
    properties: {}
  }
};

// Export for server integration
export const CORE_TOOLS: McpTool[] = [
  healthCheckTool
];

// All available tools (core + auth + environment + collections + endpoints + testing + flows)
export const ALL_TOOLS: McpTool[] = [
  ...CORE_TOOLS,
  ...AUTH_TOOLS,
  ...ENVIRONMENT_TOOLS,
  ...COLLECTION_TOOLS,
  ...ENDPOINT_TOOLS,
  ...TESTING_TOOLS,
  ...FLOW_TOOLS
];

// Tool handler factory (for server integration)
export function createCoreToolHandlers(): Record<string, (args: any) => Promise<McpToolResponse>> {
  return {
    [healthCheckTool.name]: async (args: Record<string, any>) => {
      try {
        const uptime = process.uptime();
        const memory = process.memoryUsage();

        const status = {
          server: 'GASSAPI MCP Client',
          version: '1.0.0',
          status: 'healthy',
          timestamp: new Date().toISOString(),
          uptime: uptime,
          memory: memory,
          tools: ALL_TOOLS.map(t => t.name),
          migration_status: 'Step 7 - Flow Tools Migrated'
        };

        return {
          content: [
            {
              type: 'text',
              text: `✅ GASSAPI MCP Server Status\n\n${JSON.stringify(status, null, 2)}`
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `❌ Health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`
            }
          ],
          isError: true
        };
      }
    }
  };
}

// All tool handlers (core + auth + environment + collections + endpoints + testing + flows)
export function createAllToolHandlers(): Record<string, (args: any) => Promise<McpToolResponse>> {
  return {
    ...createCoreToolHandlers(),
    ...createAuthToolHandlers(),
    ...createEnvironmentToolHandlers(),
    ...createCollectionToolHandlers(),
    ...createEndpointToolHandlers(),
    ...createTestingToolHandlers(),
    ...createFlowToolHandlers()
  };
}

// Legacy compatibility (for migration from tools/index.ts pattern)
export const TOOLS: McpTool[] = ALL_TOOLS;
export class ToolHandlers {
  static async handleHealthCheck(): Promise<McpToolResponse> {
    const handlers = createCoreToolHandlers();
    return handlers.health_check({});
  }
}

export function createToolHandlers(config: any): Record<string, (args: any) => Promise<McpToolResponse>> {
  return createAllToolHandlers();
}