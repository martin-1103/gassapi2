import { ScriptExecutor } from './script-executor';
import { TestContextManager } from './test-context-manager';
import { TestResultProcessor } from './test-result-processor';
import { TestSandbox } from './test-sandbox';
import type {
  TestResult,
  TestContext,
  ConsoleEntry,
  TestScript,
  RequestData,
  ResponseData,
} from './types';

/**
 * Test Runner - Main Orchestrator
 * Koordinasi execution pre/post request tests dengan modular approach
 */
export class TestRunner {
  private testContextManager: TestContextManager;
  private scriptExecutor: ScriptExecutor;
  private resultProcessor: TestResultProcessor;

  constructor(variables: Record<string, string> = {}) {
    const testSandbox = new TestSandbox();
    this.testContextManager = new TestContextManager(variables);
    this.scriptExecutor = new ScriptExecutor(testSandbox);
    this.resultProcessor = new TestResultProcessor();
  }

  async runPreRequestScript(
    script: string,
    context: Partial<TestContext>,
  ): Promise<{
    console: ConsoleEntry[];
    variables: Map<string, unknown>;
    globals: Map<string, unknown>;
    tests: Map<string, boolean>;
    assertions: TestResult[];
  }> {
    const testContext =
      this.testContextManager.createPreRequestContext(context);

    try {
      await this.scriptExecutor.executePreRequest(script, testContext);
      return this.testContextManager.extractPreRequestResults(testContext);
    } catch (error) {
      return this.testContextManager.createErrorContext(
        error as Error,
        testContext,
      );
    }
  }

  async runPostResponseTests(
    scripts: TestScript[],
    request: RequestData,
    response: ResponseData,
  ): Promise<TestResult[]> {
    const results: TestResult[] = [];

    for (const testScript of scripts) {
      if (!testScript.enabled) {
        results.push(
          this.resultProcessor.createSkipResult(testScript.id, testScript.name),
        );
        continue;
      }

      const startTime = Date.now();

      try {
        const testContext = this.testContextManager.createPostResponseContext(
          request,
          response,
        );

        await this.scriptExecutor.executePostResponse(
          testScript.script,
          testContext,
        );

        const endTime = Date.now();
        const duration = this.resultProcessor.calculateDuration(
          startTime,
          endTime,
        );

        // Process results menggunakan TestResultProcessor
        const scriptResults = this.resultProcessor.processResults(
          testContext,
          testScript.id,
          testScript.name,
          duration,
        );

        results.push(...scriptResults);
      } catch (error) {
        const endTime = Date.now();
        const duration = this.resultProcessor.calculateDuration(
          startTime,
          endTime,
        );

        results.push(
          this.resultProcessor.createErrorResult(
            testScript.id,
            testScript.name,
            error as Error,
            duration,
          ),
        );
      }
    }

    return results;
  }

  /**
   * Convenience method untuk running single test script
   */
  async runSingleTest(
    script: string,
    request: RequestData,
    response: ResponseData,
    testName: string = 'script-test',
  ): Promise<TestResult[]> {
    const testScripts = [
      {
        id: 'single-test',
        name: testName,
        script,
        enabled: true,
      },
    ];

    return this.runPostResponseTests(testScripts, request, response);
  }

  /**
   * Get test execution summary
   */
  getSummary(results: TestResult[]) {
    return this.resultProcessor.generateSummary(results);
  }

  /**
   * Validate script syntax
   */
  validateScript(script: string) {
    return this.scriptExecutor.validateScript(script);
  }

  /**
   * Update variables untuk interpolation
   */
  updateVariables(newVariables: Record<string, string>): void {
    // Re-create context manager dengan new variables
    this.testContextManager = new TestContextManager(newVariables);
  }

  /**
   * Reset internal state
   */
  reset(): void {
    // Reset internal modules
    this.testContextManager = new TestContextManager();
  }
}

// Remove duplicate export since class is already exported
