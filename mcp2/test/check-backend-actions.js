/**
 * Check All Backend Action Names
 * Verify correct action names from backend
 */

const { spawn } = require('child_process');

async function testBackendAction(action, id = null, method = 'GET', body = null) {
  return new Promise((resolve) => {
    const args = [
      '-s',
      `http://localhost:8080/gassapi2/backend/?act=${action}${id ? `&id=${id}` : ''}`,
      '-H', 'Authorization: Bearer 2032781cbb63ea282749778091b2170a5a18d0491a519bad4ab488ab463e885d'
    ];

    if (method === 'POST' && body) {
      args.push('-X', 'POST', '-H', 'Content-Type: application/json', '-d', JSON.stringify(body));
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

async function checkAllActions() {
  console.log('🔍 CHECKING ALL BACKEND ACTION NAMES');
  console.log('=====================================\n');

  const actions = [
    // Environment actions
    { name: 'project_environments', id: 'proj_1761385246_5ec798d9', desc: 'List environments' },
    { name: 'environment', id: 'env_1761385247_5f4b2bae', desc: 'Get environment details' },
    { name: 'environment_create', id: 'proj_1761385246_5ec798d9', method: 'POST',
      body: { name: 'Test Env', description: 'Test' }, desc: 'Create environment' },
    { name: 'environment_update', id: 'env_1761385247_5f4b2bae', method: 'POST',
      body: { name: 'Updated Env' }, desc: 'Update environment' },
    { name: 'environment_delete', id: 'env_1761385247_5f4b2bae', method: 'DELETE', desc: 'Delete environment' },

    // Folder actions
    { name: 'project_folders', id: 'proj_1761385246_5ec798d9', desc: 'List folders' },
    { name: 'folder', id: 'col_6f6f1c44ff46c4e133feabc7e44f9a92', desc: 'Get folder details' },
    { name: 'folder_create', id: 'proj_1761385246_5ec798d9', method: 'POST',
      body: { name: 'Test Folder', description: 'Test' }, desc: 'Create folder' },
    { name: 'folder_update', id: 'col_6f6f1c44ff46c4e133feabc7e44f9a92', method: 'POST',
      body: { name: 'Updated Folder' }, desc: 'Update folder' },
    { name: 'folder_delete', id: 'col_6f6f1c44ff46c4e133feabc7e44f9a92', method: 'DELETE', desc: 'Delete folder' },

    // Endpoint actions
    { name: 'endpoints', id: 'col_6f6f1c44ff46c4e133feabc7e44f9a92', desc: 'List endpoints' },
    { name: 'endpoint', id: 'ep_e23ff1c3a552183c71fe587e465fcb35', desc: 'Get endpoint details' },
    { name: 'endpoint_create', id: 'col_6f6f1c44ff46c4e133feabc7e44f9a92', method: 'POST',
      body: { name: 'Test Endpoint', method: 'GET', url: 'https://jsonplaceholder.typicode.com/posts/1' }, desc: 'Create endpoint' },
    { name: 'endpoint_update', id: 'ep_e23ff1c3a552183c71fe587e465fcb35', method: 'POST',
      body: { name: 'Updated Endpoint' }, desc: 'Update endpoint' },
    { name: 'endpoint_delete', id: 'ep_e23ff1c3a552183c71fe587e465fcb35', method: 'DELETE', desc: 'Delete endpoint' },

    // Flow actions
    { name: 'flows', id: 'proj_1761385246_5ec798d9', desc: 'List flows' },
    { name: 'flow', id: 'flow_0b20867987a45aa2dc7a5b93b8aef1a4', desc: 'Get flow details' },
    { name: 'flow_create', id: 'proj_1761385246_5ec798d9', method: 'POST',
      body: { name: 'Test Flow', description: 'Test', folder_id: 'col_6f6f1c44ff46c4e133feabc7e44f9a92' }, desc: 'Create flow' },
    { name: 'flow_update', id: 'flow_0b20867987a45aa2dc7a5b93b8aef1a4', method: 'POST',
      body: { name: 'Updated Flow' }, desc: 'Update flow' },
    { name: 'flow_delete', id: 'flow_0b20867987a45aa2dc7a5b93b8aef1a4', method: 'DELETE', desc: 'Delete flow' },
    { name: 'flow_execute', id: 'flow_0b20867987a45aa2dc7a5b93b8aef1a4', method: 'POST', desc: 'Execute flow' }
  ];

  const results = [];

  for (const action of actions) {
    console.log(`Testing: ${action.desc}`);
    console.log(`URL: ?act=${action.name}${action.id ? `&id=${action.id}` : ''}`);

    const result = await testBackendAction(action.name, action.id, action.method || 'GET', action.body);

    const isSuccess = result.success && result.data && result.data.success;
    console.log(`Result: ${isSuccess ? '✅ SUCCESS' : '❌ FAILED'}`);

    if (!isSuccess && result.raw) {
      console.log(`Error: ${result.raw.substring(0, 100)}`);
    }

    console.log('');
    results.push({ ...action, working: isSuccess });
  }

  console.log('\n📊 SUMMARY:');
  console.log('============');
  const working = results.filter(r => r.working).length;
  const total = results.length;
  console.log(`Working: ${working}/${total} (${Math.round((working/total)*100)}%)`);

  console.log('\n✅ WORKING ACTIONS:');
  results.filter(r => r.working).forEach(r => {
    console.log(`  - ${r.name} (${r.desc})`);
  });

  console.log('\n❌ BROKEN ACTIONS:');
  results.filter(r => !r.working).forEach(r => {
    console.log(`  - ${r.name} (${r.desc})`);
  });

  return results;
}

checkAllActions().catch(console.error);