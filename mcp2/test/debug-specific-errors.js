/**
 * Debug Specific MCP2 Tool Errors
 * Deep dive into specific error patterns
 */

const { createTestClient, withTestClient } = require('./utils/McpTestClient.js');

async function debugSpecificErrors() {
  console.log('🔍 DEBUGGING SPECIFIC MCP2 TOOL ERRORS');
  console.log('==========================================\n');

  // Test 1: Debug create_folder vs list_folders
  console.log('🔍 TEST 1: Compare working vs broken folder tools');

  try {
    await withTestClient({ debug: false }, async (client) => {
      console.log('1. Testing list_folders (working):');
      const listResult = await client.call('list_folders', {
        projectId: 'proj_1761385246_5ec798d9',
        parentId: null,
        includeTree: false,
        activeOnly: true
      });
      console.log('   Result:', listResult.content[0].text.substring(0, 200));

      console.log('\n2. Testing create_folder (broken):');
      const createResult = await client.call('create_folder', {
        projectId: 'proj_1761385246_5ec798d9',
        name: 'Debug Test Folder',
        description: 'Debug folder creation'
      });
      console.log('   Result:', createResult.content[0].text);

      console.log('\n🎯 Analysis:');
      console.log('   - list_folders works, uses projectId parameter');
      console.log('   - create_folder fails with HTTP 404');
      console.log('   - Both tools should use same backend route pattern');
    });
  } catch (error) {
    console.error('Test 1 failed:', error.message);
  }

  // Test 2: Debug environment tools
  console.log('\n🔍 TEST 2: Debug environment tool parameter mapping');

  try {
    await withTestClient({ debug: false }, async (client) => {
      console.log('1. Testing list_environments (working):');
      const listResult = await client.call('list_environments', {
        projectId: 'proj_1761385246_5ec798d9',
        activeOnly: true
      });
      console.log('   Result:', listResult.content[0].text.substring(0, 200));

      console.log('\n2. Testing get_environment_details (broken):');
      const detailsResult = await client.call('get_environment_details', {
        environmentId: 'env_1761385247_5f4b2bae'
      });
      console.log('   Result:', detailsResult.content[0].text);

      console.log('\n3. Testing with alternative parameter names:');
      console.log('   Trying with id parameter...');
      const altResult = await client.call('get_environment_details', {
        id: 'env_1761385247_5f4b2bae'
      });
      console.log('   Result with "id":', altResult.content[0].text);
    });
  } catch (error) {
    console.error('Test 2 failed:', error.message);
  }

  // Test 3: Debug endpoints tools
  console.log('\n🔍 TEST 3: Debug endpoint tools with direct curl comparison');

  try {
    // Direct curl test
    console.log('1. Direct curl test (should work):');
    const { spawn } = require('child_process');

    const curlResult = spawn('curl', [
      '-s',
      'http://localhost:8080/gassapi2/backend/?act=endpoints&id=col_6f6f1c44ff46c4e133feabc7e44f9a92',
      '-H', 'Authorization: Bearer 2032781cbb63ea282749778091b2170a5a18d0491a519bad4ab488ab463e885d'
    ]);

    let curlOutput = '';
    curlResult.stdout.on('data', (data) => {
      curlOutput += data.toString();
    });

    await new Promise((resolve) => {
      curlResult.on('close', resolve);
    });

    console.log('   Curl result:', curlOutput.substring(0, 200));

    // MCP test
    console.log('\n2. MCP list_endpoints test (broken):');
    await withTestClient({ debug: false }, async (client) => {
      const mcpResult = await client.call('list_endpoints', {
        folder_id: 'col_6f6f1c44ff46c4e133feabc7e44f9a92',
        method: 'GET'
      });
      console.log('   MCP result:', mcpResult.content[0].text);

      console.log('\n🎯 Analysis:');
      console.log('   - Direct curl works, returns endpoints');
      console.log('   - MCP returns "Unknown error"');
      console.log('   - Issue is in MCP client, not backend');
    });
  } catch (error) {
    console.error('Test 3 failed:', error.message);
  }

  // Test 4: Check flow data integrity
  console.log('\n🔍 TEST 4: Debug flow data structure issues');

  try {
    await withTestClient({ debug: false }, async (client) => {
      console.log('1. Getting flow details to check data structure:');
      const detailsResult = await client.call('get_flow_details', {
        flowId: 'flow_0b20867987a45aa2dc7a5b93b8aef1a4'
      });
      console.log('   Flow details:', detailsResult.content[0].text);

      console.log('\n2. Testing execute_flow (broken - no steps):');
      const execResult = await client.call('execute_flow', {
        flowId: 'flow_0b20867987a45aa2dc7a5b93b8aef1a4'
      });
      console.log('   Execute result:', execResult.content[0].text);

      console.log('\n🎯 Analysis:');
      console.log('   - Flow exists but "has no steps to execute"');
      console.log('   - This suggests flow_data is empty or malformed');
      console.log('   - Need to check flow data structure');
    });
  } catch (error) {
    console.error('Test 4 failed:', error.message);
  }
}

// Run debugging
debugSpecificErrors().catch(console.error);