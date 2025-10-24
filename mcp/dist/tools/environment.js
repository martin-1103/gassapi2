import { ConfigLoader } from '../discovery/ConfigLoader.js';
import { BackendClient } from '../client/BackendClient.js';
/**
 * Tool MCP buat ngelola environment
 * Handle operasi variabel environment dan konfigurasi
 */
const list_environments = {
    name: 'list_environments',
    description: 'Tampilin semua environment yang ada di project',
    inputSchema: {
        type: 'object',
        properties: {
            projectId: {
                type: 'string',
                description: 'UUID project (opsional, bakal pake config project kalo ga dikasih)'
            }
        },
        required: []
    }
};
const get_environment_variables = {
    name: 'get_environment_variables',
    description: 'Ambil variabel environment dari environment tertentu',
    inputSchema: {
        type: 'object',
        properties: {
            environmentId: {
                type: 'string',
                description: 'UUID environment'
            },
            includeDisabled: {
                type: 'boolean',
                description: 'Sertakan variabel yang disabled di respons',
                default: false
            }
        },
        required: ['environmentId']
    }
};
const set_environment_variable = {
    name: 'set_environment_variable',
    description: 'Update atau tambah variabel environment',
    inputSchema: {
        type: 'object',
        properties: {
            environmentId: {
                type: 'string',
                description: 'UUID environment'
            },
            key: {
                type: 'string',
                description: 'Key variabel'
            },
            value: {
                type: 'string',
                description: 'Value variabel'
            },
            description: {
                type: 'string',
                description: 'Deskripsi variabel'
            },
            enabled: {
                type: 'boolean',
                description: 'Status variabel aktif atau nggak',
                default: true
            }
        },
        required: ['environmentId', 'key', 'value']
    }
};
const export_environment = {
    name: 'export_environment',
    description: 'Export konfigurasi environment dalam format tertentu',
    inputSchema: {
        type: 'object',
        properties: {
            environmentId: {
                type: 'string',
                description: 'UUID environment'
            },
            format: {
                type: 'string',
                enum: ['json', 'env', 'yaml'],
                description: 'Format export',
                default: 'json'
            },
            includeDisabled: {
                type: 'boolean',
                description: 'Sertakan variabel disabled di export',
                default: false
            }
        },
        required: ['environmentId']
    }
};
const import_environment = {
    name: 'import_environment',
    description: 'Import variabel environment dari data',
    inputSchema: {
        type: 'object',
        properties: {
            environmentId: {
                type: 'string',
                description: 'UUID environment buat diimport'
            },
            variables: {
                type: 'array',
                description: 'Array variabel yang mau diimport',
                items: {
                    type: 'object',
                    description: 'Data variabel environment'
                }
            },
            overwrite: {
                type: 'boolean',
                description: 'Timpa variabel yang udah ada',
                default: false
            }
        },
        required: ['environmentId', 'variables']
    }
};
export class EnvironmentTools {
    constructor() {
        this.backendClient = null;
        this.configLoader = new ConfigLoader();
    }
    async getBackendClient() {
        if (this.backendClient) {
            return this.backendClient;
        }
        const config = await this.configLoader.detectProjectConfig();
        if (!config) {
            throw new Error('No GASSAPI configuration found. Please create gassapi.json in your project root.');
        }
        this.backendClient = new BackendClient(this.configLoader.getServerURL(config), this.configLoader.getMcpToken(config));
        return this.backendClient;
    }
    /**
     * Tampilin environment buat sebuah project
     */
    async listEnvironments(args) {
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
                            type: 'text',
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
            const environmentList = result.environments.map((env) => `${env.is_default ? '🟢' : '⚪'} ${env.name} (ID: ${env.id})`).join('\n');
            return {
                content: [
                    {
                        type: 'text',
                        text: `📋 Project Environments

Project: ${config.project.name} (${projectId})
Total Environments: ${result.environments.length}

Environments:
${environmentList}

Use environmentId for other operations. Default environment marked with 🟢`
                    }
                ]
            };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            return {
                content: [
                    {
                        type: 'text',
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
     * Ambil variabel environment
     */
    async getEnvironmentVariables(args) {
        try {
            const client = await this.getBackendClient();
            const result = await client.getEnvironmentVariables(args.environmentId);
            if (!result.variables || result.variables.length === 0) {
                return {
                    content: [
                        {
                            type: 'text',
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
            const activeVars = result.variables.filter((v) => includeDisabled || v.enabled);
            const disabledVars = result.variables.filter((v) => !v.enabled);
            let variablesText = activeVars.map((v) => `🟢 ${v.key} = "${v.value}"${v.description ? ` // ${v.description}` : ''}`).join('\n');
            if (includeDisabled && disabledVars.length > 0) {
                variablesText += '\n\n🔴 Disabled Variables:\n';
                variablesText += disabledVars.map((v) => `🔴 ${v.key} = "${v.value}"${v.description ? ` // ${v.description}` : ''}`).join('\n');
            }
            return {
                content: [
                    {
                        type: 'text',
                        text: `🔧 Environment Variables

Environment: ${result.environment.name} (${args.environmentId})
Total Variables: ${activeVars.length} (${includeDisabled ? result.variables.length : `${activeVars.length} active`})

Variables:
${variablesText}

Environment variables ready for use in API testing!`
                    }
                ]
            };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            return {
                content: [
                    {
                        type: 'text',
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
     * Set variabel environment
     */
    async setEnvironmentVariable(args) {
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
            if (!result.success) {
                throw new Error('Failed to set environment variable');
            }
            return {
                content: [
                    {
                        type: 'text',
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
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            return {
                content: [
                    {
                        type: 'text',
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
     * Export konfigurasi environment
     */
    async exportEnvironment(args) {
        try {
            const client = await this.getBackendClient();
            const format = args.format || 'json';
            const result = await client.exportEnvironment(args.environmentId, format);
            const exportData = typeof result.content === 'string' ? result.content : JSON.stringify(result.content, null, 2);
            return {
                content: [
                    {
                        type: 'text',
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
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            return {
                content: [
                    {
                        type: 'text',
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
     * Import variabel environment
     */
    async importEnvironment(args) {
        try {
            const client = await this.getBackendClient();
            const importData = {
                environment_id: args.environmentId,
                variables: args.variables.map(v => ({
                    key: v.key,
                    value: v.value,
                    description: v.description,
                    enabled: v.enabled !== undefined ? v.enabled : true
                })),
                overwrite: args.overwrite || false
            };
            const result = await client.importEnvironment(importData);
            if (!result.success) {
                throw new Error('Failed to import environment variables');
            }
            const successCount = result.imported || args.variables.length;
            const variablesText = args.variables.map((v) => `${v.enabled !== false ? '🟢' : '🔴'} ${v.key} = "${v.value}"${v.description ? ` // ${v.description}` : ''}`).join('\n');
            return {
                content: [
                    {
                        type: 'text',
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
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            return {
                content: [
                    {
                        type: 'text',
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
     * Ambil daftar tool environment
     */
    getTools() {
        return [
            list_environments,
            get_environment_variables,
            set_environment_variable,
            export_environment,
            import_environment
        ];
    }
    /**
     * Handle pemanggilan tool
     */
    async handleToolCall(toolName, args) {
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
//# sourceMappingURL=environment.js.map