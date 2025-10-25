import { createSafeRegExp } from '@/lib/security/regexp-utils';

import { addAssertion, getLength } from './assertion-utils';
import { TestContext, JsonValue, Constructor } from './types';

export interface IContentAssertions {
  // Equality Assertions
  toEqual(expected: JsonValue, message?: string): AssertionResult;
  toBeNull(message?: string): AssertionResult;
  toBeUndefined(message?: string): AssertionResult;
  toBeTruthy(message?: string): AssertionResult;
  toBeFalsy(message?: string): AssertionResult;

  // String Assertions
  toInclude(expected: string, message?: string): AssertionResult;
  toNotInclude(expected: string, message?: string): AssertionResult;
  toContain(expected: string, message?: string): AssertionResult;
  toMatch(pattern: string | RegExp, message?: string): AssertionResult;

  // Length and Size Assertions
  toHaveLength(expected: number, message?: string): AssertionResult;
  toHaveSize(expected: number, message?: string): AssertionResult;

  // Type Assertions
  toBeInstanceOf(expectedClass: Constructor, message?: string): AssertionResult;
  toBeArray(message?: string): AssertionResult;
  toMatchType(expectedType: string, message?: string): AssertionResult;

  // Convenience Methods
  success(message?: string): AssertionResult;
  failure(message?: string): AssertionResult;
}

export class ContentAssertions implements IContentAssertions {
  constructor(
    private actual: JsonValue,
    private context: TestContext,
  ) {}

  // Equality Assertions
  toEqual(expected: JsonValue, message?: string): AssertionResult {
    const passed = this.actual === expected;
    const assertionMessage =
      message ||
      (passed
        ? 'Assertion passed'
        : `Expected ${JSON.stringify(expected)}, but got ${JSON.stringify(this.actual)}`);

    return addAssertion(
      this.context,
      'to equal',
      {
        expected,
        actual: this.actual,
        passed,
      },
      assertionMessage,
    );
  }

  toBeNull(message?: string): AssertionResult {
    const passed = this.actual === null;
    const assertionMessage =
      message ||
      (passed ? 'Value is null' : 'Value is not null but expected null');

    return addAssertion(
      this.context,
      'to be null',
      {
        expected: null,
        actual: this.actual,
        passed,
      },
      assertionMessage,
    );
  }

  toBeUndefined(message?: string): AssertionResult {
    const passed = typeof this.actual === 'undefined';
    const assertionMessage =
      message ||
      (passed
        ? 'Value is undefined'
        : 'Value is not undefined but expected undefined');

    return addAssertion(
      this.context,
      'to be undefined',
      {
        expected: undefined,
        actual: this.actual,
        passed,
      },
      assertionMessage,
    );
  }

  toBeTruthy(message?: string): AssertionResult {
    const passed = Boolean(this.actual);
    const assertionMessage =
      message || (passed ? 'Value is truthy' : 'Value is not truthy');

    return addAssertion(
      this.context,
      'to be truthy',
      {
        expected: true,
        actual: this.actual,
        passed,
      },
      assertionMessage,
    );
  }

  toBeFalsy(message?: string): AssertionResult {
    const passed = !this.actual;
    const assertionMessage =
      message || (passed ? 'Value is falsy' : 'Value is not falsy');

    return addAssertion(
      this.context,
      'to be falsy',
      {
        expected: false,
        actual: this.actual,
        passed,
      },
      assertionMessage,
    );
  }

  // String Assertions
  toInclude(expected: string, message?: string): AssertionResult {
    let passed = false;
    let assertionMessage = message;

    if (typeof this.actual === 'string') {
      passed = this.actual.includes(expected);
      assertionMessage =
        assertionMessage ||
        (passed
          ? `String contains "${expected}"`
          : `String does not contain "${expected}"`);
    } else {
      passed = false;
      assertionMessage = assertionMessage || 'Actual value is not a string';
    }

    return addAssertion(
      this.context,
      'to include',
      {
        expected,
        actual: this.actual,
        passed,
      },
      assertionMessage,
    );
  }

