/**
 * Debug Script untuk Flow Management Permission Issues
 *
 * Script ini khusus untuk debugging detail masalah flow management
 * permission dengan analisis authentication context.
 */

const axios = require('axios');
const CONFIG = require('./config.js');

class FlowDebugger {
  constructor() {
    this.baseURL = CONFIG.backend.baseURL;
    this.mcpToken = CONFIG.mcp.token;
    this.projectId = CONFIG.mcp.projectId;
    this.jwtToken = null;
  }

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
        status: error.response?.status || 0
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
      console.log('   User ID:', loginResult.data.data.user.id);
      console.log('   User Email:', loginResult.data.data.user.email);
      return true;
    } else {
      console.log('❌ Failed to get JWT token');
      console.log('   Error:', loginResult.error);
      return false;
    }
  }

  // Test 1: Compare MCP vs JWT token authentication
  async compareAuthTokens() {
    console.log('\n🔍 Comparing MCP vs JWT Token Authentication...');

    // Test MCP token
    console.log('   Testing MCP token authentication...');
    const mcpProjectResult = await this.makeRequest('GET', `/gassapi2/backend/?act=project&id=${this.projectId}`);

    // Test JWT token
    console.log('   Testing JWT token authentication...');
    if (!this.jwtToken) {
      await this.login();
    }

    if (this.jwtToken) {
      const jwtProjectResult = await this.makeRequest('GET', `/gassapi2/backend/?act=project&id=${this.projectId}`, null, true);

      console.log(`   MCP Project Access: ${mcpProjectResult.success ? 'SUCCESS' : 'FAILED'}`);
      console.log(`   JWT Project Access: ${jwtProjectResult.success ? 'SUCCESS' : 'FAILED'}`);

      // Test flows dengan kedua token
      console.log('   Testing flows with MCP token...');
      const mcpFlowResult = await this.makeRequest('GET', `/gassapi2/backend/?act=flows&id=${this.projectId}`);

      console.log('   Testing flows with JWT token...');
      const jwtFlowResult = await this.makeRequest('GET', `/gassapi2/backend/?act=flows&id=${this.projectId}`, null, true);

      console.log(`   MCP Flow Access: ${mcpFlowResult.success ? 'SUCCESS' : 'FAILED'}`);
      console.log(`   JWT Flow Access: ${jwtFlowResult.success ? 'SUCCESS' : 'FAILED'}`);

      // Analisis hasil
      if (!mcpFlowResult.success && jwtFlowResult.success) {
        console.log('🎯 ROOT CAUSE FOUND: MCP token flow permission issue');
        console.log('   JWT token works for flows, MCP token does not');
        return false;
      } else if (mcpFlowResult.success && jwtFlowResult.success) {
        console.log('✅ Both tokens work for flows - issue may be elsewhere');
        return true;
      } else {
        console.log('❌ Both tokens fail for flows - investigate permission system');
        return false;
      }
    } else {
      console.log('❌ Could not get JWT token for comparison');
      return false;
    }
  }

  // Test 2: Analyze MCP token validation response
  async analyzeMcpValidation() {
    console.log('\n🔍 Analyzing MCP Token Validation Response...');

    const validationResult = await this.makeRequest('GET', '/gassapi2/backend/?act=mcp_validate');

    if (validationResult.success) {
      console.log('✅ MCP Validation: SUCCESS');
      console.log('   Project Details:');
      console.log(`     ID: ${validationResult.data.data.project.id}`);
      console.log(`     Name: ${validationResult.data.data.project.name}`);
      console.log(`     Owner ID: ${validationResult.data.data.project.owner_id}`);

      if (validationResult.data.data.user) {
        console.log('   User Context: AVAILABLE');
        console.log(`     User ID: ${validationResult.data.data.user.id}`);
        console.log(`     Token Type: ${validationResult.data.data.user.token_type}`);
        console.log(`     Project ID: ${validationResult.data.data.user.project_id}`);
      } else {
        console.log('   User Context: NOT AVAILABLE');
        console.log('   ⚠️  This could be the issue - no user context in MCP validation');
      }
    } else {
      console.log('❌ MCP Validation: FAILED');
      console.log('   Error:', validationResult.error);
    }

    return validationResult.success;
  }

  // Test 3: Check project membership
  async checkProjectMembership() {
    console.log('\n🔍 Checking Project Membership...');

    // Dapatkan user info dari MCP validation
    const validationResult = await this.makeRequest('GET', '/gassapi2/backend/?act=mcp_validate');
    if (!validationResult.success || !validationResult.data.data.user) {
      console.log('❌ Cannot get user info for membership check');
      return false;
    }

    const userId = validationResult.data.data.user.id;
    const projectId = validationResult.data.data.project.id;

    console.log(`   User ID: ${userId}`);
    console.log(`   Project ID: ${projectId}`);
    console.log(`   Project Owner ID: ${validationResult.data.data.project.owner_id}`);

    // Test isMember logic
    console.log('   Testing isMember logic...');

    // Test via direct API
    const membershipResult = await this.makeRequest('POST', '/gassapi2/backend/?act=project_check_membership', {
      project_id: projectId,
      user_id: userId
    });

    if (membershipResult.success) {
      console.log('   Project Membership Check: SUCCESS');
    } else {
      console.log('   Project Membership Check: FAILED');
      console.log('   Error:', membershipResult.error);
    }

    return membershipResult.success;
  }

  // Test 4: Debug FlowHandler permission check
  async debugFlowHandler() {
    console.log('\n🔍 Debugging FlowHandler Permission Check...');

    // Simulate FlowHandler logic
    console.log('   Simulating FlowHandler.getAll() logic...');

    // Step 1: Check project ID
    if (!this.projectId) {
      console.log('   ❌ Project ID is required');
      return false;
    }

    // Step 2: Get user via AuthHelper::requireAuth()
    console.log('   Testing AuthHelper::requireAuth()...');
    const validationResult = await this.makeRequest('GET', '/gassapi2/backend/?act=mcp_validate');

    if (!validationResult.success || !validationResult.data.data.user) {
      console.log('   ❌ AuthHelper::requireAuth() would fail - no user context');
      return false;
    }

    const user = validationResult.data.data.user;
    const userId = user.id;
    console.log(`   ✅ AuthHelper::requireAuth() would return user ID: ${userId}`);

    // Step 3: Check isMember()
    console.log('   Testing ProjectRepository::isMember()...');
    const project = validationResult.data.data.project;
    const isOwner = project.owner_id === userId;

    console.log(`   Is Owner: ${isOwner}`);
    console.log(`   User ID: ${userId}`);
    console.log(`   Owner ID: ${project.owner_id}`);

    if (isOwner) {
      console.log('   ✅ isMember() should return true (user is owner)');
    } else {
      console.log('   ⚠️  isMember() would check project_members table');
    }

    // Step 4: Test actual flow access
    console.log('   Testing actual flow access...');
    const flowResult = await this.makeRequest('GET', `/gassapi2/backend/?act=flows&id=${this.projectId}`);

    if (flowResult.success) {
      console.log('   ✅ Flow access: SUCCESS');
      return true;
    } else {
      console.log('   ❌ Flow access: FAILED');
      console.log('   Error:', flowResult.error.message || flowResult.error);
      console.log('   Status:', flowResult.status);

      if (flowResult.status === 403) {
        console.log('   🎯 This is a permission issue, not authentication');
      }

      return false;
    }
  }

  // Test 5: Check MCP token record
  async checkMcpTokenRecord() {
    console.log('\n🔍 Checking MCP Token Record...');

    // Dapatkan MCP token details
    const validationResult = await this.makeRequest('GET', '/gassapi2/backend/?act=mcp_validate');

    if (validationResult.success && validationResult.data.data.user) {
      const user = validationResult.data.data.user;
      console.log('   MCP Token User Context:');
      console.log(`     ID: ${user.id}`);
      console.log(`     Project ID: ${user.project_id}`);
      console.log(`     Token Type: ${user.token_type}`);
      console.log(`     MCP Token ID: ${user.mcp_token_id}`);

      // Verify consistency
      const project = validationResult.data.data.project;
      const isConsistent = user.id === project.owner_id && user.project_id === project.id;

      console.log(`   User-Project Consistency: ${isConsistent ? 'CONSISTENT' : 'INCONSISTENT'}`);

      if (!isConsistent) {
        console.log('   ⚠️  User context inconsistent with project');
        console.log('   Expected: user.id === project.owner_id');
        console.log(`   Actual: ${user.id} !== ${project.owner_id}`);
      }

      return isConsistent;
    } else {
      console.log('❌ Cannot check MCP token record');
      return false;
    }
  }

  // Run all flow debug tests
  async runFlowDebugTests() {
    console.log('🐛 MCP2 Flow Management Debugging');
    console.log('=================================');

    const tests = [
      () => this.analyzeMcpValidation(),
      () => this.checkMcpTokenRecord(),
      () => this.compareAuthTokens(),
      () => this.checkProjectMembership(),
      () => this.debugFlowHandler()
    ];

    let passed = 0;
    let failed = 0;

    for (const test of tests) {
      try {
        const result = await test();
        if (result) passed++;
        else failed++;
      } catch (error) {
        console.log(`❌ ERROR: Flow debug test failed: ${error.message}`);
        failed++;
      }
    }

    console.log('\n📊 Flow Debug Results Summary:');
    console.log(`✅ Tests Completed: ${passed}`);
    console.log(`❌ Errors: ${failed}`);

    console.log('\n💡 Flow Debug Recommendations:');
    console.log('1. Ensure MCP validation returns proper user context');
    console.log('2. Verify user-project consistency in token record');
    console.log('3. Check if MCP token user ID matches project owner');
    console.log('4. Validate isMember() logic for MCP tokens');
    console.log('5. Debug AuthHelper::requireAuth() with MCP tokens');
  }
}

// Run flow debug tests if this file is executed directly
if (require.main === module) {
  const flowDebugger = new FlowDebugger();
  flowDebugger.runFlowDebugTests();
}

module.exports = FlowDebugger;