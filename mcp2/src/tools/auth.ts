/**
 * Auth Tools for GASSAPI MCP v2
 * Migrated from original auth tools but simplified
 */

import { McpTool, McpToolResponse } from '../types.js';
import { ConfigManager } from '../config.js';
import { BackendClient } from '../client/BackendClient.js';

// Singleton instances for auth tools
let configManagerInstance: ConfigManager | null = null;
let backendClientInstance: BackendClient | null = null;

/**
 * Initialize auth dependencies
 */
async function getAuthDependencies() {
  if (!configManagerInstance) {
    configManagerInstance = new ConfigManager();
  }
  if (!backendClientInstance) {
    const config = await configManagerInstance.detectProjectConfig();
    if (!config) {
      throw new Error('No configuration found');
    }
    const token = configManagerInstance.getMcpToken(config);
    const serverUrl = configManagerInstance.getServerURL(config);
    if (!token || !serverUrl) {
      throw new Error('Missing token or server URL in configuration');
    }
    backendClientInstance = new BackendClient(serverUrl, token);
  }
  return { configManager: configManagerInstance, backendClient: backendClientInstance };
}

// Tool: get_project_context - Single auth tool that validates token and returns context
export const getProjectContextTool: McpTool = {
  name: 'get_project_context',
  description: 'Get project context including environments and collections. Validates MCP token and returns enriched project data.',
  inputSchema: {
    type: 'object',
    properties: {
      project_id: {
        type: 'string',
        description: 'Project ID to get context for (uses project from config if not provided)'
      }
    }
  }
};

/**
 * Auth tool handlers - Simplified to single get_project_context
 */
export function createAuthToolHandlers(): Record<string, (args: any) => Promise<McpToolResponse>> {
  return {
    [getProjectContextTool.name]: async (args: Record<string, any>) => {
      try {
        const { configManager, backendClient } = await getAuthDependencies();

        // Get project ID from args or config
        let projectId = args.project_id as string | undefined;
        if (!projectId) {
          const config = await configManager.detectProjectConfig();
          projectId = config?.project?.id;
          if (!projectId) {
            throw new Error('Project ID not found in config and not provided in arguments');
          }
        }

        const result = await backendClient.getProjectContext(projectId);

        if (result.success && result.data) {
          // Handle different response formats from backend
          let project: any, environments: any[], collections: any[], user: any;

          if (result.data.project) {
            // Full context response (what we want from project_context endpoint)
            project = result.data.project;
            environments = result.data.environments || [];
            collections = result.data.collections || [];
            user = result.data.user;
          } else {
            // Basic project response (what we get from project endpoint)
            project = result.data;
            environments = [];
            collections = [];
            user = {
              id: project.owner_id,
              token_type: 'mcp',
              authenticated: true
            };
          }

          let contextText = `📁 Project Context Retrieved\n\n`;
          contextText += `🔐 Authentication: ${user?.token_type === 'mcp' ? '✅ MCP Token Validated' : '✅ JWT Authenticated'}\n\n`;

          contextText += `📋 Project Details:\n`;
          contextText += `- Name: ${project.name}\n`;
          contextText += `- ID: ${project.id}\n`;
          if (project.description) {
            contextText += `- Description: ${project.description}\n`;
          }

          if (environments && environments.length > 0) {
            contextText += `\n🌍 Environments (${environments.length}):\n`;
            environments.forEach((env: any) => {
              contextText += `- ${env.name} (${env.id})${env.is_default ? ' [Default]' : ''}\n`;
            });
          }

          if (collections && collections.length > 0) {
            contextText += `\n📚 Collections (${collections.length}):\n`;
            collections.forEach((collection: any) => {
              contextText += `- ${collection.name} (${collection.id})`;
              if (collection.endpoint_count) {
                contextText += ` - ${collection.endpoint_count} endpoints`;
              }
              contextText += '\n';
            });
          }

          return {
            content: [
              {
                type: 'text',
                text: contextText
              }
            ]
          };
        } else {
          return {
            content: [
              {
                type: 'text',
                text: `❌ Failed to get project context: ${result.error || 'Unknown error'}`
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
              text: `❌ Project context error: ${error instanceof Error ? error.message : 'Unknown error'}`
            }
          ],
          isError: true
        };
      }
    }
  };
}

// Export for server integration
export const AUTH_TOOLS: McpTool[] = [
  getProjectContextTool
];

// Legacy compatibility
export const TOOLS: McpTool[] = AUTH_TOOLS;
export class ToolHandlers {
  static async handleGetProjectContext(args?: { project_id?: string }): Promise<McpToolResponse> {
    const handlers = createAuthToolHandlers();
    return handlers.get_project_context(args || {});
  }
}

export function createToolHandlers(config: any): Record<string, (args: any) => Promise<McpToolResponse>> {
  return createAuthToolHandlers();
}