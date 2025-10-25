/**
 * Endpoints Test Runner
 * Runs all endpoint management related tests
 */

const { createTestReporter } = require('../../utils/TestReporter.js');
const { getTestCategoryConfig } = require('../../config/test-config.js');

// Import test functions
const {
  testListEndpointsSuccess,
  testCreateEndpoint,
  testGetEndpointDetails,
  testListEndpointsResponseFormat,
  testEndpointInvalidData,
  testEndpointsPerformance
} = require('./test-endpoints.js');

/**
 * Run all endpoints tests
 */
async function runEndpointsTests(options = {}) {
  const categoryConfig = getTestCategoryConfig('endpoints');
  const reporter = createTestReporter({
    suite: `${categoryConfig.name} - ${categoryConfig.description}`,
    verbose: options.verbose || false,
    json: options.json !== false,
    html: options.html || false
  });

  console.log(`\n🔗 Running ${categoryConfig.name}...`);
  console.log(`📝 ${categoryConfig.description}\n`);

  // List of all endpoints tests
  const endpointsTests = [
    testListEndpointsSuccess,
    testCreateEndpoint,
    testGetEndpointDetails,
    testListEndpointsResponseFormat,
    testEndpointInvalidData,
    testEndpointsPerformance
  ];

  // Run each test
  for (const testFunction of endpointsTests) {
    const testStartTime = Date.now();

    try {
      const result = await testFunction();
      reporter.addTestResult({
        name: result.name,
        category: 'endpoints',
        status: result.status,
        duration: result.duration,
        message: result.message,
        details: result.details || null
      });
    } catch (error) {
      reporter.addTestResult({
        name: testFunction.name,
        category: 'endpoints',
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
    category: 'endpoints'
  };
}

/**
 * Run specific endpoints test by name
 */
async function runSpecificEndpointsTest(testName, options = {}) {
  const testMap = {
    'testListEndpointsSuccess': testListEndpointsSuccess,
    'testCreateEndpoint': testCreateEndpoint,
    'testGetEndpointDetails': testGetEndpointDetails,
    'testListEndpointsResponseFormat': testListEndpointsResponseFormat,
    'testEndpointInvalidData': testEndpointInvalidData,
    'testEndpointsPerformance': testEndpointsPerformance
  };

  const testFunction = testMap[testName];
  if (!testFunction) {
    throw new Error(`Unknown endpoints test: ${testName}. Available tests: ${Object.keys(testMap).join(', ')}`);
  }

  const reporter = createTestReporter({
    suite: `Endpoints Test - ${testName}`,
    verbose: options.verbose || false,
    json: options.json !== false,
    html: options.html || false
  });

  const testStartTime = Date.now();

  try {
    const result = await testFunction();
    reporter.addTestResult({
      name: result.name,
      category: 'endpoints',
      status: result.status,
      duration: result.duration,
      message: result.message,
      details: result.details || null
    });
  } catch (error) {
    reporter.addTestResult({
      name: testName,
      category: 'endpoints',
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
 * Get list of available endpoints tests
 */
function getAvailableEndpointsTests() {
  return [
    {
      name: 'testListEndpointsSuccess',
      description: 'Test successful endpoint retrieval',
      required: true
    },
    {
      name: 'testCreateEndpoint',
      description: 'Test endpoint creation functionality',
      required: true
    },
    {
      name: 'testGetEndpointDetails',
      description: 'Test endpoint details retrieval',
      required: true
    },
    {
      name: 'testListEndpointsResponseFormat',
      description: 'Validate endpoint response format',
      required: true
    },
    {
      name: 'testEndpointInvalidData',
      description: 'Test error handling for invalid endpoint data',
      required: true
    },
    {
      name: 'testEndpointsPerformance',
      description: 'Test endpoint operations performance',
      required: false
    }
  ];
}

// Export for use by main test runner
module.exports = {
  runEndpointsTests,
  runSpecificEndpointsTest,
  getAvailableEndpointsTests
};

// Allow running this file directly
if (require.main === module) {
  runEndpointsTests({
    verbose: process.argv.includes('--verbose'),
    json: !process.argv.includes('--no-json'),
    html: process.argv.includes('--html')
  }).then(result => {
    process.exit(result.success ? 0 : 1);
  }).catch(error => {
    console.error('❌ Endpoints test runner failed:', error.message);
    process.exit(1);
  });
}