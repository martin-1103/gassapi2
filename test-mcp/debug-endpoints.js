/**
 * Debug Script untuk Endpoint Creation Issues
 *
 * Script ini khusus untuk debugging detail masalah create_endpoint
 * dengan membandingkan request format MCP client vs direct requests.
 */

const axios = require('axios');
const CONFIG = require('./config.js');

class EndpointDebugger {
  constructor() {
    this.baseURL = CONFIG.backend.baseURL;
    this.mcpToken = CONFIG.mcp.token;
    this.projectId = CONFIG.mcp.projectId;
  }

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

  // Fungsi untuk format headers seperti MCP client
  formatHeadersLikeMCP(headers) {
    if (!headers || Object.keys(headers).length === 0) {
      return '{}';
    }
    return JSON.stringify(headers, null, 2); // MCP client format
  }

  // Fungsi untuk format headers yang benar
  formatHeadersCorrect(headers) {
    if (!headers || Object.keys(headers).length === 0) {
      return '{}';
    }
    return JSON.stringify(headers); // Correct format
  }

  // Test 1: Bandingkan format headers
  async testHeaderFormats() {
    console.log('\n🔍 Testing Header Format Differences...');

    const folderResult = await this.makeRequest('GET', `/gassapi2/backend/?act=project_folders&id=${this.projectId}`);
    if (!folderResult.success || !folderResult.data.data || folderResult.data.data.length === 0) {
      console.log('❌ No folders available');
      return false;
    }

    const folderId = folderResult.data.data[0].id;
    const baseData = {
      name: 'Header Format Test',
      method: 'GET',
      url: 'https://httpbin.org/get'
    };

    // Test dengan MCP client format (with indentation)
    console.log('   Testing MCP client header format (with indentation)...');
    const mcpData = {
      ...baseData,
      headers: this.formatHeadersLikeMCP({ 'Content-Type': 'application/json' })
    };

    const mcpResult = await this.makeRequest('POST', `/gassapi2/backend/?act=endpoint_create&id=${folderId}`, mcpData);

    // Test dengan correct format (no indentation)
    console.log('   Testing correct header format (no indentation)...');
    const correctData = {
      ...baseData,
      headers: this.formatHeadersCorrect({ 'Content-Type': 'application/json' })
    };

    const correctResult = await this.makeRequest('POST', `/gassapi2/backend/?act=endpoint_create&id=${folderId}`, correctData);

    console.log(`   MCP Format Result: ${mcpResult.success ? 'SUCCESS' : 'FAILED'}`);
    console.log(`   Correct Format Result: ${correctResult.success ? 'SUCCESS' : 'FAILED'}`);

    if (!mcpResult.success && correctResult.success) {
      console.log('🎯 ROOT CAUSE FOUND: Header format indentation issue!');
      console.log('   MCP client uses JSON.stringify(headers, null, 2) but backend expects JSON.stringify(headers)');
    }

    // Cleanup
    if (correctResult.success && correctResult.data.data?.id) {
      await this.makeRequest('DELETE', `/gassapi2/backend/?act=endpoint_delete&id=${correctResult.data.data.id}`);
    }

    return mcpResult.success || correctResult.success;
  }

  // Test 2: Bandingkan request URL generation
  async testURLGeneration() {
    console.log('\n🔍 Testing URL Generation...');

    const folderResult = await this.makeRequest('GET', `/gassapi2/backend/?act=project_folders&id=${this.projectId}`);
    if (!folderResult.success || !folderResult.data.data || folderResult.data.data.length === 0) {
      console.log('❌ No folders available');
      return false;
    }

    const folderId = folderResult.data.data[0].id;

    // Test URL variations
    const urlTests = [
      {
        name: 'MCP Client URL',
        url: `/gassapi2/backend/?act=endpoint_create&id=${folderId}`
      },
      {
        name: 'Alternative URL 1',
        url: `/gassapi2/backend/?act=endpoint_create&id=${folderId}&format=json`
      },
      {
        name: 'Alternative URL 2',
        url: `/gassapi2/backend/?act=endpoint_create&id=${folderId}`
      }
    ];

    const testData = {
      name: 'URL Test Endpoint',
      method: 'GET',
      url: 'https://httpbin.org/get'
    };

    for (const urlTest of urlTests) {
      console.log(`   Testing: ${urlTest.name}`);
      console.log(`   URL: ${urlTest.url}`);

      const result = await this.makeRequest('POST', urlTest.url, testData);

      if (result.success) {
        console.log(`   ✅ SUCCESS: ${urlTest.name}`);

        // Cleanup
        if (result.data.data?.id) {
          await this.makeRequest('DELETE', `/gassapi2/backend/?act=endpoint_delete&id=${result.data.data.id}`);
        }
      } else {
        console.log(`   ❌ FAILED: ${urlTest.name}`);
        console.log(`      Error: ${result.error.message || result.error}`);
        console.log(`      Status: ${result.status}`);
      }
    }

    return true;
  }

