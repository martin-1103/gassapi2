import { McpTool } from '../types/mcp.types';
export declare class EnvironmentTools {
    private configLoader;
    private backendClient;
    constructor();
    private getBackendClient;
    /**
     * List environments for a project
     */
    listEnvironments(args: {
        projectId?: string;
    }): Promise<{
        content: Array<{
            type: 'text';
            text: string;
        }>;
        isError?: boolean;
    }>;
    /**
     * Get environment variables
     */
    getEnvironmentVariables(args: {
        environmentId: string;
        includeDisabled?: boolean;
    }): Promise<{
        content: Array<{
            type: 'text';
            text: string;
        }>;
        isError?: boolean;
    }>;
    /**
     * Set environment variable
     */
    setEnvironmentVariable(args: {
        environmentId: string;
        key: string;
        value: string;
        description?: string;
        enabled?: boolean;
    }): Promise<{
        content: Array<{
            type: 'text';
            text: string;
        }>;
        isError?: boolean;
    }>;
    /**
     * Export environment configuration
     */
    exportEnvironment(args: {
        environmentId: string;
        format?: 'json' | 'env' | 'yaml';
        includeDisabled?: boolean;
    }): Promise<{
        content: Array<{
            type: 'text';
            text: string;
        }>;
        isError?: boolean;
    }>;
    /**
     * Import environment variables
     */
    importEnvironment(args: {
        environmentId: string;
        variables: Array<{
            key: string;
            value: string;
            description?: string;
            enabled?: boolean;
        }>;
        overwrite?: boolean;
    }): Promise<{
        content: Array<{
            type: 'text';
            text: string;
        }>;
        isError?: boolean;
    }>;
    /**
     * Get environment tools list
     */
    getTools(): McpTool[];
    /**
     * Handle tool calls
     */
    handleToolCall(toolName: string, args: Record<string, unknown>): Promise<unknown>;
}
export declare const environmentTools: EnvironmentTools;
export declare const ENVIRONMENT_TOOLS: McpTool[];
//# sourceMappingURL=environment.d.ts.map