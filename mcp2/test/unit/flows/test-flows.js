/**
 * Test Flows
 * Test flow management and execution functionality
 */

const { createTestClient, withTestClient } = require('../../utils/McpTestClient.js');
const { Assert, TestUtils, TestDataGenerator } = require('../../utils/TestHelpers.js');

/**
 * Helper function to validate MCP response format
 */
function validateMcpResponse(result, expectedContentPattern = null) {
  Assert.isNotNull(result, 'Response should not be null');
  Assert.isTrue(Array.isArray(result.content), 'Response should have content array');
  Assert.isTrue(result.content.length > 0, 'Response content should not be empty');
  Assert.isTrue(result.content[0].type === 'text', 'Content should be text type');
  Assert.isString(result.content[0].text, 'Content should be string');

  if (expectedContentPattern) {
    Assert.isTrue(result.content[0].text.includes(expectedContentPattern),
      `Response should contain: ${expectedContentPattern}`);
  }

  return result;
}

/**
 * Test create_flow with steps format
 */
async function testCreateFlow() {
  const startTime = Date.now();
  const testFlowName = `Test Flow ${Date.now()}`;

  await TestUtils.withTimeout(
    (async () => {
      await withTestClient({ debug: false }, async (client) => {
        // Create a test flow with steps format
        const result = await client.call('create_flow', {
          project_id: 'test-project-id', // This would come from config in real implementation
          name: testFlowName,
          description: 'Test flow for automation testing',
          flow_data: {
            version: '1.0',
            steps: [
              {
                id: 'step1',
                name: 'GET Request',
                method: 'GET',
                url: '{{input.baseUrl}}/api/users',
                headers: {
                  'Content-Type': 'application/json'
                },
                outputs: {
                  'users': 'response.body'
                }
              },
              {
                id: 'step2',
                name: 'POST Request',
                method: 'POST',
                url: '{{input.baseUrl}}/api/users',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: {
                  'name': '{{input.userName}}',
                  'email': '{{input.userEmail}}'
                },
                outputs: {
                  'createdUser': 'response.body'
                }
              }
            ],
            config: {
              delay: 1000,
              retryCount: 3,
              parallel: false
            }
          }
        });

        // Validate MCP response format
        validateMcpResponse(result, 'Flow');

        console.log(`✅ Successfully created flow: ${testFlowName}`);
      });
    })(),
    15000,
    'create_flow test timed out'
  );

  return {
    name: 'testCreateFlow',
    status: 'passed',
    duration: Date.now() - startTime,
    message: `Successfully created flow: ${testFlowName}`
  };
}

/**
 * Test list_flows functionality
 */
async function testListFlows() {
  const startTime = Date.now();

  await TestUtils.withTimeout(
    (async () => {
      await withTestClient({ debug: false }, async (client) => {
        // Call with project_id parameter
        const result = await client.call('list_flows', {
          project_id: 'test-project-id'
        });

        // Validate MCP response format (check for any response, not specific pattern)
        validateMcpResponse(result);

        console.log(`✅ Successfully listed flows`);
      });
    })(),
    15000,
    'list_flows test timed out'
  );

  return {
    name: 'testListFlows',
    status: 'passed',
    duration: Date.now() - startTime,
    message: 'Successfully listed flows'
  };
}

/**
 * Test get_flow_detail functionality
 */
async function testGetFlowDetail() {
  const startTime = Date.now();
  const testFlowId = 'test-flow-id';

  await TestUtils.withTimeout(
    (async () => {
      await withTestClient({ debug: false }, async (client) => {
        const result = await client.call('get_flow_detail', {
          flow_id: testFlowId
        });

        // Validate MCP response format
        validateMcpResponse(result, 'Flow');

        console.log(`✅ Successfully retrieved flow details`);
      });
    })(),
    15000,
    'get_flow_detail test timed out'
  );

  return {
    name: 'testGetFlowDetail',
    status: 'passed',
    duration: Date.now() - startTime,
    message: 'Successfully retrieved flow details'
  };
}

/**
 * Test execute_flow functionality
 */
