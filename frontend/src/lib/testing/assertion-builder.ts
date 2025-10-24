import { TestResult, JsonValue, TestContext, Constructor } from './types';

/**
 * Assertion Builder untuk Chai-like syntax
 * Menyediakan 20+ method assertion untuk testing
 */
export class AssertionBuilder {
  private actual: JsonValue;
  private assertions: TestResult[];
  private negated: boolean = false;
  private testContext: TestContext;

  constructor(
    actual: JsonValue,
    testContext: TestContext,
    assertions?: TestResult[],
  ) {
    this.actual = actual;
    this.testContext = testContext;
    this.assertions = Array.isArray(assertions) ? [...assertions] : [];
    this.negated = false;
  }

  get not(): AssertionBuilder {
    this.negated = !this.negated;
    return this;
  }

  get deep(): AssertionBuilder {
    // Deep comparison untuk objects/arrays
    return this;
  }

  private addAssertion(
    assertion: string,
    expected: JsonValue,
    passed: boolean,
    message?: string,
  ) {
    this.assertions.push({
      name: assertion,
      status: passed ? 'pass' : 'fail',
      message: message || `Expected ${expected}, got ${this.actual}`,
      actual: this.actual,
      expected,
      duration: 0,
    });
    return this;
  }

  // Basic equality assertions
  toEqual(expected: JsonValue): AssertionBuilder {
    const passed = JSON.stringify(this.actual) === JSON.stringify(expected);
    return this.addAssertion(
      'to equal',
      expected,
      passed,
      passed ? 'Values are equal' : 'Values do not match',
    );
  }

  toBe(expected: JsonValue): AssertionBuilder {
    const passed = this.actual === expected;
    return this.addAssertion(
      'to be',
      expected,
      passed,
      passed ? 'Values are equal' : 'Values do not match',
    );
  }

  // Null/undefined assertions
  toBeNull(): AssertionBuilder {
    const passed = this.actual === null;
    return this.addAssertion(
      'to be null',
      null,
      passed,
      passed ? 'Value is null' : 'Value is not null',
    );
  }

  toBeUndefined(): AssertionBuilder {
    const passed = this.actual === undefined;
    return this.addAssertion(
      'to be undefined',
      undefined,
      passed,
      passed ? 'Value is undefined' : 'Value is not undefined',
    );
  }

  // Truthy/falsy assertions
  toBeTruthy(): AssertionBuilder {
    const passed = Boolean(this.actual);
    return this.addAssertion(
      'to be truthy',
      undefined,
      passed,
      passed ? 'Value is truthy' : 'Value is falsy',
    );
  }

  toBeFalsy(): AssertionBuilder {
    const passed = !this.actual;
    return this.addAssertion(
      'to be falsy',
      undefined,
      passed,
      passed ? 'Value is falsy' : 'Value is not falsy',
    );
  }

  // Array/string assertions
  toContain(expected: JsonValue): AssertionBuilder {
    const passed =
      (Array.isArray(this.actual) && this.actual.includes(expected)) ||
      (typeof this.actual === 'string' &&
        this.actual.includes(String(expected)));
    return this.addAssertion(
      'to contain',
      expected,
      passed,
      passed ? 'Value contains expected' : 'Value does not contain expected',
    );
  }

  toHaveLength(expected: number): AssertionBuilder {
    const passed = Array.isArray(this.actual)
      ? this.actual.length === expected
      : false;
    return this.addAssertion(
      'to have length',
      expected,
      passed,
      passed
        ? `Array has expected length: ${expected}`
        : 'Array does not have expected length',
    );
  }

