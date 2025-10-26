#!/usr/bin/env node

/**
 * Test Execute Flow Tool
 * Kirim request ke MCP server yang sedang running
 */

const { spawn } = require('child_process');
const fs = require('fs');

function testExecuteFlow() {
  console.log('🧪 Testing Execute Flow Tool...');

  const mcpRequest = {
    jsonrpc: '2.0',
    id: Date.now(),
    method: 'tools/call',
    params: {
      name: 'execute_flow',
      arguments: {
        flowId: 'flow_5eba7d4ecc2133358006206ce6be8f37',
        variables: 'username=testuser123,email=test@example.com,password=password123',
        dryRun: true
      }
    }
  };

  console.log('📤 MCP Request:', JSON.stringify(mcpRequest, null, 2));

  // Spawn process untuk komunikasi dengan MCP server
  const mcpClient = spawn('node', ['dist/index.js'], {
    cwd: __dirname,
    stdio: ['pipe', 'pipe', 'pipe']
  });

  let output = '';
  let errorOutput = '';

  mcpClient.stdout.on('data', (data) => {
    const chunk = data.toString();
    output += chunk;
    console.log('MCP Response:', chunk.trim());

    // Look for JSON response
    try {
      const lines = output.split('\n').filter(line => line.trim().startsWith('{'));
      for (const line of lines) {
        const response = JSON.parse(line);
        if (response.id === mcpRequest.id) {
          console.log('\n✅ Execute Flow Result:', JSON.stringify(response, null, 2));
          mcpClient.kill();
          process.exit(0);
        }
      }
    } catch (e) {
      // Still parsing or invalid JSON
    }
  });

  mcpClient.stderr.on('data', (data) => {
    const chunk = data.toString();
    errorOutput += chunk;
    console.error('MCP Error:', chunk.trim());
  });

  mcpClient.on('error', (error) => {
    console.error('❌ MCP client error:', error.message);
    process.exit(1);
  });

  mcpClient.on('close', (code) => {
    if (code !== 0 && !output.includes('"result"')) {
      console.error(`❌ MCP client exited with code ${code}`);
      console.error('Error output:', errorOutput);
      process.exit(1);
    }
  });

  // Send request
  mcpClient.stdin.write(JSON.stringify(mcpRequest) + '\n');

  // Timeout
  setTimeout(() => {
    console.error('❌ Test timeout');
    mcpClient.kill();
    process.exit(1);
  }, 10000);
}

testExecuteFlow();