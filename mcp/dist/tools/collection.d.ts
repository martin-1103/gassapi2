import { McpTool } from '../types/mcp.types';
export declare class CollectionTools {
    private configLoader;
    private backendClient;
    constructor();
    private getBackendClient;
    /**
     * List collections for a project
     */
    getCollections(args: {
        projectId?: string;
        includeEndpointCount?: boolean;
        flatten?: boolean;
    }): Promise<{
        content: Array<{
            type: 'text';
            text: string;
        }>;
        isError?: boolean;
    }>;
    /**
     * Create new collection
     */
    createCollection(args: {
        name: string;
        projectId: string;
        parentId?: string;
        description?: string;
    }): Promise<{
        content: Array<{
            type: 'text';
            text: string;
        }>;
        isError?: boolean;
    }>;
    /**
     * Move collection to new parent
     */
    moveCollection(args: {
        collectionId: string;
        newParentId: string;
    }): Promise<{
        content: Array<{
            type: 'text';
            text: string;
        }>;
        isError?: boolean;
    }>;
    /**
     * Delete collection with safety checks
     */
    deleteCollection(args: {
        collectionId: string;
        force?: boolean;
    }): Promise<{
        content: Array<{
            type: 'text';
            text: string;
        }>;
        isError?: boolean;
    }>;
    /**
     * Build collection hierarchy tree
     */
    private buildCollectionTree;
    /**
     * Format collection tree as text
     */
    private formatCollectionTree;
    /**
     * Get collection tools list
     */
    getTools(): McpTool[];
    /**
     * Handle tool calls
     */
    handleToolCall(toolName: string, args: any): Promise<any>;
}
export declare const collectionTools: CollectionTools;
export declare const COLLECTION_TOOLS: McpTool[];
//# sourceMappingURL=collection.d.ts.map