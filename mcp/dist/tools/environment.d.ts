import { McpTool } from '../types/mcp.types';
export declare class EnvironmentTools {
    private configLoader;
    private backendClient;
    constructor();
    private getBackendClient;
    /**
     * Tampilin environment buat sebuah project
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
     * Ambil variabel environment
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
     * Set variabel environment
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
     * Export konfigurasi environment
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
     * Import variabel environment
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
     * Ambil daftar tool environment
     */
    getTools(): McpTool[];
    /**
     * Handle pemanggilan tool
     */
    handleToolCall(toolName: string, args: Record<string, unknown>): Promise<unknown>;
}
export declare const environmentTools: EnvironmentTools;
export declare const ENVIRONMENT_TOOLS: McpTool[];
//# sourceMappingURL=environment.d.ts.map