  // Test 3: Request body encoding
  async testRequestBodyEncoding() {
    console.log('\n🔍 Testing Request Body Encoding...');

    const folderResult = await this.makeRequest('GET', `/gassapi2/backend/?act=project_folders&id=${this.projectId}`);
    if (!folderResult.success || !folderResult.data.data || folderResult.data.data.length === 0) {
      console.log('❌ No folders available');
      return false;
    }

    const folderId = folderResult.data.data[0].id;

    // Test dengan berbagai encoding scenarios
    const encodingTests = [
      {
        name: 'Simple ASCII',
        data: {
          name: 'Simple Test',
          method: 'GET',
          url: 'https://httpbin.org/get'
        }
      },
      {
        name: 'With Special Characters',
        data: {
          name: 'Test with émojis 🎉',
          method: 'GET',
          url: 'https://httpbin.org/get',
          description: 'Special chars: café, naïve, résumé'
        }
      },
      {
        name: 'Empty Headers String',
        data: {
          name: 'Empty Headers Test',
          method: 'GET',
          url: 'https://httpbin.org/get',
          headers: ''
        }
      },
      {
        name: 'Null Values',
        data: {
          name: 'Null Values Test',
          method: 'GET',
          url: 'https://httpbin.org/get',
          description: null,
          headers: null,
          body: null
        }
      }
    ];

    for (const test of encodingTests) {
      console.log(`   Testing: ${test.name}`);
      const result = await this.makeRequest('POST', `/gassapi2/backend/?act=endpoint_create&id=${folderId}`, test.data);

      if (result.success) {
        console.log(`   ✅ SUCCESS: ${test.name}`);

        // Cleanup
        if (result.data.data?.id) {
          await this.makeRequest('DELETE', `/gassapi2/backend/?act=endpoint_delete&id=${result.data.data.id}`);
        }
      } else {
        console.log(`   ❌ FAILED: ${test.name}`);
        console.log(`      Error: ${result.error.message || result.error}`);
        console.log(`      Status: ${result.status}`);
      }
    }

    return true;
  }

  // Test 4: Authentication header differences
  async testAuthHeaders() {
    console.log('\n🔍 Testing Authentication Headers...');

    const folderResult = await this.makeRequest('GET', `/gassapi2/backend/?act=project_folders&id=${this.projectId}`);
    if (!folderResult.success || !folderResult.data.data || folderResult.data.data.length === 0) {
      console.log('❌ No folders available');
      return false;
    }

    const folderId = folderResult.data.data[0].id;

    // Test dengan berbagai auth header formats
    const authTests = [
      {
        name: 'Bearer Token',
        headers: {
          'Authorization': `Bearer ${this.mcpToken}`,
          'Content-Type': 'application/json'
        }
      },
      {
        name: 'Bearer Token (lowercase authorization)',
        headers: {
          'authorization': `Bearer ${this.mcpToken}`,
          'Content-Type': 'application/json'
        }
      },
      {
        name: 'Token Only',
        headers: {
          'Authorization': this.mcpToken,
          'Content-Type': 'application/json'
        }
      }
    ];

    const testData = {
      name: 'Auth Test Endpoint',
      method: 'GET',
      url: 'https://httpbin.org/get'
    };

    for (const authTest of authTests) {
      console.log(`   Testing: ${authTest.name}`);

      try {
        const config = {
          method: 'POST',
          url: `${this.baseURL}/gassapi2/backend/?act=endpoint_create&id=${folderId}`,
          headers: authTest.headers,
          data: testData,
          timeout: CONFIG.backend.timeout
        };

        const response = await axios(config);
        const result = { success: true, data: response.data, status: response.status };

        if (result.success) {
          console.log(`   ✅ SUCCESS: ${authTest.name}`);

          // Cleanup
          if (result.data.data?.id) {
            await this.makeRequest('DELETE', `/gassapi2/backend/?act=endpoint_delete&id=${result.data.data.id}`);
          }
        } else {
          console.log(`   ❌ FAILED: ${authTest.name}`);
        }
      } catch (error) {
        console.log(`   ❌ FAILED: ${authTest.name}`);
        console.log(`      Error: ${error.response?.data?.message || error.message}`);
        console.log(`      Status: ${error.response?.status}`);
      }
    }

    return true;
  }

  // Run all debug tests
  async runDebugTests() {
    console.log('🐛 MCP2 Endpoint Creation Debugging');
    console.log('==================================');

    const tests = [
      () => this.testHeaderFormats(),
      () => this.testURLGeneration(),
      () => this.testRequestBodyEncoding(),
      () => this.testAuthHeaders()
    ];

    let passed = 0;
    let failed = 0;

    for (const test of tests) {
      try {
        await test();
        passed++;
      } catch (error) {
        console.log(`❌ ERROR: Debug test failed: ${error.message}`);
        failed++;
      }
    }

    console.log('\n📊 Debug Results Summary:');
    console.log(`✅ Tests Completed: ${passed}`);
    console.log(`❌ Errors: ${failed}`);

    console.log('\n💡 Debug Recommendations:');
    console.log('1. Check MCP client header formatting (JSON.stringify vs JSON.stringify(headers, null, 2))');
    console.log('2. Verify URL generation and parameter substitution');
    console.log('3. Ensure consistent request body encoding');
    console.log('4. Validate authentication header format');
  }
}

// Run debug tests if this file is executed directly
if (require.main === module) {
  const endpointDebugger = new EndpointDebugger();
  endpointDebugger.runDebugTests();
}

module.exports = EndpointDebugger;