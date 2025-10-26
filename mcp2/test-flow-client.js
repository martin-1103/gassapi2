
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

    client.stdin.write(JSON.stringify(request) + '\n');

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
          reject(new Error(`Failed to parse response: ${output}`));
        }
      } else {
        reject(new Error(`Client error: ${error}`));
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
    const createResult = await runMcpTool('create_flow', {
  "name": "User Registration Flow",
  "description": "Complete user registration flow: register -> login -> update profile",
  "flow_inputs": [
    {
      "name": "username",
      "type": "string",
      "required": true,
      "validation": {
        "min_length": 3,
        "max_length": 50
      },
      "description": "Username untuk registrasi"
    },
    {
      "name": "email",
      "type": "email",
      "required": true,
      "description": "Email address user"
    },
    {
      "name": "password",
      "type": "password",
      "required": true,
      "validation": {
        "min_length": 8
      },
      "description": "Password user"
    }
  ],
  "flow_data": {
    "version": "1.0",
    "steps": [
      {
        "id": "register_user",
        "name": "Register User",
        "method": "POST",
        "url": "http://localhost:8080/gassapi/backend-php/?act=register",
        "headers": {
          "Content-Type": "application/json"
        },
        "body": {
          "username": "{{input.username}}",
          "email": "{{input.email}}",
          "password": "{{input.password}}"
        },
        "timeout": 30000,
        "expectedStatus": 201
      },
      {
        "id": "login_user",
        "name": "Login User",
        "method": "POST",
        "url": "http://localhost:8080/gassapi/backend-php/?act=login",
        "headers": {
          "Content-Type": "application/json"
        },
        "body": {
          "email": "{{input.email}}",
          "password": "{{input.password}}"
        },
        "timeout": 30000,
        "expectedStatus": 200
      },
      {
        "id": "update_profile",
        "name": "Update Profile",
        "method": "PUT",
        "url": "http://localhost:8080/gassapi/backend-php/?act=user&id={{register_user.userId}}",
        "headers": {
          "Content-Type": "application/json",
          "Authorization": "Bearer {{login_user.accessToken}}"
        },
        "body": {
          "username": "{{input.username}}"
        },
        "timeout": 30000,
        "expectedStatus": 200
      }
    ],
    "config": {
      "timeout": 60000,
      "stopOnError": true,
      "parallel": false,
      "maxConcurrency": 1
    }
  }
});
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
