import { McpTool } from '../types/mcp.types.js';
export declare class EndpointTools {
    private configLoader;
    private backendClient;
    constructor();
    private getBackendClient;
    /**
     * Validasi HTTP method string ke HttpMethod type yang valid
     */
    private validateHttpMethod;
    /**
     * Ambil detail informasi endpoint
     */
    getEndpointDetails(args: {
        endpointId: string;
        includeCollection?: boolean;
    }): Promise<{
        content: Array<{
            type: 'text';
            text: string;
        }>;
        isError?: boolean;
    }>;
    /**
     * Buat endpoint baru
     */
    createEndpoint(args: {
        name: string;
        method: string;
        url: string;
        headers?: Record<string, string>;
        body?: Record<string, unknown> | unknown[] | string | null;
        collectionId: string;
        description?: string;
    }): Promise<{
        content: Array<{
            type: 'text';
            text: string;
        }>;
        isError?: boolean;
    }>;
    /**
     * Update endpoint yang sudah ada
     */
    updateEndpoint(args: {
        endpointId: string;
        name?: string;
        method?: string;
        url?: string;
        headers?: Record<string, string>;
        body?: Record<string, unknown> | unknown[] | string | null;
        description?: string;
    }): Promise<{
        content: Array<{
            type: 'text';
            text: string;
        }>;
        isError?: boolean;
    }>;
    /**
     * Pindahkan endpoint ke collection lain
     */
    moveEndpoint(args: {
        endpointId: string;
        newCollectionId: string;
    }): Promise<{
        content: Array<{
            type: 'text';
            text: string;
        }>;
        isError?: boolean;
    }>;
    /**
     * Tampilkan semua endpoint dengan filter opsional
     */
    listEndpoints(args: {
        collectionId?: string;
        projectId?: string;
    }): Promise<{
        content: Array<{
            type: 'text';
            text: string;
        }>;
        isError?: boolean;
    }>;
    /**
     * Ambil daftar tools endpoint
     */
    getTools(): McpTool[];
    /**
     * Handle pemanggilan tool
     */
    handleToolCall(toolName: string, args: Record<string, unknown>): Promise<unknown>;
}
export declare const endpointTools: EndpointTools;
export declare const ENDPOINT_TOOLS: McpTool[];
//# sourceMappingURL=endpoint.d.ts.map