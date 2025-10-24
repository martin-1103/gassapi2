#!/usr/bin/env node

/**
 * GASSAPI MCP Server v2 - Migration Mode
 * Simple entry point for incremental migration
 */

import { McpServer } from './server.js';

/**
 * Simple startup
 */
async function main(): Promise<void> {
  const server = new McpServer();

  // Handle command line arguments
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    console.error('GASSAPI MCP Server v2 - Migration Mode');
    console.error('Usage: node dist/index.js');
    console.error('');
    console.error('Status: Ready for migration from original MCP');
    return;
  }

  if (args.includes('--status')) {
    const status = server.getStatus();
    console.error('📊 Server Status:', status.status);
    console.error('📋 Migration: Step 0 - Reset Complete');
    return;
  }

  // Default: start server
  try {
    console.error('🚀 Starting GASSAPI MCP Server v2 (Migration Mode)...');
    await server.start();
    console.error('✅ MCP Server started successfully');
    console.error('📋 Migration Status: Ready for Step 1 - Core Framework');
  } catch (error) {
    console.error('❌ Failed to start server:', error);
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