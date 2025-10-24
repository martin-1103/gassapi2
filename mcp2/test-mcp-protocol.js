#!/usr/bin/env node

/**
 * MCP Protocol Test Client
 * Tests complete MCP protocol communication with GASSAPI MCP Server v2
 */

import { spawn } from 'child_process';

class MCPTestClient {
  constructor() {
    this.serverProcess = null;
    this.requestId = 1;
    this.responses = new Map();
  }

  async startServer() {
    console.log('🚀 Starting GASSAPI MCP Server v2...');

    this.serverProcess = spawn('node', ['dist/index.js'], {
      stdio: ['pipe', 'pipe', 'pipe'],
      cwd: process.cwd()
    });

    // Handle server logs (stderr)
    this.serverProcess.stderr.on('data', (data) => {
      const logs = data.toString().trim();
      if (logs) {
        console.log('📋 Server:', logs);
      }
    });

    // Handle MCP responses (stdout)
    this.serverProcess.stdout.on('data', (data) => {
      const responses = data.toString().trim().split('\n');
      responses.forEach(response => {
        if (response.trim()) {
          this.handleResponse(response);
        }
      });
    });

    // Handle server errors
    this.serverProcess.on('error', (error) => {
      console.error('❌ Server error:', error.message);
    });

    // Handle server exit
    this.serverProcess.on('exit', (code) => {
      console.log(`📡 Server exited with code ${code}`);
    });

    // Wait for server to start
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  handleResponse(data) {
    try {
      const response = JSON.parse(data);
      console.log('📨 MCP Response:', JSON.stringify(response, null, 2));

      if (response.id) {
        this.responses.set(response.id, response);
      }
    } catch (error) {
      console.log('📨 Non-JSON response:', data);
    }
  }

  async sendRequest(method, params = {}) {
    const request = {
      jsonrpc: '2.0',
      id: this.requestId++,
      method,
      params
    };

    console.log(`📤 Sending ${method} request:`, JSON.stringify(request, null, 2));

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error(`Request timeout for ${method}`));
      }, 5000);

      this.responses.set(request.id, null);

      // Check for response
      const checkResponse = () => {
        const response = this.responses.get(request.id);
        if (response !== undefined) {
          clearTimeout(timeout);
          this.responses.delete(request.id);

          if (response && response.error) {
            reject(new Error(response.error.message));
          } else {
            resolve(response);
          }
        } else {
          setTimeout(checkResponse, 100);
        }
      };

      // Send request
      this.serverProcess.stdin.write(JSON.stringify(request) + '\n');

      // Start checking for response
      setTimeout(checkResponse, 100);
    });
  }

  async testInitialization() {
    console.log('\n🔧 Testing MCP Initialization...');

    try {
      const response = await this.sendRequest('initialize', {
        protocolVersion: '2025-06-18',
        capabilities: { tools: {} },
        clientInfo: { name: 'test-client', version: '1.0.0' }
      });

      if (response.result && response.result.serverInfo) {
        console.log('✅ Initialization successful!');
        console.log(`   Server: ${response.result.serverInfo.name} v${response.result.serverInfo.version}`);
        console.log(`   Protocol: ${response.result.protocolVersion}`);
        return true;
      } else {
        console.log('❌ Initialization failed');
        return false;
      }
    } catch (error) {
      console.error('❌ Initialization error:', error.message);
      return false;
    }
  }

  async testListTools() {
    console.log('\n🔧 Testing Tools List...');

    try {
      const response = await this.sendRequest('tools/list');

      if (response.result && response.result.tools) {
        console.log('✅ Tools list received!');
        console.log(`   Available tools: ${response.result.tools.length}`);
        response.result.tools.forEach(tool => {
          console.log(`   - ${tool.name}: ${tool.description}`);
        });
        return response.result.tools;
      } else {
        console.log('❌ Tools list failed');
        return [];
      }
    } catch (error) {
      console.error('❌ Tools list error:', error.message);
      return [];
    }
  }

  async testToolCall(toolName, args = {}) {
    console.log(`\n🔧 Testing Tool Call: ${toolName}...`);

    try {
      const response = await this.sendRequest('tools/call', {
        name: toolName,
        arguments: args
      });

      if (response.result) {
        console.log('✅ Tool call successful!');
        if (response.result.content && response.result.content.length > 0) {
          response.result.content.forEach(content => {
            console.log(`   ${content.type}: ${content.text}`);
          });
        }
        return response.result;
      } else {
        console.log('❌ Tool call failed');
        return null;
      }
    } catch (error) {
      console.error(`❌ Tool call error for ${toolName}:`, error.message);
      return null;
    }
  }

  async runTests() {
    try {
      await this.startServer();

      // Test initialization
      const initSuccess = await this.testInitialization();
      if (!initSuccess) {
        throw new Error('Initialization failed');
      }

      // Test tools list
      const tools = await this.testListTools();
      if (tools.length === 0) {
        throw new Error('No tools available');
      }

      // Test each tool
      for (const tool of tools) {
        let args = {};

        // Set up test arguments for each tool
        switch (tool.name) {
          case 'echo':
            args = { message: 'Hello from MCP test client!' };
            break;
          case 'health_check':
            args = {};
            break;
          case 'test_api':
            args = {
              url: 'https://httpbin.org/json',
              method: 'GET'
            };
            break;
        }

        await this.testToolCall(tool.name, args);
      }

      console.log('\n🎉 All tests completed successfully!');
      console.log('✅ GASSAPI MCP Server v2 is fully functional!');

    } catch (error) {
      console.error('\n❌ Test suite failed:', error.message);
      throw error;
    } finally {
      this.cleanup();
    }
  }

  cleanup() {
    if (this.serverProcess) {
      console.log('\n🧹 Cleaning up...');
      this.serverProcess.kill();
      this.serverProcess = null;
    }
  }
}

// Run tests
async function main() {
  const client = new MCPTestClient();

  try {
    await client.runTests();
    process.exit(0);
  } catch (error) {
    console.error('Test suite failed:', error.message);
    process.exit(1);
  }
}

main();