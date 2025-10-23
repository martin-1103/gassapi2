import { McpTool } from '../types/mcp.types';
export declare class EndpointTools {
    private configLoader;
    private backendClient;
    constructor();
    private getBackendClient;
    /**
     * Get detailed endpoint information
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
     * Create new endpoint
     */
    createEndpoint(args: {
        name: string;
        method: string;
        url: string;
        headers?: Record<string, string>;
        body?: any;
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
     * Update existing endpoint
     */
    updateEndpoint(args: {
        endpointId: string;
        name?: string;
        method?: string;
        url?: string;
        headers?: Record<string, string>;
        body?: any;
        description?: string;
    }): Promise<{
        content: Array<{
            type: 'text';
            text: string;
        }>;
        isError?: boolean;
    }>;
    /**
     * Move endpoint to different collection
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
     * List all endpoints with optional filtering
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
     * Get endpoint tools list
     */
    getTools(): McpTool[];
    /**
     * Handle tool calls
     */
    handleToolCall(toolName: string, args: any): Promise<any>;
}
export declare const endpointTools: EndpointTools;
export declare const ENDPOINT_TOOLS: McpTool[];
//# sourceMappingURL=endpoint.d.ts.map