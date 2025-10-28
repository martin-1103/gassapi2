#!/usr/bin/env node

/**
 * GASSAPI MCP Server v2
 * AI-powered API testing and automation tools
 */

import { McpServer } from './server.js';

const PACKAGE_VERSION = '2.0.0';

/**
 * Show help information
 */
function showHelp(): void {
  console.log('GASSAPI MCP Server v2 - AI-powered API testing and automation');
  console.log('');
  console.log('Usage:');
  console.log('  gassapi-mcp2              Start MCP server');
  console.log('  gassapi-mcp2 --help       Show this help message');
  console.log('  gassapi-mcp2 --version    Show version information');
  console.log('  gassapi-mcp2 --status     Show server status');
  console.log('');
  console.log('Configuration:');
  console.log('  Create gassapi.json in your working directory:');
  console.log('  {');
  console.log('    "project": {');
  console.log('      "id": "YOUR_PROJECT_ID",');
  console.log('      "name": "Project Name",');
  console.log('      "description": "Project description"');
  console.log('    },');
  console.log('    "mcpClient": {');
  console.log('      "token": "YOUR_TOKEN"');
  console.log('    }');
  console.log('  }');
  console.log('');
  console.log('Installation:');
  console.log('  npm install -g gassapi-mcp2    # Global install');
  console.log('  claude mcp add gassapi-mcp2      # Add to Claude Code');
  console.log('');
  console.log('For more information, visit: https://github.com/martin-1103/mcp2');
}

/**
 * Show version information
 */
function showVersion(): void {
  console.log(`gassapi-mcp2 v${PACKAGE_VERSION}`);
  console.log('GASSAPI MCP Server - AI-powered API testing and automation');
}

/**
 * Show server status
 */
function showStatus(): void {
  const server = new McpServer();
  const status = server.getStatus();

  console.log('GASSAPI MCP Server Status');
  console.log('========================');
  console.log(`Version: ${PACKAGE_VERSION}`);
  console.log(`Status: ${status.status}`);
  console.log(`Tools Available: ${status.details?.toolsCount || 0}`);
  console.log(`Uptime: ${status.details?.uptime || 0}s`);
  if (status.details?.tools?.length > 0) {
    console.log('Available Tools:');
    status.details.tools.forEach((tool: string) => {
      console.log(`  - ${tool}`);
    });
  }
}

/**
 * Main startup function
 */
async function main(): Promise<void> {
  const args = process.argv.slice(2);

  // Handle command line arguments
  if (args.includes('--help') || args.includes('-h')) {
    showHelp();
    return;
  }

  if (args.includes('--version') || args.includes('-v')) {
    showVersion();
    return;
  }

  if (args.includes('--status')) {
    showStatus();
    return;
  }

  // Default: start server
  const server = new McpServer();

  try {
    console.error('🚀 Starting GASSAPI MCP Server v2...');
    await server.start();
    console.error('✅ MCP Server started successfully');
    console.error('🔧 Base URL: http://mapi.gass.web.id');
    console.error('📋 Ready for AI assistant integration');
  } catch (error) {
    console.error('❌ Failed to start server:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', () => {
  console.error('📡 Received SIGINT, shutting down...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.error('📡 Received SIGTERM, shutting down...');
  process.exit(0);
});

main().catch((error) => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});