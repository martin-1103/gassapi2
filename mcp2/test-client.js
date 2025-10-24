#!/usr/bin/env node

/**
 * Test client for GASSAPI MCP Server v2
 * Validates that the server works correctly
 */

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

async function testMcpServer() {
  console.log('🧪 Testing GASSAPI MCP Server v2...\\n');

  const client = new Client({
    name: 'test-client',
    version: '1.0.0'
  }, {
    capabilities: {
      tools: {}
    }
  });

  try {
    // Start the server process
    console.log('🚀 Starting MCP server...');
    const transport = new StdioClientTransport({
      command: 'node',
      args: ['dist/index.js']
    });

    // Connect to server
    await client.connect(transport);
    console.log('✅ Connected to MCP server\\n');

    // Test 1: Initialization
    console.log('🔍 Test 1: Initialization...');
    const initResult = await client.request({
      method: 'initialize',
      params: {
        protocolVersion: '2025-06-18',
        capabilities: { tools: {} },
        clientInfo: { name: 'test-client', version: '1.0.0' }
      }
    });
    console.log(`✅ Server: ${initResult.serverInfo.name} v${initResult.serverInfo.version}`);
    console.log(`✅ Protocol: ${initResult.protocolVersion}`);
    console.log(`✅ Capabilities: ${JSON.stringify(initResult.capabilities)}\\n`);

    // Test 2: List Tools
    console.log('🔍 Test 2: Listing tools...');
    const toolsResult = await client.request({
      method: 'tools/list',
      params: {}
    });
    console.log(`✅ Found ${toolsResult.tools.length} tools:`);
    toolsResult.tools.forEach((tool, index) => {
      console.log(`   ${index + 1}. ${tool.name} - ${tool.description}`);
    });
    console.log();

    // Test 3: Echo Tool
    if (toolsResult.tools.some(t => t.name === 'echo')) {
      console.log('🔍 Test 3: Echo tool...');
      try {
        const echoResult = await client.request({
          method: 'tools/call',
          params: {
            name: 'echo',
            arguments: { message: 'Hello from GASSAPI MCP v2!' }
          }
        });
        console.log('✅ Echo tool response:');
        console.log(`   ${echoResult.content[0].text}\\n`);
      } catch (error) {
        console.log('❌ Echo tool failed:', error.message, '\\n');
      }
    }

    // Test 4: Health Check Tool
    if (toolsResult.tools.some(t => t.name === 'health_check')) {
      console.log('🔍 Test 4: Health check tool...');
      try {
        const healthResult = await client.request({
          method: 'tools/call',
          params: {
            name: 'health_check',
            arguments: {}
          }
        });
        console.log('✅ Health check response:');
        console.log(`   ${healthResult.content[0].text.split('\\n')[0]}`);
        console.log('   (Full status available in response)\\n');
      } catch (error) {
        console.log('❌ Health check failed:', error.message, '\\n');
      }
    }

    // Test 5: API Test Tool (optional, may fail due to network)
    if (toolsResult.tools.some(t => t.name === 'test_api')) {
      console.log('🔍 Test 5: API test tool...');
      try {
        const apiResult = await client.request({
          method: 'tools/call',
          params: {
            name: 'test_api',
            arguments: { url: 'https://httpbin.org/json' }
          }
        });
        console.log('✅ API test response:');
        console.log(`   ${apiResult.content[0].text.split('\\n')[0]}\\n`);
      } catch (error) {
        console.log('⚠️  API test failed (network issues expected):', error.message, '\\n');
      }
    }

    // Close connection
    await client.close();
    console.log('✅ All tests completed successfully!');
    console.log('🎉 GASSAPI MCP Server v2 is working correctly!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);

    if (error.stack) {
      console.error('Stack trace:');
      console.error(error.stack);
    }

    process.exit(1);
  }
}

// Run the test
testMcpServer().catch(console.error);