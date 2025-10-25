#!/usr/bin/env node

/**
 * Run Category Tests
 * Run tests for a specific category
 */

const { getTestCategoryConfig, TEST_CONFIG } = require('../config/test-config.js');
const { runAuthTests } = require('../unit/auth/auth-test-runner.js');

/**
 * Show usage information
 */
function showUsage() {
  console.log('Usage: node run-category-tests.js <category> [options]');
  console.log('');
  console.log('Available categories:');
  Object.keys(TEST_CONFIG.categories).forEach(category => {
    const config = getTestCategoryConfig(category);
    console.log(`  ${category.padEnd(15)} - ${config.description}`);
  });
  console.log('');
  console.log('Options:');
  console.log('  --verbose     Enable verbose output');
  console.log('  --no-json     Disable JSON report generation');
  console.log('  --html        Enable HTML report generation');
  console.log('');
  console.log('Examples:');
  console.log('  node run-category-tests.js auth');
  console.log('  node run-category-tests.js auth --verbose --html');
}

/**
 * Get available categories
 */
function getAvailableCategories() {
  return Object.keys(TEST_CONFIG.categories).filter(category => {
    const config = getTestCategoryConfig(category);
    return config && config.required !== false;
  });
}

/**
 * Parse command line arguments
 */
function parseArgs(args) {
  const options = {
    category: null,
    verbose: false,
    json: true,
    html: false
  };

  if (args.length === 0) {
    return options; // Will show usage later
  }

  // First argument should be the category
  const availableCategories = getAvailableCategories();
  const potentialCategory = args[0];

  if (availableCategories.includes(potentialCategory)) {
    options.category = potentialCategory;
  } else {
    console.error(`❌ Unknown category: ${potentialCategory}`);
    console.error(`Available categories: ${availableCategories.join(', ')}`);
    return null;
  }

  // Parse options
  for (let i = 1; i < args.length; i++) {
    const arg = args[i];
    switch (arg) {
      case '--verbose':
        options.verbose = true;
        break;
      case '--no-json':
        options.json = false;
        break;
      case '--html':
        options.html = true;
        break;
      default:
        console.error(`❌ Unknown option: ${arg}`);
        return null;
    }
  }

  return options;
}

/**
 * Run tests for a specific category
 */
async function runCategoryTests(category, options) {
  const startTime = Date.now();

  console.log(`🧪 Running ${category} tests...`);
  console.log(`📋 ${getTestCategoryConfig(category).description}`);
  console.log(`⏱️  Started at: ${new Date().toISOString()}`);
  console.log(`🔧 Verbose mode: ${options.verbose ? 'ON' : 'OFF'}`);

  try {
    let result;

    switch (category) {
      case 'auth':
        result = await runAuthTests(options);
        break;

      case 'environment':
        const { runEnvironmentTests } = require('../unit/environment/environment-test-runner.js');
        result = await runEnvironmentTests(options);
        break;

      case 'folders':
        const { runFoldersTests } = require('../unit/folders/folders-test-runner.js');
        result = await runFoldersTests(options);
        break;

      case 'endpoints':
        const { runEndpointsTests } = require('../unit/endpoints/endpoints-test-runner.js');
        result = await runEndpointsTests(options);
        break;

      case 'flows':
        const { runFlowsTests } = require('../unit/flows/flows-test-runner.js');
        result = await runFlowsTests(options);
        break;

      case 'testing':
        const { runTestingTests } = require('../unit/testing/testing-test-runner.js');
        result = await runTestingTests(options);
        break;

      default:
        throw new Error(`Unknown category: ${category}`);
    }

    const duration = Date.now() - startTime;
    const { summary } = result;

    console.log('\n' + '='.repeat(50));
    console.log(`📊 ${category.toUpperCase()} TEST RESULTS`);
    console.log('='.repeat(50));
    console.log(`⏱️  Duration: ${duration}ms`);
    console.log(`📈 Total Tests: ${summary.total}`);
    console.log(`✅ Passed: ${summary.passed}`);
    console.log(`❌ Failed: ${summary.failed}`);
    console.log(`⏭️ Skipped: ${summary.skipped}`);
    console.log(`💥 Errors: ${summary.errors}`);

    const successRate = summary.total > 0 ? ((summary.passed / summary.total) * 100).toFixed(1) : 0;
    console.log(`📊 Success Rate: ${successRate}%`);
    console.log('='.repeat(50));

    if (result.success) {
      console.log('\n✅ All tests passed successfully!');
      return 0;
    } else {
      console.log('\n❌ Some tests failed. Check the reports for details.');
      return 1;
    }

  } catch (error) {
    console.error(`\n💥 Error running ${category} tests:`, error.message);
    if (options.verbose) {
      console.error(error.stack);
    }
    return 1;
  }
}

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(2);
  const options = parseArgs(args);

  if (!options) {
    showUsage();
    process.exit(1);
  }

  if (!options.category) {
    showUsage();
    process.exit(1);
  }

  const exitCode = await runCategoryTests(options.category, {
    verbose: options.verbose || TEST_CONFIG.execution.verbose,
    json: options.json,
    html: options.html
  });

  process.exit(exitCode);
}

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught Exception:', error.message);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Run if this file is executed directly
if (require.main === module) {
  main().catch(error => {
    console.error('💥 Category test runner failed:', error.message);
    process.exit(1);
  });
}

module.exports = { runCategoryTests, getAvailableCategories };