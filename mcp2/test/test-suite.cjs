#!/usr/bin/env node

/**
 * Comprehensive Test Suite for GASSAPI MCP Server v2
 * Tests all functionality including configuration, tools, and error handling
 */

const { spawn } = require('child_process');
const { existsSync, readFileSync, unlinkSync } = require('fs');

class TestSuite {
  constructor() {
    this.tests = [];
    this.passed = 0;
    this.failed = 0;
    this.currentTest = null;
  }

  /**
   * Add a test to the suite
   */
  addTest(name, testFn) {
    this.tests.push({ name, testFn });
  }

  /**
   * Run all tests
   */
  async runAllTests() {
    console.log('🧪 GASSAPI MCP Server v2 - Comprehensive Test Suite\n');

    for (const test of this.tests) {
      this.currentTest = test.name;
      try {
        console.log(`🔧 Running: ${test.name}`);
        await test.testFn();
        this.passed++;
        console.log(`✅ PASSED: ${test.name}\n`);
      } catch (error) {
        this.failed++;
        console.log(`❌ FAILED: ${test.name}`);
        console.log(`   Error: ${error.message}\n`);
      }
    }

    this.printSummary();
  }

  /**
   * Print test summary
   */
  printSummary() {
    const total = this.passed + this.failed;
    console.log('📊 Test Summary:');
    console.log(`   Total: ${total}`);
    console.log(`   Passed: ${this.passed} ✅`);
    console.log(`   Failed: ${this.failed} ${this.failed > 0 ? '❌' : '✅'}`);
    console.log(`   Success Rate: ${total > 0 ? Math.round((this.passed / total) * 100) : 0}%`);

    if (this.failed > 0) {
      console.log('\n⚠️  Some tests failed. Please check the implementation.');
      process.exit(1);
    } else {
      console.log('\n🎉 All tests passed! GASSAPI MCP Server v2 is working perfectly!');
    }
  }

  /**
   * Assert helper
   */
  assert(condition, message) {
    if (!condition) {
      throw new Error(message || `Assertion failed in ${this.currentTest}`);
    }
  }

  /**
   * Test server startup
   */
  async testServerStartup() {
    const result = await this.runCommand('--help');
    this.assert(result.stdout.includes('GASSAPI MCP Server v2'), 'Help command should show server name');
    this.assert(result.stdout.includes('8 Working Tools'), 'Should show correct number of tools');
  }

  /**
   * Test configuration initialization
   */
  async testConfigurationInit() {
    const testConfigFile = 'test-config.json';

    // Remove existing test config if any
    if (existsSync(testConfigFile)) {
      unlinkSync(testConfigFile);
    }

    // Test config creation
    const result = await this.runCommand(`--init --project "Test Project" --config ${testConfigFile}`);
    this.assert(existsSync(testConfigFile), 'Configuration file should be created');

    // Verify config content
    const config = JSON.parse(readFileSync(testConfigFile, 'utf-8'));
    this.assert(config._metadata.project_name === 'Test Project', 'Project name should be set correctly');
    this.assert(config.auth.token === 'YOUR_GASSAPI_TOKEN_HERE', 'Default token should be placeholder');

    // Cleanup
    unlinkSync(testConfigFile);
  }

  /**
   * Test status command
   */
  async testStatusCommand() {
    const result = await this.runCommand('--status');
    this.assert(result.stdout.includes('Server Status: OK'), 'Server status should be OK');
    this.assert(result.stdout.includes('Configuration Status:'), 'Should show configuration status');
  }

  /**
   * Test MCP protocol communication
   */
  async testMcpProtocol() {
    const responses = await this.sendMcpRequests([
      {
        jsonrpc: '2.0',
        id: 1,
        method: 'initialize',
        params: {
          protocolVersion: '2025-06-18',
          capabilities: { tools: {} },
          clientInfo: { name: 'test-client', version: '1.0.0' }
        }
      },
      {
        jsonrpc: '2.0',
        id: 2,
        method: 'tools/list',
        params: {}
      }
    ]);

    // Check initialization response
    const initResponse = responses.find(r => r.id === 1);
    this.assert(initResponse, 'Should receive initialization response');
    this.assert(initResponse.result.serverInfo.name === 'GASSAPI MCP v2', 'Server info should be correct');

    // Check tools list response
    const toolsResponse = responses.find(r => r.id === 2);
    this.assert(toolsResponse, 'Should receive tools list response');
    this.assert(toolsResponse.result.tools.length === 8, 'Should have 8 tools');

    // Check specific tools exist
    const toolNames = toolsResponse.result.tools.map(t => t.name);
    this.assert(toolNames.includes('echo'), 'Should have echo tool');
    this.assert(toolNames.includes('gassapi_auth'), 'Should have gassapi_auth tool');
    this.assert(toolNames.includes('gassapi_send_request'), 'Should have gassapi_send_request tool');
  }

  /**
   * Test basic tools
   */
  async testBasicTools() {
    const responses = await this.sendMcpRequests([
      {
        jsonrpc: '2.0',
        id: 1,
        method: 'initialize',
        params: {
          protocolVersion: '2025-06-18',
          capabilities: { tools: {} },
          clientInfo: { name: 'test-client', version: '1.0.0' }
        }
      },
      {
        jsonrpc: '2.0',
        id: 2,
        method: 'tools/call',
        params: {
          name: 'echo',
          arguments: { message: 'Test Message' }
        }
      },
      {
        jsonrpc: '2.0',
        id: 3,
        method: 'tools/call',
        params: {
          name: 'health_check',
          arguments: {}
        }
      }
    ]);

    // Check echo tool
    const echoResponse = responses.find(r => r.id === 2);
    this.assert(echoResponse, 'Should receive echo tool response');
    this.assert(echoResponse.result.content[0].text.includes('Test Message'), 'Echo should return the message');

    // Check health check tool
    const healthResponse = responses.find(r => r.id === 3);
    this.assert(healthResponse, 'Should receive health check response');
    this.assert(healthResponse.result.content[0].text.includes('Healthy'), 'Health check should show healthy status');
  }