  // String assertions
  toMatch(pattern: string | RegExp): AssertionBuilder {
    // Safe regex construction for string patterns
    const regex =
      typeof pattern === 'string'
        ? new RegExp(pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
        : pattern;
    const passed = regex.test(String(this.actual));
    return this.addAssertion(
      'to match',
      String(pattern),
      passed,
      passed ? 'String matches pattern' : 'String does not match',
    );
  }

  // Object assertions
  toHaveProperty(propertyName: string): AssertionBuilder {
    const passed =
      this.actual &&
      typeof this.actual === 'object' &&
      propertyName in this.actual;
    return this.addAssertion(
      'to have property',
      propertyName,
      passed,
      passed ? 'Object has property' : 'Object does not have property',
    );
  }

  // Number assertions
  toBeGreaterThan(expected: number): AssertionBuilder {
    const actual = Number(this.actual);
    const passed = actual > expected;
    return this.addAssertion(
      'to be greater than',
      expected,
      passed,
      passed ? `${actual} > ${expected}` : `${actual} <= ${expected}`,
    );
  }

  toBeLessThan(expected: number): AssertionBuilder {
    const actual = Number(this.actual);
    const passed = actual < expected;
    return this.addAssertion(
      'to be less than',
      expected,
      passed,
      passed ? `${actual} < ${expected}` : `${actual} >= ${expected}`,
    );
  }

  // Type assertions
  toBeInstanceOf(type: string | Constructor): AssertionBuilder {
    if (type === 'array') {
      const passed = Array.isArray(this.actual);
      return this.addAssertion(
        'to be array',
        type,
        passed,
        passed ? 'Value is array' : 'Value is not an array',
      );
    }
    if (type === 'object') {
      const passed = typeof this.actual === 'object' && this.actual !== null;
      return this.addAssertion(
        'to be object',
        type,
        passed,
        passed ? 'Value is object' : 'Value is not an object',
      );
    }
    if (typeof type === 'string') {
      const passed = typeof this.actual === type;
      return this.addAssertion(
        'to be instance of',
        type,
        passed,
        passed ? `Value is ${type}` : `Value is not ${type}`,
      );
    }
    // Handle constructor function
    const passed = this.actual instanceof type;
    return this.addAssertion(
      'to be instance of',
      type.name || 'Function',
      passed,
      passed
        ? `Value is instance of ${type.name || 'Function'}`
        : `Value is not instance of ${type.name || 'Function'}`,
    );
  }

  // HTTP specific assertions
  toHaveStatus(status: number): AssertionBuilder {
    // Note: Ini akan di-refactor untuk menggunakan context yang benar
    const response = this.testContext?.response || {};
    const actual = response?.status || 200;
    const passed = actual === status;
    return this.addAssertion(
      'to have status',
      status,
      passed,
      passed ? `Status code is ${status}` : `Status code is ${actual}`,
    );
  }

  toHaveHeader(headerName: string): AssertionBuilder {
    const response = this.testContext?.response || {};
    const headers = response?.headers || {};
    const passed =
      headerName.toLowerCase() in (headers as Record<string, unknown>);
    return this.addAssertion(
      'to have header',
      headerName,
      passed,
      passed ? `Header ${headerName} found` : `Header ${headerName} not found`,
    );
  }

  // Custom schema validation
  toMatchSchema(schema: JsonValue): AssertionBuilder {
    try {
      // Simple JSON schema validation without external dependencies
      const passed = this.validateAgainstSchema(this.actual, schema);
      return this.addAssertion(
        'to match schema',
        schema,
        passed,
        passed ? 'Value matches schema' : 'Value does not match schema',
      );
    } catch {
      return this.addAssertion(
        'to match schema',
        schema,
        false,
        'Invalid schema definition',
      );
    }
  }

  // Simple schema validation helper
  private validateAgainstSchema(value: JsonValue, schema: JsonValue): boolean {
    // Basic type validation
    if (typeof schema === 'object' && schema !== null) {
      const schemaObj = schema as Record<string, JsonValue>;

      // Check for type property
      if (schemaObj.type) {
        const expectedType = schemaObj.type;
        if (typeof expectedType === 'string') {
          switch (expectedType) {
            case 'string':
              return typeof value === 'string';
            case 'number':
              return typeof value === 'number';
            case 'boolean':
              return typeof value === 'boolean';
            case 'object':
              return (
                typeof value === 'object' &&
                value !== null &&
                !Array.isArray(value)
              );
            case 'array':
              return Array.isArray(value);
            case 'null':
              return value === null;
            default:
              return true; // Unknown type, pass
          }
        }
      }

      // Check for required properties
      if (
        schemaObj.required &&
        Array.isArray(schemaObj.required) &&
        typeof value === 'object' &&
        value !== null
      ) {
        const required = schemaObj.required as string[];
        for (const prop of required) {
          if (!(prop in value)) {
            return false;
          }
        }
      }

      // Check for properties
      if (schemaObj.properties && typeof value === 'object' && value !== null) {
        const properties = schemaObj.properties as Record<string, JsonValue>;
        const valueObj = value as Record<string, JsonValue>;

        for (const [key, propSchema] of Object.entries(properties)) {
          // Validate key to prevent prototype pollution
          if (
            key !== '__proto__' &&
            key !== 'constructor' &&
            key !== 'prototype' &&
            key in valueObj
          ) {
            if (!this.validateAgainstSchema(valueObj[key], propSchema)) {
              return false;
            }
          }
        }
      }
    }

    return true; // Default to pass for complex schemas
  }

  // addAssertionAdvanced method removed as it was unused

  // Utility methods
  getAssertions(): TestResult[] {
    return this.assertions;
  }

  reset(): void {
    this.assertions = [];
    this.negated = false;
  }

  // Advanced chaining support using addAssertion method
  then = function (
    assertion: string,
    expected: JsonValue,
    passed: boolean,
    message?: string,
  ): AssertionBuilder {
    return this.addAssertion(assertion, expected, passed, message);
  };

  // Negation support
  private applyNegation(passed: boolean): boolean {
    return this.negated ? !passed : passed;
  }

  // Custom assertion helper
  toSatisfy(
    predicate: (value: JsonValue) => boolean,
    message?: string,
  ): AssertionBuilder {
    const passed = this.applyNegation(predicate(this.actual));
    return this.addAssertion(
      'to satisfy',
      String(predicate),
      passed,
      message || `Value satisfies ${predicate.toString()}`,
    );
  }
}
