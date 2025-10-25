/**
 * Flows Test Runner
 * Runs all flow management related tests
 */

const { createTestReporter } = require('../../utils/TestReporter.js');
const { getTestCategoryConfig } = require('../../config/test-config.js');

// Import test functions
const {
  testCreateFlow,
  testListFlows,
  testGetFlowDetail,
  testExecuteFlow,
  testDeleteFlow,
  testFlowsResponseFormat,
  testFlowInvalidData
} = require('./test-flows.js');

/**
 * Run all flows tests
 */
async function runFlowsTests(options = {}) {
  const categoryConfig = getTestCategoryConfig('flows');
  const reporter = createTestReporter({
    suite: `${categoryConfig.name} - ${categoryConfig.description}`,
    verbose: options.verbose || false,
    json: options.json !== false,
    html: options.html || false
  });

  console.log(`\n🔄 Running ${categoryConfig.name}...`);
  console.log(`📝 ${categoryConfig.description}\n`);

  // List of all flows tests
  const flowsTests = [
    testCreateFlow,
    testListFlows,
    testGetFlowDetail,
    testExecuteFlow,
    testDeleteFlow,
    testFlowsResponseFormat,
    testFlowInvalidData
  ];

  // Run each test
  for (const testFunction of flowsTests) {
    const testStartTime = Date.now();

    try {
      const result = await testFunction();
      reporter.addTestResult({
        name: result.name,
        category: 'flows',
        status: result.status,
        duration: result.duration,
        message: result.message,
        details: result.details || null
      });
    } catch (error) {
      reporter.addTestResult({
        name: testFunction.name,
        category: 'flows',
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
    category: 'flows'
  };
}

/**
 * Run specific flows test by name
 */
async function runSpecificFlowsTest(testName, options = {}) {
  const testMap = {
    'testCreateFlow': testCreateFlow,
    'testListFlows': testListFlows,
    'testGetFlowDetail': testGetFlowDetail,
    'testExecuteFlow': testExecuteFlow,
    'testDeleteFlow': testDeleteFlow,
    'testFlowsResponseFormat': testFlowsResponseFormat,
    'testFlowInvalidData': testFlowInvalidData
  };

  const testFunction = testMap[testName];
  if (!testFunction) {
    throw new Error(`Unknown flows test: ${testName}. Available tests: ${Object.keys(testMap).join(', ')}`);
  }

  const reporter = createTestReporter({
    suite: `Flows Test - ${testName}`,
    verbose: options.verbose || false,
    json: options.json !== false,
    html: options.html || false
  });

  const testStartTime = Date.now();

  try {
    const result = await testFunction();
    reporter.addTestResult({
      name: result.name,
      category: 'flows',
      status: result.status,
      duration: result.duration,
      message: result.message,
      details: result.details || null
    });
  } catch (error) {
    reporter.addTestResult({
      name: testName,
      category: 'flows',
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
 * Get list of available flows tests
 */
function getAvailableFlowsTests() {
  return [
    {
      name: 'testCreateFlow',
      description: 'Test flow creation functionality',
      required: true
    },
    {
      name: 'testListFlows',
      description: 'Test flow listing functionality',
      required: true
    },
    {
      name: 'testGetFlowDetail',
      description: 'Test flow details retrieval',
      required: true
    },
    {
      name: 'testExecuteFlow',
      description: 'Test flow execution functionality',
      required: true
    },
    {
      name: 'testDeleteFlow',
      description: 'Test flow deletion functionality',
      required: true
    },
    {
      name: 'testFlowsResponseFormat',
      description: 'Validate flow response format',
      required: true
    },
    {
      name: 'testFlowInvalidData',
      description: 'Test error handling for invalid flow data',
      required: true
    }
  ];
}

// Export for use by main test runner
module.exports = {
  runFlowsTests,
  runSpecificFlowsTest,
  getAvailableFlowsTests
};

// Allow running this file directly
if (require.main === module) {
  runFlowsTests({
    verbose: process.argv.includes('--verbose'),
    json: !process.argv.includes('--no-json'),
    html: process.argv.includes('--html')
  }).then(result => {
    process.exit(result.success ? 0 : 1);
  }).catch(error => {
    console.error('❌ Flows test runner failed:', error.message);
    process.exit(1);
  });
}