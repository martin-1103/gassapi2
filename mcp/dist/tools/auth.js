import { ConfigLoader } from '../discovery/ConfigLoader';
import { BackendClient } from '../client/BackendClient';
/**
 * Authentication MCP Tools
 * Handles token validation and authentication operations
 */
const validate_mcp_token = {
    name: 'validate_mcp_token',
    description: 'Validate MCP token and get project context information',
    inputSchema: {
        type: 'object',
        properties: {
            token: {
                type: 'string',
                description: 'MCP token to validate (optional, will use config file if not provided)'
            }
        },
        required: []
    }
};
export class AuthTools {
    constructor() {
        this.backendClient = null;
        this.configLoader = new ConfigLoader();
    }
    async getBackendClient(token) {
        if (this.backendClient) {
            return this.backendClient;
        }
        // Try to get token from parameter or config
        let mcpToken;
        if (token) {
            mcpToken = token;
        }
        else {
            // Load from configuration
            const config = await this.configLoader.detectProjectConfig();
            if (!config) {
                throw new Error('No GASSAPI configuration found. Please create gassapi.json in your project root.');
            }
            mcpToken = this.configLoader.getMcpToken(config);
        }
        if (!mcpToken) {
            throw new Error('No MCP token available. Please provide token or ensure gassapi.json contains valid token.');
        }
        // Get server URL from config
        const config = await this.configLoader.detectProjectConfig();
        if (!config) {
            throw new Error('No GASSAPI configuration found');
        }
        const serverURL = this.configLoader.getServerURL(config);
        this.backendClient = new BackendClient(serverURL, mcpToken);
        return this.backendClient;
    }
    /**
     * Validate MCP token and return project context
     */
    async validateMcpToken(args) {
        try {
            const client = await this.getBackendClient(args.token);
            const result = await client.validateToken();
            const response = {
                content: [
                    {
                        type: 'text',
                        text: `✅ MCP Token Valid

Project Information:
- ID: ${result.project?.id || 'N/A'}
- Name: ${result.project?.name || 'N/A'}

Environment:
- Active: ${result.environment?.name || 'N/A'}
- Variables: ${Object.keys(result.environment?.variables || {}).length} configured

Token Status: Valid
Last Validated: ${result.lastValidatedAt || 'N/A'}

Ready for GASSAPI operations!`
                    }
                ]
            };
            console.log('MCP Token validated successfully');
            return response;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown validation error';
            const response = {
                content: [
                    {
                        type: 'text',
                        text: `❌ MCP Token Validation Failed

Error: ${errorMessage}

Please check:
1. Token is correct and active
2. gassapi.json exists in project root
3. Backend server is accessible

Token validation failed!`
                    }
                ],
                isError: true
            };
            console.error('MCP Token validation failed:', error);
            return response;
        }
    }
    /**
     * Get current authentication status
     */
    async getAuthStatus() {
        try {
            const config = await this.configLoader.detectProjectConfig();
            if (!config) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `📋 Authentication Status

Configuration: ❌ Not Found
- gassapi.json: Not found in parent directories

To setup:
1. Create project via GASSAPI web dashboard
2. Generate MCP configuration
3. Save as gassapi.json in project root`
                        }
                    ]
                };
            }
            // Test token validity
            try {
                const client = await this.getBackendClient();
                const result = await client.validateToken();
                return {
                    content: [
                        {
                            type: 'text',
                            text: `📋 Authentication Status

Configuration: ✅ Found
- gassapi.json: Located and valid
- Project: ${config.project.name} (${config.project.id})
- Server: ${this.configLoader.getServerURL(config)}

Token: ✅ Valid
- Project Access: Granted
- Last Validated: ${result.lastValidatedAt || 'First time'}

Status: 🟢 Ready for GASSAPI operations`
                        }
                    ]
                };
            }
            catch (error) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `📋 Authentication Status

Configuration: ✅ Found
- gassapi.json: Located
- Project: ${config.project.name} (${config.project.id})
- Server: ${this.configLoader.getServerURL(config)}

Token: ❌ Invalid
- Error: ${error instanceof Error ? error.message : 'Unknown error'}
- Status: Not authenticated

Please check token or regenerate MCP configuration`
                        }
                    ],
                    isError: true
                };
            }
        }
        catch (error) {
            return {
                content: [
                    {
                        type: 'text',
                        text: `📋 Authentication Status

Configuration: ❌ Error
- Error: ${error instanceof Error ? error.message : 'Unknown error'}

Please check gassapi.json configuration file`
                    }
                ],
                isError: true
            };
        }
    }
    /**
     * Get project context information
     */
    async getProjectContext(args) {
        try {
            const config = await this.configLoader.detectProjectConfig();
            if (!config) {
                throw new Error('No GASSAPI configuration found');
            }
            const projectId = args.project_id || config.project.id;
            const client = await this.getBackendClient();
            const context = await client.getProjectContext(projectId);
            const environments = context.environments.map((env) => `- ${env.name} (ID: ${env.id}, Default: ${env.is_default ? 'Yes' : 'No'})`).join('\n');
            const collections = context.collections ? context.collections.map((col) => `- ${col.name} (ID: ${col.id}, Endpoints: ${col.endpoints?.length || 0})`).join('\n') : 'No collections found';
            return {
                content: [
                    {
                        type: 'text',
                        text: `📋 Project Context

Project: ${context.project.name} (${context.project.id})
Description: ${context.project.description || 'No description'}

Environments (${context.environments.length}):
${environments}

Collections (${context.collections?.length || 0}):
${collections}

Status: 🟢 Project loaded successfully`
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
                        text: `❌ Failed to Load Project Context

Error: ${errorMessage}

Please check:
1. Project ID is correct
2. MCP token is valid
3. Have access to the project

Project context loading failed!`
                    }
                ],
                isError: true
            };
        }
    }
    /**
     * Refresh authentication (clear cache and re-validate)
     */
    async refreshAuth() {
        try {
            // Clear caches
            await this.configLoader.clearCache();
            this.backendClient = null;
            // Re-validate token
            await this.validateMcpToken({});
            return {
                content: [
                    {
                        type: 'text',
                        text: `🔄 Authentication Refreshed

Caches: ✅ Cleared
Token: ✅ Re-validated
Status: 🟢 Ready for fresh operations

Authentication cache cleared and token re-validated!`
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
                        text: `❌ Authentication Refresh Failed

Error: ${errorMessage}

Please check your configuration and try again.

Authentication refresh failed!`
                    }
                ],
                isError: true
            };
        }
    }
    /**
     * Get authentication tools list
     */
    getTools() {
        return [validate_mcp_token];
    }
    /**
     * Handle tool calls
     */
    async handleToolCall(toolName, args) {
        switch (toolName) {
            case 'validate_mcp_token':
                return this.validateMcpToken(args);
            default:
                throw new Error(`Unknown authentication tool: ${toolName}`);
        }
    }
}
// Export for MCP server registration
export const authTools = new AuthTools();
export const AUTH_TOOLS = [validate_mcp_token];
//# sourceMappingURL=auth.js.map