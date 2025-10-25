/**
 * Collections Test Runner
 * Runs all collection management related tests
 */

const { createTestReporter } = require('../../utils/TestReporter.js');
const { getTestCategoryConfig } = require('../../config/test-config.js');

// Import test functions
const {
  testGetCollectionsSuccess,
  testCreateCollection,
  testGetCollectionsResponseFormat,
  testCollectionInvalidData,
  testCollectionsPerformance
} = require('./test-collections.js');

/**
 * Run all collections tests
 */
async function runCollectionsTests(options = {}) {
  const categoryConfig = getTestCategoryConfig('collections');
  const reporter = createTestReporter({
    suite: `${categoryConfig.name} - ${categoryConfig.description}`,
    verbose: options.verbose || false,
    json: options.json !== false,
    html: options.html || false
  });

  console.log(`\n📚 Running ${categoryConfig.name}...`);
  console.log(`📝 ${categoryConfig.description}\n`);

  // List of all collections tests
  const collectionsTests = [
    testGetCollectionsSuccess,
    testCreateCollection,
    testGetCollectionsResponseFormat,
    testCollectionInvalidData,
    testCollectionsPerformance
  ];

  // Run each test
  for (const testFunction of collectionsTests) {
    const testStartTime = Date.now();

    try {
      const result = await testFunction();
      reporter.addTestResult({
        name: result.name,
        category: 'collections',
        status: result.status,
        duration: result.duration,
        message: result.message,
        details: result.details || null
      });
    } catch (error) {
      reporter.addTestResult({
        name: testFunction.name,
        category: 'collections',
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
    category: 'collections'
  };
}

/**
 * Run specific collections test by name
 */
async function runSpecificCollectionsTest(testName, options = {}) {
  const testMap = {
    'testGetCollectionsSuccess': testGetCollectionsSuccess,
    'testCreateCollection': testCreateCollection,
    'testGetCollectionsResponseFormat': testGetCollectionsResponseFormat,
    'testCollectionInvalidData': testCollectionInvalidData,
    'testCollectionsPerformance': testCollectionsPerformance
  };

  const testFunction = testMap[testName];
  if (!testFunction) {
    throw new Error(`Unknown collections test: ${testName}. Available tests: ${Object.keys(testMap).join(', ')}`);
  }

  const reporter = createTestReporter({
    suite: `Collections Test - ${testName}`,
    verbose: options.verbose || false,
    json: options.json !== false,
    html: options.html || false
  });

  const testStartTime = Date.now();

  try {
    const result = await testFunction();
    reporter.addTestResult({
      name: result.name,
      category: 'collections',
      status: result.status,
      duration: result.duration,
      message: result.message,
      details: result.details || null
    });
  } catch (error) {
    reporter.addTestResult({
      name: testName,
      category: 'collections',
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
 * Get list of available collections tests
 */
function getAvailableCollectionsTests() {
  return [
    {
      name: 'testGetCollectionsSuccess',
      description: 'Test successful collection retrieval',
      required: true
    },
    {
      name: 'testCreateCollection',
      description: 'Test collection creation functionality',
      required: true
    },
    {
      name: 'testGetCollectionsResponseFormat',
      description: 'Validate collection response format',
      required: true
    },
    {
      name: 'testCollectionInvalidData',
      description: 'Test error handling for invalid collection data',
      required: true
    },
    {
      name: 'testCollectionsPerformance',
      description: 'Test collection operations performance',
      required: false
    }
  ];
}

// Export for use by main test runner
module.exports = {
  runCollectionsTests,
  runSpecificCollectionsTest,
  getAvailableCollectionsTests
};

// Allow running this file directly
if (require.main === module) {
  runCollectionsTests({
    verbose: process.argv.includes('--verbose'),
    json: !process.argv.includes('--no-json'),
    html: process.argv.includes('--html')
  }).then(result => {
    process.exit(result.success ? 0 : 1);
  }).catch(error => {
    console.error('❌ Collections test runner failed:', error.message);
    process.exit(1);
  });
}