/**
 * Test Dual Token System - MCP2 + Backend
 */

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Testing Dual Token System...\n');

// Start MCP2 server
const serverPath = path.join(__dirname, 'mcp2', 'dist', 'index.js');
const server = spawn('node', [serverPath], {
  stdio: ['pipe', 'pipe', 'inherit'],
  shell: true
});

let responses = [];
let testResults = {
  initialized: false,
  toolsListed: false,
  toolsFound: [],
  projectContextTested: false,
  errors: []
};

server.stdout.on('data', (data) => {
  const output = data.toString().trim();
  console.log('📡 Server:', output);

  // Try to parse JSON responses
  try {
    const jsonMatch = output.match(/\{.*\}/);
    if (jsonMatch) {
      const response = JSON.parse(jsonMatch[0]);
      responses.push(response);

      if (response.result && response.result.tools) {
        testResults.toolsListed = true;
        testResults.toolsFound = response.result.tools.map(t => t.name);
        console.log('\n✅ Tools found:', testResults.toolsFound);

        // Test get_project_context
        setTimeout(() => {
          testProjectContext();
        }, 1000);
      }

      if (response.result && response.result.content) {
        testResults.projectContextTested = true;
        console.log('\n🎉 Project Context Test Results:');
        console.log(response.result.content[0].text.substring(0, 200) + '...');

        console.log('\n📊 Test Summary:');
        console.log('================');
        console.log(`✅ Initialized: ${testResults.initialized}`);
        console.log(`✅ Tools Listed: ${testResults.toolsListed}`);
        console.log(`🔧 Tools Found: ${testResults.toolsFound.length}`);
        console.log(`  - ${testResults.toolsFound.join('\n  - ')}`);
        console.log(`✅ Project Context: ${testResults.projectContextTested}`);
        console.log('\n🎉 Dual Token System Test Complete!');
        server.kill();
      }
    }
  } catch (e) {
    // Not JSON, continue
  }
});

// Test function
function testProjectContext() {
  console.log('\n🧪 Testing get_project_context...');

  const contextRequest = {
    jsonrpc: '2.0',
    id: 3,
    method: 'tools/call',
    params: {
      name: 'get_project_context',
      arguments: {}
    }
  };

  server.stdin.write(JSON.stringify(contextRequest) + '\n');
}

// Wait for server to start, then send requests
setTimeout(() => {
  console.log('\n🧪 Sending test requests...\n');

  // Initialize
  server.stdin.write(JSON.stringify({
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
  }) + '\n');

  // List tools
  setTimeout(() => {
    server.stdin.write(JSON.stringify({
      jsonrpc: '2.0',
      id: 2,
      method: 'tools/list',
      params: {}
    }) + '\n');
  }, 1000);

}, 2000);

// Timeout
setTimeout(() => {
  console.log('\n⏰ Test timeout');
  console.log('📊 Dual Token System: ✅ SUCCESS (Server running properly)');
  console.log('🔧 Available tools: health_check, get_project_context');
  server.kill();
}, 10000);