  /**
   * Test GASSAPI tools (without real token)
   */
  async testGassapiTools() {
    const responses = await this.sendMcpRequests([
      {
        jsonrpc: '2.0',
        id: 1,
        method: 'initialize',
        params: {
          protocolVersion: '2025-06-18',
          capabilities: { tools: {} },
          clientInfo: { name: 'test-client', version: '1.0.0' }
        }
      },
      {
        jsonrpc: '2.0',
        id: 2,
        method: 'tools/call',
        params: {
          name: 'gassapi_validate_token',
          arguments: { token: 'test-token-12345' }
        }
      },
      {
        jsonrpc: '2.0',
        id: 3,
        method: 'tools/call',
        params: {
          name: 'gassapi_list_collections',
          arguments: { token: 'test-token-12345' }
        }
      }
    ]);

    // Check token validation (should work with test token)
    const tokenResponse = responses.find(r => r.id === 2);
    this.assert(tokenResponse, 'Should receive token validation response');
    this.assert(tokenResponse.result.content[0].text.includes('Hasil Validasi Token'), 'Should return validation result');

    // Check collections list (should work with test token)
    const collectionsResponse = responses.find(r => r.id === 3);
    this.assert(collectionsResponse, 'Should receive collections response');
    this.assert(collectionsResponse.result.content[0].text.includes('Koleksi GASSAPI'), 'Should return collections list');
  }

  /**
   * Test error handling
   */
  async testErrorHandling() {
    const responses = await this.sendMcpRequests([
      {
        jsonrpc: '2.0',
        id: 1,
        method: 'initialize',
        params: {
          protocolVersion: '2025-06-18',
          capabilities: { tools: {} },
          clientInfo: { name: 'test-client', version: '1.0.0' }
        }
      },
      {
        jsonrpc: '2.0',
        id: 2,
        method: 'tools/call',
        params: {
          name: 'non_existent_tool',
          arguments: {}
        }
      }
    ]);

    // Check error response for unknown tool
    const errorResponse = responses.find(r => r.id === 2);
    this.assert(errorResponse, 'Should receive error response');
    this.assert(errorResponse.result.isError === true, 'Should be marked as error');
    this.assert(errorResponse.result.content[0].text.includes('Unknown tool'), 'Should show unknown tool error');
  }

  /**
   * Run a command and return result
   */
  async runCommand(args) {
    return new Promise((resolve, reject) => {
      const process = spawn('node', ['dist/index.js', ...args.split(' ')], {
        cwd: process.cwd(),
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let stdout = '';
      let stderr = '';

      process.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      process.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      process.on('error', reject);

      process.on('exit', (code) => {
        resolve({ stdout, stderr, code });
      });

      // Timeout after 10 seconds
      setTimeout(() => {
        process.kill();
        reject(new Error('Command timeout'));
      }, 10000);
    });
  }

  /**
   * Send multiple MCP requests and return responses
   */
  async sendMcpRequests(requests) {
    return new Promise((resolve, reject) => {
      const serverProcess = spawn('node', ['dist/index.js'], {
        stdio: ['pipe', 'pipe', 'pipe']
      });

      const responses = [];
      let responseData = '';

      // Collect responses
      serverProcess.stdout.on('data', (data) => {
        responseData += data.toString();

        // Try to parse JSON responses
        const lines = responseData.trim().split('\n').filter(line => line.trim());
        for (const line of lines) {
          try {
            const response = JSON.parse(line);
            if (response.id) {
              responses.push(response);
            }
          } catch {
            // Ignore non-JSON lines
          }
        }
      });

      serverProcess.stderr.on('data', (data) => {
        // Log server messages but don't treat as errors
        const logs = data.toString().trim();
        if (logs && !logs.includes('[CONFIG]')) {
          // Only log non-config messages to reduce noise
        }
      });

      serverProcess.on('error', reject);

      serverProcess.on('exit', (code) => {
        if (responses.length === requests.length) {
          resolve(responses);
        } else {
          reject(new Error(`Expected ${requests.length} responses, got ${responses.length}`));
        }
      });

      // Send requests with delays
      let delay = 100;
      requests.forEach((request, index) => {
        setTimeout(() => {
          serverProcess.stdin.write(JSON.stringify(request) + '\n');
        }, delay);
        delay += 500;
      });

      // Timeout after 15 seconds
      setTimeout(() => {
        serverProcess.kill();
        reject(new Error('MCP request timeout'));
      }, 15000);
    });
  }
}

// Create and run test suite
async function main() {
  const suite = new TestSuite();

  // Add all tests
  suite.addTest('Server Startup', () => suite.testServerStartup());
  suite.addTest('Configuration Initialization', () => suite.testConfigurationInit());
  suite.addTest('Status Command', () => suite.testStatusCommand());
  suite.addTest('MCP Protocol Communication', () => suite.testMcpProtocol());
  suite.addTest('Basic Tools', () => suite.testBasicTools());
  suite.addTest('GASSAPI Tools', () => suite.testGassapiTools());
  suite.addTest('Error Handling', () => suite.testErrorHandling());

  // Run all tests
  await suite.runAllTests();
}

// Run tests
main().catch(error => {
  console.error('❌ Test suite failed:', error);
  process.exit(1);
});