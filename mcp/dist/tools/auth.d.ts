import { McpTool } from '../types/mcp.types';
export declare class AuthTools {
    private configLoader;
    private backendClient;
    constructor();
    private getBackendClient;
    /**
     * Validate MCP token and return project context
     */
    validateMcpToken(args: {
        token?: string;
    }): Promise<{
        content: Array<{
            type: 'text';
            text: string;
        }>;
        isError?: boolean;
    }>;
    /**
     * Get current authentication status
     */
    getAuthStatus(): Promise<{
        content: Array<{
            type: 'text';
            text: string;
        }>;
        isError?: boolean;
    }>;
    /**
     * Get project context information
     */
    getProjectContext(args: {
        project_id?: string;
    }): Promise<{
        content: Array<{
            type: 'text';
            text: string;
        }>;
        isError?: boolean;
    }>;
    /**
     * Refresh authentication (clear cache and re-validate)
     */
    refreshAuth(): Promise<{
        content: Array<{
            type: 'text';
            text: string;
        }>;
        isError?: boolean;
    }>;
    /**
     * Get authentication tools list
     */
    getTools(): McpTool[];
    /**
     * Handle tool calls
     */
    handleToolCall(toolName: string, args: Record<string, unknown>): Promise<unknown>;
}
export declare const authTools: AuthTools;
export declare const AUTH_TOOLS: McpTool[];
//# sourceMappingURL=auth.d.ts.map