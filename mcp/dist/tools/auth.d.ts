import { McpTool } from '../types/mcp.types.js';
export declare class AuthTools {
    private configLoader;
    private backendClient;
    constructor();
    /**
     * Dapatkan backend client dengan caching biar ga bikin baru terus
     */
    private getBackendClient;
    /**
     * Validasi token MCP dan kembalikan konteks proyek
     * Type-safe implementation dengan proper error handling
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
     * Dapatkan status autentikasi sekarang dengan type-safe implementation
     */
    getAuthStatus(): Promise<{
        content: Array<{
            type: 'text';
            text: string;
        }>;
        isError?: boolean;
    }>;
    /**
     * Dapatkan informasi konteks proyek dengan type-safe implementation
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
     * Refresh autentikasi (bersihin cache dan validasi ulang) dengan proper error handling
     */
    refreshAuth(): Promise<{
        content: Array<{
            type: 'text';
            text: string;
        }>;
        isError?: boolean;
    }>;
    /**
     * Dapatkan daftar tool autentikasi
     */
    getTools(): McpTool[];
    /**
     * Handle pemanggilan tool dengan type-safe argument validation
     */
    handleToolCall(toolName: string, args: Record<string, unknown>): Promise<unknown>;
}
export declare const authTools: AuthTools;
export declare const AUTH_TOOLS: McpTool[];
//# sourceMappingURL=auth.d.ts.map