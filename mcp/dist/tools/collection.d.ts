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
     * Pindahkan koleksi ke parent baru
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
     * Hapus koleksi dengan pemeriksaan keamanan
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
     * Bangun hierarchy tree koleksi dengan type safety
     */
    private buildCollectionTree;
    /**
     * Format collection tree sebagai text
     */
    private formatCollectionTree;
    /**
     * Dapatkan daftar tool koleksi
     */
    getTools(): McpTool[];
    /**
     * Handle pemanggilan tool
     */
    handleToolCall(toolName: string, args: Record<string, unknown>): Promise<unknown>;
}
export declare const collectionTools: CollectionTools;
export declare const COLLECTION_TOOLS: McpTool[];
//# sourceMappingURL=collection.d.ts.map