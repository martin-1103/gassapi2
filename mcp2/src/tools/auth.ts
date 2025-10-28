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
    if (!token) {
      throw new Error('Missing token in configuration');
    }
    backendClientInstance = new BackendClient(token);
  }
  return { configManager: configManagerInstance, backendClient: backendClientInstance };
}

// Tool: get_project_context - Single auth tool that validates token and returns context
export const getProjectContextTool: McpTool = {
  name: 'get_project_context',
  description: 'Get project context including environments and folders. Validates MCP token and returns enriched project data.',
  inputSchema: {
    type: 'object',
    properties: {}
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

        // Get project ID from config
        const config = await configManager.detectProjectConfig();
        console.error('[AUTH] Config loaded:', JSON.stringify(config, null, 2));
        if (!config) {
          throw new Error('No configuration found - make sure gassapi.json exists');
        }
        const projectId = config?.project?.id;
        if (!projectId) {
          throw new Error('Project ID not found in gassapi.json configuration');
        }

        const result = await backendClient.getProjectContext(projectId);

        if (result.success && result.data) {
          // Handle different response formats from backend
          let project: any, environments: any[], folders: any[], user: any;

          if (result.data.project) {
            // Full context response (what we want from project_context endpoint)
            project = result.data.project;
            environments = result.data.environments || [];
            folders = result.data.folders || [];
            user = result.data.user;
          } else {
            // Basic project response (what we get from project endpoint)
            project = result.data;
            environments = [];
            folders = [];
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

          if (folders && folders.length > 0) {
            contextText += `\n📚 Folders (${folders.length}):\n`;
            folders.forEach((folder: any) => {
              contextText += `- ${folder.name} (${folder.id})`;
              if (folder.endpoint_count) {
                contextText += ` - ${folder.endpoint_count} endpoints`;
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
  static async handleGetProjectContext(): Promise<McpToolResponse> {
    const handlers = createAuthToolHandlers();
    return handlers.get_project_context({});
  }
}

export function createToolHandlers(config: any): Record<string, (args: any) => Promise<McpToolResponse>> {
  return createAuthToolHandlers();
}