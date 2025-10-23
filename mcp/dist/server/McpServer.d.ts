import { McpTool, McpServerStatus } from '../types/mcp.types';
/**
 * GASSAPI MCP Server
 * Implements Model Context Protocol for Claude Desktop integration
 */
export declare class McpServer {
    private server;
    private tools;
    private config;
    constructor();
    /**
     * Register all available tools
     */
    private registerAllTools;
    /**
     * Start MCP server with stdio transport
     */
    start(): Promise<void>;
    /**
     * Handle MCP initialize request
     */
    private handleInitialize;
    /**
     * Handle tools/list request
     */
    private handleListTools;
    /**
     * Handle tools/call request
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
     * Graceful shutdown
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