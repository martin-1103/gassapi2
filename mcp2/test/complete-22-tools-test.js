/**
 * Complete 22 MCP2 Tools Test
 * Test ALL 22 registered tools systematically
 */

const { createTestClient, withTestClient } = require('./utils/McpTestClient.js');

const TOOLS_DATA = {
  // Test data
  projectId: 'proj_1761385246_5ec798d9',
  folderId: 'col_6f6f1c44ff46c4e133feabc7e44f9a92',
  environmentId: 'env_1761385247_5f4b2bae',
  flowId: 'flow_0b20867987a45aa2dc7a5b93b8aef1a4'
};

async function testTool(toolName, args = {}) {
  console.log(`\n🔄 ${toolName}: ${JSON.stringify(args)}`);

  try {
    const result = await withTestClient({ debug: false }, async (client) => {
      return await client.call(toolName, args);
    });

    const responseText = result.content[0].text;

    // Success indicators
    const isSuccess = responseText.includes('"success":true') ||
                     responseText.includes('✅') ||
                     responseText.includes('successfully') ||
                     responseText.includes('Retrieved') ||
                     responseText.includes('fetched') ||
                     responseText.includes('Folders List') ||
                     responseText.includes('flow data') ||
                     responseText.includes('Environments List') ||
                     responseText.includes('environments)') ||
                     responseText.includes('Endpoints List') ||
                     responseText.includes('Server Status') ||
                     responseText.includes('Project Context Retrieved');

    if (isSuccess) {
      console.log(`✅ ${toolName} - SUCCESS`);
      return { name: toolName, status: 'passed' };
    } else {
      console.log(`❌ ${toolName} - FAILED`);
      console.log('Response:', responseText.substring(0, 300));
      return { name: toolName, status: 'failed', error: responseText.substring(0, 200) };
    }
  } catch (error) {
    console.log(`💥 ${toolName} - ERROR: ${error.message}`);
    return { name: toolName, status: 'error', error: error.message };
  }
}

async function runComplete22ToolsTest() {
  console.log('🚀 COMPLETE 22 MCP2 TOOLS TEST');
  console.log('===================================\n');

  const tests = [
    // Core/Context Tools (2)
    { name: 'health_check', args: {} },
    { name: 'get_project_context', args: {} },

    // Environment Tools (6)
    { name: 'list_environments', args: { projectId: TOOLS_DATA.projectId, activeOnly: true } },
    { name: 'get_environment_details', args: { environmentId: TOOLS_DATA.environmentId } },
    { name: 'create_environment', args: {
      projectId: TOOLS_DATA.projectId,
      name: 'Test Environment',
      description: 'Created during complete test'
    }},
    { name: 'update_environment_variables', args: {
      environmentId: TOOLS_DATA.environmentId,
      variables: { test: 'value', api_key: 'test_key' }
    }},
    { name: 'set_default_environment', args: {
      environmentId: TOOLS_DATA.environmentId
    }},
    { name: 'delete_environment', args: {
      environmentId: 'env_dummy_nonexistent'
    }},

    // Folder Tools (4)
    { name: 'list_folders', args: {
      projectId: TOOLS_DATA.projectId,
      parentId: null,
      includeTree: false,
      activeOnly: true
    }},
    { name: 'create_folder', args: {
      projectId: TOOLS_DATA.projectId,
      name: 'Complete Test Folder',
      description: 'Created during 22 tools test'
    }},
    { name: 'update_folder', args: {
      folderId: TOOLS_DATA.folderId,
      name: 'Updated Folder Name'
    }},
    { name: 'delete_folder', args: {
      folderId: 'folder_dummy_nonexistent'
    }},

    // Endpoint Tools (5)
    { name: 'list_endpoints', args: {
      folder_id: TOOLS_DATA.folderId,
      method: 'GET'
    }},
    { name: 'get_endpoint_details', args: {
      endpointId: 'ep_dummy_nonexistent'
    }},
    { name: 'create_endpoint', args: {
      folderId: TOOLS_DATA.folderId,
      name: 'Complete Test Endpoint',
      method: 'GET',
      url: 'https://jsonplaceholder.typicode.com/posts/1',
      headers: { 'Content-Type': 'application/json' },
      body: '{}'
    }},
    { name: 'update_endpoint', args: {
      endpointId: 'ep_dummy_nonexistent',
      name: 'Updated Endpoint'
    }},
    { name: 'test_endpoint', args: {
      endpointId: 'ep_dummy_nonexistent'
    }},

    // Flow Tools (5)
    { name: 'execute_flow', args: {
      flowId: TOOLS_DATA.flowId
    }},
    { name: 'create_flow', args: {
      name: 'Complete Test Flow',
      description: 'Created during 22 tools test',
      folderId: TOOLS_DATA.folderId,
      steps: [{
        id: 'step1',
        name: 'Test GET Request',
        method: 'GET',
        url: 'https://jsonplaceholder.typicode.com/posts/1',
        timeout: 5000,
        expectedStatus: 200,
        description: 'Test endpoint call'
      }]
    }},
    { name: 'get_flow_details', args: {
      flowId: TOOLS_DATA.flowId
    }},
    { name: 'list_flows', args: {
      projectId: TOOLS_DATA.projectId
    }},
    { name: 'delete_flow', args: {
      flowId: 'flow_dummy_nonexistent'
    }}
  ];

  const results = [];

  for (let i = 0; i < tests.length; i++) {
    const test = tests[i];
    console.log(`\n[${i + 1}/22] Testing ${test.name}`);
    const result = await testTool(test.name, test.args);
    results.push(result);

    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 800));
  }

  console.log('\n📊 COMPLETE 22 TOOLS TEST SUMMARY');
  console.log('=====================================');

  const passed = results.filter(r => r.status === 'passed').length;
  const failed = results.filter(r => r.status === 'failed').length;
  const errors = results.filter(r => r.status === 'error').length;

  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`💥 Errors: ${errors}`);
  console.log(`📈 Total: ${results.length}`);
  console.log(`🎯 Success Rate: ${Math.round((passed / results.length) * 100)}%`);

  // Show failed tests with analysis
  if (failed > 0 || errors > 0) {
    console.log('\n❌ FAILED/ERROR TESTS ANALYSIS:');
    console.log('====================================');

    results.filter(r => r.status !== 'passed').forEach((r, index) => {
      console.log(`\n${index + 1}. ${r.name}:`);
      console.log(`   Error: ${r.error || 'Unknown error'}`);

      // Analyze error patterns
      if (r.error?.includes('HTTP 404')) {
        console.log(`   🔍 Analysis: Backend endpoint not found - routing or parameter issue`);
      } else if (r.error?.includes('HTTP 400')) {
        console.log(`   🔍 Analysis: Bad request - parameter validation or mapping issue`);
      } else if (r.error?.includes('Unknown error')) {
        console.log(`   🔍 Analysis: Internal error - likely response handling issue`);
      } else if (r.error?.includes('is required')) {
        console.log(`   🔍 Analysis: Missing required parameter - argument mapping issue`);
      } else if (r.error?.includes('no steps')) {
        console.log(`   🔍 Analysis: Data validation issue - flow structure problem`);
      }
    });
  }

  return results;
}

// Run complete test
runComplete22ToolsTest().catch(console.error);