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
const config_1 = require("./config");
/**
 * CLI application class
 */
class GassapiMcpCli {
    /**
     * Main CLI entry point
     */
    static async main() {
        try {
            // Parse command line arguments
            const args = process.argv.slice(2);
            const command = args[0] || 'help';
            console.log('🚀 GASSAPI MCP Client CLI');
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
                    console.error(`❌ Unknown command: ${command}`);
                    console.error('Use "gassapi-mcp help" for available commands');
                    process.exit(1);
            }
        }
        catch (error) {
            console.error('❌ CLI Error:', error instanceof Error ? error.message : 'Unknown error');
            process.exit(1);
        }
    }
    /**
     * Start MCP server
     */
    static async startServer() {
        console.log('🤖 Starting MCP Server...');
        try {
            // Load configuration first
            await config_1.config.loadProjectConfig();
            if (!config_1.config.hasProjectConfig()) {
                console.error('❌ No GASSAPI configuration found');
                console.error('Please create gassapi.json in your project root or run "gassapi-mcp init"');
                process.exit(1);
            }
            const summary = config_1.config.getConfigurationSummary();
            console.log(`📋 Project: ${summary.projectName} (${summary.projectId})`);
            console.log(`🔗 Server: ${summary.serverUrl}`);
            console.log(`🌍 Environment: ${summary.environmentActive}`);
            console.log(`🔧 Variables: ${summary.variableCount}`);
            // Import and start server
            const { GassapiMcpClient } = await Promise.resolve().then(() => __importStar(require('./index.js')));
            const client = new GassapiMcpClient();
            await client.start();
        }
        catch (error) {
            console.error('❌ Failed to start MCP server:', error instanceof Error ? error.message : 'Unknown error');
            process.exit(1);
        }
    }
    /**
     * Initialize sample configuration
     */
    static async initConfig() {
        console.log('📝 Initializing GASSAPI configuration...');
        const readline = require('readline');
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
            console.log('✅ Configuration initialized successfully!');
            console.log('');
            console.log('📁 File created: ./gassapi.json');
            console.log('⚠️  Next steps:');
            console.log('   1. Edit gassapi.json with your actual project details');
            console.log('   2. Replace YOUR_MCP_TOKEN_HERE with your actual MCP token');
            console.log('   3. Configure environment variables');
            console.log('   4. Start MCP server: gassapi-mcp start');
        }
        catch (error) {
            console.error('❌ Failed to initialize configuration:', error instanceof Error ? error.message : 'Unknown error');
            process.exit(1);
        }
    }
    /**
     * Show current status
     */
    static async showStatus() {
        console.log('📊 GASSAPI MCP Client Status');
        console.log('='.repeat(50));
        try {
            // Load configuration
            await config_1.config.loadProjectConfig();
            if (!config_1.config.hasProjectConfig()) {
                console.log('📋 Configuration: ❌ Not found');
                console.log('📄 gassapi.json: Missing in project directory');
                console.log('');
                console.log('💡 To setup:');
                console.log('   1. Run: gassapi-mcp init');
                console.log('   2. Edit generated gassapi.json');
                console.log('   3. Start: gassapi-mcp start');
                return;
            }
            const summary = config_1.config.getConfigurationSummary();
            const validation = await config_1.config.validateConfiguration();
            console.log('📋 Configuration: ✅ Loaded and valid');
            console.log(`   Project: ${summary.projectName} (${summary.projectId})`);
            console.log(`   Server: ${summary.serverUrl}`);
            console.log(`   Environment: ${summary.environmentActive}`);
            console.log(`   Variables: ${summary.variableCount} configured`);
            console.log(`   Tools: ${summary.toolsAvailable} available`);
            if (validation.warnings.length > 0) {
                console.log('');
                console.log('⚠️  Warnings:');
                validation.warnings.forEach(warning => console.log(`   - ${warning}`));
            }
            // Test backend connection
            const { BackendClient } = await Promise.resolve().then(() => __importStar(require('./client/BackendClient.js')));
            const serverURL = config_1.config.getServerURL();
            const token = config_1.config.getMcpToken();
            if (serverURL && token) {
                console.log('');
                console.log('🔗 Testing backend connection...');
                try {
                    const client = new BackendClient(serverURL, token);
                    const healthCheck = await client.healthCheck();
                    if (healthCheck.status === 'ok') {
                        console.log('✅ Backend connection: OK');
                        console.log(`   Response time: ${Date.now() - healthCheck.timestamp}ms`);
                    }
                    else {
                        console.log('❌ Backend connection: Failed');
                        console.log(`   Error: ${healthCheck.error || 'Unknown error'}`);
                    }
                }
                catch (error) {
                    console.log('❌ Backend connection: Error');
                    console.log(`   ${error instanceof Error ? error.message : 'Unknown error'}`);
                }
            }
        }
        catch (error) {
            console.error('❌ Failed to get status:', error instanceof Error ? error.message : 'Unknown error');
        }
    }
    /**
     * Validate current configuration
     */
    static async validateConfig() {
        console.log('🔍 Validating GASSAPI configuration...');
        try {
            await config_1.config.loadProjectConfig();
            const validation = await config_1.config.validateConfiguration();
            console.log('='.repeat(50));
            console.log('📋 Configuration Validation Results:');
            if (validation.isValid) {
                console.log('✅ Valid: Configuration is correct and ready to use');
            }
            else {
                console.log('❌ Invalid: Configuration has errors');
            }
            if (validation.errors.length > 0) {
                console.log('');
                console.log('❌ Errors:');
                validation.errors.forEach((error, index) => {
                    console.log(`   ${index + 1}. ${error}`);
                });
            }
            if (validation.warnings.length > 0) {
                console.log('');
                console.log('⚠️  Warnings:');
                validation.warnings.forEach((warning, index) => {
                    console.log(`   ${index + 1}. ${warning}`);
                });
            }
            console.log('='.repeat(50));
            if (!validation.isValid) {
                console.log('💡 To fix:');
                console.log('   1. Check gassapi.json format');
                console.log('   2. Verify all required fields are present');
                console.log('   3. Ensure MCP token is valid and active');
                console.log('   4. Check server URL accessibility');
            }
        }
        catch (error) {
            console.error('❌ Validation failed:', error instanceof Error ? error.message : 'Unknown error');
            process.exit(1);
        }
    }
    /**
     * Test backend connection
     */
    static async testConnection() {
        console.log('🔗 Testing GASSAPI backend connection...');
        try {
            await config_1.config.loadProjectConfig();
            if (!config_1.config.hasProjectConfig()) {
                console.error('❌ No configuration found');
                console.error('Please run "gassapi-mcp init" or create gassapi.json');
                process.exit(1);
            }
            const { BackendClient } = await Promise.resolve().then(() => __importStar(require('./client/BackendClient.js')));
            const serverURL = config_1.config.getServerURL();
            const token = config_1.config.getMcpToken();
            if (!serverURL || !token) {
                console.error('❌ Server URL or MCP token missing from configuration');
                process.exit(1);
            }
            const client = new BackendClient(serverURL, token);
            console.log(`🔗 Connecting to: ${serverURL}`);
            console.log('🔐 Using token validation...');
            // Test token validation
            const startTime = Date.now();
            const result = await client.validateToken();
            const responseTime = Date.now() - startTime;
            console.log('✅ Token validation: Successful');
            console.log(`📊 Response time: ${responseTime}ms`);
            console.log(`📋 Project: ${result.project?.name || 'N/A'}`);
            console.log(`🌍 Environment: ${result.environment?.name || 'N/A'}`);
            console.log(`🔢 Variables: ${Object.keys(result.environment?.variables || {}).length} configured`);
        }
        catch (error) {
            console.error('❌ Connection test failed:', error instanceof Error ? error.message : 'Unknown error');
            process.exit(1);
        }
    }
    /**
     * Clear all caches
     */
    static async clearCache() {
        console.log('🧹 Clearing GASSAPI caches...');
        try {
            const { CacheManager } = await Promise.resolve().then(() => __importStar(require('./cache/CacheManager.js')));
            const cacheManager = new CacheManager();
            await cacheManager.clearAllCache();
            console.log('✅ All caches cleared successfully');
            console.log('');
            console.log('Cleared: cache/gassapi/ directory');
            console.log('Project configurations, tokens, and temporary data removed');
        }
        catch (error) {
            console.error('❌ Failed to clear caches:', error instanceof Error ? error.message : 'Unknown error');
            process.exit(1);
        }
    }
    /**
     * Show help information
     */
    static showHelp() {
        console.log('🚀 GASSAPI MCP Client - AI-powered API Testing');
        console.log('');
        console.log('USAGE:');
        console.log('  gassapi-mcp <command> [options]');
        console.log('');
        console.log('COMMANDS:');
        console.log('  start           Start MCP server for Claude Desktop (default)');
        console.log('  init            Create sample gassapi.json configuration');
        console.log('  status          Show configuration and connection status');
        console.log('  validate        Validate current configuration');
        console.log('  test            Test backend connection');
        console.log('  clear-cache     Clear all local caches');
        console.log('  help            Show this help message');
        console.log('  version         Show version information');
        console.log('');
        console.log('EXAMPLES:');
        console.log('  gassapi-mcp start                    # Start with auto-detected config');
        console.log('  gassapi-mcp init "My API Project"    # Create sample config');
        console.log('  gassapi-mcp status                    # Show current status');
        console.log('  gassapi-mcp validate                   # Validate configuration');
        console.log('');
        console.log('CONFIGURATION:');
        console.log('  GASSAPI configuration is loaded from gassapi.json');
        console.log('  File should be in project root or parent directory');
        console.log('  Contains project info, MCP token, and environment settings');
        console.log('');
        console.log('CLAUDE DESKTOP SETUP:');
        console.log('  Add to ~/.claude/claude_desktop_config.json:');
        console.log('  {');
        console.log('    "mcpServers": {');
        console.log('      "gassapi-local": {');
        console.log('        "command": "gassapi-mcp"');
        console.log('      }');
        console.log('    }');
        console.log('  }');
        console.log('');
        console.log('LEARN MORE:');
        console.log('  📖 Documentation: https://docs.gassapi.com/mcp-client');
        console.log('  🛠️ GitHub: https://github.com/gassapi/mcp-client');
        console.log('  💬 Discord: https://discord.gg/gassapi');
        console.log('  🐛 Issues: https://github.com/gassapi/mcp-client/issues');
    }
    /**
     * Show version information
     */
    static showVersion() {
        console.log('🚀 GASSAPI MCP Client v1.0.0');
        console.log('');
        console.log('📅 Built: ' + new Date().toISOString().split('T')[0]);
        console.log('🔗 Repository: https://github.com/gassapi/mcp-client');
        console.log('📄 Documentation: https://docs.gassapi.com/mcp-client');
        console.log('');
        console.log('License: MIT');
        console.log('Author: GASSAPI Team');
        console.log('');
        console.log('🤖 Powered by Model Context Protocol (MCP)');
        console.log('🎯 Purpose: AI-powered API testing with Claude Desktop');
    }
}
// Run CLI if called directly
if (require.main === module) {
    GassapiMcpCli.main().catch(error => {
        console.error('❌ Fatal CLI error:', error);
        process.exit(1);
    });
}
//# sourceMappingURL=cli.js.map