  toNotInclude(expected: string, message?: string): AssertionResult {
    let passed = false;
    let assertionMessage = message;

    if (typeof this.actual === 'string') {
      passed = !this.actual.includes(expected);
      assertionMessage =
        assertionMessage ||
        (passed
          ? `String does not contain "${expected}"`
          : `String contains "${expected}"`);
    } else {
      passed = false;
      assertionMessage = assertionMessage || 'Actual value is not a string';
    }

    return addAssertion(
      this.context,
      'to not include',
      {
        expected,
        actual: this.actual,
        passed,
      },
      assertionMessage,
    );
  }

  toContain(expected: string, message?: string): AssertionResult {
    return this.toInclude(expected, message);
  }

  toMatch(pattern: string | RegExp, message?: string): AssertionResult {
    let regex: RegExp;
    let assertionMessage = message;

    try {
      if (typeof pattern === 'string') {
        // Use centralized security utility for safe RegExp construction
        regex = createSafeRegExp(pattern, 'gi', {
          maxLength: 500,
          allowComplex: false,
        });
      } else {
        regex = pattern;
      }

      const passed = regex.test(String(this.actual));
      assertionMessage =
        assertionMessage ||
        (passed ? 'String matches pattern' : 'String does not match pattern');

      return addAssertion(
        this.context,
        'to match',
        {
          expected: String(pattern),
          actual: this.actual,
          passed,
        },
        assertionMessage,
      );
    } catch (error) {
      // Jika RegExp creation gagal, return failed assertion
      return addAssertion(
        this.context,
        'to match',
        {
          expected: String(pattern),
          actual: this.actual,
          passed: false,
        },
        assertionMessage ||
          `Invalid regex pattern: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  // Length and Size Assertions
  toHaveLength(expected: number, message?: string): AssertionResult {
    const actualLength = getLength(this.actual);
    const passed = actualLength === expected;
    const assertionMessage =
      message ||
      (passed ? 'Length matches' : `${actualLength}/${expected} items`);

    return addAssertion(
      this.context,
      'to have length',
      {
        expected,
        actual: actualLength,
        passed,
      },
      assertionMessage,
    );
  }

  toHaveSize(expected: number, message?: string): AssertionResult {
    return this.toHaveLength(expected, message);
  }

  // Type Assertions
  toBeInstanceOf(
    expectedClass: Constructor,
    message?: string,
  ): AssertionResult {
    const passed = this.actual instanceof expectedClass;
    const assertionMessage =
      message ||
      (passed
        ? `Value is instanceof ${expectedClass.name}`
        : `Value is not instance of ${expectedClass.name}`);

    return addAssertion(
      this.context,
      'to be instance',
      {
        expected: expectedClass.name,
        actual: this.actual?.constructor?.name,
        passed,
      },
      assertionMessage,
    );
  }

  toBeArray(message?: string): AssertionResult {
    const passed = Array.isArray(this.actual);
    const assertionMessage =
      message || (passed ? 'Is array' : 'Value is not an array');

    return addAssertion(
      this.context,
      'to be array',
      {
        expected: 'Array',
        actual: Array.isArray(this.actual) ? 'Array' : typeof this.actual,
        passed,
      },
      assertionMessage,
    );
  }

  toMatchType(expectedType: string, message?: string): AssertionResult {
    const actualType = typeof this.actual;
    const passed = actualType === expectedType;
    const assertionMessage =
      message ||
      (passed
        ? `Type is ${expectedType}`
        : `Type is ${actualType} but expected ${expectedType}`);

    return addAssertion(
      this.context,
      'to match type',
      {
        expected: expectedType,
        actual: actualType,
        passed,
      },
      assertionMessage,
    );
  }

  // Convenience Methods
  success(message?: string): AssertionResult {
    return addAssertion(
      this.context,
      'test passed',
      {
        passed: true,
      },
      message || 'Test passed',
    );
  }

  failure(message?: string): AssertionResult {
    return addAssertion(
      this.context,
      'test failed',
      {
        passed: false,
      },
      message || 'Test failed',
    );
  }
}

// Re-export for backward compatibility if needed
export type AssertionResult = import('./types').TestResult;
