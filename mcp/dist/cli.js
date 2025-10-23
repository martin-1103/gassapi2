#!/usr/bin/env node
"use strict";
/**
 * GASSAPI MCP Client CLI Entry Point
 * Command line interface for the MCP client
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const readline = __importStar(require("readline"));
const config_1 = require("./config");
const Logger_1 = require("./utils/Logger");
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
            (0, Logger_1.initializeLogger)();
            // Parse command line arguments
            const args = process.argv.slice(2);
            const command = args[0] || 'help';
            Logger_1.logger.cli('🚀 GASSAPI MCP Client CLI', 'info');
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
                    Logger_1.logger.cli(`❌ Unknown command: ${command}`, 'error');
                    Logger_1.logger.cli('Use "gassapi-mcp help" for available commands', 'error');
                    process.exit(1);
            }
        }
        catch (error) {
            Logger_1.logger.cli('❌ CLI Error: ' + (error instanceof Error ? error.message : 'Unknown error'), 'error');
            process.exit(1);
        }
    }
    /**
     * Start MCP server
     */
    static async startServer() {
        Logger_1.logger.cli('🤖 Starting MCP Server...', 'info');
        try {
            // Load configuration first
            await config_1.config.loadProjectConfig();
            if (!config_1.config.hasProjectConfig()) {
                Logger_1.logger.cli('❌ No GASSAPI configuration found', 'error');
                Logger_1.logger.cli('Please create gassapi.json in your project root or run "gassapi-mcp init"', 'error');
                process.exit(1);
            }
            const summary = config_1.config.getConfigurationSummary();
            Logger_1.logger.cli(`📋 Project: ${summary.projectName} (${summary.projectId})`, 'info');
            Logger_1.logger.cli(`🔗 Server: ${summary.serverUrl}`, 'info');
            Logger_1.logger.cli(`🌍 Environment: ${summary.environmentActive}`, 'info');
            Logger_1.logger.cli(`🔧 Variables: ${summary.variableCount}`, 'info');
            // Import and start server
            const { GassapiMcpClient } = await Promise.resolve().then(() => __importStar(require('./index.js')));
            const client = new GassapiMcpClient();
            await client.start();
        }
        catch (error) {
            Logger_1.logger.cli('❌ Failed to start MCP server: ' + (error instanceof Error ? error.message : 'Unknown error'), 'error');
            process.exit(1);
        }
    }
    /**
     * Initialize sample configuration
     */
    static async initConfig() {
        Logger_1.logger.cli('📝 Initializing GASSAPI configuration...', 'info');
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
            await config_1.config.createSampleConfig(projectName, projectId);
            Logger_1.logger.cli('✅ Configuration initialized successfully!', 'success');
            Logger_1.logger.cli('');
            Logger_1.logger.cli('📁 File created: ./gassapi.json', 'info');
            Logger_1.logger.cli('⚠️  Next steps:', 'warning');
            Logger_1.logger.cli('   1. Edit gassapi.json with your actual project details', 'info');
            Logger_1.logger.cli('   2. Replace YOUR_MCP_TOKEN_HERE with your actual MCP token', 'info');
            Logger_1.logger.cli('   3. Configure environment variables', 'info');
            Logger_1.logger.cli('   4. Start MCP server: gassapi-mcp start', 'info');
        }
        catch (error) {
            Logger_1.logger.cli('❌ Failed to initialize configuration: ' + (error instanceof Error ? error.message : 'Unknown error'), 'error');
            process.exit(1);
        }
    }
    /**
     * Show current status
     */
    static async showStatus() {
        Logger_1.logger.cli('📊 GASSAPI MCP Client Status', 'info');
        Logger_1.logger.cli('='.repeat(50), 'info');
        try {
            // Load configuration
            await config_1.config.loadProjectConfig();
            if (!config_1.config.hasProjectConfig()) {
                Logger_1.logger.cli('📋 Configuration: ❌ Not found', 'error');
                Logger_1.logger.cli('📄 gassapi.json: Missing in project directory', 'error');
                Logger_1.logger.cli('');
                Logger_1.logger.cli('💡 To setup:', 'info');
                Logger_1.logger.cli('   1. Run: gassapi-mcp init', 'info');
                Logger_1.logger.cli('   2. Edit generated gassapi.json', 'info');
                Logger_1.logger.cli('   3. Start: gassapi-mcp start', 'info');
                return;
            }
            const summary = config_1.config.getConfigurationSummary();
            const validation = await config_1.config.validateConfiguration();
            Logger_1.logger.cli('📋 Configuration: ✅ Loaded and valid', 'success');
            Logger_1.logger.cli(`   Project: ${summary.projectName} (${summary.projectId})`, 'info');
            Logger_1.logger.cli(`   Server: ${summary.serverUrl}`, 'info');
            Logger_1.logger.cli(`   Environment: ${summary.environmentActive}`, 'info');
            Logger_1.logger.cli(`   Variables: ${summary.variableCount} configured`, 'info');
            Logger_1.logger.cli(`   Tools: ${summary.toolsAvailable} available`, 'info');
            if (validation.warnings.length > 0) {
                Logger_1.logger.cli('');
                Logger_1.logger.cli('⚠️  Warnings:', 'warning');
                validation.warnings.forEach(warning => Logger_1.logger.cli(`   - ${warning}`, 'warning'));
            }
            // Test backend connection
            const { BackendClient } = await Promise.resolve().then(() => __importStar(require('./client/BackendClient.js')));
            const serverURL = config_1.config.getServerURL();
            const token = config_1.config.getMcpToken();
            if (serverURL && token) {
                Logger_1.logger.cli('');
                Logger_1.logger.cli('🔗 Testing backend connection...', 'info');
                try {
                    const client = new BackendClient(serverURL, token);
                    const healthCheck = await client.healthCheck();
                    if (healthCheck.status === 'ok') {
                        Logger_1.logger.cli('✅ Backend connection: OK', 'success');
                        Logger_1.logger.cli(`   Response time: ${Date.now() - healthCheck.timestamp}ms`, 'info');
                    }
                    else {
                        Logger_1.logger.cli('❌ Backend connection: Failed', 'error');
                        Logger_1.logger.cli(`   Error: ${healthCheck.error || 'Unknown error'}`, 'error');
                    }
                }
                catch (error) {
                    Logger_1.logger.cli('❌ Backend connection: Error', 'error');
                    Logger_1.logger.cli(`   ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
                }
            }
        }
        catch (error) {
            Logger_1.logger.cli('❌ Failed to get status: ' + (error instanceof Error ? error.message : 'Unknown error'), 'error');
        }
    }
    /**
     * Validate current configuration
     */
    static async validateConfig() {
        Logger_1.logger.cli('🔍 Validating GASSAPI configuration...', 'info');
        try {
            await config_1.config.loadProjectConfig();
            const validation = await config_1.config.validateConfiguration();
            Logger_1.logger.cli('='.repeat(50), 'info');
            Logger_1.logger.cli('📋 Configuration Validation Results:', 'info');
            if (validation.isValid) {
                Logger_1.logger.cli('✅ Valid: Configuration is correct and ready to use', 'success');
            }
            else {
                Logger_1.logger.cli('❌ Invalid: Configuration has errors', 'error');
            }
            if (validation.errors.length > 0) {
                Logger_1.logger.cli('');
                Logger_1.logger.cli('❌ Errors:', 'error');
                validation.errors.forEach((error, index) => {
                    Logger_1.logger.cli(`   ${index + 1}. ${error}`, 'error');
                });
            }
            if (validation.warnings.length > 0) {
                Logger_1.logger.cli('');
                Logger_1.logger.cli('⚠️  Warnings:', 'warning');
                validation.warnings.forEach((warning, index) => {
                    Logger_1.logger.cli(`   ${index + 1}. ${warning}`, 'warning');
                });
            }
            Logger_1.logger.cli('='.repeat(50), 'info');
            if (!validation.isValid) {
                Logger_1.logger.cli('💡 To fix:', 'info');
                Logger_1.logger.cli('   1. Check gassapi.json format', 'info');
                Logger_1.logger.cli('   2. Verify all required fields are present', 'info');
                Logger_1.logger.cli('   3. Ensure MCP token is valid and active', 'info');
                Logger_1.logger.cli('   4. Check server URL accessibility', 'info');
            }
        }
        catch (error) {
            Logger_1.logger.cli('❌ Validation failed: ' + (error instanceof Error ? error.message : 'Unknown error'), 'error');
            process.exit(1);
        }
    }
    /**
     * Test backend connection
     */
    static async testConnection() {
        Logger_1.logger.cli('🔗 Testing GASSAPI backend connection...', 'info');
        try {
            await config_1.config.loadProjectConfig();
            if (!config_1.config.hasProjectConfig()) {
                Logger_1.logger.cli('❌ No configuration found', 'error');
                Logger_1.logger.cli('Please run "gassapi-mcp init" or create gassapi.json', 'error');
                process.exit(1);
            }
            const { BackendClient } = await Promise.resolve().then(() => __importStar(require('./client/BackendClient.js')));
            const serverURL = config_1.config.getServerURL();
            const token = config_1.config.getMcpToken();
            if (!serverURL || !token) {
                Logger_1.logger.cli('❌ Server URL or MCP token missing from configuration', 'error');
                process.exit(1);
            }
            const client = new BackendClient(serverURL, token);
            Logger_1.logger.cli(`🔗 Connecting to: ${serverURL}`, 'info');
            Logger_1.logger.cli('🔐 Using token validation...', 'info');
            // Test token validation
            const startTime = Date.now();
            const result = await client.validateToken();
            const responseTime = Date.now() - startTime;
            Logger_1.logger.cli('✅ Token validation: Successful', 'success');
            Logger_1.logger.cli(`📊 Response time: ${responseTime}ms`, 'info');
            Logger_1.logger.cli(`📋 Project: ${result.project?.name || 'N/A'}`, 'info');
            Logger_1.logger.cli(`🌍 Environment: ${result.environment?.name || 'N/A'}`, 'info');
            Logger_1.logger.cli(`🔢 Variables: ${Object.keys(result.environment?.variables || {}).length} configured`, 'info');
        }
        catch (error) {
            Logger_1.logger.cli('❌ Connection test failed: ' + (error instanceof Error ? error.message : 'Unknown error'), 'error');
            process.exit(1);
        }
    }
    /**
     * Clear all caches
     */
    static async clearCache() {
        Logger_1.logger.cli('🧹 Clearing GASSAPI caches...', 'info');
        try {
            const { CacheManager } = await Promise.resolve().then(() => __importStar(require('./cache/CacheManager.js')));
            const cacheManager = new CacheManager();
            await cacheManager.clearAllCache();
            Logger_1.logger.cli('✅ All caches cleared successfully', 'success');
            Logger_1.logger.cli('');
            Logger_1.logger.cli('Cleared: cache/gassapi/ directory', 'info');
            Logger_1.logger.cli('Project configurations, tokens, and temporary data removed', 'info');
        }
        catch (error) {
            Logger_1.logger.cli('❌ Failed to clear caches: ' + (error instanceof Error ? error.message : 'Unknown error'), 'error');
            process.exit(1);
        }
    }
    /**
     * Show help information
     */
    static showHelp() {
        Logger_1.logger.cli('🚀 GASSAPI MCP Client - AI-powered API Testing', 'info');
        Logger_1.logger.cli('');
        Logger_1.logger.cli('USAGE:', 'info');
        Logger_1.logger.cli('  gassapi-mcp <command> [options]', 'info');
        Logger_1.logger.cli('');
        Logger_1.logger.cli('COMMANDS:', 'info');
        Logger_1.logger.cli('  start           Start MCP server for Claude Desktop (default)', 'info');
        Logger_1.logger.cli('  init            Create sample gassapi.json configuration', 'info');
        Logger_1.logger.cli('  status          Show configuration and connection status', 'info');
        Logger_1.logger.cli('  validate        Validate current configuration', 'info');
        Logger_1.logger.cli('  test            Test backend connection', 'info');
        Logger_1.logger.cli('  clear-cache     Clear all local caches', 'info');
        Logger_1.logger.cli('  help            Show this help message', 'info');
        Logger_1.logger.cli('  version         Show version information', 'info');
        Logger_1.logger.cli('');
        Logger_1.logger.cli('EXAMPLES:', 'info');
        Logger_1.logger.cli('  gassapi-mcp start                    # Start with auto-detected config', 'info');
        Logger_1.logger.cli('  gassapi-mcp init "My API Project"    # Create sample config', 'info');
        Logger_1.logger.cli('  gassapi-mcp status                    # Show current status', 'info');
        Logger_1.logger.cli('  gassapi-mcp validate                   # Validate configuration', 'info');
        Logger_1.logger.cli('');
        Logger_1.logger.cli('CONFIGURATION:', 'info');
        Logger_1.logger.cli('  GASSAPI configuration is loaded from gassapi.json', 'info');
        Logger_1.logger.cli('  File should be in project root or parent directory', 'info');
        Logger_1.logger.cli('  Contains project info, MCP token, and environment settings', 'info');
        Logger_1.logger.cli('');
        Logger_1.logger.cli('CLAUDE DESKTOP SETUP:', 'info');
        Logger_1.logger.cli('  Add to ~/.claude/claude_desktop_config.json:', 'info');
        Logger_1.logger.cli('  {', 'info');
        Logger_1.logger.cli('    "mcpServers": {', 'info');
        Logger_1.logger.cli('      "gassapi-local": {', 'info');
        Logger_1.logger.cli('        "command": "gassapi-mcp"', 'info');
        Logger_1.logger.cli('      }', 'info');
        Logger_1.logger.cli('    }', 'info');
        Logger_1.logger.cli('  }', 'info');
        Logger_1.logger.cli('');
        Logger_1.logger.cli('LEARN MORE:', 'info');
        Logger_1.logger.cli('  📖 Documentation: https://docs.gassapi.com/mcp-client', 'info');
        Logger_1.logger.cli('  🛠️ GitHub: https://github.com/gassapi/mcp-client', 'info');
        Logger_1.logger.cli('  💬 Discord: https://discord.gg/gassapi', 'info');
        Logger_1.logger.cli('  🐛 Issues: https://github.com/gassapi/mcp-client/issues', 'info');
    }
    /**
     * Show version information
     */
    static showVersion() {
        Logger_1.logger.cli('🚀 GASSAPI MCP Client v1.0.0', 'info');
        Logger_1.logger.cli('');
        Logger_1.logger.cli('📅 Built: ' + new Date().toISOString().split('T')[0], 'info');
        Logger_1.logger.cli('🔗 Repository: https://github.com/gassapi/mcp-client', 'info');
        Logger_1.logger.cli('📄 Documentation: https://docs.gassapi.com/mcp-client', 'info');
        Logger_1.logger.cli('');
        Logger_1.logger.cli('License: MIT', 'info');
        Logger_1.logger.cli('Author: GASSAPI Team', 'info');
        Logger_1.logger.cli('');
        Logger_1.logger.cli('🤖 Powered by Model Context Protocol (MCP)', 'info');
        Logger_1.logger.cli('🎯 Purpose: AI-powered API testing with Claude Desktop', 'info');
    }
}
// Run CLI if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    GassapiMcpCli.main().catch(error => {
        Logger_1.logger.cli('❌ Fatal CLI error: ' + (error instanceof Error ? error.message : 'Unknown error'), 'error');
        process.exit(1);
    });
}
//# sourceMappingURL=cli.js.map