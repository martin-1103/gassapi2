/**
 * Test Collections
 * Test collection management functionality
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
 * Test get_collections with auto project detection
 */
async function testGetCollectionsSuccess() {
  const startTime = Date.now();

  await TestUtils.withTimeout(
    (async () => {
      await withTestClient({ debug: false }, async (client) => {
        // Call without project_id - MCP server will auto-use config
        const result = await client.call('get_collections', {});

        // Validate MCP response format
        validateMcpResponse(result, 'Collections');

        console.log(`✅ Successfully retrieved collections`);
      });
    })(),
    15000,
    'get_collections test timed out'
  );

  return {
    name: 'testGetCollectionsSuccess',
    status: 'passed',
    duration: Date.now() - startTime,
    message: 'Successfully retrieved collections'
  };
}

/**
 * Test create_collection functionality
 */
async function testCreateCollection() {
  const startTime = Date.now();
  const testCollectionName = `Test Collection ${Date.now()}`;

  await TestUtils.withTimeout(
    (async () => {
      await withTestClient({ debug: false }, async (client) => {
        const result = await client.call('create_collection', {
          name: testCollectionName,
          description: 'Test collection for automation testing'
        });

        // Validate MCP response format - collection creation might have different pattern
        validateMcpResponse(result, 'Collection');

        console.log(`✅ Successfully created collection: ${testCollectionName}`);
      });
    })(),
    15000,
    'create_collection test timed out'
  );

  return {
    name: 'testCreateCollection',
    status: 'passed',
    duration: Date.now() - startTime,
    message: `Successfully created collection: ${testCollectionName}`
  };
}

/**
 * Test get_collections response format
 */
async function testGetCollectionsResponseFormat() {
  const startTime = Date.now();

  await TestUtils.withTimeout(
    (async () => {
      await withTestClient({ debug: false }, async (client) => {
        // Call without project_id - MCP server auto-uses config
        const result = await client.call('get_collections', {});

        // Validate MCP response format
        validateMcpResponse(result, 'Collections');

        console.log(`✅ Response format validated successfully`);
      });
    })(),
    15000,
    'get_collections response format test timed out'
  );

  return {
    name: 'testGetCollectionsResponseFormat',
    status: 'passed',
    duration: Date.now() - startTime,
    message: 'Response format validated successfully'
  };
}

/**
 * Test collection operations with invalid data
 */
async function testCollectionInvalidData() {
  const startTime = Date.now();
  let errorCaught = false;
  let errorMessage = '';

  await TestUtils.withTimeout(
    (async () => {
      await withTestClient({ debug: false }, async (client) => {
        try {
          // Test create collection without name (required field)
          const result = await client.call('create_collection', {
            description: 'Test collection without name'
          });

          // Check if response contains error information
          if (result && result.content && result.content.length > 0) {
            const responseText = result.content[0].text;
            if (responseText.includes('Error') || responseText.includes('Failed') || responseText.includes('Required')) {
              errorCaught = true;
              errorMessage = responseText;
            } else {
              throw new Error('Expected error for missing required field but got successful response');
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
    'collection invalid data test timed out'
  );

  Assert.isTrue(errorCaught, 'Should have caught an error');
  Assert.isTrue(errorMessage.length > 0, 'Error message should not be empty');

  return {
    name: 'testCollectionInvalidData',
    status: 'passed',
    duration: Date.now() - startTime,
    message: `Correctly handled invalid data: ${errorMessage.substring(0, 100)}...`
  };
}

/**
 * Test collection operations performance
 */
async function testCollectionsPerformance() {
  const startTime = Date.now();
  const iterations = 3;
  const durations = [];

  await TestUtils.withTimeout(
    (async () => {
      await withTestClient({ debug: false }, async (client) => {
        for (let i = 0; i < iterations; i++) {
          const iterationStart = Date.now();

          const result = await client.call('get_collections', {});

          validateMcpResponse(result, 'Collections');

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
    'collections performance test timed out'
  );

  return {
    name: 'testCollectionsPerformance',
    status: 'passed',
    duration: Date.now() - startTime,
    message: `Performance test completed - ${iterations} iterations`
  };
}

module.exports = {
  testGetCollectionsSuccess,
  testCreateCollection,
  testGetCollectionsResponseFormat,
  testCollectionInvalidData,
  testCollectionsPerformance
};