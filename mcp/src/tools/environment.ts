import { McpTool } from '../types/mcp.types';
import { ConfigLoader } from '../discovery/ConfigLoader';
import { BackendClient } from '../client/BackendClient';

/**
 * Environment Management MCP Tools
 * Handles environment variables and configuration operations
 */

const list_environments: McpTool = {
  name: 'list_environments',
  description: 'List all environments for a project',
  inputSchema: {
    type: 'object',
    properties: {
      projectId: {
        type: 'string',
        description: 'Project UUID (optional, will use config project if not provided)'
      }
    },
    required: [] as string[]
  }
};

const get_environment_variables: McpTool = {
  name: 'get_environment_variables',
  description: 'Get environment variables for a specific environment',
  inputSchema: {
    type: 'object',
    properties: {
      environmentId: {
        type: 'string',
        description: 'Environment UUID'
      },
      includeDisabled: {
        type: 'boolean',
        description: 'Include disabled variables in response',
        default: false
      }
    },
    required: ['environmentId']
  }
};

const set_environment_variable: McpTool = {
  name: 'set_environment_variable',
  description: 'Update or add an environment variable',
  inputSchema: {
    type: 'object',
    properties: {
      environmentId: {
        type: 'string',
        description: 'Environment UUID'
      },
      key: {
        type: 'string',
        description: 'Variable key'
      },
      value: {
        type: 'string',
        description: 'Variable value'
      },
      description: {
        type: 'string',
        description: 'Variable description'
      },
      enabled: {
        type: 'boolean',
        description: 'Whether the variable is enabled',
        default: true
      }
    },
    required: ['environmentId', 'key', 'value']
  }
};

const export_environment: McpTool = {
  name: 'export_environment',
  description: 'Export environment configuration in specified format',
  inputSchema: {
    type: 'object',
    properties: {
      environmentId: {
        type: 'string',
        description: 'Environment UUID'
      },
      format: {
        type: 'string',
        enum: ['json', 'env', 'yaml'],
        description: 'Export format',
        default: 'json'
      },
      includeDisabled: {
        type: 'boolean',
        description: 'Include disabled variables in export',
        default: false
      }
    },
    required: ['environmentId']
  }
};

const import_environment: McpTool = {
  name: 'import_environment',
  description: 'Import environment variables from data',
  inputSchema: {
    type: 'object',
    properties: {
      environmentId: {
        type: 'string',
        description: 'Environment UUID to import into'
      },
      variables: {
        type: 'array',
        description: 'Array of variables to import',
        items: {
          type: 'object',
          properties: {
            key: { type: 'string' },
            value: { type: 'string' },
            description: { type: 'string' },
            enabled: { type: 'boolean', default: true }
          }
        }
      },
      overwrite: {
        type: 'boolean',
        description: 'Overwrite existing variables',
        default: false
      }
    },
    required: ['environmentId', 'variables']
  }
};

export class EnvironmentTools {
  private configLoader: ConfigLoader;
  private backendClient: BackendClient | null = null;

  constructor() {
    this.configLoader = new ConfigLoader();
  }

  private async getBackendClient(): Promise<BackendClient> {
    if (this.backendClient) {
      return this.backendClient;
    }

    const config = await this.configLoader.detectProjectConfig();
    if (!config) {
      throw new Error('No GASSAPI configuration found. Please create gassapi.json in your project root.');
    }

    this.backendClient = new BackendClient(
      this.configLoader.getServerURL(config),
      this.configLoader.getMcpToken(config)
    );

    return this.backendClient;
  }

