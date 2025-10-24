import { TestContext, TestResult } from './types';
import { JsonAssertions } from './json-assertions';
import { HeaderAssertions } from './header-assertions';
import { StatusAssertions } from './status-assertions';
import { ContentAssertions } from './content-assertions';

export class AssertionBuilder {
  private context: TestContext;
  private actual: any;

  constructor(actual: any, context: TestContext) {
    this.context = context;
    this.actual = actual;
  }

  // JSON Assertions
  toHaveProperty(propertyPath: string, message?: string): AssertionBuilder {
    const jsonAssertions = new JsonAssertions(this.actual, this.context);
    jsonAssertions.toHaveProperty(propertyPath, message);
    return this;
  }

  toHavePropertyWithValue(propertyPath: string, expectedValue: any, message?: string): AssertionBuilder {
    const jsonAssertions = new JsonAssertions(this.actual, this.context);
    jsonAssertions.toHavePropertyWithValue(propertyPath, expectedValue, message);
    return this;
  }

  toBeObject(message?: string): AssertionBuilder {
    const jsonAssertions = new JsonAssertions(this.actual, this.context);
    jsonAssertions.toBeObject(message);
    return this;
  }

  expectJSON(message?: string): AssertionBuilder {
    const jsonAssertions = new JsonAssertions(this.actual, this.context);
    jsonAssertions.expectJSON(message);
    return this;
  }

  expectArray(message?: string): AssertionBuilder {
    const jsonAssertions = new JsonAssertions(this.actual, this.context);
    jsonAssertions.expectArray(message);
    return this;
  }

  expectEmpty(message?: string): AssertionBuilder {
    const jsonAssertions = new JsonAssertions(this.actual, this.context);
    jsonAssertions.expectEmpty(message);
    return this;
  }

  expectKeyExists(key: string, message?: string): AssertionBuilder {
    const jsonAssertions = new JsonAssertions(this.actual, this.context);
    jsonAssertions.expectKeyExists(key, message);
    return this;
  }

  expectKeyWithValue(key: string, value: any, message?: string): AssertionBuilder {
    const jsonAssertions = new JsonAssertions(this.actual, this.context);
    jsonAssertions.expectKeyWithValue(key, value, message);
    return this;
  }

  // Header Assertions
  toHaveHeader(headerName: string, message?: string): AssertionBuilder {
    const headerAssertions = new HeaderAssertions(this.actual, this.context);
    headerAssertions.toHaveHeader(headerName, message);
    return this;
  }

  toHaveContentType(expected: string, message?: string): AssertionBuilder {
    const headerAssertions = new HeaderAssertions(this.actual, this.context);
    headerAssertions.toHaveContentType(expected, message);
    return this;
  }

  // Status Assertions
  toHaveStatus(expected: number, message?: string): AssertionBuilder {
    const statusAssertions = new StatusAssertions(this.actual, this.context);
    statusAssertions.toHaveStatus(expected, message);
    return this;
  }

  toHaveStatusInRange(start: number, end: number, message?: string): AssertionBuilder {
    const statusAssertions = new StatusAssertions(this.actual, this.context);
    statusAssertions.toHaveStatusInRange(start, end, message);
    return this;
  }

  expectStatus(status: number, message?: string): AssertionBuilder {
    const statusAssertions = new StatusAssertions(this.actual, this.context);
    statusAssertions.expectStatus(status, message);
    return this;
  }

  expectOk(message?: string): AssertionBuilder {
    const statusAssertions = new StatusAssertions(this.actual, this.context);
    statusAssertions.expectOk(message);
    return this;
  }

  expectCreated(message?: string): AssertionBuilder {
    const statusAssertions = new StatusAssertions(this.actual, this.context);
    statusAssertions.expectCreated(message);
    return this;
  }

  expectBadRequest(message?: string): AssertionBuilder {
    const statusAssertions = new StatusAssertions(this.actual, this.context);
    statusAssertions.expectBadRequest(message);
    return this;
  }

  expectUnauthorized(message?: string): AssertionBuilder {
    const statusAssertions = new StatusAssertions(this.actual, this.context);
    statusAssertions.expectUnauthorized(message);
    return this;
  }

