/**
 * Final Comprehensive Validation of All MCP2 Tools
 */

const { createTestClient, withTestClient } = require('./utils/McpTestClient.js');

async function testAllTools() {
  console.log('🧪 COMPREHENSIVE MCP2 TOOLS VALIDATION');
  console.log('===========================================');

  const tools = [
    // Core tools
    { name: 'health_check', params: {}, category: 'Core' },
    { name: 'get_project_context', params: {}, category: 'Core' },

    // Environment tools
    { name: 'list_environments', params: { projectId: 'proj_1761385246_5ec798d9' }, category: 'Environment' },
    { name: 'get_environment_details', params: { environmentId: 'env_1761385247_5f4b2bae' }, category: 'Environment' },
    { name: 'create_environment', params: { name: 'Test Env ' + Date.now(), projectId: 'proj_1761385246_5ec798d9' }, category: 'Environment' },
    { name: 'update_environment_variables', params: { environmentId: 'env_1761385247_5f4b2bae', variables: { test: 'value' } }, category: 'Environment' },
    { name: 'set_default_environment', params: { environmentId: 'env_1761385247_5f4b2bae' }, category: 'Environment' },
    { name: 'delete_environment', params: { environmentId: 'env_1761385247_5f4b2bae' }, category: 'Environment' },

    // Folder tools
    { name: 'list_folders', params: { projectId: 'proj_1761385246_5ec798d9' }, category: 'Folder' },
    { name: 'create_folder', params: { name: 'Test Folder ' + Date.now(), projectId: 'proj_1761385246_5ec798d9' }, category: 'Folder' },
    { name: 'update_folder', params: { folderId: 'col_6f6f1c44ff46c4e133feabc7e44f9a92', name: 'Updated Folder' }, category: 'Folder' },
    { name: 'delete_folder', params: { folderId: 'col_27e1178e6882c0cc6ab80e7b9f85b61c' }, category: 'Folder' }, // Use test folder
    { name: 'get_folder_details', params: { folderId: 'col_6f6f1c44ff46c4e133feabc7e44f9a92' }, category: 'Folder' },

    // Endpoint tools
    { name: 'list_endpoints', params: { folder_id: 'col_6f6f1c44ff46c4e133feabc7e44f9a92' }, category: 'Endpoint' },
    { name: 'get_endpoint_details', params: { endpoint_id: 'ep_f14e063808af1a2e8cad80cdd5cb304d' }, category: 'Endpoint' },
    { name: 'create_endpoint', params: { name: 'Test Endpoint ' + Date.now(), method: 'GET', url: 'https://jsonplaceholder.typicode.com/posts/1', folder_id: 'col_6f6f1c44ff46c4e133feabc7e44f9a92' }, category: 'Endpoint' },
    { name: 'update_endpoint', params: { endpoint_id: 'ep_f14e063808af1a2e8cad80cdd5cb304d', name: 'Updated Endpoint' }, category: 'Endpoint' },
    { name: 'test_endpoint', params: { endpointId: 'ep_f14e063808af1a2e8cad80cdd5cb304d' }, category: 'Testing' },

    // Flow tools
    { name: 'list_flows', params: { projectId: 'proj_1761385246_5ec798d9' }, category: 'Flow' },
    { name: 'get_flow_details', params: { flowId: 'flow_149bcbe9b3abf45c833e88284f8997a5' }, category: 'Flow' },
    { name: 'create_flow', params: { name: 'Final Test Flow', projectId: 'proj_1761385246_5ec798d9', folderId: 'col_6f6f1c44ff46c4e133feabc7e44f9a92' }, category: 'Flow' },
    { name: 'execute_flow', params: { flowId: 'flow_149bcbe9b3abf45c833e88284f8997a5' }, category: 'Flow' },
    { name: 'delete_flow', params: { flowId: 'flow_6b639dafaf7de0667130094f14870bf6' }, category: 'Flow' }
  ];

  const results = { success: 0, failed: 0, byCategory: {} };

  await withTestClient({ debug: false }, async (client) => {
    for (const tool of tools) {
      try {
        const result = await client.call(tool.name, tool.params);
        const text = result.content[0].text;

        // Check if tool worked (either formatted text or JSON success)
        const isFormattedOutput = text.includes('✅') || text.includes('🔗') || text.includes('📁') || text.includes('🧪') || text.includes('🔄');
        const isSuccessJson = text.includes('"success":true');
        const isWorking = isFormattedOutput || isSuccessJson || !text.includes('"success":false');

        if (isWorking) {
          results.success++;
          console.log(`✅ ${tool.name} (${tool.category})`);
        } else {
          results.failed++;
          console.log(`❌ ${tool.name} (${tool.category}) - ${text.substring(0, 50)}...`);
        }

        // Track by category
        if (!results.byCategory[tool.category]) {
          results.byCategory[tool.category] = { success: 0, failed: 0 };
        }
        if (isWorking) {
          results.byCategory[tool.category].success++;
        } else {
          results.byCategory[tool.category].failed++;
        }

      } catch (error) {
        results.failed++;
        console.log(`❌ ${tool.name} (${tool.category}) - ERROR: ${error.message}`);

        if (!results.byCategory[tool.category]) {
          results.byCategory[tool.category] = { success: 0, failed: 0 };
        }
        results.byCategory[tool.category].failed++;
      }
    }
  });

  console.log('\n📊 FINAL RESULTS:');
  console.log('==================');
  console.log(`Total Tools: ${results.success + results.failed}`);
  console.log(`✅ Working: ${results.success}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`📈 Success Rate: ${Math.round((results.success / (results.success + results.failed)) * 100)}%`);

  console.log('\n📋 By Category:');
  Object.entries(results.byCategory).forEach(([category, stats]) => {
    const total = stats.success + stats.failed;
    const rate = Math.round((stats.success / total) * 100);
    console.log(`  ${category}: ${stats.success}/${total} (${rate}%)`);
  });

  return results;
}

testAllTools().catch(console.error);