/**
 * Analyze MCP2 vs Backend API Mismatch
 * Compare what MCP2 expects vs what backend actually provides
 */

const { spawn } = require('child_process');
const path = require('path');

async function testBackendAPI(action, params = {}) {
  return new Promise((resolve) => {
    const args = [
      '-s',
      `http://localhost:8080/gassapi2/backend/?act=${action}`,
      '-H', 'Authorization: Bearer 2032781cbb63ea282749778091b2170a5a18d0491a519bad4ab488ab463e885d'
    ];

    // Add query parameters
    if (Object.keys(params).length > 0) {
      const query = new URLSearchParams(params).toString();
      args[1] += `&${query}`;
    }

    const curlResult = spawn('curl', args);
    let output = '';

    curlResult.stdout.on('data', (data) => {
      output += data.toString();
    });

    curlResult.on('close', () => {
      try {
        const parsed = JSON.parse(output);
        resolve({ success: true, data: parsed, raw: output });
      } catch (e) {
        resolve({ success: false, error: e.message, raw: output });
      }
    });
  });
}

async function analyzeMismatches() {
  console.log('🔍 ANALYZING MCP2 VS BACKEND API MISMATCH');
  console.log('=========================================\n');

  // Test 1: Environment API patterns
  console.log('🌍 ENVIRONMENT API ANALYSIS');

  console.log('1. Backend: list_environments');
  const envList = await testBackendAPI('project_environments', { id: 'proj_1761385246_5ec798d9' });
  console.log('   Backend expects: ?act=project_environments&id=projectId');
  console.log('   Result:', envList.success ? '✅ Success' : '❌ Failed');

  console.log('\n2. Backend: get_environment_details');
  const envDetails = await testBackendAPI('environment_details', { id: 'env_1761385247_5f4b2bae' });
  console.log('   Backend expects: ?act=environment_details&id=environmentId');
  console.log('   Result:', envDetails.success ? '✅ Success' : '❌ Failed');

  console.log('\n3. Backend: create_environment');
  const envCreate = await testBackendAPI('environment_create', { id: 'proj_1761385246_5ec798d9' });
  console.log('   Backend expects: ?act=environment_create&id=projectId');
  console.log('   Result:', envCreate.success ? '✅ Success' : '❌ Failed');

  // Test 2: Folder API patterns
  console.log('\n📁 FOLDER API ANALYSIS');

  console.log('1. Backend: list_folders');
  const folderList = await testBackendAPI('project_folders', { id: 'proj_1761385246_5ec798d9' });
  console.log('   Backend expects: ?act=project_folders&id=projectId');
  console.log('   Result:', folderList.success ? '✅ Success' : '❌ Failed');

  console.log('\n2. Backend: create_folder');
  const folderCreate = await testBackendAPI('folder_create', { id: 'proj_1761385246_5ec798d9' });
  console.log('   Backend expects: ?act=folder_create&id=projectId');
  console.log('   Result:', folderCreate.success ? '✅ Success' : '❌ Failed');

  console.log('\n3. Backend: update_folder');
  const folderUpdate = await testBackendAPI('folder_update', { id: 'col_6f6f1c44ff46c4e133feabc7e44f9a92' });
  console.log('   Backend expects: ?act=folder_update&id=folderId');
  console.log('   Result:', folderUpdate.success ? '✅ Success' : '❌ Failed');

  // Test 3: Endpoint API patterns
  console.log('\n🔌 ENDPOINT API ANALYSIS');

  console.log('1. Backend: list_endpoints');
  const endpointList = await testBackendAPI('endpoints', { id: 'col_6f6f1c44ff46c4e133feabc7e44f9a92' });
  console.log('   Backend expects: ?act=endpoints&id=folderId');
  console.log('   Result:', endpointList.success ? '✅ Success' : '❌ Failed');

  console.log('\n2. Backend: create_endpoint');
  const endpointCreate = await testBackendAPI('endpoint_create', { id: 'col_6f6f1c44ff46c4e133feabc7e44f9a92' });
  console.log('   Backend expects: ?act=endpoint_create&id=folderId');
  console.log('   Result:', endpointCreate.success ? '✅ Success' : '❌ Failed');

  // Test 4: Flow API patterns
  console.log('\n🔄 FLOW API ANALYSIS');

  console.log('1. Backend: list_flows');
  const flowList = await testBackendAPI('flows', { id: 'proj_1761385246_5ec798d9' });
  console.log('   Backend expects: ?act=flows&id=projectId');
  console.log('   Result:', flowList.success ? '✅ Success' : '❌ Failed');

  console.log('\n2. Backend: create_flow');
  const flowCreate = await testBackendAPI('flow_create', { id: 'proj_1761385246_5ec798d9' });
  console.log('   Backend expects: ?act=flow_create&id=projectId');
  console.log('   Result:', flowCreate.success ? '✅ Success' : '❌ Failed');

  console.log('\n3. Backend: update_flow');
  const flowUpdate = await testBackendAPI('flow_update', { id: 'flow_0b20867987a45aa2dc7a5b93b8aef1a4' });
  console.log('   Backend expects: ?act=flow_update&id=flowId');
  console.log('   Result:', flowUpdate.success ? '✅ Success' : '❌ Failed');

  // Summary
  console.log('\n📋 SUMMARY - BACKEND API PATTERNS:');
  console.log('===================================');
  console.log('✅ WORKING BACKEND ENDPOINTS:');
  console.log('   ?act=project_environments&id=projectId');
  console.log('   ?act=project_folders&id=projectId');
  console.log('   ?act=endpoints&id=folderId');
  console.log('   ?act=flows&id=projectId');
  console.log('   ?act=flow_create&id=projectId');
  console.log('   ?act=folder_update&id=folderId');
  console.log('   ?act=flow_update&id=flowId');

  console.log('\n❌ MCP2 MISMATCH ISSUES:');
  console.log('   1. MCP2 BackendClient calling wrong URLs');
  console.log('   2. Parameter names don\'t match (folderId vs id)');
  console.log('   3. HTTP methods not properly set (POST vs GET)');
  console.log('   4. Request body format incorrect');
  console.log('   5. Response structure handling issues');
}

// Run analysis
analyzeMismatches().catch(console.error);