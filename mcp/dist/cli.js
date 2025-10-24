#!/usr/bin/env node
/**
 * GASSAPI MCP Client CLI Entry Point
 * Command line interface for the MCP client
 */
import * as readline from 'readline';
import { config } from './config.js';
import { logger, initializeLogger } from './utils/Logger.js';
/**
 * CLI application class
 */
class GassapiMcpCli {
    /**
     * Main CLI entry point
     */
    static async main() {
        try {
            // Initialize logger
            initializeLogger();
            // Parse command line arguments
            const args = process.argv.slice(2);
            const command = args[0] || 'help';
            logger.cli('🚀 GASSAPI MCP Client CLI', 'info');
            switch (command) {
                case 'start':
                    await GassapiMcpCli.startServer();
                    break;
                case 'init':
                    await GassapiMcpCli.initConfig();
                    break;
                case 'status':
                    await GassapiMcpCli.showStatus();
                    break;
                case 'validate':
                    await GassapiMcpCli.validateConfig();
                    break;
                case 'test':
                    await GassapiMcpCli.testConnection();
                    break;
                case 'clear-cache':
                    await GassapiMcpCli.clearCache();
                    break;
                case 'help':
                case '--help':
                case '-h':
                    GassapiMcpCli.showHelp();
                    break;
                case 'version':
                case '--version':
                case '-v':
                    GassapiMcpCli.showVersion();
                    break;
                default:
                    logger.cli(`❌ Unknown command: ${command}`, 'error');
                    logger.cli('Use "gassapi-mcp help" for available commands', 'error');
                    process.exit(1);
            }
        }
        catch (error) {
            logger.cli('❌ CLI Error: ' + (error instanceof Error ? error.message : 'Unknown error'), 'error');
            process.exit(1);
        }
    }
    /**
     * Start MCP server
     */
    static async startServer() {
        logger.cli('🤖 Starting MCP Server...', 'info');
        try {
            // Load configuration first
            await config.loadProjectConfig();
            if (!config.hasProjectConfig()) {
                logger.cli('❌ No GASSAPI configuration found', 'error');
                logger.cli('Please create gassapi.json in your project root or run "gassapi-mcp init"', 'error');
                process.exit(1);
            }
            const summary = config.getConfigurationSummary();
            logger.cli(`📋 Project: ${summary.projectName} (${summary.projectId})`, 'info');
            logger.cli(`🔗 Server: ${summary.serverUrl}`, 'info');
            logger.cli(`🌍 Environment: ${summary.environmentActive}`, 'info');
            logger.cli(`🔧 Variables: ${summary.variableCount}`, 'info');
            // Import and start server
            const { GassapiMcpClient } = await import('./index.js');
            const client = new GassapiMcpClient();
            await client.start();
        }
        catch (error) {
            logger.cli('❌ Failed to start MCP server: ' + (error instanceof Error ? error.message : 'Unknown error'), 'error');
            process.exit(1);
        }
    }
    /**
     * Initialize sample configuration
     */
    static async initConfig() {
        logger.cli('📝 Initializing GASSAPI configuration...', 'info');
        // readline already imported above
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        try {
            const projectName = await new Promise((resolve) => {
                rl.question('Project name: ', resolve);
            });
            const projectId = await new Promise((resolve) => {
                rl.question('Project ID (optional): ', resolve);
            }) || 'proj_' + Date.now();
            rl.close();
            await config.createSampleConfig(projectName, projectId);
            logger.cli('✅ Configuration initialized successfully!', 'success');
            logger.cli('');
            logger.cli('📁 File created: ./gassapi.json', 'info');
            logger.cli('⚠️  Next steps:', 'warning');
            logger.cli('   1. Edit gassapi.json with your actual project details', 'info');
            logger.cli('   2. Replace YOUR_MCP_TOKEN_HERE with your actual MCP token', 'info');
            logger.cli('   3. Configure environment variables', 'info');
            logger.cli('   4. Start MCP server: gassapi-mcp start', 'info');
        }
        catch (error) {
            logger.cli('❌ Failed to initialize configuration: ' + (error instanceof Error ? error.message : 'Unknown error'), 'error');
            process.exit(1);
        }
    }
    /**
     * Show current status
     */
    static async showStatus() {
        logger.cli('📊 GASSAPI MCP Client Status', 'info');
        logger.cli('='.repeat(50), 'info');
        try {
            // Load configuration
            await config.loadProjectConfig();
            if (!config.hasProjectConfig()) {
                logger.cli('📋 Configuration: ❌ Not found', 'error');
                logger.cli('📄 gassapi.json: Missing in project directory', 'error');
                logger.cli('');
                logger.cli('💡 To setup:', 'info');
                logger.cli('   1. Run: gassapi-mcp init', 'info');
                logger.cli('   2. Edit generated gassapi.json', 'info');
                logger.cli('   3. Start: gassapi-mcp start', 'info');
                return;
            }
            const summary = config.getConfigurationSummary();
            const validation = await config.validateConfiguration();
            logger.cli('📋 Configuration: ✅ Loaded and valid', 'success');
            logger.cli(`   Project: ${summary.projectName} (${summary.projectId})`, 'info');
            logger.cli(`   Server: ${summary.serverUrl}`, 'info');
            logger.cli(`   Environment: ${summary.environmentActive}`, 'info');
            logger.cli(`   Variables: ${summary.variableCount} configured`, 'info');
            logger.cli(`   Tools: ${summary.toolsAvailable} available`, 'info');
            if (validation.warnings.length > 0) {
                logger.cli('');
                logger.cli('⚠️  Warnings:', 'warning');
                validation.warnings.forEach(warning => logger.cli(`   - ${warning}`, 'warning'));
            }
            // Test backend connection
            const { BackendClient } = await import('./client/BackendClient.js');
            const serverURL = config.getServerURL();
            const token = config.getMcpToken();
            if (serverURL && token) {
                logger.cli('');
                logger.cli('🔗 Testing backend connection...', 'info');
                try {
                    const client = new BackendClient(serverURL, token);
                    const healthCheck = await client.healthCheck();
                    if (healthCheck.status === 'ok') {
                        logger.cli('✅ Backend connection: OK', 'success');
                        logger.cli(`   Response time: ${Date.now() - healthCheck.timestamp}ms`, 'info');
                    }
                    else {
                        logger.cli('❌ Backend connection: Failed', 'error');
                        logger.cli(`   Error: ${healthCheck.error || 'Unknown error'}`, 'error');
                    }
                }
                catch (error) {
                    logger.cli('❌ Backend connection: Error', 'error');
                    logger.cli(`   ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
                }
            }
        }
        catch (error) {
            logger.cli('❌ Failed to get status: ' + (error instanceof Error ? error.message : 'Unknown error'), 'error');
        }
    }
    /**
     * Validate current configuration
     */
    static async validateConfig() {
        logger.cli('🔍 Validating GASSAPI configuration...', 'info');
        try {
            await config.loadProjectConfig();
            const validation = await config.validateConfiguration();
            logger.cli('='.repeat(50), 'info');
            logger.cli('📋 Configuration Validation Results:', 'info');
            if (validation.isValid) {
                logger.cli('✅ Valid: Configuration is correct and ready to use', 'success');
            }
            else {
                logger.cli('❌ Invalid: Configuration has errors', 'error');
            }
            if (validation.errors.length > 0) {
                logger.cli('');
                logger.cli('❌ Errors:', 'error');
                validation.errors.forEach((error, index) => {
                    logger.cli(`   ${index + 1}. ${error}`, 'error');
                });
            }
            if (validation.warnings.length > 0) {
                logger.cli('');
                logger.cli('⚠️  Warnings:', 'warning');
                validation.warnings.forEach((warning, index) => {
                    logger.cli(`   ${index + 1}. ${warning}`, 'warning');
                });
            }
            logger.cli('='.repeat(50), 'info');
            if (!validation.isValid) {
                logger.cli('💡 To fix:', 'info');
                logger.cli('   1. Check gassapi.json format', 'info');
                logger.cli('   2. Verify all required fields are present', 'info');
                logger.cli('   3. Ensure MCP token is valid and active', 'info');
                logger.cli('   4. Check server URL accessibility', 'info');
            }
        }
        catch (error) {
            logger.cli('❌ Validation failed: ' + (error instanceof Error ? error.message : 'Unknown error'), 'error');
            process.exit(1);
        }
    }
    /**
     * Test backend connection
     */
    static async testConnection() {
        logger.cli('🔗 Testing GASSAPI backend connection...', 'info');
        try {
            await config.loadProjectConfig();
            if (!config.hasProjectConfig()) {
                logger.cli('❌ No configuration found', 'error');
                logger.cli('Please run "gassapi-mcp init" or create gassapi.json', 'error');
                process.exit(1);
            }
            const { BackendClient } = await import('./client/BackendClient.js');
            const serverURL = config.getServerURL();
            const token = config.getMcpToken();
            if (!serverURL || !token) {
                logger.cli('❌ Server URL or MCP token missing from configuration', 'error');
                process.exit(1);
            }
            const client = new BackendClient(serverURL, token);
            logger.cli(`🔗 Connecting to: ${serverURL}`, 'info');
            logger.cli('🔐 Using token validation...', 'info');
            // Test token validation
            const startTime = Date.now();
            const result = await client.validateToken();
            const responseTime = Date.now() - startTime;
            logger.cli('✅ Token validation: Successful', 'success');
            logger.cli(`📊 Response time: ${responseTime}ms`, 'info');
            logger.cli(`📋 Project: ${result.project?.name || 'N/A'}`, 'info');
            logger.cli(`🌍 Environment: ${result.environment?.name || 'N/A'}`, 'info');
            logger.cli(`🔢 Variables: ${Object.keys(result.environment?.variables || {}).length} configured`, 'info');
        }
        catch (error) {
            logger.cli('❌ Connection test failed: ' + (error instanceof Error ? error.message : 'Unknown error'), 'error');
            process.exit(1);
        }
    }
    /**
     * Clear all caches
     */
    static async clearCache() {
        logger.cli('🧹 Clearing GASSAPI caches...', 'info');
        try {
            const { CacheManager } = await import('./cache/CacheManager.js');
            const cacheManager = new CacheManager();
            await cacheManager.clearAllCache();
            logger.cli('✅ All caches cleared successfully', 'success');
            logger.cli('');
            logger.cli('Cleared: cache/gassapi/ directory', 'info');
            logger.cli('Project configurations, tokens, and temporary data removed', 'info');
        }
        catch (error) {
            logger.cli('❌ Failed to clear caches: ' + (error instanceof Error ? error.message : 'Unknown error'), 'error');
            process.exit(1);
        }
    }
    /**
     * Show help information
     */
    static showHelp() {
        logger.cli('🚀 GASSAPI MCP Client - AI-powered API Testing', 'info');
        logger.cli('');
        logger.cli('USAGE:', 'info');
        logger.cli('  gassapi-mcp <command> [options]', 'info');
        logger.cli('');
        logger.cli('COMMANDS:', 'info');
        logger.cli('  start           Start MCP server for Claude Desktop (default)', 'info');
        logger.cli('  init            Create sample gassapi.json configuration', 'info');
        logger.cli('  status          Show configuration and connection status', 'info');
        logger.cli('  validate        Validate current configuration', 'info');
        logger.cli('  test            Test backend connection', 'info');
        logger.cli('  clear-cache     Clear all local caches', 'info');
        logger.cli('  help            Show this help message', 'info');
        logger.cli('  version         Show version information', 'info');
        logger.cli('');
        logger.cli('EXAMPLES:', 'info');
        logger.cli('  gassapi-mcp start                    # Start with auto-detected config', 'info');
        logger.cli('  gassapi-mcp init "My API Project"    # Create sample config', 'info');
        logger.cli('  gassapi-mcp status                    # Show current status', 'info');
        logger.cli('  gassapi-mcp validate                   # Validate configuration', 'info');
        logger.cli('');
        logger.cli('CONFIGURATION:', 'info');
        logger.cli('  GASSAPI configuration is loaded from gassapi.json', 'info');
        logger.cli('  File should be in project root or parent directory', 'info');
        logger.cli('  Contains project info, MCP token, and environment settings', 'info');
        logger.cli('');
        logger.cli('CLAUDE DESKTOP SETUP:', 'info');
        logger.cli('  Add to ~/.claude/claude_desktop_config.json:', 'info');
        logger.cli('  {', 'info');
        logger.cli('    "mcpServers": {', 'info');
        logger.cli('      "gassapi-local": {', 'info');
        logger.cli('        "command": "gassapi-mcp"', 'info');
        logger.cli('      }', 'info');
        logger.cli('    }', 'info');
        logger.cli('  }', 'info');
        logger.cli('');
        logger.cli('LEARN MORE:', 'info');
        logger.cli('  📖 Documentation: https://docs.gassapi.com/mcp-client', 'info');
        logger.cli('  🛠️ GitHub: https://github.com/gassapi/mcp-client', 'info');
        logger.cli('  💬 Discord: https://discord.gg/gassapi', 'info');
        logger.cli('  🐛 Issues: https://github.com/gassapi/mcp-client/issues', 'info');
    }
    /**
     * Show version information
     */
    static showVersion() {
        logger.cli('🚀 GASSAPI MCP Client v1.0.0', 'info');
        logger.cli('');
        logger.cli('📅 Built: ' + new Date().toISOString().split('T')[0], 'info');
        logger.cli('🔗 Repository: https://github.com/gassapi/mcp-client', 'info');
        logger.cli('📄 Documentation: https://docs.gassapi.com/mcp-client', 'info');
        logger.cli('');
        logger.cli('License: MIT', 'info');
        logger.cli('Author: GASSAPI Team', 'info');
        logger.cli('');
        logger.cli('🤖 Powered by Model Context Protocol (MCP)', 'info');
        logger.cli('🎯 Purpose: AI-powered API testing with Claude Desktop', 'info');
    }
}
// Run CLI if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    GassapiMcpCli.main().catch(error => {
        logger.cli('❌ Fatal CLI error: ' + (error instanceof Error ? error.message : 'Unknown error'), 'error');
        process.exit(1);
    });
}
//# sourceMappingURL=cli.js.map