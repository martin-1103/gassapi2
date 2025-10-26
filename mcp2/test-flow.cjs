#!/usr/bin/env node

/**
 * Test Flow Creation and Execution
 * Test user registration flow dengan backend yang benar
 */

const fs = require('fs');
const path = require('path');

// User Registration Flow dengan correct structure dan URL
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
      description: 'Password user minimal 8 karakter'
    }
  ],
  flow_data: {
    version: '1.0',
    steps: [
      {
        id: 'register_user',
        name: 'Register User',
        method: 'POST',
        url: 'http://localhost:8080/gassapi2/backend/?act=register',
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
        url: 'http://localhost:8080/gassapi2/backend/?act=login',
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
        url: 'http://localhost:8080/gassapi2/backend/?act=user&id={{register_user.userId}}',
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

async function testFlowCreation() {
  console.log('🧪 Testing Flow Creation via Backend API...');

  const flowData = {
    ...USER_REGISTRATION_FLOW,
    project_id: 'proj_1761385246_5ec798d9', // dari gassapi.json
    folder_id: null
  };

  console.log('Creating flow with data:', JSON.stringify(flowData, null, 2));

  try {
    const response = await fetch('http://localhost:8080/gassapi2/backend/?act=flow_create&id=proj_1761385246_5ec798d9', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer 2032781cbb63ea282749778091b2170a5a18d0491a519bad4ab488ab463e885d'
      },
      body: JSON.stringify(flowData)
    });

    const result = await response.json();
    console.log('✅ Flow creation result:', JSON.stringify(result, null, 2));

    if (result.success && result.data && result.data.flow_id) {
      const flowId = result.data.flow_id;
      console.log('✅ Flow created with ID:', flowId);

      // Test flow details
      console.log('\n🔍 Testing Flow Details...');
      const detailsResponse = await fetch(`http://localhost:8080/gassapi2/backend/?act=flow&id=${flowId}`, {
        headers: {
          'Authorization': 'Bearer 2032781cbb63ea282749778091b2170a5a18d0491a519bad4ab488ab463e885d'
        }
      });

      const detailsResult = await detailsResponse.json();
      console.log('✅ Flow details result:', JSON.stringify(detailsResult, null, 2));

      // Check flow_data structure
      if (detailsResult.success && detailsResult.data) {
        const flow = detailsResult.data;
        console.log('\n📊 Flow Data Analysis:');
        console.log('- flow_data type:', typeof flow.flow_data);

        if (typeof flow.flow_data === 'string') {
          try {
            const parsedFlowData = JSON.parse(flow.flow_data);
            console.log('✅ Flow data successfully parsed');
            console.log('- Version:', parsedFlowData.version);
            console.log('- Steps count:', parsedFlowData.steps?.length || 0);
            console.log('- Config:', parsedFlowData.config);

            if (parsedFlowData.steps && parsedFlowData.steps.length > 0) {
              console.log('- First step:', parsedFlowData.steps[0]);
            }
          } catch (e) {
            console.error('❌ Flow data parsing failed:', e.message);
          }
        } else {
          console.log('- Flow data is object:', flow.flow_data);
          console.log('- Steps count:', flow.flow_data?.steps?.length || 0);
        }

        return flowId;
      }
    } else {
      console.error('❌ Flow creation failed:', result);
    }
  } catch (error) {
    console.error('❌ Flow creation error:', error.message);
  }

  return null;
}

async function testFlowExecution(flowId) {
  if (!flowId) {
    console.log('❌ No flow ID available for execution test');
    return;
  }

  console.log('\n🚀 Testing Flow Execution via MCP...');

  try {
    // Test via MCP execute_flow tool
    const mcpRequest = {
      jsonrpc: '2.0',
      id: Date.now(),
      method: 'tools/call',
      params: {
        name: 'execute_flow',
        arguments: {
          flowId,
          variables: 'username=testuser123,email=test@example.com,password=password123',
          dryRun: true
        }
      }
    };

    console.log('MCP Request:', JSON.stringify(mcpRequest, null, 2));

    // Start MCP server dan test
    const { spawn } = require('child_process');

    return new Promise((resolve, reject) => {
      const mcpServer = spawn('npm', ['start'], {
        cwd: __dirname,
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let output = '';
      let errorOutput = '';

      mcpServer.stdout.on('data', (data) => {
        const chunk = data.toString();
        output += chunk;
        console.log('MCP:', chunk.trim());

        // Look for response
        if (chunk.includes('"result"') || chunk.includes('"error"')) {
          try {
            const response = JSON.parse(output.trim());
            mcpServer.kill();
            resolve(response);
          } catch (e) {
            // Still parsing
          }
        }
      });

      mcpServer.stderr.on('data', (data) => {
        const chunk = data.toString();
        errorOutput += chunk;
        console.error('MCP Error:', chunk.trim());
      });

      mcpServer.on('error', (error) => {
        console.error('❌ MCP server error:', error.message);
        reject(error);
      });

      // Send request
      mcpServer.stdin.write(JSON.stringify(mcpRequest) + '\n');

      // Timeout
      setTimeout(() => {
        mcpServer.kill();
        reject(new Error('MCP test timeout'));
      }, 15000);
    });

  } catch (error) {
    console.error('❌ Flow execution error:', error.message);
  }
}

async function main() {
  console.log('🚀 Flow Creation and Execution Test');
  console.log('===================================');

  try {
    // Test backend health
    console.log('1. Testing Backend Health...');
    const healthResponse = await fetch('http://localhost:8080/gassapi2/backend/?act=health');
    const healthData = await healthResponse.json();
    console.log('✅ Backend Health:', healthData.success ? 'OK' : 'Failed');

    // Test flow creation
    console.log('\n2. Testing Flow Creation...');
    const flowId = await testFlowCreation();

    // Test flow execution
    if (flowId) {
      console.log('\n3. Testing Flow Execution...');
      const executionResult = await testFlowExecution(flowId);
      console.log('✅ Flow execution result:', executionResult);
    }

    console.log('\n🎉 Test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

main();