import {
  validatePropertyName,
  safePropertyAccess,
} from '@/lib/security/object-injection-utils';

import { TestResult, TestContext, JsonValue } from './types';

/**
 * Utility functions for assertion implementations
 */

/**
 * Adds an assertion result to the test context
 */
export function addAssertion(
  context: TestContext,
  assertionName: string,
  data: {
    passed?: boolean;
    status?: JsonValue;
    expected?: JsonValue;
    actual?: JsonValue;
  },
  customMessage?: string,
): TestResult {
  const passed =
    data.passed !== undefined ? data.passed : data.status === data.expected;
  const message =
    customMessage || (passed ? 'Assertion passed' : 'Assertion failed');

  const result: TestResult = {
    name: assertionName,
    status: passed ? 'pass' : 'fail',
    message,
    duration: 0,
    actual: data.actual !== undefined ? data.actual : data.status,
    expected: data.expected || data.status,
  };

  // Save result to context
  if (context.results) {
    context.results.push(result);
  }
  if (context.assertions) {
    context.assertions.push(result);
  }

  return result;
}

/**
 * Gets a nested property value from an object using dot notation
 */
export function getValue(
  obj: Record<string, JsonValue> | JsonValue,
  path: string,
): JsonValue {
  // Validasi path input
  if (typeof path !== 'string' || path.length === 0) {
    return undefined;
  }

  return path.split('.').reduce((current, key) => {
    if (
      current === null ||
      current === undefined ||
      !(typeof current === 'object')
    ) {
      return undefined;
    }

    // Validasi key menggunakan security utilities
    const keyValidation = validatePropertyName(key);
    if (!keyValidation.isValid) {
      return undefined;
    }

    // Gunakan safe property access
    return safePropertyAccess(current as Record<string, JsonValue>, key);
  }, obj);
}

/**
 * Gets the length of a value (string, array, or other)
 */
export function getLength(value: JsonValue): number {
  if (typeof value === 'string') {
    return value.length;
  } else if (Array.isArray(value)) {
    return value.length;
  } else if (
    value &&
    typeof value === 'object' &&
    'length' in value &&
    typeof value.length === 'number'
  ) {
    return value.length;
  }
  return 0;
}
