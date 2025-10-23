#!/usr/bin/env node
/**
 * GASSAPI MCP Client Entry Point
 * Main package initialization and CLI interface
 */
import { McpServer } from './server/McpServer';
import { config } from './config';
/**
 * Main MCP Client Application
 */
declare class GassapiMcpClient {
    private server;
    constructor();
    /**
     * Initialize MCP client
     */
    initialize(): Promise<void>;
    /**
     * Start MCP server
     */
    start(): Promise<void>;
    /**
     * Handle graceful shutdown
     */
    shutdown(): Promise<void>;
    /**
     * Get client status
     */
    status(): Promise<void>;
    /**
     * Create sample configuration
     */
    init(projectName?: string, projectId?: string): Promise<void>;
    /**
     * Show help information
     */
    help(): void;
    /**
     * Show version information
     */
    version(): void;
    /**
     * Parse command line arguments
     */
    parseArguments(args: string[]): {
        command: string;
        options: Record<string, string>;
    };
}
export { GassapiMcpClient, McpServer, config };
//# sourceMappingURL=index.d.ts.map