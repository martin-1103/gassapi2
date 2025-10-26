/**
 * Tool Definitions for GASSAPI MCP v2
 * Integration with migrated server framework
 */

import { McpTool, McpToolResponse } from '../types.js';
import { AUTH_TOOLS, createAuthToolHandlers } from './auth.js';
import { environmentTools } from './environment/index.js';
import { folderTools } from './folders/index.js';
import { ENDPOINT_TOOLS, createEndpointToolHandlers } from './endpoints.js';
import { testingTools } from './testing/index.js';
import { flowTools } from './flows/index.js';

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

// All available tools (core + auth + environment + folders + endpoints + testing + flows)
export const ALL_TOOLS: McpTool[] = [
  ...CORE_TOOLS,
  ...AUTH_TOOLS,
  ...environmentTools,
  ...folderTools,
  ...ENDPOINT_TOOLS,
  ...testingTools,
  ...flowTools
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
          migration_status: 'Refactoring Complete - Modular Structure Implemented'
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

// Create handlers for modular tools
function createEnvironmentToolHandlers(): Record<string, (args: any) => Promise<McpToolResponse>> {
  return {
    'list_environments': async (args: any) => {
      const { handleListEnvironments } = await import('./environment/handlers/listHandler.js');
      return handleListEnvironments(args);
    },
    'get_environment_details': async (args: any) => {
      const { handleGetEnvironmentDetails } = await import('./environment/handlers/detailsHandler.js');
      return handleGetEnvironmentDetails(args);
    },
    'create_environment': async (args: any) => {
      const { handleCreateEnvironment } = await import('./environment/handlers/detailsHandler.js');
      return handleCreateEnvironment(args);
    },
    'update_environment_variables': async (args: any) => {
      const { handleUpdateEnvironmentVariables } = await import('./environment/handlers/updateHandler.js');
      return handleUpdateEnvironmentVariables(args);
    },
    'set_default_environment': async (args: any) => {
      const { handleSetDefaultEnvironment } = await import('./environment/handlers/updateHandler.js');
      return handleSetDefaultEnvironment(args);
    },
    'duplicate_environment': async (args: any) => {
      const { handleDuplicateEnvironment } = await import('./environment/handlers/updateHandler.js');
      return handleDuplicateEnvironment(args);
    },
    'delete_environment': async (args: any) => {
      const { handleDeleteEnvironment } = await import('./environment/handlers/detailsHandler.js');
      return handleDeleteEnvironment(args);
    }
  };
}

function createFolderToolHandlers(): Record<string, (args: any) => Promise<McpToolResponse>> {
  return {
    'list_folders': async (args: any) => {
      const { handleListFolders } = await import('./folders/handlers/folderHandlers.js');
      return handleListFolders(args);
    },
    'create_folder': async (args: any) => {
      const { handleCreateFolder } = await import('./folders/handlers/folderHandlers.js');
      return handleCreateFolder(args);
    },
    'update_folder': async (args: any) => {
      const { handleUpdateFolder } = await import('./folders/handlers/folderHandlers.js');
      return handleUpdateFolder(args);
    },
    'move_folder': async (args: any) => {
      const { handleMoveFolder } = await import('./folders/handlers/folderHandlers.js');
      return handleMoveFolder(args);
    },
    'delete_folder': async (args: any) => {
      const { handleDeleteFolder } = await import('./folders/handlers/folderHandlers.js');
      return handleDeleteFolder(args);
    },
    'get_folder_details': async (args: any) => {
      const { handleGetFolderDetails } = await import('./folders/handlers/folderHandlers.js');
      return handleGetFolderDetails(args);
    }
  };
}

function createTestingToolHandlers(): Record<string, (args: any) => Promise<McpToolResponse>> {
  return {
    'test_endpoint': async (args: any) => {
      const { handleTestEndpoint } = await import('./testing/handlers/testingHandlers.js');
      return handleTestEndpoint(args);
    },
    'test_multiple_endpoints': async (args: any) => {
      const { handleTestMultipleEndpoints } = await import('./testing/handlers/testingHandlers.js');
      return handleTestMultipleEndpoints(args);
    },
    'create_test_suite': async (args: any) => {
      const { handleCreateTestSuite } = await import('./testing/handlers/testingHandlers.js');
      return handleCreateTestSuite(args);
    },
    'list_test_suites': async (args: any) => {
      const { handleListTestSuites } = await import('./testing/handlers/testingHandlers.js');
      return handleListTestSuites(args);
    }
  };
}

function createFlowToolHandlers(): Record<string, (args: any) => Promise<McpToolResponse>> {
  return {
    'execute_flow': async (args: any) => {
      const { handleExecuteFlow } = await import('./flows/handlers/executeHandler.js');
      return handleExecuteFlow(args);
    },
    'create_flow': async (args: any) => {
      const { handleCreateFlow } = await import('./flows/handlers/createHandler.js');
      return handleCreateFlow(args);
    },
    'get_flow_details': async (args: any) => {
      const { handleGetFlowDetails } = await import('./flows/handlers/detailsHandler.js');
      return handleGetFlowDetails(args);
    },
    'list_flows': async (args: any) => {
      const { handleListFlows } = await import('./flows/handlers/detailsHandler.js');
      return handleListFlows(args);
    },
    'delete_flow': async (args: any) => {
      const { handleDeleteFlow } = await import('./flows/handlers/detailsHandler.js');
      return handleDeleteFlow(args);
    }
  };
}

// All tool handlers (core + auth + environment + folders + endpoints + testing + flows)
export function createAllToolHandlers(): Record<string, (args: any) => Promise<McpToolResponse>> {
  return {
    ...createCoreToolHandlers(),
    ...createAuthToolHandlers(),
    ...createEnvironmentToolHandlers(),
    ...createFolderToolHandlers(),
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