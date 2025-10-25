/**
 * Test Script untuk Reproduce Exact MCP2 Error
 * Bandingkan request format antara mcp2 dan test-mcp
 */

const axios = require('axios');

const CONFIG = {
  // Sama seperti gassapi.json
  backend: {
    baseURL: 'http://localhost:8080'
  },
  mcp: {
    projectId: 'proj_1761385246_5ec798d9',
    token: '2032781cbb63ea282749778091b2170a5a18d0491a519bad4ab488ab463e885d'
  },
  testData: {
    folder: {
      id: 'col_6f6f1c44ff46c4e133feabc7e44f9a92' // API Endpoints folder
    },
    endpoint: {
      name: 'Test MCP Endpoint Debug',
      method: 'GET',
      url: 'https://jsonplaceholder.typicode.com/posts/1',
      description: 'Debug endpoint testing',
      headers: {"Content-Type": "application/json", "User-Agent": "GASSAPI-MCP-Test"},
      body: null
    }
  }
};

class Mcp2ErrorReproducer {
  constructor() {
    this.baseURL = CONFIG.backend.baseURL;
    this.mcpToken = CONFIG.mcp.token;
  }

  // 1. Test dengan format test-mcp (AXIOS - yang berhasil)
  async testWithAxios() {
    console.log('\n🟢 TEST 1: AXIOS (test-mcp format)');
    console.log('=====================================');

    try {
      const requestBody = {
        name: CONFIG.testData.endpoint.name + ' (AXIOS)',
        method: CONFIG.testData.endpoint.method,
        url: CONFIG.testData.endpoint.url,
        description: CONFIG.testData.endpoint.description + ' (AXIOS)',
        headers: JSON.stringify(CONFIG.testData.endpoint.headers),
        body: CONFIG.testData.endpoint.body
      };

      console.log('Request URL:', `${this.baseURL}/gassapi2/backend/?act=endpoint_create&id=${CONFIG.testData.folder.id}`);
      console.log('Request Headers:', {
        'Authorization': `Bearer ${this.mcpToken.substring(0, 20)}...`,
        'Content-Type': 'application/json'
      });
      console.log('Request Body:', JSON.stringify(requestBody, null, 2));

      const response = await axios.post(`${this.baseURL}/gassapi2/backend/?act=endpoint_create&id=${CONFIG.testData.folder.id}`, requestBody, {
        headers: {
          'Authorization': `Bearer ${this.mcpToken}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      });

      console.log('✅ AXIOS SUCCESS:', response.status);
      console.log('Response:', JSON.stringify(response.data, null, 2));
      return { success: true, data: response.data };

    } catch (error) {
      console.log('❌ AXIOS ERROR:', error.response?.status);
      console.log('Error Response:', JSON.stringify(error.response?.data, null, 2));
      return { success: false, error: error.response?.data || error.message };
    }
  }

  // 2. Test dengan format MCP2 (fetch - yang gagal)
  async testWithFetch() {
    console.log('\n🔴 TEST 2: FETCH (mcp2 format)');
    console.log('==================================');

    try {
      const requestBody = JSON.stringify({
        name: CONFIG.testData.endpoint.name + ' (FETCH)',
        method: CONFIG.testData.endpoint.method,
        url: CONFIG.testData.endpoint.url,
        description: CONFIG.testData.endpoint.description + ' (FETCH)',
        headers: JSON.stringify(CONFIG.testData.endpoint.headers),
        body: CONFIG.testData.endpoint.body
      });

      console.log('Request URL:', `${this.baseURL}/gassapi2/backend/?act=endpoint_create&id=${CONFIG.testData.folder.id}`);
      console.log('Request Headers:', {
        'Authorization': `Bearer ${this.mcpToken.substring(0, 20)}...`,
        'Content-Type': 'application/json'
      });
      console.log('Request Body:', requestBody);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const result = await fetch(`${this.baseURL}/gassapi2/backend/?act=endpoint_create&id=${CONFIG.testData.folder.id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.mcpToken}`,
          'Content-Type': 'application/json'
        },
        body: requestBody,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      console.log('HTTP Status:', result.status, result.statusText);

      if (!result.ok) {
        throw new Error(`HTTP ${result.status}: ${result.statusText}`);
      }

      const data = await result.json();

      console.log('✅ FETCH SUCCESS:', result.status);
      console.log('Response:', JSON.stringify(data, null, 2));
      return { success: true, data };

    } catch (error) {
      console.log('❌ FETCH ERROR:', error.message);
      return { success: false, error: error.message };
    }
  }

  // 3. Test exact MCP2 simulation dengan error handling yang sama
  async testExactMcp2Logic() {
    console.log('\n🔍 TEST 3: EXACT MCP2 LOGIC');
    console.log('===============================');

    try {
      // Simulate exact MCP2 logic dari endpoints.ts line 607-658
      const apiEndpoints = {
        getEndpoint: (key, variables) => {
          const endpoints = {
            'endpointCreate': '/gassapi2/backend/?act=endpoint_create&id={id}'
          };
          let endpoint = endpoints[key];
          if (variables) {
            Object.entries(variables).forEach(([varName, value]) => {
              endpoint = endpoint.replace(new RegExp(`{${varName}}`, 'g'), encodeURIComponent(value));
            });
          }
          return endpoint;
        }
      };

      const endpoint = apiEndpoints.getEndpoint('endpointCreate', { id: CONFIG.testData.folder.id });
      const fullUrl = `${this.baseURL}${endpoint}`;

      const requestBody = JSON.stringify({
        name: CONFIG.testData.endpoint.name + ' (EXACT MCP2)',
        method: CONFIG.testData.endpoint.method,
        url: CONFIG.testData.endpoint.url,
        description: CONFIG.testData.endpoint.description + ' (EXACT MCP2)',
        headers: JSON.stringify(CONFIG.testData.endpoint.headers),
        body: JSON.stringify(CONFIG.testData.endpoint.body || {})
      });

      console.log('Request URL:', fullUrl);
      console.log('Request Body:', requestBody);

      // Exact MCP2 fetch implementation
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      let apiResponse;
      try {
        const result = await fetch(fullUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.mcpToken}`,
            'Content-Type': 'application/json'
          },
          body: requestBody,
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!result.ok) {
          throw new Error(`HTTP ${result.status}: ${result.statusText}`);
        }

        const data = await result.json();

        apiResponse = {
          success: data.success,
          data: data.data,
          message: data.message,
          status: result.status
        };

        console.log('✅ EXACT MCP2 SUCCESS');
        console.log('API Response:', JSON.stringify(apiResponse, null, 2));

        if (!apiResponse.success) {
          let errorMessage = `Failed to create endpoint: ${apiResponse.error || apiResponse.message || 'Unknown error'}`;
          console.log('❌ MCP2 ERROR MESSAGE:', errorMessage);
          return { success: false, error: errorMessage };
        }

        return { success: true, data: apiResponse.data };

      } catch (networkError) {
        clearTimeout(timeoutId);
        console.log('❌ MCP2 NETWORK ERROR:', networkError.message);
        throw networkError;
      }

    } catch (error) {
      console.log('❌ EXACT MCP2 ERROR:', error.message);
      return { success: false, error: error.message };
    }
  }

