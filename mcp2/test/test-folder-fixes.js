/**
 * Test Folder Fixes
 * Test if folder tools now work after fixes
 */

const { createTestClient, withTestClient } = require('./utils/McpTestClient.js');

async function testFolderFixes() {
  console.log('🔍 Testing Folder Fixes');

  try {
    await withTestClient({ debug: false }, async (client) => {
      console.log('1. Testing get_folder_details:');
      const result1 = await client.call('get_folder_details', {
        folderId: 'col_6f6f1c44ff46c4e133feabc7e44f9a92'
      });
      console.log('   Result:', result1.content[0].text.substring(0, 300));

      console.log('\n2. Testing create_folder:');
      const result2 = await client.call('create_folder', {
        projectId: 'proj_1761385246_5ec798d9',
        name: 'Test Folder ' + Date.now(),
        description: 'Testing folder creation after fixes'
      });
      console.log('   Result:', result2.content[0].text.substring(0, 300));

      const success1 = result1.content[0].text.includes('"success":true') ||
                        result1.content[0].text.includes('Folder Details');

      const success2 = result2.content[0].text.includes('"success":true') ||
                        result2.content[0].text.includes('created successfully');

      if (success1) {
        console.log('   ✅ Folder details working!');
      } else {
        console.log('   ❌ Folder details still failing');
      }

      if (success2) {
        console.log('   ✅ Folder creation working!');
      } else {
        console.log('   ❌ Folder creation still failing');
      }
    });
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testFolderFixes().catch(console.error);