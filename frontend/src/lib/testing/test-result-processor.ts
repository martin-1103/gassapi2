import { TestResult, TestContext } from './types';

/**
 * Test Result Processor
 * Menangani result processing, formatting, dan status determination
 */
export class TestResultProcessor {
  /**
   * Process test results dari context ke TestResult array
   */
  processResults(
    testContext: TestContext,
    scriptId: string,
    scriptName: string,
    duration: number,
  ): TestResult[] {
    const results: TestResult[] = [];

    // Extract explicit test results
    const testResults = Array.from(testContext.tests.entries());

    if (testResults.length === 0) {
      // No explicit tests, check assertions
      const failedAssertions = testContext.assertions.filter(
        a => a.status === 'fail',
      );

      if (failedAssertions.length > 0) {
        results.push({
          id: scriptId,
          name: scriptName,
          status: 'fail',
          message: `${failedAssertions.length} assertion(s) failed`,
          duration,
          error: new Error('Test failed due to failed assertions'),
        });
      } else {
        results.push({
          id: scriptId,
          name: scriptName,
          status: 'pass',
          message: 'All checks passed',
          duration,
        });
      }
    } else {
      // Create TestResult untuk setiap explicit test
      testResults.forEach(([testName, passed]) => {
        results.push({
          id: scriptId,
          name: testName,
          status: passed ? 'pass' : 'fail',
          message: passed ? 'Test passed' : 'Test failed',
          duration,
        });
      });
    }

    // Add assertion results sebagai separate entries
    results.push(...testContext.assertions);

    return results;
  }

  /**
   * Create result untuk disabled test
   */
  createSkipResult(scriptId: string, scriptName: string): TestResult {
    return {
      id: scriptId,
      name: scriptName,
      status: 'skip',
      message: 'Test disabled',
      duration: 0,
    };
  }

  /**
   * Create error result untuk failed script execution
   */
  createErrorResult(
    scriptId: string,
    scriptName: string,
    error: Error,
    duration: number,
  ): TestResult {
    return {
      id: scriptId,
      name: scriptName,
      status: 'error',
      message: `Script execution failed: ${error.message}`,
      duration,
      error,
    };
  }

  /**
   * Calculate duration dengan proper timestamp handling
   */
  calculateDuration(startTime: number, endTime?: number): number {
    const end = endTime || Date.now();
    return Math.max(0, end - startTime);
  }

  /**
   * Format error message dengan context
   */
  formatError(error: Error, context: string = 'execution'): string {
    return `${context} failed: ${error.message}`;
  }

  /**
   * Process multiple test results dari array of contexts
   */
  processBatchResults(
    contexts: Array<{
      context: TestContext;
      scriptId: string;
      scriptName: string;
      duration: number;
      enabled: boolean;
    }>,
  ): TestResult[] {
    const allResults: TestResult[] = [];

    for (const {
      context,
      scriptId,
      scriptName,
      duration,
      enabled,
    } of contexts) {
      if (!enabled) {
        allResults.push(this.createSkipResult(scriptId, scriptName));
        continue;
      }

      allResults.push(
        ...this.processResults(context, scriptId, scriptName, duration),
      );
    }

    return allResults;
  }

  /**
   * Generate summary statistics dari results
   */
  generateSummary(results: TestResult[]): {
    total: number;
    passed: number;
    failed: number;
    skipped: number;
    errors: number;
    totalDuration: number;
    successRate: number;
  } {
    const summary = {
      total: results.length,
      passed: 0,
      failed: 0,
      skipped: 0,
      errors: 0,
      totalDuration: 0,
      successRate: 0,
    };

    for (const result of results) {
      switch (result.status) {
        case 'pass':
          summary.passed++;
          break;
        case 'fail':
          summary.failed++;
          break;
        case 'skip':
          summary.skipped++;
          break;
        case 'error':
          summary.errors++;
          break;
      }
      summary.totalDuration += result.duration;
    }

    const executedTests = summary.passed + summary.failed + summary.errors;
    summary.successRate =
      executedTests > 0
        ? Math.round((summary.passed / executedTests) * 100)
        : 0;

    return summary;
  }

  /**
   * Filter results by status
   */
  filterByStatus(
    results: TestResult[],
    status: TestResult['status'],
  ): TestResult[] {
    return results.filter(result => result.status === status);
  }

  /**
   * Get failed test details
   */
  getFailedTests(results: TestResult[]): Array<{
    name: string;
    message: string;
    error?: Error;
  }> {
    return results
      .filter(result => result.status === 'fail' || result.status === 'error')
      .map(result => ({
        name: result.name,
        message: result.message || 'No message provided',
        error: result.error,
      }));
  }

  /**
   * Sort results by duration (descending)
   */
  sortByDuration(results: TestResult[]): TestResult[] {
    return [...results].sort((a, b) => b.duration - a.duration);
  }

  /**
   * Format results untuk reporting
   */
  formatForReporting(results: TestResult[]): string {
    const summary = this.generateSummary(results);
    const failedTests = this.getFailedTests(results);

    let report = `
Test Execution Summary:
- Total Tests: ${summary.total}
- Passed: ${summary.passed}
- Failed: ${summary.failed}
- Skipped: ${summary.skipped}
- Errors: ${summary.errors}
- Success Rate: ${summary.successRate}%
- Total Duration: ${summary.totalDuration}ms
    `.trim();

    if (failedTests.length > 0) {
      report += '\n\nFailed Tests:\n';
      failedTests.forEach((test, index) => {
        report += `${index + 1}. ${test.name}: ${test.message}\n`;
      });
    }

    return report;
  }
}
