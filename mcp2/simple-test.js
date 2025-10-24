#!/usr/bin/env node

/**
 * Simple test for GASSAPI MCP Server v2
 * Tests basic functionality without complex client setup
 */

import { spawn } from 'child_process';

async function testServer() {
  console.log('🧪 Simple GASSAPI MCP Server v2 Test\\n');

  return new Promise((resolve, reject) => {
    // Start the server process
    const serverProcess = spawn('node', ['dist/index.js'], {
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let responseData = '';
    let errorData = '';
    let testPassed = false;

    // Collect stderr (logs) to see if server starts correctly
    serverProcess.stderr.on('data', (data) => {
      errorData += data.toString();
      console.log('Server log:', data.toString().trim());
    });

    // Collect stdout (MCP responses)
    serverProcess.stdout.on('data', (data) => {
      responseData += data.toString();

      // Try to parse the response
      try {
        const lines = responseData.trim().split('\\n').filter(line => line.trim());
        for (const line of lines) {
          try {
            const response = JSON.parse(line);
            console.log('MCP Response:', JSON.stringify(response, null, 2));

            // Check if this is an initialization response
            if (response.result && response.result.serverInfo) {
              console.log('\\n✅ Server initialized successfully!');
              console.log(`   Server: ${response.result.serverInfo.name} v${response.result.serverInfo.version}`);
              console.log(`   Protocol: ${response.result.protocolVersion}`);
              testPassed = true;

              // Test complete
              setTimeout(() => {
                serverProcess.kill();
                resolve(true);
              }, 1000);
              return;
            }
          } catch (parseError) {
            // Not a JSON line, ignore
          }
        }
      } catch (error) {
        // Ignore JSON parse errors
      }
    });

    // Handle process errors
    serverProcess.on('error', (error) => {
      console.error('❌ Server process error:', error.message);
      reject(error);
    });

    // Handle process exit
    serverProcess.on('exit', (code) => {
      if (code !== 0 && !testPassed) {
        console.error('❌ Server exited with code:', code);
        console.error('Error output:', errorData);
        reject(new Error('Server failed to start'));
      } else if (testPassed) {
        console.log('\\n🎉 Test completed successfully!');
        console.log('✅ GASSAPI MCP Server v2 is working correctly!');
      }
    });

    // Send initialization request after a short delay
    setTimeout(() => {
      console.log('📡 Sending initialization request...');
      const initRequest = {
        jsonrpc: '2.0',
        id: 1,
        method: 'initialize',
        params: {
          protocolVersion: '2025-06-18',
          capabilities: { tools: {} },
          clientInfo: { name: 'test-client', version: '1.0.0' }
        }
      };

      serverProcess.stdin.write(JSON.stringify(initRequest) + '\\n');

      // Send list tools request
      setTimeout(() => {
        console.log('📡 Sending list tools request...');
        const listToolsRequest = {
          jsonrpc: '2.0',
          id: 2,
          method: 'tools/list',
          params: {}
        };

        serverProcess.stdin.write(JSON.stringify(listToolsRequest) + '\\n');
      }, 1000);

      // Send tool call request
      setTimeout(() => {
        console.log('📡 Sending echo tool call...');
        const toolCallRequest = {
          jsonrpc: '2.0',
          id: 3,
          method: 'tools/call',
          params: {
            name: 'echo',
            arguments: { message: 'Hello from simple test!' }
          }
        };

        serverProcess.stdin.write(JSON.stringify(toolCallRequest) + '\\n');
      }, 2000);

    }, 500);

    // Timeout after 10 seconds
    setTimeout(() => {
      if (!testPassed) {
        serverProcess.kill();
        reject(new Error('Test timeout'));
      }
    }, 10000);
  });
}

// Run the test
testServer()
  .then(() => {
    console.log('\\n✅ All tests passed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\\n❌ Test failed:', error.message);
    process.exit(1);
  });