  /**
   * List environments for a project
   */
  async listEnvironments(args: { projectId?: string }): Promise<{
    content: Array<{ type: 'text'; text: string }>;
    isError?: boolean;
  }> {
    try {
      const config = await this.configLoader.detectProjectConfig();
      if (!config) {
        throw new Error('No GASSAPI configuration found');
      }

      const projectId = args.projectId || config.project.id;
      const client = await this.getBackendClient();
      const result = await client.getEnvironments(projectId);

      if (!result.environments || result.environments.length === 0) {
        return {
          content: [
            {
              type: 'text' as const,
              text: `📋 Environments

Project: ${config.project.name} (${projectId})
Result: No environments found

To create environments:
1. Use set_environment_variable tool
2. Import from existing environment
3. Use web dashboard for visual management`
            }
          ]
        };
      }

      const environmentList = result.environments.map((env: any) =>
        `${env.is_default ? '🟢' : '⚪'} ${env.name} (ID: ${env.id})`
      ).join('\n');

      return {
        content: [
          {
            type: 'text' as const,
            text: `📋 Project Environments

Project: ${config.project.name} (${projectId})
Total Environments: ${result.environments.length}

Environments:
${environmentList}

Use environmentId for other operations. Default environment marked with 🟢`
          }
        ]
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      return {
        content: [
          {
                type: 'text' as const,
                text: `❌ Failed to List Environments

Error: ${errorMessage}

Please check:
1. Project ID is correct
2. MCP token has project access
3. Backend server is accessible`
              }
            ],
        isError: true
      };
    }
  }

  /**
   * Get environment variables
   */
  async getEnvironmentVariables(args: {
    environmentId: string;
    includeDisabled?: boolean
  }): Promise<{
    content: Array<{ type: 'text'; text: string }>;
    isError?: boolean;
  }> {
    try {
      const client = await this.getBackendClient();
      const result = await client.getEnvironmentVariables(args.environmentId);

      if (!result.variables || result.variables.length === 0) {
        return {
          content: [
            {
              type: 'text' as const,
              text: `🔧 Environment Variables

Environment ID: ${args.environmentId}
Result: No variables found

To add variables:
1. Use set_environment_variable tool
2. Import from existing environment
3. Use web dashboard for bulk management`
            }
          ]
        };
      }

      const includeDisabled = args.includeDisabled || false;
      const activeVars = result.variables.filter((v: any) => includeDisabled || v.enabled);
      const disabledVars = result.variables.filter((v: any) => !v.enabled);

      let variablesText = activeVars.map((v: any) =>
        `🟢 ${v.key} = "${v.value}"${v.description ? ` // ${v.description}` : ''}`
      ).join('\n');

      if (includeDisabled && disabledVars.length > 0) {
        variablesText += '\n\n🔴 Disabled Variables:\n';
        variablesText += disabledVars.map((v: any) =>
          `🔴 ${v.key} = "${v.value}"${v.description ? ` // ${v.description}` : ''}`
        ).join('\n');
      }

      return {
        content: [
          {
            type: 'text' as const,
            text: `🔧 Environment Variables

Environment: ${result.environment.name} (${args.environmentId})
Total Variables: ${activeVars.length} (${includeDisabled ? result.variables.length : `${activeVars.length} active`})

Variables:
${variablesText}

Environment variables ready for use in API testing!`
          }
        ]
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      return {
        content: [
          {
            type: 'text' as const,
            text: `❌ Failed to Get Environment Variables

Error: ${errorMessage}

Please check:
1. Environment ID is correct
2. Have access to the environment
3. Backend server is accessible`
          }
        ],
        isError: true
      };
    }
  }

  /**
   * Set environment variable
   */
  async setEnvironmentVariable(args: {
    environmentId: string;
    key: string;
    value: string;
    description?: string;
    enabled?: boolean;
  }): Promise<{
    content: Array<{ type: 'text'; text: string }>;
    isError?: boolean;
  }> {
    try {
      const client = await this.getBackendClient();
      const variableData = {
        environment_id: args.environmentId,
        key: args.key,
        value: args.value,
        description: args.description,
        enabled: args.enabled !== undefined ? args.enabled : true
      };

      const result = await client.setEnvironmentVariable(variableData);

      return {
        content: [
          {
            type: 'text' as const,
            text: `✅ Environment Variable Set

Environment ID: ${args.environmentId}
Variable: ${args.key}
Value: "${args.value}"
Status: ${args.enabled !== false ? '🟢 Enabled' : '🔴 Disabled'}
Description: ${args.description || 'No description'}

Environment variable updated successfully!

Variable will be available in subsequent API tests.`
          }
        ]
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      return {
        content: [
          {
            type: 'text' as const,
            text: `❌ Failed to Set Environment Variable

Error: ${errorMessage}

Please check:
1. Environment ID is valid
2. Variable key and value format
3. Have write access to environment`
          }
        ],
        isError: true
      };
    }
  }

  /**
   * Export environment configuration
   */
  async exportEnvironment(args: {
    environmentId: string;
    format?: 'json' | 'env' | 'yaml';
    includeDisabled?: boolean;
  }): Promise<{
    content: Array<{ type: 'text'; text: string }>;
    isError?: boolean;
  }> {
    try {
      const client = await this.getBackendClient();
      const format = args.format || 'json';
      const result = await client.exportEnvironment(args.environmentId, format);

      const exportData = typeof result.data === 'string' ? result.data : JSON.stringify(result.data, null, 2);

      return {
        content: [
          {
            type: 'text' as const,
            text: `📤 Environment Exported

Environment ID: ${args.environmentId}
Format: ${format.toUpperCase()}
Include Disabled: ${args.includeDisabled ? 'Yes' : 'No'}

Export Data:
${exportData}

Environment configuration exported successfully!`
          }
        ]
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      return {
        content: [
          {
            type: 'text' as const,
            text: `❌ Failed to Export Environment

Error: ${errorMessage}

Please check:
1. Environment ID is valid
2. Export format is supported
3. Have read access to environment`
          }
        ],
        isError: true
      };
    }
  }

  /**
   * Import environment variables
   */
  async importEnvironment(args: {
    environmentId: string;
    variables: Array<{
      key: string;
      value: string;
      description?: string;
      enabled?: boolean;
    }>;
    overwrite?: boolean;
  }): Promise<{
    content: Array<{ type: 'text'; text: string }>;
    isError?: boolean;
  }> {
    try {
      const client = await this.getBackendClient();
      const importData = {
        environment_id: args.environmentId,
        variables: args.variables,
        overwrite: args.overwrite || false
      };

      const result = await client.importEnvironment(importData);

      const successCount = args.variables.length;
      const variablesText = args.variables.map((v: any) =>
        `${v.enabled !== false ? '🟢' : '🔴'} ${v.key} = "${v.value}"${v.description ? ` // ${v.description}` : ''}`
      ).join('\n');

      return {
        content: [
          {
            type: 'text' as const,
            text: `📥 Environment Imported

Environment ID: ${args.environmentId}
Variables Imported: ${successCount}
Overwrite: ${args.overwrite ? 'Yes' : 'No'}

Imported Variables:
${variablesText}

Environment import completed successfully!`
          }
        ]
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      return {
        content: [
          {
            type: 'text' as const,
            text: `❌ Failed to Import Environment

Error: ${errorMessage}

Please check:
1. Environment ID is valid
2. Variable data format is correct
3. Have write access to environment
4. Variable keys don't conflict (when overwrite=false)`
          }
        ],
        isError: true
      };
    }
  }

  /**
   * Get environment tools list
   */
  getTools(): McpTool[] {
    return [
      list_environments,
      get_environment_variables,
      set_environment_variable,
      export_environment,
      import_environment
    ];
  }

  /**
   * Handle tool calls
   */
  async handleToolCall(toolName: string, args: any): Promise<any> {
    switch (toolName) {
      case 'list_environments':
        return this.listEnvironments(args);
      case 'get_environment_variables':
        return this.getEnvironmentVariables(args);
      case 'set_environment_variable':
        return this.setEnvironmentVariable(args);
      case 'export_environment':
        return this.exportEnvironment(args);
      case 'import_environment':
        return this.importEnvironment(args);
      default:
        throw new Error(`Unknown environment tool: ${toolName}`);
    }
  }
}

// Export for MCP server registration
export const environmentTools = new EnvironmentTools();
export const ENVIRONMENT_TOOLS = [
  list_environments,
  get_environment_variables,
  set_environment_variable,
  export_environment,
  import_environment
];