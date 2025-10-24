/**
 * Simple test script for MCP2 with auth tools
 */

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Testing MCP2 Server with Auth Tools...\n');

// Start MCP2 server
const serverPath = path.join(__dirname, 'mcp2', 'dist', 'index.js');
const server = spawn('node', [serverPath], {
  stdio: ['pipe', 'pipe', 'inherit']
});

let testResults = {
  initialized: false,
  toolsListed: false,
  toolsFound: [],
  healthCheck: false,
  validateToken: false,
  errors: []
};

let serverOutput = '';

// Capture server stdout
server.stdout.on('data', (data) => {
  serverOutput += data.toString();
  console.log('📡 Server:', data.toString().trim());
});

// Test MCP2 communication
setTimeout(() => {
  console.log('\n🧪 Starting MCP2 Tests...\n');

  // Send initialize request
  const initRequest = {
    jsonrpc: '2.0',
    id: 1,
    method: 'initialize',
    params: {
      protocolVersion: '2024-11-05',
      capabilities: {},
      clientInfo: {
        name: 'test-client',
        version: '1.0.0'
      }
    }
  };

  server.stdin.write(JSON.stringify(initRequest) + '\n');

}, 1000);

// Parse responses
server.on('message', (data) => {
  try {
    const response = JSON.parse(data.toString());

    if (response.id === 1 && response.result) {
      testResults.initialized = true;
      console.log('✅ Initialize successful');

      // List tools
      setTimeout(() => {
        const toolsRequest = {
          jsonrpc: '2.0',
          id: 2,
          method: 'tools/list',
          params: {}
        };

        server.stdin.write(JSON.stringify(toolsRequest) + '\n');
      }, 500);
    }

    if (response.id === 2 && response.result) {
      testResults.toolsListed = true;
      testResults.toolsFound = response.result.tools.map(t => t.name);
      console.log('✅ Tools listed:', testResults.toolsFound);

      // Test health check
      setTimeout(() => {
        const healthRequest = {
          jsonrpc: '2.0',
          id: 3,
          method: 'tools/call',
          params: {
            name: 'health_check',
            arguments: {}
          }
        };

        server.stdin.write(JSON.stringify(healthRequest) + '\n');
      }, 500);
    }

    if (response.id === 3) {
      if (response.result && response.result.content) {
        testResults.healthCheck = true;
        console.log('✅ Health check passed');
      } else {
        testResults.errors.push('Health check failed');
        console.log('❌ Health check failed:', response.error);
      }

      // Show test results
      setTimeout(() => {
        console.log('\n📊 Test Results:');
        console.log('================');
        console.log(`✅ Initialized: ${testResults.initialized}`);
        console.log(`✅ Tools Listed: ${testResults.toolsListed}`);
        console.log(`🔧 Tools Found: ${testResults.toolsFound.length}`);
        console.log(`  - ${testResults.toolsFound.join('\n  - ')}`);
        console.log(`✅ Health Check: ${testResults.healthCheck}`);

        if (testResults.errors.length > 0) {
          console.log(`❌ Errors: ${testResults.errors.join(', ')}`);
        }

        console.log('\n🎉 MCP2 Server Test Complete!');
        server.kill();
      }, 1000);
    }

    if (response.error) {
      testResults.errors.push(response.error.message);
      console.log('❌ Error:', response.error);
    }

  } catch (error) {
    console.log('❌ Parse error:', error.message);
  }
});

// Handle server errors
server.on('error', (error) => {
  console.error('❌ Server error:', error);
  server.kill();
});

// Timeout
setTimeout(() => {
  console.log('\n⏰ Test timeout');
  server.kill();
}, 10000);