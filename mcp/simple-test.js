#!/usr/bin/env node

import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { InitializeRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';

const server = new Server({
  name: 'test-gassapi',
  version: '1.0.0'
}, {
  capabilities: {
    tools: {
      listChanged: true
    }
  }
});

// Handle initialize
server.setRequestHandler(InitializeRequestSchema, async (request) => {
  console.log('Initialize request received:', request);
  return {
    protocolVersion: '2024-11-05',
    capabilities: {
      tools: {
        listChanged: true
      }
    },
    serverInfo: {
      name: 'test-gassapi',
      version: '1.0.0'
    }
  };
});

// Handle list tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  console.log('List tools request received');
  return {
    tools: [
      {
        name: 'test_tool',
        description: 'A test tool',
        inputSchema: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'Test message'
            }
          },
          required: ['message']
        }
      }
    ]
  };
});

console.log('Starting simple MCP server...');

const transport = new StdioServerTransport();
await server.connect(transport);

console.log('MCP server connected and ready!');