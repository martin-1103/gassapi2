#!/usr/bin/env node

/**
 * Run All Tests
 * Master test runner that executes all test categories
 */

const { createTestReporter } = require('../utils/TestReporter.js');
const { getTestCategoryConfig, TEST_CONFIG } = require('../config/test-config.js');

// Import category test runners
const { runAuthTests } = require('../unit/auth/auth-test-runner.js');
// Note: Other category runners will be imported as they are created

/**
 * Get available test categories
 */
function getAvailableCategories() {
  return Object.keys(TEST_CONFIG.categories).filter(category => {
    const config = getTestCategoryConfig(category);
    return config && config.required !== false;
  });
}

/**
 * Run tests for a specific category
 */
async function runCategoryTests(category, options = {}) {
  console.log(`\n🧪 Running ${category} tests...`);

  try {
    switch (category) {
      case 'auth':
        return await runAuthTests(options);

      case 'environment':
        // TODO: Implement when environment tests are ready
        console.log('⏭️  Environment tests not yet implemented');
        return { success: true, summary: { total: 0, passed: 0, failed: 0, skipped: 0, errors: 0 } };

      case 'folders':
        // TODO: Implement when folder tests are ready
        console.log('⏭️  Folder tests not yet implemented');
        return { success: true, summary: { total: 0, passed: 0, failed: 0, skipped: 0, errors: 0 } };

      case 'endpoints':
        // TODO: Implement when endpoint tests are ready
        console.log('⏭️  Endpoint tests not yet implemented');
        return { success: true, summary: { total: 0, passed: 0, failed: 0, skipped: 0, errors: 0 } };

      case 'flows':
        // TODO: Implement when flow tests are ready
        console.log('⏭️  Flow tests not yet implemented');
        return { success: true, summary: { total: 0, passed: 0, failed: 0, skipped: 0, errors: 0 } };

      case 'testing':
        // TODO: Implement when testing tool tests are ready
        console.log('⏭️  Testing tool tests not yet implemented');
        return { success: true, summary: { total: 0, passed: 0, failed: 0, skipped: 0, errors: 0 } };

      default:
        console.log(`❌ Unknown category: ${category}`);
        return { success: false, summary: { total: 0, passed: 0, failed: 1, skipped: 0, errors: 0 } };
    }
  } catch (error) {
    console.error(`❌ Error running ${category} tests:`, error.message);
    return {
      success: false,
      summary: { total: 0, passed: 0, failed: 1, skipped: 0, errors: 0 },
      error: error.message
    };
  }
}

/**
 * Main function to run all tests
 */