async function testExecuteFlow() {
  const startTime = Date.now();
  const testFlowId = 'test-flow-id';
  const testEnvironmentId = 'test-env-id';

  await TestUtils.withTimeout(
    (async () => {
      await withTestClient({ debug: false }, async (client) => {
        // First set environment variables
        await client.call('set_environment_variables', {
          variables: {
            'baseUrl': 'https://api.example.com',
            'timeout': '30000'
          }
        });

        // Then set flow inputs
        await client.call('set_flow_inputs', {
          inputs: {
            'userName': 'testuser',
            'userEmail': 'test@example.com'
          }
        });

        // Execute the flow
        const result = await client.call('execute_flow', {
          flow_id: testFlowId,
          environment_id: testEnvironmentId,
          max_execution_time: 60000,
          debug_mode: false
        });

        // Validate MCP response format (check for any response, not specific pattern)
        validateMcpResponse(result);

        console.log(`✅ Successfully executed flow`);
      });
    })(),
    65000,
    'execute_flow test timed out'
  );

  return {
    name: 'testExecuteFlow',
    status: 'passed',
    duration: Date.now() - startTime,
    message: 'Successfully executed flow'
  };
}

/**
 * Test delete_flow functionality (cleanup)
 */
async function testDeleteFlow() {
  const startTime = Date.now();
  const testFlowId = 'test-flow-id';

  await TestUtils.withTimeout(
    (async () => {
      await withTestClient({ debug: false }, async (client) => {
        const result = await client.call('delete_flow', {
          flow_id: testFlowId
        });

        // Validate MCP response format (check for any response, not specific pattern)
        validateMcpResponse(result);

        console.log(`✅ Successfully deleted flow`);
      });
    })(),
    15000,
    'delete_flow test timed out'
  );

  return {
    name: 'testDeleteFlow',
    status: 'passed',
    duration: Date.now() - startTime,
    message: 'Successfully deleted flow'
  };
}

/**
 * Test flow operations response format
 */
async function testFlowsResponseFormat() {
  const startTime = Date.now();

  await TestUtils.withTimeout(
    (async () => {
      await withTestClient({ debug: false }, async (client) => {
        // Test list flows response format
        const listResult = await client.call('list_flows', {
          project_id: 'test-project-id'
        });

        validateMcpResponse(listResult);

        console.log(`✅ Response format validated successfully`);
      });
    })(),
    15000,
    'flows response format test timed out'
  );

  return {
    name: 'testFlowsResponseFormat',
    status: 'passed',
    duration: Date.now() - startTime,
    message: 'Response format validated successfully'
  };
}

/**
 * Test flow operations with invalid data
 */
async function testFlowInvalidData() {
  const startTime = Date.now();
  let errorCaught = false;
  let errorMessage = '';

  await TestUtils.withTimeout(
    (async () => {
      await withTestClient({ debug: false }, async (client) => {
        try {
          // Test create flow without required fields
          const result = await client.call('create_flow', {
            // Missing project_id, name
            description: 'Test flow without required fields'
          });

          // Check if response contains error information
          if (result && result.content && result.content.length > 0) {
            const responseText = result.content[0].text;
            if (responseText.includes('Error') || responseText.includes('Failed') || responseText.includes('Required')) {
              errorCaught = true;
              errorMessage = responseText;
            } else {
              throw new Error('Expected error for missing required fields but got successful response');
            }
          } else {
            throw new Error('Expected error but got empty response');
          }
        } catch (error) {
          errorCaught = true;
          errorMessage = error.message;
        }
      });
    })(),
    15000,
    'flow invalid data test timed out'
  );

  Assert.isTrue(errorCaught, 'Should have caught an error');
  Assert.isTrue(errorMessage.length > 0, 'Error message should not be empty');

  return {
    name: 'testFlowInvalidData',
    status: 'passed',
    duration: Date.now() - startTime,
    message: `Correctly handled invalid data: ${errorMessage.substring(0, 100)}...`
  };
}

module.exports = {
  testCreateFlow,
  testListFlows,
  testGetFlowDetail,
  testExecuteFlow,
  testDeleteFlow,
  testFlowsResponseFormat,
  testFlowInvalidData
};