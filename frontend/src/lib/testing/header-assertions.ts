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
    const passed =
      headers && (headerName.toLowerCase() in headers || headerName in headers);
    const assertionMessage =
      message ||
      (passed
        ? `Header "${headerName}" exists`
        : `Header "${headerName}" is missing`);

    return addAssertion(
      this.context,
      'to have header',
      {
        expected: `Header ${headerName}`,
        actual: headers?.[headerName] || headers?.[headerName.toLowerCase()],
        passed,
      },
      assertionMessage,
    );
  }

  toHaveContentType(expected: string, message?: string): AssertionResult {
    const response = this.actual as Response;
    const headers = response?.headers;
    const contentType =
      headers?.['content-type'] ||
      headers?.['Content-Type'] ||
      headers?.['CONTENT-TYPE'];
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
