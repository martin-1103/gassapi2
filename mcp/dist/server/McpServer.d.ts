import { McpTool, McpServerStatus } from '../types/mcp.types.js';
/**
 * GASSAPI MCP Server
 * Implementasi Model Context Protocol buat Claude Desktop integration
 *
 * Server ini nanganin komunikasi antara MCP client dan backend GASSAPI
 * Pake proper logging instead of console.log biar lebih rapih
 */
export declare class McpServer {
    private server;
    private tools;
    private config;
    constructor();
    /**
     * Daftarin semua tools yang tersedia
     * Tools ini dipake buat handle berbagai operasi di backend GASSAPI
     */
    private registerAllTools;
    /**
     * Nyalain MCP server pake stdio transport
     * Server bakal jalan dan nunggu commands dari Claude Desktop
     */
    start(): Promise<void>;
    /**
     * Nanganin MCP initialize request
     * Validate protocol version dan setup capabilities
     */
    private handleInitialize;
    /**
     * Nanganin tools/list request
     * Kembaliin daftar semua tools yang tersedia buat client
     */
    private handleListTools;
    /**
     * Nanganin tools/call request
     * Jalankan tool yang diminta sama client dan kembaliin hasilnya
     */
    private handleToolCall;
    /**
     * Check if protocol version is supported
     */
    private isProtocolVersionSupported;
    /**
     * Get server status
     */
    getStatus(): {
        name: string;
        version: string;
        toolsCount: number;
        status: string;
    };
    /**
     * Get available tools by category
     */
    getToolsByCategory(): {
        authentication: McpTool[];
        environment: McpTool[];
        collection: McpTool[];
        endpoint: McpTool[];
        testing: McpTool[];
        flow: McpTool[];
    };
    /**
     * Add custom tool (for future extensions)
     */
    addCustomTool(tool: McpTool): void;
    /**
     * Remove tool by name
     */
    removeTool(toolName: string): boolean;
    /**
     * Matiin server dengan cara yang aman
     * Cleanup semua resources dan close connections
     */
    shutdown(): Promise<void>;
    /**
     * Health check for monitoring
     */
    healthCheck(): Promise<McpServerStatus>;
    /**
     * Get server info for debugging
     */
    getDebugInfo(): {
        server: any;
        tools: Array<{
            name: string;
            description: string;
            category: string;
        }>;
        config: any;
    };
}
//# sourceMappingURL=McpServer.d.ts.map