#!/usr/bin/env node

/**
 * CLI Entry Point for GASSAPI MCP Server
 */

import { McpServer } from './server.js';

// Parse command line arguments
const args = process.argv.slice(2);

// Show help
if (args.includes('--help') || args.includes('-h')) {
  console.log(`
GASSAPI MCP Server v2.0.0

Usage:
  gassapi-mcp2 [options]

Options:
  --help, -h     Show this help message
  --version, -v  Show version
  --status       Show server status

Examples:
  gassapi-mcp2 --help
  gassapi-mcp2 --version
  gassapi-mcp2 --status

For Claude Code integration:
  claude mcp add gassapi-mcp2
`);
  process.exit(0);
}

// Show version
if (args.includes('--version') || args.includes('-v')) {
  console.log('2.0.0');
  process.exit(0);
}

// Show status
if (args.includes('--status')) {
  console.log('GASSAPI MCP Server Status:');
  console.log('✅ Package installed');
  console.log('✅ Binary available');
  console.log('❓ Configuration: Check gassapi.json file');
  console.log('');
  console.log('To test with Claude:');
  console.log('1. Create gassapi.json with your project credentials');
  console.log('2. Run: claude mcp add gassapi-mcp2');
  console.log('3. Restart Claude Code');
  process.exit(0);
}

// Start MCP server (default behavior)
const server = new McpServer();
server.start().catch(error => {
  console.error('Failed to start GASSAPI MCP Server:', error.message);
  process.exit(1);
});