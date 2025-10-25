/**
 * Test Reporter
 * Standardized reporting for test results (console, JSON, HTML)
 */

const fs = require('fs');
const path = require('path');

class TestReporter {
  constructor(options = {}) {
    this.options = {
      outputDir: options.outputDir || 'reports',
      console: options.console !== false,
      json: options.json !== false,
      html: options.html || false,
      verbose: options.verbose || false
    };
    this.results = {
      suite: options.suite || 'Test Suite',
      startTime: new Date(),
      endTime: null,
      duration: 0,
      tests: [],
      summary: {
        total: 0,
        passed: 0,
        failed: 0,
        skipped: 0,
        errors: 0
      }
    };
  }

  /**
   * Add test result
   */
  addTestResult(testResult) {
    const result = {
      name: testResult.name,
      category: testResult.category || 'General',
      status: testResult.status || 'unknown', // passed, failed, skipped, error
      duration: testResult.duration || 0,
      message: testResult.message || '',
      details: testResult.details || null,
      error: testResult.error || null,
      timestamp: new Date()
    };

    this.results.tests.push(result);
    this.results.summary.total++;

    switch (result.status) {
      case 'passed':
        this.results.summary.passed++;
        break;
      case 'failed':
        this.results.summary.failed++;
        break;
      case 'skipped':
        this.results.summary.skipped++;
        break;
      case 'error':
        this.results.summary.errors++;
        break;
    }

    // Real-time console output
    if (this.options.console) {
      this.printTestResult(result);
    }
  }

  /**
   * Print single test result to console
   */
  printTestResult(result) {
    const statusIcon = {
      passed: '✅',
      failed: '❌',
      skipped: '⏭️',
      error: '💥',
      unknown: '❓'
    };

    const icon = statusIcon[result.status] || statusIcon.unknown;
    const duration = result.duration ? ` (${result.duration}ms)` : '';

    console.log(`${icon} ${result.name}${duration}`);

    if (result.message && this.options.verbose) {
      console.log(`   ${result.message}`);
    }

    if (result.error && this.options.verbose) {
      console.log(`   Error: ${result.error}`);
    }
  }

  /**
   * Finalize test run
   */
  finalize() {
    this.results.endTime = new Date();
    this.results.duration = this.results.endTime - this.results.startTime;
  }

  /**
   * Print summary to console
   */
  printSummary() {
    const { summary, duration } = this.results;
    const successRate = summary.total > 0 ? ((summary.passed / summary.total) * 100).toFixed(1) : 0;

    console.log('\n' + '='.repeat(60));
    console.log(`📊 ${this.results.suite} - Test Results Summary`);
    console.log('='.repeat(60));
    console.log(`⏱️  Duration: ${duration}ms`);
    console.log(`📈 Total Tests: ${summary.total}`);
    console.log(`✅ Passed: ${summary.passed}`);
    console.log(`❌ Failed: ${summary.failed}`);
    console.log(`⏭️ Skipped: ${summary.skipped}`);
    console.log(`💥 Errors: ${summary.errors}`);
    console.log(`📊 Success Rate: ${successRate}%`);

    if (summary.failed > 0 || summary.errors > 0) {
      console.log('\n❌ Failed Tests:');
      this.results.tests
        .filter(test => test.status === 'failed' || test.status === 'error')
        .forEach(test => {
          console.log(`   - ${test.name}: ${test.error || test.message}`);
        });
    }

    console.log('='.repeat(60));
  }

  /**
   * Generate JSON report
   */
  generateJsonReport() {
    if (!this.options.json) return;

    const report = {
      ...this.results,
      generatedAt: new Date().toISOString(),
      environment: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch
      }
    };

