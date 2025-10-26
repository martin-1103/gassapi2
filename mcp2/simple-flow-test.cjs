#!/usr/bin/env node

/**
 * Simple Flow Test
 * Test flow creation and execution directly
 */

const fs = require('fs');
const path = require('path');

// Test configuration
const CONFIG_PATH = path.join(__dirname, 'gassapi.json');

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

// Simple flow with correct structure
const SIMPLE_FLOW = {
  name: 'Simple Test Flow',
  description: 'Basic flow for testing execution',
  flow_inputs: [
    {
      name: 'testValue',
      type: 'string',
      required: true,
      description: 'Test value'
    }
  ],
  flow_data: {
    version: '1.0',
    steps: [
      {
        id: 'test_step',
        name: 'Test Step',
        method: 'GET',
        url: 'http://localhost:8080/gassapi/backend-php/?act=health',
        headers: {},
        body: null,
        timeout: 5000,
        expectedStatus: 200,
        description: 'Simple health check test'
      }
    ],
    config: {
      timeout: 30000,
      stopOnError: true,
      parallel: false,
      maxConcurrency: 1
    }
  }
};

async function setupConfig() {
  try {
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(TEST_CONFIG, null, 2));
    console.log('✅ Configuration created');
  } catch (error) {
    console.error('❌ Config creation failed:', error.message);
  }
}

async function testBackendFlow() {
  console.log('🧪 Testing flow creation via backend API...');

  try {
    const fetch = require('node-fetch');

    // Test backend health
    const healthResponse = await fetch('http://localhost:8080/gassapi/backend-php/?act=health');
    const healthData = await healthResponse.json();
    console.log('Backend health:', healthData);

    if (!healthData.success) {
      console.log('⚠️ Backend not available, skipping flow test');
      return;
    }

    // Create flow via backend
    const flowData = {
      ...SIMPLE_FLOW,
      project_id: 'project-1',
      folder_id: null
    };

    console.log('Creating flow with data:', JSON.stringify(flowData, null, 2));

    const createResponse = await fetch('http://localhost:8080/gassapi/backend-php/?act=flow_create&id=project-1', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token-12345'
      },
      body: JSON.stringify(flowData)
    });

    const createResult = await createResponse.json();
    console.log('Flow creation result:', JSON.stringify(createResult, null, 2));

    if (createResult.success && createResult.data && createResult.data.flow_id) {
      const flowId = createResult.data.flow_id;
      console.log('✅ Flow created with ID:', flowId);

      // Test flow details
      const detailsResponse = await fetch(`http://localhost:8080/gassapi/backend-php/?act=flow&id=${flowId}`, {
        headers: {
          'Authorization': 'Bearer test-token-12345'
        }
      });

      const detailsResult = await detailsResponse.json();
      console.log('Flow details:', JSON.stringify(detailsResult, null, 2));

      // Check if flow_data is properly formatted
      if (detailsResult.success && detailsResult.data) {
        const flow = detailsResult.data;
        console.log('Flow data type:', typeof flow.flow_data);

        if (typeof flow.flow_data === 'string') {
          try {
            const parsedFlowData = JSON.parse(flow.flow_data);
            console.log('✅ Flow data can be parsed');
            console.log('Steps count:', parsedFlowData.steps?.length || 0);
            console.log('Step details:', parsedFlowData.steps);
          } catch (e) {
            console.error('❌ Flow data parsing failed:', e.message);
          }
        } else {
          console.log('Flow data structure:', flow.flow_data);
          console.log('Steps count:', flow.flow_data?.steps?.length || 0);
        }
      }
    }

  } catch (error) {
    console.error('❌ Backend test failed:', error.message);
  }
}

async function cleanup() {
  try {
    if (fs.existsSync(CONFIG_PATH)) {
      fs.unlinkSync(CONFIG_PATH);
    }
    console.log('✅ Cleanup completed');
  } catch (error) {
    console.error('⚠️ Cleanup warning:', error.message);
  }
}

async function main() {
  console.log('🚀 Simple Flow Test');
  console.log('===================');

  try {
    await setupConfig();
    await testBackendFlow();
    console.log('🎉 Test completed!');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await cleanup();
  }
}

main();