  expectForbidden(message?: string): AssertionBuilder {
    const statusAssertions = new StatusAssertions(this.actual, this.context);
    statusAssertions.expectForbidden(message);
    return this;
  }

  expectNotFound(message?: string): AssertionBuilder {
    const statusAssertions = new StatusAssertions(this.actual, this.context);
    statusAssertions.expectNotFound(message);
    return this;
  }

  expectServerError(message?: string): AssertionBuilder {
    const statusAssertions = new StatusAssertions(this.actual, this.context);
    statusAssertions.expectServerError(message);
    return this;
  }

  // Content Assertions
  toEqual(expected: any, message?: string): AssertionBuilder {
    const contentAssertions = new ContentAssertions(this.actual, this.context);
    contentAssertions.toEqual(expected, message);
    return this;
  }

  toBeNull(message?: string): AssertionBuilder {
    const contentAssertions = new ContentAssertions(this.actual, this.context);
    contentAssertions.toBeNull(message);
    return this;
  }

  toBeUndefined(message?: string): AssertionBuilder {
    const contentAssertions = new ContentAssertions(this.actual, this.context);
    contentAssertions.toBeUndefined(message);
    return this;
  }

  toBeTruthy(message?: string): AssertionBuilder {
    const contentAssertions = new ContentAssertions(this.actual, this.context);
    contentAssertions.toBeTruthy(message);
    return this;
  }

  toBeFalsy(message?: string): AssertionBuilder {
    const contentAssertions = new ContentAssertions(this.actual, this.context);
    contentAssertions.toBeFalsy(message);
    return this;
  }

  toInclude(expected: string, message?: string): AssertionBuilder {
    const contentAssertions = new ContentAssertions(this.actual, this.context);
    contentAssertions.toInclude(expected, message);
    return this;
  }

  toNotInclude(expected: string, message?: string): AssertionBuilder {
    const contentAssertions = new ContentAssertions(this.actual, this.context);
    contentAssertions.toNotInclude(expected, message);
    return this;
  }

  toContain(expected: string, message?: string): AssertionBuilder {
    const contentAssertions = new ContentAssertions(this.actual, this.context);
    contentAssertions.toContain(expected, message);
    return this;
  }

  toMatch(pattern: string | RegExp, message?: string): AssertionBuilder {
    const contentAssertions = new ContentAssertions(this.actual, this.context);
    contentAssertions.toMatch(pattern, message);
    return this;
  }

  toHaveLength(expected: number, message?: string): AssertionBuilder {
    const contentAssertions = new ContentAssertions(this.actual, this.context);
    contentAssertions.toHaveLength(expected, message);
    return this;
  }

  toHaveSize(expected: number, message?: string): AssertionBuilder {
    const contentAssertions = new ContentAssertions(this.actual, this.context);
    contentAssertions.toHaveSize(expected, message);
    return this;
  }

  toBeInstanceOf(expectedClass: any, message?: string): AssertionBuilder {
    const contentAssertions = new ContentAssertions(this.actual, this.context);
    contentAssertions.toBeInstanceOf(expectedClass, message);
    return this;
  }

  toBeArray(message?: string): AssertionBuilder {
    const contentAssertions = new ContentAssertions(this.actual, this.context);
    contentAssertions.toBeArray(message);
    return this;
  }

  toMatchType(expectedType: string, message?: string): AssertionBuilder {
    const contentAssertions = new ContentAssertions(this.actual, this.context);
    contentAssertions.toMatchType(expectedType, message);
    return this;
  }

  success(message?: string): AssertionBuilder {
    const contentAssertions = new ContentAssertions(this.actual, this.context);
    contentAssertions.success(message);
    return this;
  }

  failure(message?: string): AssertionBuilder {
    const contentAssertions = new ContentAssertions(this.actual, this.context);
    contentAssertions.failure(message);
    return this;
  }
}

// Helper function to create assertion
export function expect(actual: any, context?: TestContext): AssertionBuilder {
  const defaultContext: TestContext = {
    request: { url: '', method: 'GET' },
    response: {},
    variables: new Map(),
    globals: new Map(),
    tests: new Map(),
    assertions: [],
    console: [],
    environment: {},
    results: []
  };

  return new AssertionBuilder(actual, context || defaultContext);
}

// Export types for external usage
export type { TestResult, TestContext };