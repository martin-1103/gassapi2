/**
 * Environment Test Runner
 * Runs all environment-related tests
 */

const { createTestReporter } = require('../../utils/TestReporter.js');
const { getTestCategoryConfig } = require('../../config/test-config.js');

// Import test functions
const {
  testListEnvironmentsSuccess,
  testListEnvironmentsInvalidProject,
  testListEnvironmentsNoProjectId,
  testListEnvironmentsResponseFormat,
  testListEnvironmentsPerformance
} = require('./test-list-environments.js');

/**
 * Run all environment tests
 */
async function runEnvironmentTests(options = {}) {
  const categoryConfig = getTestCategoryConfig('environment');
  const reporter = createTestReporter({
    suite: `${categoryConfig.name} - ${categoryConfig.description}`,
    verbose: options.verbose || false,
    console: options.console !== false,
    json: options.json || false,
    html: options.html || false
  });

  const tests = [
    testListEnvironmentsSuccess,
    testListEnvironmentsInvalidProject,
    testListEnvironmentsNoProjectId,
    testListEnvironmentsResponseFormat,
    testListEnvironmentsPerformance
  ];

  for (const testFunction of tests) {
    try {
      const result = await testFunction();
      reporter.addTestResult(result);
    } catch (error) {
      reporter.addTestResult({
        name: testFunction.name || 'Unknown Test',
        status: 'error',
        duration: 0,
        error: error.message,
        details: error.stack
      });
    }
  }

  reporter.generateReports();

  return {
    success: reporter.allTestsPassed(),
    reporter,
    summary: reporter.results.summary
  };
}

/**
 * Run specific environment test by name
 */
async function runSpecificEnvironmentTest(testName, options = {}) {
  const testMap = {
    'testListEnvironmentsSuccess': testListEnvironmentsSuccess,
    'testListEnvironmentsInvalidProject': testListEnvironmentsInvalidProject,
    'testListEnvironmentsNoProjectId': testListEnvironmentsNoProjectId,
    'testListEnvironmentsResponseFormat': testListEnvironmentsResponseFormat,
    'testListEnvironmentsPerformance': testListEnvironmentsPerformance
  };

  const testFunction = testMap[testName];
  if (!testFunction) {
    throw new Error(`Unknown environment test: ${testName}`);
  }

  const reporter = createTestReporter({
    suite: `Environment Test - ${testName}`,
    verbose: options.verbose || false,
    console: options.console !== false,
    json: options.json || false,
    html: options.html || false
  });

  try {
    const result = await testFunction();
    reporter.addTestResult(result);
  } catch (error) {
    reporter.addTestResult({
      name: testName,
      status: 'error',
      duration: 0,
      error: error.message,
      details: error.stack
    });
  }

  reporter.generateReports();

  return {
    success: reporter.allTestsPassed(),
    reporter,
    summary: reporter.results.summary
  };
}

/**
 * Get list of available environment tests
 */
function getAvailableEnvironmentTests() {
  return [
    {
      name: 'testListEnvironmentsSuccess',
      description: 'Test successful environment list retrieval',
      required: true
    },
    {
      name: 'testListEnvironmentsInvalidProject',
      description: 'Test environment list with invalid project ID',
      required: true
    },
    {
      name: 'testListEnvironmentsNoProjectId',
      description: 'Test environment list without project ID',
      required: true
    },
    {
      name: 'testListEnvironmentsResponseFormat',
      description: 'Test environment list response format validation',
      required: true
    },
    {
      name: 'testListEnvironmentsPerformance',
      description: 'Test environment list performance',
      required: false
    }
  ];
}

module.exports = {
  runEnvironmentTests,
  runSpecificEnvironmentTest,
  getAvailableEnvironmentTests
};

// Allow running this file directly
if (require.main === module) {
  runEnvironmentTests({
    verbose: process.argv.includes('--verbose'),
    json: !process.argv.includes('--no-json'),
    html: process.argv.includes('--html')
  }).then(result => {
    process.exit(result.success ? 0 : 1);
  }).catch(error => {
    console.error('❌ Environment test runner failed:', error.message);
    process.exit(1);
  });
}