/**
 * Semantic Fields Test Runner
 * Test runner for endpoint semantic fields functionality
 */

const { createTestReporter } = require('../../utils/TestReporter.js');
const semanticTests = require('./test-endpoint-semantic-fields.js');

/**
 * Run all semantic fields tests
 */
async function runSemanticTests() {
  console.log('🧠 Running Semantic Fields Tests...');
  console.log('📝 Test new semantic fields functionality (purpose, request_params, response_schema, header_docs)');

  const reporter = createTestReporter({
    suite: 'Semantic Fields Tests',
    description: 'Test new semantic fields functionality',
    verbose: true
  });

  // Run all semantic tests
  const testFunctions = [
    semanticTests.testCreateEndpointWithSemanticFields,
    semanticTests.testCreateEndpointWithPurposeOnly,
    semanticTests.testCreateEndpointWithParamDocumentation,
    semanticTests.testBasicEndpointCreationBackwardCompatibility
  ];

  for (const testFunction of testFunctions) {
    const startTime = Date.now();

    try {
      const result = await testFunction();
      reporter.addTestResult({
        name: result.name,
        status: result.status,
        duration: result.duration,
        message: result.message
      });
    } catch (error) {
      reporter.addTestResult({
        name: testFunction.name || 'Anonymous Test',
        status: 'error',
        duration: Date.now() - startTime,
        error: error.message,
        message: 'Test failed with error'
      });
    }
  }

  // Generate reports
  reporter.generateReports();

  return {
    success: reporter.allTestsPassed(),
    reporter,
    summary: reporter.results.summary,
    successRate: reporter.getSuccessRate()
  };
}

// Run tests if this file is executed directly
if (require.main === module) {
  runSemanticTests()
    .then((results) => {
      console.log('\n🎉 Semantic Fields tests completed!');
      process.exit(results.successRate === 100 ? 0 : 1);
    })
    .catch((error) => {
      console.error('❌ Semantic Fields test runner failed:', error);
      process.exit(1);
    });
}

module.exports = { runSemanticTests };