import { TestContext } from './types';
import { addAssertion, getValue } from './assertion-utils';
import { ContentAssertions } from './content-assertions';

export interface IJsonAssertions {
  toHaveProperty(propertyPath: string, message?: string): AssertionResult;
  toHavePropertyWithValue(propertyPath: string, expectedValue: any, message?: string): AssertionResult;
  toBeObject(message?: string): AssertionResult;
  expectJSON(message?: string): AssertionResult;
  expectArray(message?: string): AssertionResult;
  expectEmpty(message?: string): AssertionResult;
  expectKeyExists(key: string, message?: string): AssertionResult;
  expectKeyWithValue(key: string, value: any, message?: string): AssertionResult;
}

export class JsonAssertions implements IJsonAssertions {
  constructor(private actual: any, private context: TestContext) {}

  toHaveProperty(propertyPath: string, message?: string): AssertionResult {
    const hasProperty = getValue(this.actual, propertyPath) !== undefined;
    const assertionMessage = message ||
      (hasProperty ? `Has property "${propertyPath}"` : `Missing property "${propertyPath}"`);

    return addAssertion(this.context, 'to have property', {
      expected: true,
      actual: hasProperty,
      passed: hasProperty
    }, assertionMessage);
  }

  toHavePropertyWithValue(propertyPath: string, expectedValue: any, message?: string): AssertionResult {
    const actualValue = getValue(this.actual, propertyPath);
    const passed = actualValue === expectedValue;
    const assertionMessage = message ||
      (passed ? `Property "${propertyPath}" has expected value` :
        `Expected "${expectedValue}" but got "${actualValue}"`);

    return addAssertion(this.context, 'to have property with value', {
      expected: expectedValue,
      actual: actualValue,
      passed
    }, assertionMessage);
  }

  toBeObject(message?: string): AssertionResult {
    const passed = typeof this.actual === 'object' && this.actual !== null && !Array.isArray(this.actual);
    const assertionMessage = message || (passed ? 'Is object' : 'Value is not an object');

    return addAssertion(this.context, 'to be object', {
      expected: 'Object',
      actual: typeof this.actual,
      passed
    }, assertionMessage);
  }

  expectJSON(message?: string): AssertionResult {
    const hasDataProperty = this.toHaveProperty('data', message);
    const isObjectResult = this.toBeObject();
    return hasDataProperty.status === 'pass' && isObjectResult.status === 'pass'
      ? hasDataProperty  // Return the first result
      : addAssertion(this.context, 'expect JSON', {
          passed: false,
          expected: 'JSON object with data property',
          actual: this.actual
        }, message || 'Expected JSON object with data property');
  }

  expectArray(message?: string): AssertionResult {
    const hasDataProperty = this.toHaveProperty('data', message);
    const isArrayResult = new ContentAssertions(this.actual?.data, this.context).toBeArray();
    return hasDataProperty.status === 'pass' && isArrayResult.status === 'pass'
      ? hasDataProperty  // Return the first result
      : addAssertion(this.context, 'expect array', {
          passed: false,
          expected: 'Array with data property',
          actual: this.actual
        }, message || 'Expected array with data property');
  }

  expectEmpty(message?: string): AssertionResult {
    const data = this.actual?.data;
    let isEmpty = false;

    if (!data) {
      isEmpty = true;
    } else if (Array.isArray(data)) {
      isEmpty = data.length === 0;
    } else if (typeof data === 'object') {
      isEmpty = Object.keys(data).length === 0;
    }

    return addAssertion(this.context, 'to be empty', {
      expected: 'empty',
      actual: data,
      passed: isEmpty
    }, message || (isEmpty ? 'Data is empty' : 'Data is not empty'));
  }

  expectKeyExists(key: string, message?: string): AssertionResult {
    return this.toHaveProperty(`data.${key}`, message);
  }

  expectKeyWithValue(key: string, value: any, message?: string): AssertionResult {
    return this.toHavePropertyWithValue(`data.${key}`, value, message);
  }
}

// Re-export for backward compatibility if needed
export type AssertionResult = import('./types').TestResult;