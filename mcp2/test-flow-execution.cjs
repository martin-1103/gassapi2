#!/usr/bin/env node

/**
 * Test Flow Execution Script
 * Test complete user registration flow: register -> login -> update profile
 */

const { spawn } = require('child_process');
const path = require('path');

const CONFIG_PATH = path.join(__dirname, 'gassapi.json');

// Test configuration
const TEST_CONFIG = {
  project: {
    id: 'project-1',
    name: 'Test Project'
  },
  api: {
    baseURL: 'http://localhost:8080/gassapi/backend-php'
  },
  mcpClient: {
    token: 'test-token-12345'
  }
};

// User Registration Flow with correct structure
const USER_REGISTRATION_FLOW = {
  name: 'User Registration Flow',
  description: 'Complete user registration flow: register -> login -> update profile',
  flow_inputs: [
    {
      name: 'username',
      type: 'string',
      required: true,
      validation: { min_length: 3, max_length: 50 },
      description: 'Username untuk registrasi'
    },
    {
      name: 'email',
      type: 'email',
      required: true,
      description: 'Email address user'
    },
    {
      name: 'password',
      type: 'password',
      required: true,
      validation: { min_length: 8 },
      description: 'Password user'
    }
  ],
  flow_data: {
    version: '1.0',
    steps: [
      {
        id: 'register_user',
        name: 'Register User',
        method: 'POST',
        url: 'http://localhost:8080/gassapi/backend-php/?act=register',
        headers: { 'Content-Type': 'application/json' },
        body: {
          username: '{{input.username}}',
          email: '{{input.email}}',
          password: '{{input.password}}'
        },
        timeout: 30000,
        expectedStatus: 201
      },
      {
        id: 'login_user',
        name: 'Login User',
        method: 'POST',
        url: 'http://localhost:8080/gassapi/backend-php/?act=login',
        headers: { 'Content-Type': 'application/json' },
        body: {
          email: '{{input.email}}',
          password: '{{input.password}}'
        },
        timeout: 30000,
        expectedStatus: 200
      },
      {
        id: 'update_profile',
        name: 'Update Profile',
        method: 'PUT',
        url: 'http://localhost:8080/gassapi/backend-php/?act=user&id={{register_user.userId}}',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer {{login_user.accessToken}}'
        },
        body: {
          username: '{{input.username}}'
        },
        timeout: 30000,
        expectedStatus: 200
      }
    ],
    config: {
      timeout: 60000,
      stopOnError: true,
      parallel: false,
      maxConcurrency: 1
    }
  }
};

async function setupConfig() {
  console.log('🔧 Setting up test configuration...');
  const fs = require('fs');

  try {
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(TEST_CONFIG, null, 2));
    console.log('✅ Configuration file created');
  } catch (error) {
    console.error('❌ Failed to create config:', error.message);
    process.exit(1);
  }
}

