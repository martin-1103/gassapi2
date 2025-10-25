/**
 * Auth Test Runner
 * Runs all authentication-related tests
 */

const { createTestReporter } = require('../../utils/TestReporter.js');
const { getTestCategoryConfig } = require('../../config/test-config.js');

// Import test functions
const {
  testGetProjectContextSuccess,
  testGetProjectContextInvalidId,
  testGetProjectContextNoId,
  testGetProjectContextDataIntegrity,
  testGetProjectContextPerformance
} = require('./test-project-context.js');

/**
 * Run all auth tests
 */
async function runAuthTests(options = {}) {
  const categoryConfig = getTestCategoryConfig('auth');
  const reporter = createTestReporter({
    suite: `${categoryConfig.name} - ${categoryConfig.description}`,
    verbose: options.verbose || false,
    json: options.json !== false,
    html: options.html || false
  });

  console.log(`\n🔐 Running ${categoryConfig.name}...`);
  console.log(`📝 ${categoryConfig.description}\n`);

  // List of all auth tests
  const authTests = [
    testGetProjectContextSuccess,
    testGetProjectContextInvalidId,
    testGetProjectContextNoId,
    testGetProjectContextDataIntegrity,
    testGetProjectContextPerformance
  ];

  // Run each test
  for (const testFunction of authTests) {
    const testStartTime = Date.now();

    try {
      const result = await testFunction();
      reporter.addTestResult({
        name: result.name,
        category: 'auth',
        status: result.status,
        duration: result.duration,
        message: result.message,
        details: result.details || null
      });
    } catch (error) {
      reporter.addTestResult({
        name: testFunction.name,
        category: 'auth',
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
    category: 'auth'
  };
}

/**
 * Run specific auth test by name
 */
async function runSpecificAuthTest(testName, options = {}) {
  const testMap = {
    'testGetProjectContextSuccess': testGetProjectContextSuccess,
    'testGetProjectContextInvalidId': testGetProjectContextInvalidId,
    'testGetProjectContextNoId': testGetProjectContextNoId,
    'testGetProjectContextDataIntegrity': testGetProjectContextDataIntegrity,
    'testGetProjectContextPerformance': testGetProjectContextPerformance
  };

  const testFunction = testMap[testName];
  if (!testFunction) {
    throw new Error(`Unknown auth test: ${testName}. Available tests: ${Object.keys(testMap).join(', ')}`);
  }

  const reporter = createTestReporter({
    suite: `Auth Test - ${testName}`,
    verbose: options.verbose || false,
    json: options.json !== false,
    html: options.html || false
  });

  const testStartTime = Date.now();

  try {
    const result = await testFunction();
    reporter.addTestResult({
      name: result.name,
      category: 'auth',
      status: result.status,
      duration: result.duration,
      message: result.message,
      details: result.details || null
    });
  } catch (error) {
    reporter.addTestResult({
      name: testName,
      category: 'auth',
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
 * Get list of available auth tests
 */
function getAvailableAuthTests() {
  return [
    {
      name: 'testGetProjectContextSuccess',
      description: 'Test successful project context retrieval',
      required: true
    },
    {
      name: 'testGetProjectContextInvalidId',
      description: 'Test error handling for invalid project ID',
      required: true
    },
    {
      name: 'testGetProjectContextNoId',
      description: 'Test behavior when no project ID provided',
      required: true
    },
    {
      name: 'testGetProjectContextDataIntegrity',
      description: 'Validate response data structure and integrity',
      required: true
    },
    {
      name: 'testGetProjectContextPerformance',
      description: 'Test response time and performance',
      required: false
    }
  ];
}

// Export for use by main test runner
module.exports = {
  runAuthTests,
  runSpecificAuthTest,
  getAvailableAuthTests
};

// Allow running this file directly
if (require.main === module) {
  runAuthTests({
    verbose: process.argv.includes('--verbose'),
    json: !process.argv.includes('--no-json'),
    html: process.argv.includes('--html')
  }).then(result => {
    process.exit(result.success ? 0 : 1);
  }).catch(error => {
    console.error('❌ Auth test runner failed:', error.message);
    process.exit(1);
  });
}