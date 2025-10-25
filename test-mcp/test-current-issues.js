/**
 * Test Script untuk Error yang Masih Ada (Current Issues)
 *
 * Script ini mereproduksi error-error yang masih belum diperbaiki
 * untuk debugging dan analisis lebih lanjut.
 */

const axios = require('axios');
const CONFIG = require('./config.js');

class CurrentIssuesTester {
  constructor() {
    this.baseURL = CONFIG.backend.baseURL;
    this.mcpToken = CONFIG.mcp.token;
    this.projectId = CONFIG.mcp.projectId;
    this.jwtToken = null;
  }

  // Helper untuk membuat request dengan MCP token
  async makeRequest(method, endpoint, data = null, useJWT = false) {
    try {
      const token = useJWT ? this.jwtToken : this.mcpToken;

      const config = {
        method,
        url: `${this.baseURL}${endpoint}`,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: CONFIG.backend.timeout
      };

      if (data) {
        config.data = data;
      }

      const response = await axios(config);
      return { success: true, data: response.data, status: response.status };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data || error.message,
        status: error.response?.status || 0,
        headers: error.response?.headers
      };
    }
  }

  // Helper untuk login dan dapat JWT token
  async login() {
    console.log('🔐 Logging in untuk JWT token...');

    const loginResult = await this.makeRequest('POST', '/gassapi2/backend/?act=login', {
      email: CONFIG.jwt.email,
      password: CONFIG.jwt.password
    }, false);

    if (loginResult.success && loginResult.data.data.access_token) {
      this.jwtToken = loginResult.data.data.access_token;
      console.log('✅ JWT token obtained');
      return true;
    } else {
      console.log('❌ Failed to get JWT token');
      console.log('   Error:', loginResult.error);
      return false;
    }
  }

  // Test 1: create_endpoint Request Format Issue
  async testCreateEndpointRequestFormat() {
    console.log('\n🔍 Testing create_endpoint Request Format Issue...');

    // Step 1: Dapatkan folder yang valid
    const folderResult = await this.makeRequest('GET', `/gassapi2/backend/?act=project_folders&id=${this.projectId}`);

    if (!folderResult.success || !folderResult.data.data || folderResult.data.data.length === 0) {
      console.log('❌ SKIP: No folders available');
      return false;
    }

    const folderId = folderResult.data.data[0].id;
    console.log(`   Using folder: ${folderId}`);

    // Step 2: Test endpoint creation via MCP client format
    console.log('   Testing MCP client request format...');
    const mcpResult = await this.makeRequest('POST', `/gassapi2/backend/?act=endpoint_create&id=${folderId}`, {
      name: CONFIG.testData.endpoint.name,
      method: CONFIG.testData.endpoint.method,
      url: CONFIG.testData.endpoint.url,
      description: CONFIG.testData.endpoint.description,
      headers: '{}'
    });

    // Step 3: Test endpoint creation via direct curl format
    console.log('   Testing direct request format...');
    const directResult = await this.makeRequest('POST', `/gassapi2/backend/?act=endpoint_create&id=${folderId}`, {
      name: 'Direct Test Endpoint',
      method: 'GET',
      url: 'https://jsonplaceholder.typicode.com/posts/1'
    });

    // Step 4: Analysis
    console.log(`   MCP Client Result: ${mcpResult.success ? 'SUCCESS' : 'FAILED'}`);
    if (!mcpResult.success) {
      console.log(`   MCP Error: ${mcpResult.error.message || mcpResult.error}`);
    }

    console.log(`   Direct Request Result: ${directResult.success ? 'SUCCESS' : 'FAILED'}`);
    if (!directResult.success) {
      console.log(`   Direct Error: ${directResult.error.message || directResult.error}`);
    }

    if (mcpResult.success && directResult.success) {
      console.log('✅ PASS: Both MCP client and direct requests work');

      // Cleanup
      if (mcpResult.data.data?.id) {
        await this.makeRequest('DELETE', `/gassapi2/backend/?act=endpoint_delete&id=${mcpResult.data.data.id}`);
      }
      if (directResult.data.data?.id) {
        await this.makeRequest('DELETE', `/gassapi2/backend/?act=endpoint_delete&id=${directResult.data.data.id}`);
      }
      return true;
    } else if (directResult.success && !mcpResult.success) {
      console.log('🔍 ISSUE REPRODUCED: MCP client fails, direct request works');
      console.log('   Root cause: MCP client request format inconsistency');
      return false;
    } else {
      console.log('❌ Both requests failed - investigate backend issues');
      return false;
    }
  }

  // Test 2: Flow Management Permission Issue
  async testFlowManagementPermission() {
    console.log('\n🔍 Testing Flow Management Permission Issue...');

    // Test via MCP token
    console.log('   Testing with MCP token...');
    const mcpFlowResult = await this.makeRequest('GET', `/gassapi2/backend/?act=flows&id=${this.projectId}`);

    // Test via JWT token (jika available)
    let jwtFlowResult = null;
    if (this.jwtToken || await this.login()) {
      console.log('   Testing with JWT token...');
      jwtFlowResult = await this.makeRequest('GET', `/gassapi2/backend/?act=flows&id=${this.projectId}`, null, true);
    }

    // Analysis
    console.log(`   MCP Token Flow Result: ${mcpFlowResult.success ? 'SUCCESS' : 'FAILED'}`);
    if (!mcpFlowResult.success) {
      console.log(`   MCP Flow Error: ${mcpFlowResult.error.message || mcpFlowResult.error}`);
    }

    if (jwtFlowResult) {
      console.log(`   JWT Token Flow Result: ${jwtFlowResult.success ? 'SUCCESS' : 'FAILED'}`);
      if (!jwtFlowResult.success) {
        console.log(`   JWT Flow Error: ${jwtFlowResult.error.message || jwtFlowResult.error}`);
      }
    }

    // Test MCP validation untuk user context
    console.log('   Testing MCP token validation...');
    const mcpValidationResult = await this.makeRequest('GET', '/gassapi2/backend/?act=mcp_validate');

    if (mcpValidationResult.success) {
      console.log('   MCP Validation: SUCCESS');
      console.log('   User Context:', mcpValidationResult.data.data.user ? 'AVAILABLE' : 'NOT AVAILABLE');
      console.log('   Project Context:', mcpValidationResult.data.data.project ? 'AVAILABLE' : 'NOT AVAILABLE');
    } else {
      console.log('   MCP Validation: FAILED');
      console.log(`   Validation Error: ${mcpValidationResult.error.message || mcpValidationResult.error}`);
    }

    if (mcpFlowResult.success) {
      console.log('✅ PASS: Flow management works with MCP token');
      return true;
    } else if (jwtFlowResult && jwtFlowResult.success) {
      console.log('🔍 ISSUE REPRODUCED: MCP token fails, JWT token works');
      console.log('   Root cause: MCP token authentication context mapping issue');
      return false;
    } else {
      console.log('🔍 ISSUE REPRODUCED: Both MCP and JWT tokens fail');
      console.log('   Root cause: Permission system or user context issue');
      return false;
    }
  }

  // Debug endpoint creation dengan detail logging
  async debugEndpointCreation() {
    console.log('\n🔍 DEBUG: Detailed Endpoint Creation Analysis...');

    const folderResult = await this.makeRequest('GET', `/gassapi2/backend/?act=project_folders&id=${this.projectId}`);

    if (!folderResult.success) {
      console.log('❌ Cannot get folders for debugging');
      return false;
    }

    const folder = folderResult.data.data[0];
    console.log(`   Folder ID: ${folder.id}`);
    console.log(`   Folder Name: ${folder.name}`);
    console.log(`   Project ID: ${folder.project_id}`);

    // Test dengan berbagai request formats
    const testCases = [
      {
        name: 'Minimal Request',
        data: { name: 'Minimal Test', method: 'GET', url: 'https://httpbin.org/get' }
      },
      {
        name: 'Full Request',
        data: {
          name: 'Full Test Endpoint',
          method: 'POST',
          url: 'https://httpbin.org/post',
          description: 'Test description',
          headers: '{"Content-Type": "application/json"}',
          body: '{"test": "data"}'
        }
      },
      {
        name: 'Empty Headers',
        data: { name: 'Empty Headers Test', method: 'GET', url: 'https://httpbin.org/get', headers: '{}' }
      }
    ];

    for (const testCase of testCases) {
      console.log(`\n   Testing: ${testCase.name}`);
      const result = await this.makeRequest('POST', `/gassapi2/backend/?act=endpoint_create&id=${folder.id}`, testCase.data);

      if (result.success) {
        console.log(`   ✅ SUCCESS: ${testCase.name}`);
        console.log(`      Endpoint ID: ${result.data.data.id}`);

        // Cleanup
        await this.makeRequest('DELETE', `/gassapi2/backend/?act=endpoint_delete&id=${result.data.data.id}`);
      } else {
        console.log(`   ❌ FAILED: ${testCase.name}`);
        console.log(`      Error: ${result.error.message || result.error}`);
        console.log(`      Status: ${result.status}`);
      }
    }

    return true;
  }

  // Run all current issues tests
  async runAllTests() {
    console.log('🧪 MCP2 Current Issues Testing');
    console.log('=================================');

    const tests = [
      () => this.testCreateEndpointRequestFormat(),
      () => this.testFlowManagementPermission(),
      () => this.debugEndpointCreation()
    ];

    let passed = 0;
    let failed = 0;

    for (const test of tests) {
      try {
        const result = await test();
        if (result) passed++;
        else failed++;
      } catch (error) {
        console.log(`❌ ERROR: Test failed with exception: ${error.message}`);
        failed++;
      }
    }

    console.log('\n📊 Test Results Summary:');
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📈 Success Rate: ${Math.round((passed / (passed + failed)) * 100)}%`);

    if (failed > 0) {
      console.log('\n⚠️  CURRENT ISSUES REPRODUCED - Debugging needed!');
    } else {
      console.log('\n🎉 ALL CURRENT ISSUES RESOLVED!');
    }

    return { passed, failed, successRate: Math.round((passed / (passed + failed)) * 100) };
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  const tester = new CurrentIssuesTester();
  tester.runAllTests();
}

module.exports = CurrentIssuesTester;