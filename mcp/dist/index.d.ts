#!/usr/bin/env node
/**
 * GASSAPI MCP Client Entry Point
 * Titik awal aplikasi MCP Client
 */
import { McpServer } from './server/McpServer.js';
import { config } from './config.js';
/**
 * Main MCP Client Application
 * Aplikasi utama untuk mengelola MCP Client
 */
declare class GassapiMcpClient {
    private server;
    constructor();
    /**
     * Initialize MCP client
     * Inisialisasi client dan validasi konfigurasi
     */
    initialize(): Promise<void>;
    /**
     * Start MCP server
     * Menjalankan MCP server
     */
    start(): Promise<void>;
    /**
     * Handle graceful shutdown
     * Menangani shutdown dengan aman
     */
    shutdown(): Promise<void>;
    /**
     * Get client status
     * Menampilkan status client
     */
    status(): Promise<void>;
    /**
     * Create sample configuration
     * Membuat file konfigurasi contoh
     */
    init(projectName?: string, projectId?: string): Promise<void>;
    /**
     * Show help information
     * Menampilkan informasi bantuan
     */
    help(): void;
    /**
     * Show version information
     * Menampilkan informasi versi
     */
    version(): void;
    /**
     * Parse command line arguments
     * Parsing argumen command line
     */
    parseArguments(args: string[]): {
        command: string;
        options: Record<string, string>;
    };
}
export { GassapiMcpClient, McpServer, config };
//# sourceMappingURL=index.d.ts.map