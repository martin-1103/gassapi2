import {
  validatePropertyName,
  safePropertyAccess,
} from '@/lib/security/object-injection-utils';

import { addAssertion } from './assertion-utils';
import { TestContext, JsonValue } from './types';

interface ResponseHeaders {
  [key: string]: string | string[];
}

interface Response {
  status?: number;
  headers?: ResponseHeaders;
}

export interface IHeaderAssertions {
  toHaveHeader(headerName: string, message?: string): AssertionResult;
  toHaveContentType(expected: string, message?: string): AssertionResult;
}

export class HeaderAssertions implements IHeaderAssertions {
  constructor(
    private actual: JsonValue,
    private context: TestContext,
  ) {}

  toHaveHeader(headerName: string, message?: string): AssertionResult {
    const response = this.actual as Response;
    const headers = response?.headers;

    // Validate headerName to prevent prototype pollution menggunakan security utilities
    const headerNameValidation = validatePropertyName(headerName);
    if (!headerNameValidation.isValid) {
      const assertionMessage =
        message ||
        `Invalid header name "${headerName}": ${headerNameValidation.reason}`;
      return addAssertion(
        this.context,
        'to have header',
        {
          expected: `Valid header name`,
          actual: 'Invalid header name (security validation failed)',
          passed: false,
        },
        assertionMessage,
      );
    }

    const headerNameLower = headerName.toLowerCase();
    const passed =
      headers && (headerNameLower in headers || headerName in headers);
    const assertionMessage =
      message ||
      (passed
        ? `Header "${headerName}" exists`
        : `Header "${headerName}" is missing`);

    // Safe property access dengan security utilities
    let actualValue;
    if (headers) {
      actualValue =
        safePropertyAccess(headers, headerName) ||
        safePropertyAccess(headers, headerNameLower);
    }

    return addAssertion(
      this.context,
      'to have header',
      {
        expected: `Header ${headerName}`,
        actual: actualValue,
        passed,
      },
      assertionMessage,
    );
  }

  toHaveContentType(expected: string, message?: string): AssertionResult {
    const response = this.actual as Response;
    const headers = response?.headers;

    // Safe property access untuk content-type headers
    const contentType =
      (headers && safePropertyAccess(headers, 'content-type')) ||
      (headers && safePropertyAccess(headers, 'Content-Type')) ||
      (headers && safePropertyAccess(headers, 'CONTENT-TYPE'));

    const passed =
      typeof contentType === 'string' && contentType.includes(expected);
    const assertionMessage =
      message ||
      (passed
        ? `Content type contains "${expected}"`
        : `Content type "${contentType}" does not contain "${expected}"`);

    return addAssertion(
      this.context,
      'to have content type',
      {
        expected,
        actual: contentType,
        passed,
      },
      assertionMessage,
    );
  }
}

// Re-export for backward compatibility if needed
export type AssertionResult = import('./types').TestResult;
