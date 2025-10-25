/**
 * Folders Test Runner
 * Runs all folder management related tests
 */

const { createTestReporter } = require('../../utils/TestReporter.js');
const { getTestCategoryConfig } = require('../../config/test-config.js');

// Import test functions
const {
  testGetFoldersSuccess,
  testCreateFolder,
  testGetFoldersResponseFormat,
  testFolderInvalidData,
  testFoldersPerformance
} = require('./test-folders.js');

/**
 * Run all folders tests
 */
async function runFoldersTests(options = {}) {
  const categoryConfig = getTestCategoryConfig('folders');
  const reporter = createTestReporter({
    suite: `${categoryConfig.name} - ${categoryConfig.description}`,
    verbose: options.verbose || false,
    json: options.json !== false,
    html: options.html || false
  });

  console.log(`\n📚 Running ${categoryConfig.name}...`);
  console.log(`📝 ${categoryConfig.description}\n`);

  // List of all folders tests
  const foldersTests = [
    testGetFoldersSuccess,
    testCreateFolder,
    testGetFoldersResponseFormat,
    testFolderInvalidData,
    testFoldersPerformance
  ];

  // Run each test
  for (const testFunction of foldersTests) {
    const testStartTime = Date.now();

    try {
      const result = await testFunction();
      reporter.addTestResult({
        name: result.name,
        category: 'folders',
        status: result.status,
        duration: result.duration,
        message: result.message,
        details: result.details || null
      });
    } catch (error) {
      reporter.addTestResult({
        name: testFunction.name,
        category: 'folders',
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
    category: 'folders'
  };
}

/**
 * Run specific folders test by name
 */
async function runSpecificFoldersTest(testName, options = {}) {
  const testMap = {
    'testGetFoldersSuccess': testGetFoldersSuccess,
    'testCreateFolder': testCreateFolder,
    'testGetFoldersResponseFormat': testGetFoldersResponseFormat,
    'testFolderInvalidData': testFolderInvalidData,
    'testFoldersPerformance': testFoldersPerformance
  };

  const testFunction = testMap[testName];
  if (!testFunction) {
    throw new Error(`Unknown folders test: ${testName}. Available tests: ${Object.keys(testMap).join(', ')}`);
  }

  const reporter = createTestReporter({
    suite: `Folders Test - ${testName}`,
    verbose: options.verbose || false,
    json: options.json !== false,
    html: options.html || false
  });

  const testStartTime = Date.now();

  try {
    const result = await testFunction();
    reporter.addTestResult({
      name: result.name,
      category: 'folders',
      status: result.status,
      duration: result.duration,
      message: result.message,
      details: result.details || null
    });
  } catch (error) {
    reporter.addTestResult({
      name: testName,
      category: 'folders',
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
 * Get list of available folders tests
 */
function getAvailableFoldersTests() {
  return [
    {
      name: 'testGetFoldersSuccess',
      description: 'Test successful folder retrieval',
      required: true
    },
    {
      name: 'testCreateFolder',
      description: 'Test folder creation functionality',
      required: true
    },
    {
      name: 'testGetFoldersResponseFormat',
      description: 'Validate folder response format',
      required: true
    },
    {
      name: 'testFolderInvalidData',
      description: 'Test error handling for invalid folder data',
      required: true
    },
    {
      name: 'testFoldersPerformance',
      description: 'Test folder operations performance',
      required: false
    }
  ];
}

// Export for use by main test runner
module.exports = {
  runFoldersTests,
  runSpecificFoldersTest,
  getAvailableFoldersTests
};

// Allow running this file directly
if (require.main === module) {
  runFoldersTests({
    verbose: process.argv.includes('--verbose'),
    json: !process.argv.includes('--no-json'),
    html: process.argv.includes('--html')
  }).then(result => {
    process.exit(result.success ? 0 : 1);
  }).catch(error => {
    console.error('❌ Folders test runner failed:', error.message);
    process.exit(1);
  });
}