  // Main test runner
  async runAllTests() {
    console.log('🧪 MCP2 Error Reproduction Test');
    console.log('==============================');
    console.log('Backend:', this.baseURL);
    console.log('Token:', this.mcpToken.substring(0, 20) + '...');
    console.log('Folder ID:', CONFIG.testData.folder.id);

    const results = {};

    // Test 1: AXIOS (test-mcp format)
    results.axios = await this.testWithAxios();

    // Test 2: FETCH (mcp2 format)
    results.fetch = await this.testWithFetch();

    // Test 3: EXACT MCP2 LOGIC
    results.exactMcp2 = await this.testExactMcp2Logic();

    // Summary
    console.log('\n📊 TEST RESULTS SUMMARY');
    console.log('=======================');
    console.log('AXIOS (test-mcp):', results.axios.success ? '✅ SUCCESS' : '❌ FAILED');
    console.log('FETCH (mcp2):', results.fetch.success ? '✅ SUCCESS' : '❌ FAILED');
    console.log('EXACT MCP2:', results.exactMcp2.success ? '✅ SUCCESS' : '❌ FAILED');

    // Analysis
    console.log('\n🔍 ANALYSIS');
    console.log('===========');
    if (results.axios.success && !results.fetch.success) {
      console.log('💡 Issue: Fetch vs Axios behavior difference');
      console.log('   - Axios works but fetch fails');
      console.log('   - Check headers, body format, or error handling');
    } else if (results.axios.success && results.fetch.success && !results.exactMcp2.success) {
      console.log('💡 Issue: MCP2 response format handling');
      console.log('   - Both basic requests work');
      console.log('   - Problem in MCP2 response processing logic');
    } else if (results.axios.success && results.fetch.success && results.exactMcp2.success) {
      console.log('🎉 All tests pass - MCP2 should work now!');
    } else {
      console.log('⚠️  Complex issue - multiple failures');
    }

    return results;
  }
}

// Run tests
if (require.main === module) {
  const reproducer = new Mcp2ErrorReproducer();
  reproducer.runAllTests().catch(console.error);
}

module.exports = Mcp2ErrorReproducer;