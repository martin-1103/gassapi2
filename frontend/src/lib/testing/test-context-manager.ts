import { VariableInterpolator } from '@/lib/variables/variable-interpolator';

import {
  TestContext,
  ConsoleEntry,
  TestResult,
  RequestData,
  ResponseData,
} from './types';

/**
 * Test Context Manager
 * Menangani creation, setup, dan management dari test context
 */
export class TestContextManager {
  private variableInterpolator: VariableInterpolator;

  constructor(variables: Record<string, string> = {}) {
    this.variableInterpolator = new VariableInterpolator(variables);
  }

  /**
   * Create test context untuk pre-request script execution
   */
  createPreRequestContext(context: Partial<TestContext>): TestContext {
    return {
      request: context.request || {
        url: '',
        method: 'GET',
        headers: {},
        body: undefined,
      },
      response: {} as ResponseData,
      variables: new Map(Object.entries(this.variableInterpolator.getAll())),
      globals: new Map(),
      tests: new Map(),
      assertions: [],
      console: [],
      environment: context.environment || {},
    };
  }

  /**
   * Create test context untuk post-response script execution
   */
  createPostResponseContext(
    request: RequestData,
    response: ResponseData,
    environment: Record<string, unknown> = {},
  ): TestContext {
    return {
      request,
      response,
      variables: new Map(Object.entries(this.variableInterpolator.getAll())),
      globals: new Map(),
      tests: new Map(),
      assertions: [],
      console: [],
      environment,
    };
  }

  /**
   * Update existing context dengan new data
   */
  updateContext(context: TestContext, updates: Partial<TestContext>): void {
    if (updates.request) {
      context.request = { ...context.request, ...updates.request };
    }
    if (updates.response) {
      context.response = { ...context.response, ...updates.response };
    }
    if (updates.environment) {
      context.environment = { ...context.environment, ...updates.environment };
    }
    if (updates.variables) {
      updates.variables.forEach((value, key) => {
        context.variables.set(key, value);
      });
    }
    if (updates.globals) {
      updates.globals.forEach((value, key) => {
        context.globals.set(key, value);
      });
    }
  }

  /**
   * Extract context data untuk return dari pre-request script
   */
  extractPreRequestResults(context: TestContext): {
    console: ConsoleEntry[];
    variables: Map<string, unknown>;
    globals: Map<string, unknown>;
    tests: Map<string, boolean>;
    assertions: TestResult[];
  } {
    return {
      console: context.console,
      variables: context.variables,
      globals: context.globals,
      tests: context.tests,
      assertions: context.assertions,
    };
  }

  /**
   * Create error context untuk failed pre-request script
   */
  createErrorContext(
    error: Error,
    context: TestContext,
  ): {
    console: ConsoleEntry[];
    variables: Map<string, unknown>;
    globals: Map<string, unknown>;
    tests: Map<string, boolean>;
    assertions: TestResult[];
  } {
    return {
      console: [
        {
          level: 'error',
          message: `Pre-request script failed: ${error.message}`,
          timestamp: Date.now(),
          source: 'pre-request',
          error: error,
        },
      ],
      variables: context.variables,
      globals: context.globals,
      tests: new Map([['pre-request-script', false]]),
      assertions: [],
    };
  }

  /**
   * Clean dan reset context untuk reuse
   */
  resetContext(context: TestContext): void {
    context.tests.clear();
    context.assertions = [];
    context.console = [];
    // Variables dan globals preserved intentionally
  }

  /**
   * Clone context untuk independent execution
   */
  cloneContext(context: TestContext): TestContext {
    return {
      request: { ...context.request },
      response: { ...context.response },
      variables: new Map(context.variables),
      globals: new Map(context.globals),
      tests: new Map(context.tests),
      assertions: [...context.assertions],
      console: [...context.console],
      environment: { ...context.environment },
    };
  }

  /**
   * Validate context structure
   */
  validateContext(context: TestContext): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!context.request) {
      errors.push('Missing request object');
    } else {
      if (!context.request.url) errors.push('Missing request URL');
      if (!context.request.method) errors.push('Missing request method');
    }

    if (!context.response) {
      errors.push('Missing response object');
    }

    if (!context.variables) {
      errors.push('Missing variables Map');
    }

    if (!context.globals) {
      errors.push('Missing globals Map');
    }

    if (!context.tests) {
      errors.push('Missing tests Map');
    }

    if (!Array.isArray(context.assertions)) {
      errors.push('Missing or invalid assertions array');
    }

    if (!Array.isArray(context.console)) {
      errors.push('Missing or invalid console array');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Add variable interpolation support
   */
  interpolateInContext(context: TestContext, text: string): string {
    return this.variableInterpolator.interpolate(text);
  }

  /**
   * Get context summary untuk debugging
   */
  getContextSummary(context: TestContext): string {
    return `
Context Summary:
- Request: ${context.request.method} ${context.request.url}
- Response Status: ${context.response.status || 'N/A'}
- Variables: ${context.variables.size} items
- Globals: ${context.globals.size} items
- Tests: ${context.tests.size} items
- Assertions: ${context.assertions.length} items
- Console Entries: ${context.console.length} items
- Environment Variables: ${Object.keys(context.environment).length} items
    `.trim();
  }
}
