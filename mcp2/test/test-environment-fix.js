/**
 * Test Environment Fix
 * Test if environment details now work after fix
 */

const { createTestClient, withTestClient } = require('./utils/McpTestClient.js');

async function testEnvironmentFix() {
  console.log('🔍 Testing Environment Fix');

  try {
    await withTestClient({ debug: false }, async (client) => {
      console.log('1. Testing get_environment_details:');
      const result = await client.call('get_environment_details', {
        environmentId: 'env_1761385247_5f4b2bae'
      });
      console.log('   Result:', result.content[0].text.substring(0, 500));

      const isSuccess = result.content[0].text.includes('"success":true') ||
                       result.content[0].text.includes('Environment Details');

      if (isSuccess) {
        console.log('   ✅ Environment details now working!');
      } else {
        console.log('   ❌ Still failing');
      }
    });
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testEnvironmentFix().catch(console.error);