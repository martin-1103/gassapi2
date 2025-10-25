#!/usr/bin/env node

/**
 * Quick Health Check
 * Fast check to verify MCP server and basic functionality
 */

const { createTestClient } = require('../utils/McpTestClient.js');
const { Assert, TestUtils } = require('../utils/TestHelpers.js');
const { getProjectConfig } = require('../config/test-config.js');

/**
 * Quick health check function
 */
async function quickHealthCheck() {
  console.log('🔍 GASSAPI MCP v2 - Quick Health Check');
  console.log('=====================================');
  console.log(`⏰ Started at: ${new Date().toISOString()}`);

  const overallStartTime = Date.now();
  const results = [];

  // Test 1: Server startup
  console.log('\n1️⃣ Testing MCP server startup...');
  const serverStartTime = Date.now();

  try {
    const client = createTestClient({ timeout: 10000, debug: true });
    await client.initialize();
    const serverDuration = Date.now() - serverStartTime;

    results.push({
      name: 'MCP Server Startup',
      status: 'passed',
      duration: serverDuration,
      message: `Server started successfully in ${serverDuration}ms`
    });

    console.log(`✅ Server started successfully (${serverDuration}ms)`);

    // Test 2: Health check tool
    console.log('\n2️⃣ Testing health_check tool...');
    const healthStartTime = Date.now();

    try {
      const healthResult = await client.healthCheck();
      const healthDuration = Date.now() - healthStartTime;

      if (healthResult.success) {
        results.push({
          name: 'Health Check Tool',
          status: 'passed',
          duration: healthDuration,
          message: 'Health check passed'
        });
        console.log(`✅ Health check passed (${healthDuration}ms)`);
      } else {
        results.push({
          name: 'Health Check Tool',
          status: 'failed',
          duration: healthDuration,
          message: `Health check failed: ${healthResult.error}`
        });
        console.log(`❌ Health check failed: ${healthResult.error}`);
      }
    } catch (error) {
      const healthDuration = Date.now() - healthStartTime;
      results.push({
        name: 'Health Check Tool',
        status: 'error',
        duration: healthDuration,
        message: `Health check error: ${error.message}`
      });
      console.log(`💥 Health check error: ${error.message}`);
    }

    // Test 3: Available tools
    console.log('\n3️⃣ Testing tools list...');
    const toolsStartTime = Date.now();

    try {
      const toolsResult = await client.getAvailableTools();
      const toolsDuration = Date.now() - toolsStartTime;

      if (toolsResult && toolsResult.tools) {
        const toolCount = toolsResult.tools.length;
        results.push({
          name: 'Tools List',
          status: 'passed',
          duration: toolsDuration,
          message: `Found ${toolCount} available tools`
        });
        console.log(`✅ Found ${toolCount} available tools (${toolsDuration}ms)`);

        // List tool categories
        const toolCategories = {};
        toolsResult.tools.forEach(tool => {
          const category = getToolCategory(tool.name);
          if (!toolCategories[category]) {
            toolCategories[category] = 0;
          }
          toolCategories[category]++;
        });

        console.log('   📋 Tool categories:');
        Object.entries(toolCategories).forEach(([category, count]) => {
          console.log(`      - ${category}: ${count} tools`);
        });
      } else {
        results.push({
          name: 'Tools List',
          status: 'failed',
          duration: toolsDuration,
          message: 'No tools found'
        });
        console.log('❌ No tools found');
      }
    } catch (error) {
      const toolsDuration = Date.now() - toolsStartTime;
      results.push({
        name: 'Tools List',
        status: 'error',
        duration: toolsDuration,
        message: `Tools list error: ${error.message}`
      });
      console.log(`💥 Tools list error: ${error.message}`);
    }

    // Test 4: Basic auth functionality
    console.log('\n4️⃣ Testing basic auth functionality...');
    const authStartTime = Date.now();

    try {
      const projectConfig = getProjectConfig();
      console.log(`   🔧 Using project ID: ${projectConfig.id}`);
      const authResult = await client.call('get_project_context', {
        project_id: projectConfig.id
      });
      const authDuration = Date.now() - authStartTime;

      console.log(`   🔧 Auth response: ${JSON.stringify(authResult, null, 2)}`);

      // Check if auth was successful by looking at the content
      const authSuccess = authResult &&
                         authResult.content &&
                         authResult.content[0] &&
                         authResult.content[0].text &&
                         (authResult.content[0].text.includes('✅ MCP Token Validated') ||
                          authResult.content[0].text.includes('Project Context Retrieved'));

      if (authSuccess) {
        results.push({
          name: 'Basic Auth',
          status: 'passed',
          duration: authDuration,
          message: 'Project context retrieved successfully'
        });
        console.log(`✅ Project context retrieved (${authDuration}ms)`);

        // Extract project name from response
        const authText = authResult.content[0].text;
        const projectMatch = authText.match(/- Name: (.+)/);
        const projectName = projectMatch ? projectMatch[1] : 'Unknown';
        console.log(`   📁 Project: ${projectName}`);
        console.log(`   🔑 Authenticated: Yes`);
      } else {
        results.push({
          name: 'Basic Auth',
          status: 'failed',
          duration: authDuration,
          message: 'Failed to retrieve project context'
        });
        console.log('❌ Failed to retrieve project context');
      }
    } catch (error) {
      const authDuration = Date.now() - authStartTime;
      results.push({
        name: 'Basic Auth',
        status: 'error',
        duration: authDuration,
        message: `Auth error: ${error.message}`
      });
      console.log(`💥 Auth error: ${error.message}`);
    }

    // Test 5: Response time check
    console.log('\n5️⃣ Testing response times...');
    const responseStartTime = Date.now();

    try {
      const responseTimes = [];
      const iterations = 3;

      for (let i = 0; i < iterations; i++) {
        const start = Date.now();
        await client.healthCheck();
        responseTimes.push(Date.now() - start);
        await TestUtils.wait(100);
      }

      const avgResponseTime = responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;
      const maxResponseTime = Math.max(...responseTimes);
      const responseDuration = Date.now() - responseStartTime;

      if (avgResponseTime < 1000 && maxResponseTime < 2000) {
        results.push({
          name: 'Response Times',
          status: 'passed',
          duration: responseDuration,
          message: `Avg: ${avgResponseTime.toFixed(0)}ms, Max: ${maxResponseTime}ms`
        });
        console.log(`✅ Response times OK (${responseDuration}ms)`);
        console.log(`   📊 Average: ${avgResponseTime.toFixed(0)}ms`);
        console.log(`   📊 Maximum: ${maxResponseTime}ms`);
      } else {
        results.push({
          name: 'Response Times',
          status: 'warning',
          duration: responseDuration,
          message: `Slow response times - Avg: ${avgResponseTime.toFixed(0)}ms`
        });
        console.log(`⚠️  Slow response times (${responseDuration}ms)`);
        console.log(`   📊 Average: ${avgResponseTime.toFixed(0)}ms`);
        console.log(`   📊 Maximum: ${maxResponseTime}ms`);
      }
    } catch (error) {
      const responseDuration = Date.now() - responseStartTime;
      results.push({
        name: 'Response Times',
        status: 'error',
        duration: responseDuration,
        message: `Response time test error: ${error.message}`
      });
      console.log(`💥 Response time test error: ${error.message}`);
    }

    await client.close();

  } catch (error) {
    results.push({
      name: 'MCP Server Startup',
      status: 'error',
      duration: Date.now() - serverStartTime,
      message: `Server startup failed: ${error.message}`
    });
    console.log(`💥 Server startup failed: ${error.message}`);
  }

  // Final summary
  const overallDuration = Date.now() - overallStartTime;
  const passedCount = results.filter(r => r.status === 'passed').length;
  const failedCount = results.filter(r => r.status === 'failed').length;
  const errorCount = results.filter(r => r.status === 'error').length;
  const warningCount = results.filter(r => r.status === 'warning').length;

  console.log('\n' + '='.repeat(50));
  console.log('📊 QUICK HEALTH CHECK SUMMARY');
  console.log('='.repeat(50));
  console.log(`⏱️  Total Duration: ${overallDuration}ms`);
  console.log(`📈 Total Checks: ${results.length}`);
  console.log(`✅ Passed: ${passedCount}`);
  console.log(`⚠️  Warnings: ${warningCount}`);
  console.log(`❌ Failed: ${failedCount}`);
  console.log(`💥 Errors: ${errorCount}`);

  // Print detailed results
  console.log('\n📋 Detailed Results:');
  results.forEach((result, index) => {
    const statusIcon = {
      passed: '✅',
      warning: '⚠️',
      failed: '❌',
      error: '💥'
    };

    const icon = statusIcon[result.status] || '❓';
    console.log(`   ${index + 1}. ${icon} ${result.name} (${result.duration}ms)`);
    if (result.message) {
      console.log(`      ${result.message}`);
    }
  });

  console.log('='.repeat(50));

  // Determine overall health
  if (errorCount > 0) {
    console.log('\n💥 CRITICAL ISSUES FOUND');
    console.log('The MCP server has critical problems that need immediate attention.');
    return 2;
  } else if (failedCount > 0) {
    console.log('\n❌ HEALTH CHECK FAILED');
    console.log('Some checks failed. Please review the detailed results above.');
    return 1;
  } else if (warningCount > 0) {
    console.log('\n⚠️  HEALTH CHECK PASSED WITH WARNINGS');
    console.log('The MCP server is functional but has some performance concerns.');
    return 0;
  } else {
    console.log('\n✅ HEALTH CHECK PASSED');
    console.log('The MCP server is running properly and all checks passed.');
    return 0;
  }
}