async function startMcpServer() {
  console.log('🚀 Starting MCP server...');

  return new Promise((resolve, reject) => {
    const server = spawn('npm', ['start'], {
      cwd: __dirname,
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let serverOutput = '';
    let serverError = '';

    server.stdout.on('data', (data) => {
      serverOutput += data.toString();
      console.log('SERVER:', data.toString().trim());

      // Check if server is ready
      if (serverOutput.includes('MCP server started') ||
          serverOutput.includes('Server listening') ||
          serverOutput.includes('ready')) {
        console.log('✅ MCP server is ready');
        resolve(server);
      }
    });

    server.stderr.on('data', (data) => {
      serverError += data.toString();
      console.error('SERVER ERROR:', data.toString().trim());
    });

    server.on('error', (error) => {
      console.error('❌ Failed to start server:', error.message);
      reject(error);
    });

    server.on('close', (code) => {
      if (code !== 0) {
        console.error(`❌ Server exited with code ${code}`);
        reject(new Error(`Server exited with code ${code}`));
      }
    });

    // Timeout after 10 seconds
    setTimeout(() => {
      if (serverOutput && !serverOutput.includes('ready')) {
        console.log('⚠️ Server might be ready (timeout reached)');
        resolve(server);
      }
    }, 10000);
  });
}

async function testMcpTools(server) {
  console.log('🧪 Testing MCP tools...');

  return new Promise((resolve, reject) => {
    const testClient = spawn('node', [path.join(__dirname, 'test-flow-client.js')], {
      cwd: __dirname,
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let testOutput = '';
    let testError = '';

    testClient.stdout.on('data', (data) => {
      const output = data.toString().trim();
      testOutput += output;
      console.log('TEST:', output);
    });

    testClient.stderr.on('data', (data) => {
      const error = data.toString().trim();
      testError += error;
      console.error('TEST ERROR:', error);
    });

    testClient.on('close', (code) => {
      if (code === 0) {
        console.log('✅ Flow execution test completed');
        resolve(testOutput);
      } else {
        console.error(`❌ Test failed with code ${code}`);
        reject(new Error(`Test failed: ${testError}`));
      }
    });

    testClient.on('error', (error) => {
      console.error('❌ Test client error:', error.message);
      reject(error);
    });
  });
}

async function createFlowTestClient() {
  const fs = require('fs');

  const testClientCode = `
#!/usr/bin/env node

/**
 * Flow Test Client
 * Tests flow creation and execution
 */

const { spawn } = require('child_process');

async function runMcpTool(toolName, args) {
  return new Promise((resolve, reject) => {
    const client = spawn('npm', ['start'], {
      cwd: __dirname,
      stdio: ['pipe', 'pipe', 'pipe']
    });

    // Send MCP request
    const request = {
      jsonrpc: '2.0',
      id: Date.now(),
      method: 'tools/call',
      params: {
        name: toolName,
        arguments: args
      }
    };

    client.stdin.write(JSON.stringify(request) + '\\n');

    let output = '';
    let error = '';

    client.stdout.on('data', (data) => {
      output += data.toString();
      try {
        const response = JSON.parse(output);
        if (response.id === request.id) {
          client.kill();
          resolve(response);
        }
      } catch (e) {
        // Still parsing
      }
    });

    client.stderr.on('data', (data) => {
      error += data.toString();
    });

    client.on('close', () => {
      if (output) {
        try {
          resolve(JSON.parse(output));
        } catch (e) {
          reject(new Error(\`Failed to parse response: \${output}\`));
        }
      } else {
        reject(new Error(\`Client error: \${error}\`));
      }
    });

    setTimeout(() => {
      client.kill();
      reject(new Error('Timeout'));
    }, 30000);
  });
}

async function testFlow() {
  try {
    console.log('🧪 Testing flow creation and execution...');

    // Test health check
    console.log('1. Testing health check...');
    const health = await runMcpTool('health_check', {});
    console.log('Health check result:', health);

    // Test flow creation
    console.log('2. Creating user registration flow...');
    const createResult = await runMcpTool('create_flow', ${JSON.stringify(USER_REGISTRATION_FLOW, null, 2)});
    console.log('Flow creation result:', createResult);

    if (!createResult.result || !createResult.result.content) {
      throw new Error('Failed to create flow');
    }

    const flowData = JSON.parse(createResult.result.content[0].text);
    if (!flowData.success || !flowData.data.flowId) {
      throw new Error('Flow creation failed: ' + (flowData.error || 'Unknown error'));
    }

    const flowId = flowData.data.flowId;
    console.log('✅ Flow created with ID:', flowId);

    // Test flow details
    console.log('3. Getting flow details...');
    const detailsResult = await runMcpTool('get_flow_details', { flowId });
    console.log('Flow details result:', detailsResult);

    // Test flow execution
    console.log('4. Executing flow...');
    const executeResult = await runMcpTool('execute_flow', {
      flowId,
      variables: {
        username: 'testuser123',
        email: 'test@example.com',
        password: 'password123'
      },
      dryRun: true
    });
    console.log('Flow execution result:', executeResult);

    console.log('✅ All tests completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

testFlow();
`;

  try {
    fs.writeFileSync(path.join(__dirname, 'test-flow-client.js'), testClientCode);
    console.log('✅ Test client created');
  } catch (error) {
    console.error('❌ Failed to create test client:', error.message);
  }
}

async function cleanup() {
  console.log('🧹 Cleaning up...');
  const fs = require('fs');

  try {
    if (fs.existsSync(CONFIG_PATH)) {
      fs.unlinkSync(CONFIG_PATH);
    }
    if (fs.existsSync(path.join(__dirname, 'test-flow-client.js'))) {
      fs.unlinkSync(path.join(__dirname, 'test-flow-client.js'));
    }
    console.log('✅ Cleanup completed');
  } catch (error) {
    console.error('⚠️ Cleanup warning:', error.message);
  }
}

async function main() {
  console.log('🚀 Starting Flow Execution Test');
  console.log('=====================================');

  let server = null;

  try {
    // Setup
    await setupConfig();
    await createFlowTestClient();

    // Start server
    server = await startMcpServer();

    // Wait a bit for server to be fully ready
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Test flow execution
    await testMcpTools(server);

    console.log('🎉 Flow execution test completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  } finally {
    // Cleanup
    if (server) {
      server.kill();
    }
    await cleanup();
  }
}

// Handle cleanup on exit
process.on('SIGINT', async () => {
  console.log('\\n🛑 Received SIGINT, cleaning up...');
  await cleanup();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\\n🛑 Received SIGTERM, cleaning up...');
  await cleanup();
  process.exit(0);
});

main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});