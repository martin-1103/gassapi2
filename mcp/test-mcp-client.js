#!/usr/bin/env node

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

async function testMcpServer() {
  console.log('Testing GASSAPI MCP Server...');

  const client = new Client({
    name: 'test-client',
    version: '1.0.0'
  }, {
    capabilities: {
      tools: {}
    }
  });

  try {
    // Connect to the server
    const transport = new StdioClientTransport({
      command: 'node',
      args: ['dist/index.js']
    });

    await client.connect(transport);
    console.log('✅ Connected to MCP server');

    // Test initialization
    console.log('🔍 Testing initialization...');
    const initResult = await client.initialize();
    console.log('✅ Initialization successful:', initResult);

    // Test listing tools
    console.log('🔍 Testing tool listing...');
    const toolsResult = await client.listTools();
    console.log(`✅ Found ${toolsResult.tools.length} tools:`);
    toolsResult.tools.forEach((tool, index) => {
      console.log(`  ${index + 1}. ${tool.name} - ${tool.description}`);
    });

    // Test calling a tool (if available)
    if (toolsResult.tools.length > 0) {
      const firstTool = toolsResult.tools[0];
      console.log(`🔍 Testing tool call: ${firstTool.name}`);

      try {
        const result = await client.callTool({
          name: firstTool.name,
          arguments: {}
        });
        console.log('✅ Tool call successful:', result.content[0]);
      } catch (toolError) {
        console.log('⚠️  Tool call failed:', toolError.message);
      }
    }

    await client.close();
    console.log('✅ Test completed successfully');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

testMcpServer().catch(console.error);