/**
 * Get tool category from tool name
 */
function getToolCategory(toolName) {
  if (toolName.startsWith('get_project_context')) return 'Auth';
  if (toolName.startsWith('list_environments')) return 'Environment';
  if (toolName.startsWith('get_environment') || toolName.startsWith('update_environment')) return 'Environment';
  if (toolName.startsWith('get_folder') || toolName.startsWith('create_folder') ||
      toolName.startsWith('move_folder') || toolName.startsWith('delete_folder')) return 'Folders';
  if (toolName.startsWith('list_endpoint') || toolName.startsWith('get_endpoint') ||
      toolName.startsWith('create_endpoint') || toolName.startsWith('update_endpoint') ||
      toolName.startsWith('move_endpoint')) return 'Endpoints';
  if (toolName.startsWith('create_flow') || toolName.startsWith('list_flows') ||
      toolName.startsWith('get_flow') || toolName.startsWith('update_flow') ||
      toolName.startsWith('delete_flow') || toolName.startsWith('execute_flow')) return 'Flows';
  if (toolName.startsWith('test_endpoint')) return 'Testing';
  if (toolName.startsWith('health_check')) return 'Core';
  return 'Other';
}

/**
 * Handle uncaught errors
 */
process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught Exception:', error.message);
  process.exit(2);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(2);
});

// Run if this file is executed directly
if (require.main === module) {
  quickHealthCheck().then(exitCode => {
    process.exit(exitCode);
  }).catch(error => {
    console.error('💥 Quick health check failed:', error.message);
    process.exit(2);
  });
}

module.exports = { quickHealthCheck };