async function runAllTests(options = {}) {
  const overallStartTime = Date.now();

  // Parse command line arguments
  const args = process.argv.slice(2);
  const verbose = args.includes('--verbose') || options.verbose || TEST_CONFIG.execution.verbose;
  const json = !args.includes('--no-json') && options.json !== false;
  const html = args.includes('--html') || options.html || false;
  const categories = args
    .filter(arg => arg.startsWith('--category='))
    .map(arg => arg.split('=')[1]);

  console.log('🚀 GASSAPI MCP v2 - Test Suite');
  console.log('================================');
  console.log(`📅 Started at: ${new Date().toISOString()}`);
  console.log(`🔧 Verbose mode: ${verbose ? 'ON' : 'OFF'}`);
  console.log(`📄 JSON reports: ${json ? 'ON' : 'OFF'}`);
  console.log(`🌐 HTML reports: ${html ? 'ON' : 'OFF'}`);

  const masterReporter = createTestReporter({
    suite: 'GASSAPI MCP v2 - Complete Test Suite',
    verbose: verbose,
    json: json,
    html: html,
    outputDir: TEST_CONFIG.reporting.outputDir
  });

  // Get categories to run
  const availableCategories = getAvailableCategories();
  const categoriesToRun = categories.length > 0
    ? categories.filter(cat => availableCategories.includes(cat))
    : availableCategories;

  console.log(`\n📋 Categories to run: ${categoriesToRun.join(', ')}`);
  console.log(`📊 Available categories: ${availableCategories.join(', ')}`);

  if (categoriesToRun.length === 0) {
    console.log('\n❌ No valid categories to run');
    process.exit(1);
  }

  // Track overall results
  const overallSummary = {
    total: 0,
    passed: 0,
    failed: 0,
    skipped: 0,
    errors: 0
  };

  const categoryResults = [];

  // Run tests for each category
  for (const category of categoriesToRun) {
    const categoryConfig = getTestCategoryConfig(category);

    try {
      let result;

      // Use specific test runners for each category
      switch (category) {
        case 'auth':
          const { runAuthTests } = require('../unit/auth/auth-test-runner.js');
          result = await runAuthTests({ verbose, json, html });
          break;

        case 'environment':
          const { runEnvironmentTests } = require('../unit/environment/environment-test-runner.js');
          result = await runEnvironmentTests({ verbose, json, html });
          break;

        case 'folders':
          const { runFoldersTests } = require('../unit/folders/folders-test-runner.js');
          result = await runFoldersTests({ verbose, json, html });
          break;

        case 'endpoints':
          const { runEndpointsTests } = require('../unit/endpoints/endpoints-test-runner.js');
          result = await runEndpointsTests({ verbose, json, html });
          break;

        case 'flows':
          const { runFlowsTests } = require('../unit/flows/flows-test-runner.js');
          result = await runFlowsTests({ verbose, json, html });
          break;

        case 'testing':
          const { runTestingTests } = require('../unit/testing/testing-test-runner.js');
          result = await runTestingTests({ verbose, json, html });
          break;

        default:
          // Fallback to old method for unimplemented categories
          result = await runCategoryTests(category, {
            verbose,
            json,
            html
          });
          break;
      }

      // Add to master summary
      overallSummary.total += result.summary.total;
      overallSummary.passed += result.summary.passed;
      overallSummary.failed += result.summary.failed;
      overallSummary.skipped += result.summary.skipped;
      overallSummary.errors += result.summary.errors;

      // Add category result to master report
      masterReporter.addTestResult({
        name: `${categoryConfig.name} (${category})`,
        category: 'master',
        status: result.success ? 'passed' : 'failed',
        message: `${result.summary.passed}/${result.summary.total} tests passed`,
        details: {
          summary: result.summary,
          config: categoryConfig
        }
      });

      categoryResults.push({
        category,
        success: result.success,
        summary: result.summary
      });

    } catch (error) {
      console.error(`💥 Critical error in ${category} tests:`, error.message);

      overallSummary.total += 1;
      overallSummary.errors += 1;

      masterReporter.addTestResult({
        name: `${categoryConfig.name} (${category})`,
        category: 'master',
        status: 'error',
        message: `Critical error: ${error.message}`,
        details: { error: error.stack }
      });

      categoryResults.push({
        category,
        success: false,
        error: error.message
      });
    }
  }

  // Finalize and generate master report
  const overallDuration = Date.now() - overallStartTime;
  masterReporter.results.endTime = new Date();
  masterReporter.results.duration = overallDuration;
  masterReporter.results.summary = overallSummary;
  masterReporter.generateReports();

  // Print final summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 FINAL TEST RESULTS');
  console.log('='.repeat(60));
  console.log(`⏱️  Total Duration: ${overallDuration}ms`);
  console.log(`📈 Total Tests: ${overallSummary.total}`);
  console.log(`✅ Passed: ${overallSummary.passed}`);
  console.log(`❌ Failed: ${overallSummary.failed}`);
  console.log(`⏭️ Skipped: ${overallSummary.skipped}`);
  console.log(`💥 Errors: ${overallSummary.errors}`);

  const successRate = overallSummary.total > 0 ? ((overallSummary.passed / overallSummary.total) * 100).toFixed(1) : 0;
  console.log(`📊 Success Rate: ${successRate}%`);

  // Print category breakdown
  console.log('\n📋 Category Breakdown:');
  categoryResults.forEach(result => {
    const status = result.success ? '✅' : '❌';
    const passed = result.summary?.passed || 0;
    const total = result.summary?.total || 0;
    console.log(`   ${status} ${result.category}: ${passed}/${total} tests passed`);
  });

  console.log('='.repeat(60));

  if (overallSummary.failed > 0 || overallSummary.errors > 0) {
    console.log('\n❌ Some tests failed. Check the reports for details.');
    process.exit(1);
  } else {
    console.log('\n✅ All tests passed successfully!');
    process.exit(0);
  }
}

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught Exception:', error.message);
  console.error(error.stack);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests().catch(error => {
    console.error('💥 Test runner failed:', error.message);
    process.exit(1);
  });
}

module.exports = {
  runAllTests,
  getAvailableCategories,
  runCategoryTests
};