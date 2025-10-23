#!/usr/bin/env node
/**
 * GASSAPI MCP Client Entry Point
 * Titik awal aplikasi MCP Client
 */
import { McpServer } from './server/McpServer.js';
import { config } from './config.js';
import * as readlineSync from 'readline-sync';
/**
 * Main MCP Client Application
 * Aplikasi utama untuk mengelola MCP Client
 */
class GassapiMcpClient {
    constructor() {
        this.server = new McpServer();
    }
    /**
     * Initialize MCP client
     * Inisialisasi client dan validasi konfigurasi
     */
    async initialize() {
        try {
            console.log('🚀 Initializing GASSAPI MCP Client v1.0.0');
            // Load project configuration
            await config.loadProjectConfig();
            if (config.hasProjectConfig()) {
                console.log('✅ Project configuration loaded');
                console.log(`📋 Project: ${config.getProjectName()}`);
                console.log(`🆔 ID: ${config.getProjectId()}`);
                console.log(`🔗 Server: ${config.getServerURL()}`);
                console.log(`🌍 Environment: ${config.getActiveEnvironment()}`);
            }
            else {
                console.log('⚠️ No project configuration found');
                console.log('📝 Create gassapi.json in your project root');
                console.log('💡 Use "gassapi-mcp init" to create sample configuration');
            }
            // Validate configuration if available
            if (config.hasProjectConfig()) {
                const validation = await config.validateConfiguration();
                if (!validation.isValid) {
                    console.log('❌ Configuration validation failed:');
                    validation.errors.forEach(error => console.log(`  - ${error}`));
                    if (validation.warnings.length > 0) {
                        console.log('⚠️ Warnings:');
                        validation.warnings.forEach(warning => console.log(`  - ${warning}`));
                    }
                }
                else {
                    console.log('✅ Configuration is valid');
                    if (validation.warnings.length > 0) {
                        console.log('⚠️ Warnings:');
                        validation.warnings.forEach(warning => console.log(`  - ${warning}`));
                    }
                }
            }
        }
        catch (error) {
            console.error('❌ Initialization failed:', error instanceof Error ? error.message : error);
            throw error;
        }
    }
    /**
     * Start MCP server
     * Menjalankan MCP server
     */
    async start() {
        try {
            await this.initialize();
            await this.server.start();
        }
        catch (error) {
            console.error('❌ Failed to start MCP server:', error instanceof Error ? error.message : error);
            process.exit(1);
        }
    }
    /**
     * Handle graceful shutdown
     * Menangani shutdown dengan aman
     */
    async shutdown() {
        try {
            console.log('🔄 Shutting down GASSAPI MCP Client...');
            await this.server.shutdown();
            console.log('✅ MCP server shut down gracefully');
        }
        catch (error) {
            console.error('❌ Error during shutdown:', error instanceof Error ? error.message : error);
        }
    }
    /**
     * Get client status
     * Menampilkan status client
     */
    async status() {
        try {
            console.log('📊 GASSAPI MCP Client Status');
            console.log('='.repeat(40));
            // Configuration status
            if (config.hasProjectConfig()) {
                console.log('📋 Configuration: ✅ Loaded');
                console.log(`  Project: ${config.getProjectName()} (${config.getProjectId()})`);
                console.log(`  Environment: ${config.getActiveEnvironment()}`);
                console.log(`  Variables: ${Object.keys(config.getEnvironmentVariables()).length} configured`);
            }
            else {
                console.log('📋 Configuration: ❌ Not found');
                console.log('  gassapi.json: Missing in project directory');
            }
            // Server status
            const serverStatus = await this.server.healthCheck();
            console.log(`🤖 Server Status: ${serverStatus.status.toUpperCase()}`);
            if (serverStatus.status === 'ok') {
                console.log(`  Timestamp: ${new Date(serverStatus.timestamp).toISOString()}`);
            }
            else {
                console.log(`  Error: ${serverStatus.error || 'Unknown error'}`);
            }
            console.log('='.repeat(40));
        }
        catch (error) {
            console.error('❌ Failed to get status:', error instanceof Error ? error.message : error);
            process.exit(1);
        }
    }
    /**
     * Create sample configuration
     * Membuat file konfigurasi contoh
     */
    async init(projectName, projectId) {
        try {
            console.log('📝 Creating GASSAPI sample configuration...');
            const name = projectName || readlineSync.question('Enter project name:') || 'My GASSAPI Project';
            const id = projectId || readlineSync.question('Enter project ID:') || 'proj_' + Date.now();
            await config.createSampleConfig(name, id);
            console.log('✅ Sample configuration created successfully!');
            console.log('📁 File: ./gassapi.json');
            console.log('⚠️ Next steps:');
            console.log('  1. Edit gassapi.json with your actual project details');
            console.log('  2. Replace YOUR_MCP_TOKEN_HERE with your actual MCP token');
            console.log('  3. Configure your environment variables');
            console.log('  4. Start MCP client: gassapi-mcp');
        }
        catch (error) {
            console.error('❌ Failed to create sample configuration:', error instanceof Error ? error.message : error);
            process.exit(1);
        }
    }
    /**
     * Show help information
     * Menampilkan informasi bantuan
     */
    help() {
        console.log('🚀 GASSAPI MCP Client v1.0.0');
        console.log('');
        console.log('USAGE:');
        console.log('  gassapi-mcp [command] [options]');
        console.log('');
        console.log('COMMANDS:');
        console.log('  start       Start MCP server (default)');
        console.log('  init        Create sample gassapi.json');
        console.log('  status      Show configuration and server status');
        console.log('  help        Show this help message');
        console.log('  version     Show version information');
        console.log('');
        console.log('OPTIONS:');
        console.log('  --debug     Enable debug logging');
        console.log('  --config     Path to gassapi.json (default: auto-detect)');
        console.log('  --port       Override server port');
        console.log('');
        console.log('EXAMPLES:');
        console.log('  gassapi-mcp start                    # Start with auto-detected config');
        console.log('  gassapi-mcp start --config ./config.json # Start with specific config');
        console.log('  gassapi-mcp init "My API Project"     # Create sample config');
        console.log('  gassapi-mcp status                    # Show current status');
        console.log('');
        console.log('DOCUMENTATION:');
        console.log('  📖 README.md - Complete documentation');
        console.log('  🔧 MCP Tools - Available tools and usage');
        console.log('  ⚙️ Configuration - Configuration options');
        console.log('');
        console.log('SUPPORT:');
        console.log('  🐛 Issues: https://github.com/gassapi/mcp-client/issues');
        console.log('  📚 Docs: https://docs.gassapi.com/mcp-client');
        console.log('  💬 Discord: https://discord.gg/gassapi');
    }
    /**
     * Show version information
     * Menampilkan informasi versi
     */
    version() {
        console.log('🚀 GASSAPI MCP Client v1.0.0');
        console.log('📅 Built: ' + new Date().toISOString().split('T')[0]);
        console.log('🔗 Repository: https://github.com/gassapi/mcp-client');
        console.log('');
        console.log('License: MIT');
        console.log('Author: GASSAPI Team');
    }
    /**
     * Parse command line arguments
     * Parsing argumen command line
     */
    parseArguments(args) {
        const options = {};
        let command = 'start'; // default command
        // Parse arguments
        for (let i = 0; i < args.length; i++) {
            const arg = args[i];
            if (arg.startsWith('--')) {
                // Parse option
                const [key, value] = arg.substring(2).split('=');
                options[key] = value || 'true';
            }
            else if (!arg.includes('-')) {
                // Parse command
                command = arg;
            }
        }
        return { command, options };
    }
}
// Main execution function
// Fungsi utama untuk eksekusi
async function main() {
    const args = process.argv.slice(2);
    const client = new GassapiMcpClient();
    if (args.length === 0) {
        // Default: start MCP server
        await client.start();
        return;
    }
    const { command, options } = client.parseArguments(args);
    switch (command) {
        case 'start':
            console.log('🚀 Starting GASSAPI MCP Server...');
            await client.start();
            break;
        case 'init': {
            const projectName = args[1];
            const projectId = options.project;
            await client.init(projectName, projectId);
            break;
        }
        case 'status':
            await client.status();
            break;
        case 'help':
        case '--help':
        case '-h':
            client.help();
            break;
        case 'version':
        case '--version':
        case '-v':
            client.version();
            break;
        default:
            console.error(`❌ Unknown command: ${command}`);
            console.error('Use "gassapi-mcp help" for usage information');
            process.exit(1);
    }
}
// Handle process signals for graceful shutdown
// Menangani sinyal proses untuk shutdown yang aman
process.on('SIGINT', async () => {
    console.log('\n🔄 Received SIGINT, shutting down gracefully...');
    const client = new GassapiMcpClient();
    await client.shutdown();
    process.exit(0);
});
process.on('SIGTERM', async () => {
    console.log('\n🔄 Received SIGTERM, shutting down gracefully...');
    const client = new GassapiMcpClient();
    await client.shutdown();
    process.exit(0);
});
// Handle uncaught exceptions
// Menangani exception yang tidak ter-catch
process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
    process.exit(1);
});
process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Promise Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});
// Export for external usage
export { GassapiMcpClient, McpServer, config };
// Run if called directly
// Jalankan jika dipanggil langsung
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(error => {
        console.error('❌ Fatal error:', error);
        process.exit(1);
    });
}
//# sourceMappingURL=index.js.map