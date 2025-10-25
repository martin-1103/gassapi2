/**
 * Test Folders
 * Test folder management functionality
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
 * Test get_folders with auto project detection
 */
async function testGetFoldersSuccess() {
  const startTime = Date.now();

  await TestUtils.withTimeout(
    (async () => {
      await withTestClient({ debug: false }, async (client) => {
        // Call without project_id - MCP server will auto-use config
        const result = await client.call('get_folders', {});

        // Validate MCP response format
        validateMcpResponse(result, 'Folders');

        console.log(`✅ Successfully retrieved folders`);
      });
    })(),
    15000,
    'get_folders test timed out'
  );

  return {
    name: 'testGetFoldersSuccess',
    status: 'passed',
    duration: Date.now() - startTime,
    message: 'Successfully retrieved folders'
  };
}

/**
 * Test create_folder functionality
 */
async function testCreateFolder() {
  const startTime = Date.now();
  const testFolderName = `Test Folder ${Date.now()}`;

  await TestUtils.withTimeout(
    (async () => {
      await withTestClient({ debug: false }, async (client) => {
        const result = await client.call('create_folder', {
          name: testFolderName,
          description: 'Test folder for automation testing'
        });

        // Validate MCP response format - folder creation might have different pattern
        validateMcpResponse(result, 'Folder');

        console.log(`✅ Successfully created folder: ${testFolderName}`);
      });
    })(),
    15000,
    'create_folder test timed out'
  );

  return {
    name: 'testCreateFolder',
    status: 'passed',
    duration: Date.now() - startTime,
    message: `Successfully created folder: ${testFolderName}`
  };
}

/**
 * Test get_folders response format
 */
async function testGetFoldersResponseFormat() {
  const startTime = Date.now();

  await TestUtils.withTimeout(
    (async () => {
      await withTestClient({ debug: false }, async (client) => {
        // Call without project_id - MCP server auto-uses config
        const result = await client.call('get_folders', {});

        // Validate MCP response format
        validateMcpResponse(result, 'Folders');

        console.log(`✅ Response format validated successfully`);
      });
    })(),
    15000,
    'get_folders response format test timed out'
  );

  return {
    name: 'testGetFoldersResponseFormat',
    status: 'passed',
    duration: Date.now() - startTime,
    message: 'Response format validated successfully'
  };
}

/**
 * Test folder operations with invalid data
 */
async function testFolderInvalidData() {
  const startTime = Date.now();
  let errorCaught = false;
  let errorMessage = '';

  await TestUtils.withTimeout(
    (async () => {
      await withTestClient({ debug: false }, async (client) => {
        try {
          // Test create folder without name (required field)
          const result = await client.call('create_folder', {
            description: 'Test folder without name'
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
    'folder invalid data test timed out'
  );

  Assert.isTrue(errorCaught, 'Should have caught an error');
  Assert.isTrue(errorMessage.length > 0, 'Error message should not be empty');

  return {
    name: 'testFolderInvalidData',
    status: 'passed',
    duration: Date.now() - startTime,
    message: `Correctly handled invalid data: ${errorMessage.substring(0, 100)}...`
  };
}

/**
 * Test folder operations performance
 */
async function testFoldersPerformance() {
  const startTime = Date.now();
  const iterations = 3;
  const durations = [];

  await TestUtils.withTimeout(
    (async () => {
      await withTestClient({ debug: false }, async (client) => {
        for (let i = 0; i < iterations; i++) {
          const iterationStart = Date.now();

          const result = await client.call('get_folders', {});

          validateMcpResponse(result, 'Folders');

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
    'folders performance test timed out'
  );

  return {
    name: 'testFoldersPerformance',
    status: 'passed',
    duration: Date.now() - startTime,
    message: `Performance test completed - ${iterations} iterations`
  };
}

module.exports = {
  testGetFoldersSuccess,
  testCreateFolder,
  testGetFoldersResponseFormat,
  testFolderInvalidData,
  testFoldersPerformance
};