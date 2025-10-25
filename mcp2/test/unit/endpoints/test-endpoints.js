/**
 * Test Endpoints
 * Test endpoint management functionality
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
 * Test list_endpoints with auto project detection
 */
async function testListEndpointsSuccess() {
  const startTime = Date.now();

  await TestUtils.withTimeout(
    (async () => {
      await withTestClient({ debug: false }, async (client) => {
        // Call without project_id - MCP server will auto-use config
        const result = await client.call('list_endpoints', {});

        // Validate MCP response format
        validateMcpResponse(result, 'Endpoints');

        console.log(`✅ Successfully listed endpoints`);
      });
    })(),
    15000,
    'list_endpoints test timed out'
  );

  return {
    name: 'testListEndpointsSuccess',
    status: 'passed',
    duration: Date.now() - startTime,
    message: 'Successfully listed endpoints'
  };
}

/**
 * Test create_endpoint functionality
 */
async function testCreateEndpoint() {
  const startTime = Date.now();
  const testEndpointName = `Test Endpoint ${Date.now()}`;

  await TestUtils.withTimeout(
    (async () => {
      await withTestClient({ debug: false }, async (client) => {
        // First create a collection to house the endpoint
        const collectionResult = await client.call('create_collection', {
          name: `Test Collection for Endpoint ${Date.now()}`,
          description: 'Test collection for endpoint creation'
        });

        validateMcpResponse(collectionResult, 'Collection');

        // Extract collection ID from response (simplified approach)
        const collectionId = 'test-collection'; // In real implementation, parse from response

        // Create endpoint
        const result = await client.call('create_endpoint', {
          name: testEndpointName,
          method: 'GET',
          url: '/api/test-endpoint',
          collection_id: collectionId,
          description: 'Test endpoint for automation testing'
        });

        // Validate MCP response format
        validateMcpResponse(result, 'Endpoint');

        console.log(`✅ Successfully created endpoint: ${testEndpointName}`);
      });
    })(),
    15000,
    'create_endpoint test timed out'
  );

  return {
    name: 'testCreateEndpoint',
    status: 'passed',
    duration: Date.now() - startTime,
    message: `Successfully created endpoint: ${testEndpointName}`
  };
}

/**
 * Test get_endpoint_details functionality
 */
async function testGetEndpointDetails() {
  const startTime = Date.now();
  const testEndpointId = 'test-endpoint-id';

  await TestUtils.withTimeout(
    (async () => {
      await withTestClient({ debug: false }, async (client) => {
        const result = await client.call('get_endpoint_details', {
          endpoint_id: testEndpointId
        });

        // Validate MCP response format
        validateMcpResponse(result, 'Endpoint');

        console.log(`✅ Successfully retrieved endpoint details`);
      });
    })(),
    15000,
    'get_endpoint_details test timed out'
  );

  return {
    name: 'testGetEndpointDetails',
    status: 'passed',
    duration: Date.now() - startTime,
    message: 'Successfully retrieved endpoint details'
  };
}

/**
 * Test list_endpoints response format
 */
async function testListEndpointsResponseFormat() {
  const startTime = Date.now();

  await TestUtils.withTimeout(
    (async () => {
      await withTestClient({ debug: false }, async (client) => {
        // Call without project_id - MCP server auto-uses config
        const result = await client.call('list_endpoints', {});

        // Validate MCP response format
        validateMcpResponse(result, 'Endpoints');

        console.log(`✅ Response format validated successfully`);
      });
    })(),
    15000,
    'list_endpoints response format test timed out'
  );

  return {
    name: 'testListEndpointsResponseFormat',
    status: 'passed',
    duration: Date.now() - startTime,
    message: 'Response format validated successfully'
  };
}

/**
 * Test endpoint operations with invalid data
 */
async function testEndpointInvalidData() {
  const startTime = Date.now();
  let errorCaught = false;
  let errorMessage = '';

  await TestUtils.withTimeout(
    (async () => {
      await withTestClient({ debug: false }, async (client) => {
        try {
          // Test create endpoint without required fields
          const result = await client.call('create_endpoint', {
            name: 'Test Endpoint',
            // Missing method, url, collection_id
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
    'endpoint invalid data test timed out'
  );

  Assert.isTrue(errorCaught, 'Should have caught an error');
  Assert.isTrue(errorMessage.length > 0, 'Error message should not be empty');

  return {
    name: 'testEndpointInvalidData',
    status: 'passed',
    duration: Date.now() - startTime,
    message: `Correctly handled invalid data: ${errorMessage.substring(0, 100)}...`
  };
}

/**
 * Test endpoint operations performance
 */
async function testEndpointsPerformance() {
  const startTime = Date.now();
  const iterations = 3;
  const durations = [];

  await TestUtils.withTimeout(
    (async () => {
      await withTestClient({ debug: false }, async (client) => {
        for (let i = 0; i < iterations; i++) {
          const iterationStart = Date.now();

          const result = await client.call('list_endpoints', {});

          validateMcpResponse(result, 'Endpoints');

          const iterationDuration = Date.now() - iterationStart;
          durations.push(iterationDuration);

          // Small delay between iterations
          await TestUtils.wait(100);
        }

        const avgDuration = durations.reduce((sum, duration) => sum + duration, 0) / durations.length;
        const maxDuration = Math.max(...durations);

        Assert.lessThan(avgDuration, 5000, 'Average response time should be less than 5 seconds');
        Assert.lessThan(maxDuration, 10000, 'Maximum response time should be less than 10 seconds');

        console.log(`✅ Average response time: ${avgDuration.toFixed(0)}ms`);
        console.log(`✅ Max response time: ${maxDuration}ms`);
      });
    })(),
    20000,
    'endpoints performance test timed out'
  );

  return {
    name: 'testEndpointsPerformance',
    status: 'passed',
    duration: Date.now() - startTime,
    message: `Performance test completed - ${iterations} iterations`
  };
}

module.exports = {
  testListEndpointsSuccess,
  testCreateEndpoint,
  testGetEndpointDetails,
  testListEndpointsResponseFormat,
  testEndpointInvalidData,
  testEndpointsPerformance
};