import { addAssertion } from './assertion-utils';
import { TestContext, JsonValue } from './types';

interface StatusResponse {
  status?: number;
  [key: string]: JsonValue;
}

export interface IStatusAssertions {
  toHaveStatus(expected: number, message?: string): AssertionResult;
  toHaveStatusInRange(
    start: number,
    end: number,
    message?: string,
  ): AssertionResult;
  expectStatus(status: number, message?: string): AssertionResult;
  expectOk(message?: string): AssertionResult;
  expectCreated(message?: string): AssertionResult;
  expectBadRequest(message?: string): AssertionResult;
  expectUnauthorized(message?: string): AssertionResult;
  expectForbidden(message?: string): AssertionResult;
  expectNotFound(message?: string): AssertionResult;
  expectServerError(message?: string): AssertionResult;
}

export class StatusAssertions implements IStatusAssertions {
  constructor(
    private actual: JsonValue,
    private context: TestContext,
  ) {}

  toHaveStatus(expected: number, message?: string): AssertionResult {
    const response = this.actual as StatusResponse;
    const status = response?.status;
    const passed = status === expected;
    const assertionMessage =
      message ||
      (passed
        ? `Status is ${expected}`
        : `Status is ${status} but expected ${expected}`);

    return addAssertion(
      this.context,
      'to have status',
      {
        expected,
        actual: status,
        passed,
      },
      assertionMessage,
    );
  }

  toHaveStatusInRange(
    start: number,
    end: number,
    message?: string,
  ): AssertionResult {
    const response = this.actual as StatusResponse;
    const status = response?.status;
    const passed =
      typeof status === 'number' && status >= start && status <= end;
    const assertionMessage =
      message ||
      (passed
        ? `Status ${status} is in range ${start}-${end}`
        : `Status ${status} is not in range ${start}-${end}`);

    return addAssertion(
      this.context,
      'to have status in range',
      {
        expected: `${start}-${end}`,
        actual: status,
        passed,
      },
      assertionMessage,
    );
  }

  expectStatus(status: number, message?: string): AssertionResult {
    return this.toHaveStatus(status, message);
  }

  expectOk(message?: string): AssertionResult {
    return this.toHaveStatus(200, message || 'Status should be OK (200)');
  }

  expectCreated(message?: string): AssertionResult {
    return this.toHaveStatus(
      201,
      message || 'Resource should be created (201)',
    );
  }

  expectBadRequest(message?: string): AssertionResult {
    return this.toHaveStatus(
      400,
      message || 'Status should be bad request (400)',
    );
  }

  expectUnauthorized(message?: string): AssertionResult {
    return this.toHaveStatus(401, message || 'Should be unauthorized (401)');
  }

  expectForbidden(message?: string): AssertionResult {
    return this.toHaveStatus(403, message || 'Should be forbidden (403)');
  }

  expectNotFound(message?: string): AssertionResult {
    return this.toHaveStatus(404, message || 'Should be not found (404)');
  }

  expectServerError(message?: string): AssertionResult {
    return this.toHaveStatusInRange(
      500,
      599,
      message || 'Should be server error (500-599)',
    );
  }
}

// Re-export for backward compatibility if needed
export type AssertionResult = import('./types').TestResult;
