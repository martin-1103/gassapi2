/**
 * Testing Tools Test Runner
 * Runs all testing tools related tests
 */

const { createTestReporter } = require('../../utils/TestReporter.js');
const { getTestCategoryConfig } = require('../../config/test-config.js');

// Import test functions
const {
  testTestEndpoint,
  testSetEnvironmentVariables,
  testSetFlowInputs,
  testGetSessionState,
  testClearSessionState,
  testTestingResponseFormat,
  testTestingInvalidData
} = require('./test-endpoint-testing.js');

/**
 * Run all testing tests
 */
async function runTestingTests(options = {}) {
  const categoryConfig = getTestCategoryConfig('testing');
  const reporter = createTestReporter({
    suite: `${categoryConfig.name} - ${categoryConfig.description}`,
    verbose: options.verbose || false,
    json: options.json !== false,
    html: options.html || false
  });

  console.log(`\n🧪 Running ${categoryConfig.name}...`);
  console.log(`📝 ${categoryConfig.description}\n`);

  // List of all testing tests
  const testingTests = [
    testTestEndpoint,
    testSetEnvironmentVariables,
    testSetFlowInputs,
    testGetSessionState,
    testClearSessionState,
    testTestingResponseFormat,
    testTestingInvalidData
  ];

  // Run each test
  for (const testFunction of testingTests) {
    const testStartTime = Date.now();

    try {
      const result = await testFunction();
      reporter.addTestResult({
        name: result.name,
        category: 'testing',
        status: result.status,
        duration: result.duration,
        message: result.message,
        details: result.details || null
      });
    } catch (error) {
      reporter.addTestResult({
        name: testFunction.name,
        category: 'testing',
        status: 'error',
        duration: Date.now() - testStartTime,
        error: error.message,
        details: error.stack
      });
    }
  }

  // Generate reports
  reporter.generateReports();

  return {
    success: reporter.allTestsPassed(),
    reporter,
    summary: reporter.results.summary,
    category: 'testing'
  };
}

/**
 * Run specific testing test by name
 */
async function runSpecificTestingTest(testName, options = {}) {
  const testMap = {
    'testTestEndpoint': testTestEndpoint,
    'testSetEnvironmentVariables': testSetEnvironmentVariables,
    'testSetFlowInputs': testSetFlowInputs,
    'testGetSessionState': testGetSessionState,
    'testClearSessionState': testClearSessionState,
    'testTestingResponseFormat': testTestingResponseFormat,
    'testTestingInvalidData': testTestingInvalidData
  };

  const testFunction = testMap[testName];
  if (!testFunction) {
    throw new Error(`Unknown testing test: ${testName}. Available tests: ${Object.keys(testMap).join(', ')}`);
  }

  const reporter = createTestReporter({
    suite: `Testing Tools Test - ${testName}`,
    verbose: options.verbose || false,
    json: options.json !== false,
    html: options.html || false
  });

  const testStartTime = Date.now();

  try {
    const result = await testFunction();
    reporter.addTestResult({
      name: result.name,
      category: 'testing',
      status: result.status,
      duration: result.duration,
      message: result.message,
      details: result.details || null
    });
  } catch (error) {
    reporter.addTestResult({
      name: testName,
      category: 'testing',
      status: 'error',
      duration: Date.now() - testStartTime,
      error: error.message,
      details: error.stack
    });
  }

  reporter.generateReports();

  return {
    success: reporter.allTestsPassed(),
    reporter,
    summary: reporter.results.summary,
    test: testName
  };
}

/**
 * Get list of available testing tests
 */
function getAvailableTestingTests() {
  return [
    {
      name: 'testTestEndpoint',
      description: 'Test endpoint execution functionality',
      required: true
    },
    {
      name: 'testSetEnvironmentVariables',
      description: 'Test environment variables setting functionality',
      required: true
    },
    {
      name: 'testSetFlowInputs',
      description: 'Test flow inputs setting functionality',
      required: true
    },
    {
      name: 'testGetSessionState',
      description: 'Test session state retrieval functionality',
      required: true
    },
    {
      name: 'testClearSessionState',
      description: 'Test session state clearing functionality',
      required: true
    },
    {
      name: 'testTestingResponseFormat',
      description: 'Validate testing tools response format',
      required: true
    },
    {
      name: 'testTestingInvalidData',
      description: 'Test error handling for invalid testing data',
      required: true
    }
  ];
}

// Export for use by main test runner
module.exports = {
  runTestingTests,
  runSpecificTestingTest,
  getAvailableTestingTests
};

// Allow running this file directly
if (require.main === module) {
  runTestingTests({
    verbose: process.argv.includes('--verbose'),
    json: !process.argv.includes('--no-json'),
    html: process.argv.includes('--html')
  }).then(result => {
    process.exit(result.success ? 0 : 1);
  }).catch(error => {
    console.error('❌ Testing tools test runner failed:', error.message);
    process.exit(1);
  });
}