    const reportPath = path.join(this.options.outputDir, 'test-results.json');
    this.ensureDirectoryExists(this.options.outputDir);
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    console.log(`📄 JSON report saved to: ${reportPath}`);
  }

  /**
   * Generate HTML report
   */
  generateHtmlReport() {
    if (!this.options.html) return;

    const html = this.createHtmlReport();
    const reportPath = path.join(this.options.outputDir, 'test-summary.html');
    this.ensureDirectoryExists(this.options.outputDir);
    fs.writeFileSync(reportPath, html);

    console.log(`🌐 HTML report saved to: ${reportPath}`);
  }

  /**
   * Create HTML report content
   */
  createHtmlReport() {
    const { results } = this;
    const successRate = results.summary.total > 0 ? ((results.summary.passed / results.summary.total) * 100).toFixed(1) : 0;

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${results.suite} - Test Report</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; padding: 30px; }
        .metric { text-align: center; padding: 20px; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #007bff; }
        .metric h3 { margin: 0 0 10px 0; color: #495057; }
        .metric .value { font-size: 2em; font-weight: bold; color: #007bff; }
        .passed { border-left-color: #28a745; }
        .passed .value { color: #28a745; }
        .failed { border-left-color: #dc3545; }
        .failed .value { color: #dc3545; }
        .skipped { border-left-color: #ffc107; }
        .skipped .value { color: #ffc107; }
        .error { border-left-color: #fd7e14; }
        .error .value { color: #fd7e14; }
        .tests { padding: 0 30px 30px; }
        .test-item { display: flex; align-items: center; padding: 15px; margin-bottom: 10px; background: #f8f9fa; border-radius: 6px; border-left: 4px solid #dee2e6; }
        .test-item.passed { border-left-color: #28a745; }
        .test-item.failed { border-left-color: #dc3545; }
        .test-item.skipped { border-left-color: #ffc107; }
        .test-item.error { border-left-color: #fd7e14; }
        .test-status { width: 30px; font-size: 1.2em; }
        .test-details { flex: 1; margin-left: 15px; }
        .test-name { font-weight: 600; margin-bottom: 5px; }
        .test-message { color: #6c757d; font-size: 0.9em; }
        .test-error { color: #dc3545; font-size: 0.9em; margin-top: 5px; }
        .progress-bar { height: 8px; background: #e9ecef; border-radius: 4px; overflow: hidden; margin: 20px 30px; }
        .progress-fill { height: 100%; background: linear-gradient(90deg, #28a745 ${successRate}%, #dc3545 ${successRate}%); transition: width 0.3s ease; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>${results.suite}</h1>
            <p>Generated on ${results.endTime.toISOString()}</p>
            <p>Duration: ${results.duration}ms</p>
        </div>

        <div class="progress-bar">
            <div class="progress-fill" style="width: ${successRate}%"></div>
        </div>

        <div class="summary">
            <div class="metric">
                <h3>Total Tests</h3>
                <div class="value">${results.summary.total}</div>
            </div>
            <div class="metric passed">
                <h3>Passed</h3>
                <div class="value">${results.summary.passed}</div>
            </div>
            <div class="metric failed">
                <h3>Failed</h3>
                <div class="value">${results.summary.failed}</div>
            </div>
            <div class="metric skipped">
                <h3>Skipped</h3>
                <div class="value">${results.summary.skipped}</div>
            </div>
            <div class="metric error">
                <h3>Errors</h3>
                <div class="value">${results.summary.errors}</div>
            </div>
            <div class="metric">
                <h3>Success Rate</h3>
                <div class="value">${successRate}%</div>
            </div>
        </div>

        <div class="tests">
            <h2>Test Results</h2>
            ${results.tests.map(test => `
                <div class="test-item ${test.status}">
                    <div class="test-status">
                        ${test.status === 'passed' ? '✅' : ''}
                        ${test.status === 'failed' ? '❌' : ''}
                        ${test.status === 'skipped' ? '⏭️' : ''}
                        ${test.status === 'error' ? '💥' : ''}
                        ${test.status === 'unknown' ? '❓' : ''}
                    </div>
                    <div class="test-details">
                        <div class="test-name">${test.name}</div>
                        <div class="test-message">${test.message || 'No message'}</div>
                        ${test.error ? `<div class="test-error">Error: ${test.error}</div>` : ''}
                    </div>
                </div>
            `).join('')}
        </div>
    </div>
</body>
</html>`;
  }

  /**
   * Ensure directory exists
   */
  ensureDirectoryExists(dirPath) {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }

  /**
   * Generate all reports
   */
  generateReports() {
    this.finalize();

    if (this.options.console) {
      this.printSummary();
    }

    if (this.options.json) {
      this.generateJsonReport();
    }

    if (this.options.html) {
      this.generateHtmlReport();
    }
  }

  /**
   * Get success rate
   */
  getSuccessRate() {
    const { total, passed } = this.results.summary;
    return total > 0 ? (passed / total) * 100 : 0;
  }

  /**
   * Check if all tests passed
   */
  allTestsPassed() {
    return this.results.summary.failed === 0 && this.results.summary.errors === 0;
  }
}

/**
 * Create a test reporter instance
 */
function createTestReporter(options = {}) {
  return new TestReporter(options);
}

/**
 * Run tests with automatic reporting
 */
async function runTestsWithReporting(testSuiteName, testFunctions, options = {}) {
  const reporter = createTestReporter({
    suite: testSuiteName,
    ...options
  });

  for (const testFunction of testFunctions) {
    const startTime = Date.now();

    try {
      await testFunction(reporter);
      reporter.addTestResult({
        name: testFunction.name || 'Anonymous Test',
        status: 'passed',
        duration: Date.now() - startTime
      });
    } catch (error) {
      reporter.addTestResult({
        name: testFunction.name || 'Anonymous Test',
        status: 'error',
        duration: Date.now() - startTime,
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

module.exports = {
  TestReporter,
  createTestReporter,
  runTestsWithReporting
};