#!/usr/bin/env node

import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import {
  InitializeRequestSchema,
  ListToolsRequestSchema,
  CallToolRequestSchema
} from '@modelcontextprotocol/sdk/types.js';

const server = new Server(
  {
    name: 'debug-gassapi',
    version: '1.0.0'
  },
  {
    capabilities: {
      tools: {
        listChanged: true
      }
    }
  }
);

// Handle initialize
server.setRequestHandler(InitializeRequestSchema, async (request) => {
  console.error('DEBUG: Initialize request received');
  return {
    protocolVersion: '2024-11-05',
    capabilities: {
      tools: {
        listChanged: true
      }
    },
    serverInfo: {
      name: 'debug-gassapi',
      version: '1.0.0'
    }
  };
});

// Handle list tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  console.error('DEBUG: List tools request received');
  return {
    tools: [
      {
        name: 'validate_mcp_token',
        description: 'Validate MCP authentication token',
        inputSchema: {
          type: 'object',
          properties: {
            token: {
              type: 'string',
              description: 'MCP token to validate'
            }
          },
          required: ['token']
        }
      }
    ]
  };
});

// Handle call tool
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  console.error('DEBUG: Tool call request received:', request.params.name);
  if (request.params.name === 'validate_mcp_token') {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            valid: true,
            message: 'Token is valid'
          })
        }
      ]
    };
  }
  throw new Error('Unknown tool: ' + request.params.name);
});

console.error('DEBUG: Starting debug MCP server...');

const transport = new StdioServerTransport();
await server.connect(transport);

console.error('DEBUG: MCP server connected and ready!');