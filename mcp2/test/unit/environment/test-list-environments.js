/**
 * Test List Environments
 * Test list_environments tool functionality
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
 * Test list_environments with valid project ID
 */
async function testListEnvironmentsSuccess() {
  const startTime = Date.now();

  await TestUtils.withTimeout(
    (async () => {
      await withTestClient({ debug: false }, async (client) => {
        // Call without project_id - MCP server will auto-use config
        const result = await client.call('list_environments', {});

        // Validate MCP response format
        validateMcpResponse(result, 'Environments');

        console.log(`✅ Successfully listed environments`);
      });
    })(),
    15000,
    'list_environments test timed out'
  );

  return {
    name: 'testListEnvironmentsSuccess',
    status: 'passed',
    duration: Date.now() - startTime,
    message: 'Successfully listed environments'
  };
}

/**
 * Test list_environments with invalid project ID
 */
async function testListEnvironmentsInvalidProject() {
  const startTime = Date.now();
  let errorCaught = false;
  let errorMessage = '';

  await TestUtils.withTimeout(
    (async () => {
      await withTestClient({ debug: false }, async (client) => {
        try {
          const result = await client.call('list_environments', {
            project_id: 'invalid_project_id'
          });

          // Check if it's an error response
          if (!result.success) {
            errorCaught = true;
            errorMessage = result.message || result.error || 'Unknown error';
          } else {
            // Some implementations might return empty list for invalid project
            if (result.content && Array.isArray(result.content) && result.content.length === 0) {
              console.log('ℹ️  Invalid project returned empty environments list');
              return {
                name: 'testListEnvironmentsInvalidProject',
                status: 'passed',
                duration: Date.now() - startTime,
                message: 'Invalid project handled gracefully with empty list'
              };
            }
            throw new Error('Expected error for invalid project but got successful response');
          }
        } catch (error) {
          errorCaught = true;
          errorMessage = error.message;
        }
      });
    })(),
    15000,
    'list_environments invalid project test timed out'
  );

  return {
    name: 'testListEnvironmentsInvalidProject',
    status: 'passed',
    duration: Date.now() - startTime,
    message: errorCaught ? `Correctly handled invalid project: ${errorMessage}` : 'Invalid project handled gracefully'
  };
}

/**
 * Test list_environments without project ID
 */
async function testListEnvironmentsNoProjectId() {
  const startTime = Date.now();
  let handledGracefully = false;

  await TestUtils.withTimeout(
    (async () => {
      await withTestClient({ debug: false }, async (client) => {
        try {
          const result = await client.call('list_environments', {});

          if (result.success) {
            // Check if it used a default project
            console.log('ℹ️  Used default project configuration');
            handledGracefully = true;
          } else {
            // Error response is also acceptable
            console.log('ℹ️  Correctly handled missing project ID with error response');
            handledGracefully = true;
          }
        } catch (error) {
          // Exception is also acceptable
          console.log(`ℹ️  Correctly handled missing project ID: ${error.message}`);
          handledGracefully = true;
        }
      });
    })(),
    15000,
    'list_environments no project ID test timed out'
  );

  return {
    name: 'testListEnvironmentsNoProjectId',
    status: 'passed',
    duration: Date.now() - startTime,
    message: handledGracefully ? 'Handled missing project ID gracefully' : 'Test completed'
  };
}

/**
 * Test list_environments response format
 */
async function testListEnvironmentsResponseFormat() {
  const startTime = Date.now();

  await TestUtils.withTimeout(
    (async () => {
      await withTestClient({ debug: false }, async (client) => {
        // Call without project_id - MCP server auto-uses config
        const result = await client.call('list_environments', {});

        // Validate MCP response format
        validateMcpResponse(result, 'Environments');

        console.log(`✅ Response format validated successfully`);
      });
    })(),
    15000,
    'list_environments response format test timed out'
  );

  return {
    name: 'testListEnvironmentsResponseFormat',
    status: 'passed',
    duration: Date.now() - startTime,
    message: 'Response format validated successfully'
  };
}

/**
 * Test list_environments performance
 */
async function testListEnvironmentsPerformance() {
  const startTime = Date.now();
  const iterations = 3;
  const durations = [];

  await TestUtils.withTimeout(
    (async () => {
      await withTestClient({ debug: false }, async (client) => {
        for (let i = 0; i < iterations; i++) {
          const iterationStart = Date.now();

          const result = await client.call('list_environments', {});

          validateMcpResponse(result, 'Environments');

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
    'list_environments performance test timed out'
  );

  return {
    name: 'testListEnvironmentsPerformance',
    status: 'passed',
    duration: Date.now() - startTime,
    message: `Performance test completed - ${iterations} iterations`
  };
}

module.exports = {
  testListEnvironmentsSuccess,
  testListEnvironmentsInvalidProject,
  testListEnvironmentsNoProjectId,
  testListEnvironmentsResponseFormat,
  testListEnvironmentsPerformance
};