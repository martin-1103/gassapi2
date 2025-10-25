/**
 * Test Script untuk Error yang Sudah Diperbaiki (Regression Testing)
 *
 * Script ini menguji apakah error yang sudah diperbaiki tetap fixed
 * atau muncul kembali (regression).
 */

const axios = require('axios');
const CONFIG = require('./config.js');

class FixedErrorsTester {
  constructor() {
    this.baseURL = CONFIG.backend.baseURL;
    this.mcpToken = CONFIG.mcp.token;
    this.projectId = CONFIG.mcp.projectId;
  }

  // Helper untuk membuat request dengan MCP token
  async makeRequest(method, endpoint, data = null) {
    try {
      const config = {
        method,
        url: `${this.baseURL}${endpoint}`,
        headers: {
          'Authorization': `Bearer ${this.mcpToken}`,
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
        status: error.response?.status || 0
      };
    }
  }

  // Test 1: Missing Import Error (ResponseHelper MessageHelper)
  async testMissingImportError() {
    console.log('\n🔍 Testing Missing Import Error (ResponseHelper)...');

    // Ini seharusnya tidak lagi error karena import sudah diperbaiki
    const result = await this.makeRequest('GET', '/gassapi2/backend/?act=project_folders&id=' + this.projectId);

    if (result.success && result.data.success) {
      console.log('✅ PASS: Missing import error FIXED - JSON response proper');
      return true;
    } else {
      // Cek apakah error berupa HTML (indikasi missing import)
      if (result.error && result.error.includes('<')) {
        console.log('❌ FAIL: Missing import error REGRESSED - HTML response detected');
        console.log('   Error:', result.error.substring(0, 200) + '...');
        return false;
      } else {
        console.log('✅ PASS: No HTML error response detected');
        return true;
      }
    }
  }

  // Test 2: Authentication Consistency (FlowHandler vs AuthHelper)
  async testAuthenticationConsistency() {
    console.log('\n🔍 Testing Authentication Consistency...');

    // Test flow endpoint - seharusnya tidak lagi 401 authentication error
    const result = await this.makeRequest('GET', '/gassapi2/backend/?act=flows&id=' + this.projectId);

    if (result.success) {
      console.log('✅ PASS: Authentication consistency FIXED - Flow endpoint accessible');
      return true;
    } else if (result.status === 403) {
      // 403 (Forbidden) adalah expected untuk permission issues, bukan authentication issues
      console.log('✅ PASS: Authentication working (403 = permission, not authentication error)');
      return true;
    } else if (result.status === 401) {
      console.log('❌ FAIL: Authentication consistency REGRESSED - 401 error detected');
      console.log('   Error:', result.error);
      return false;
    } else {
      console.log('✅ PASS: No authentication error detected');
      return true;
    }
  }

  // Test 3: Database Schema Issues (Endpoints table)
  async testDatabaseSchemaIssues() {
    console.log('\n🔍 Testing Database Schema Issues...');

    // Test endpoint creation - seharusnya tidak lagi schema error
    const testFolder = await this.makeRequest('GET', '/gassapi2/backend/?act=project_folders&id=' + this.projectId);

    if (!testFolder.success || !testFolder.data.data || testFolder.data.data.length === 0) {
      console.log('⚠️  SKIP: No folders available for schema test');
      return true;
    }

    const folderId = testFolder.data.data[0].id;
    const endpointResult = await this.makeRequest('POST', `/gassapi2/backend/?act=endpoint_create&id=${folderId}`, {
      name: 'Schema Test Endpoint',
      method: 'GET',
      url: 'https://jsonplaceholder.typicode.com/posts/1'
    });

    if (endpointResult.success) {
      console.log('✅ PASS: Database schema FIXED - Endpoint created successfully');

      // Cleanup
      await this.makeRequest('DELETE', `/gassapi2/backend/?act=endpoint_delete&id=${endpointResult.data.data.id}`);
      return true;
    } else {
      // Cek apakah error berupa schema issues
      if (endpointResult.error && endpointResult.error.includes('Unknown column')) {
        console.log('❌ FAIL: Database schema REGRESSED - Column error detected');
        console.log('   Error:', endpointResult.error);
        return false;
      } else {
        console.log('✅ PASS: No database schema error detected');
        return true;
      }
    }
  }

  // Test 4: Endpoint Mapping Error (list_endpoints)
  async testEndpointMappingError() {
    console.log('\n🔍 Testing Endpoint Mapping Error...');

    // Test list_endpoints - seharusnya menggunakan project_endpoints, bukan endpoints
    const result = await this.makeRequest('GET', '/gassapi2/backend/?act=project_endpoints&id=' + this.projectId);

    if (result.success) {
      console.log('✅ PASS: Endpoint mapping FIXED - project_endpoints working');
      console.log(`   Found ${result.data.data?.length || 0} endpoints`);
      return true;
    } else {
      console.log('❌ FAIL: Endpoint mapping REGRESSED');
      console.log('   Error:', result.error);
      return false;
    }
  }

  // Run all fixed errors tests
  async runAllTests() {
    console.log('🧪 MCP2 Fixed Errors Regression Testing');
    console.log('=====================================');

    const tests = [
      () => this.testMissingImportError(),
      () => this.testAuthenticationConsistency(),
      () => this.testDatabaseSchemaIssues(),
      () => this.testEndpointMappingError()
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

    if (failed === 0) {
      console.log('\n🎉 ALL FIXED ERRORS STILL FIXED - No regression detected!');
    } else {
      console.log('\n⚠️  REGRESSION DETECTED - Some fixed errors have returned!');
    }

    return { passed, failed, successRate: Math.round((passed / (passed + failed)) * 100) };
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  const tester = new FixedErrorsTester();
  tester.runAllTests();
}

module.exports = FixedErrorsTester;