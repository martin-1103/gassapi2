/**
 * Type definitions untuk testing framework
 * Mendefinisikan tipe data yang digunakan dalam test runner dan assertions
 */

// JSON value types untuk assertion handling
export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonObject
  | JsonArray;

export interface JsonObject {
  [key: string]: JsonValue;
}

export interface JsonArray extends Array<JsonValue> {
  length: number;
  [index: number]: JsonValue;
}

// Request dan Response types
export interface RequestData {
  url: string;
  method: string;
  headers?: Record<string, string>;
  body?: JsonValue;
}

export interface ResponseData {
  status?: number;
  statusText?: string;
  headers?: Record<string, string>;
  data?: JsonValue;
}

// Script execution types
export interface TestScript {
  id: string;
  name: string;
  script: string;
  enabled: boolean;
  type?: 'pre-request' | 'post-response';
  timeout?: number;
  lastResult?: TestResult;
  created_at?: string;
}

export interface ScriptExecutionResult {
  id: string;
  success: boolean;
  error?: Error;
  duration?: number;
}

// Console types
export type ConsoleLevel = 'log' | 'info' | 'warn' | 'error' | 'debug';

export interface ConsoleEntry {
  level: ConsoleLevel;
  message: string;
  timestamp: number;
  source: string;
  error?: Error;
}

// Sandbox types
export interface SandboxEnvironment {
  request: {
    url: string;
    method: string;
    headers: Record<string, string>;
    body: JsonValue;
  };
  response: {
    status: number;
    statusText: string;
    headers: Record<string, string>;
    data: JsonValue;
  };
  environment: Record<string, unknown>;
  variables: {
    get: (key: string) => string;
    set: (key: string, value: string) => void;
    unset: (key: string) => void;
    clear: () => void;
  };
  globals: {
    get: (key: string) => string;
    set: (key: string, value: string) => void;
    clear: () => void;
  };
  tests: {
    test: (name: string, fn: () => void | Promise<void>) => void;
  };
  expect: (actual: JsonValue) => AssertionBuilder;
  console: ConsoleProxy;
  _: Record<string, unknown>;
  responseJSON: JsonValue;
  responseBody: string;
  responseHeaders: Record<string, string>;
  responseCode: {
    code: number;
    name: string;
    detail: string;
  };
  requestJSON: JsonValue;
  requestBody: string;
  requestHeaders: Record<string, string>;
  requestMethod: string;
  requestUrl: string;
}

export interface ConsoleProxy {
  log: (...args: unknown[]) => void;
  info: (...args: unknown[]) => void;
  warn: (...args: unknown[]) => void;
  error: (...args: unknown[]) => void;
  debug: (...args: unknown[]) => void;
}

// Class constructor type untuk instance checks
export type Constructor = new (...args: unknown[]) => unknown;

// Test Results
export interface TestResult {
  id?: string;
  name: string;
  status: 'pass' | 'fail' | 'skip' | 'error';
  message?: string;
  duration: number;
  error?: Error;
  actual?: JsonValue;
  expected?: JsonValue;
}

// Test Context dengan proper types
export interface TestContext {
  request: RequestData;
  response: ResponseData;
  variables: Map<string, unknown>;
  globals: Map<string, unknown>;
  tests: Map<string, boolean>;
  assertions: TestResult[];
  console: ConsoleEntry[];
  environment: Record<string, unknown>;
  results?: TestResult[];
}

// Assertion Builder type
export interface AssertionBuilder {
  /**
   * Test if actual value equals expected value
   */
  toEqual(expected: JsonValue): AssertionBuilder;

  /**
   * Test if actual value is strictly equal to expected value
   */
  toBe(expected: JsonValue): AssertionBuilder;

  /**
   * Test if actual value contains expected value
   */
  toContain(expected: JsonValue): AssertionBuilder;

  /**
   * Test if actual value matches a predicate function
   */
  toMatch(predicate: (value: JsonValue) => boolean): AssertionBuilder;

  /**
   * Test if actual value is null
   */
  toBeNull(): AssertionBuilder;

  /**
   * Test if actual value is undefined
   */
  toBeUndefined(): AssertionBuilder;

  /**
   * Test if actual value is truthy
   */
  toBeTruthy(): AssertionBuilder;

  /**
   * Test if actual value is falsy
   */
  toBeFalsy(): AssertionBuilder;

  /**
   * Test if actual value is greater than expected
   */
  toBeGreaterThan(expected: number): AssertionBuilder;

  /**
   * Test if actual value is less than expected
   */
  toBeLessThan(expected: number): AssertionBuilder;

  /**
   * Test if actual value is an instance of expected class
   */
  toBeInstanceOf(expectedClass: Constructor): AssertionBuilder;

  /**
   * Test if actual value has expected property
   */
  toHaveProperty(propertyPath: string): AssertionBuilder;
}

// Form field types untuk component files
export interface FormField {
  id: string;
  key: string;
  value: string;
  type: 'text' | 'file';
  enabled: boolean;
}

export interface FormFieldUpdate {
  key?: string;
  value?: string;
  type?: 'text' | 'file';
  enabled?: boolean;
}

// Test script configuration type
export interface TestScriptConfig {
  id: string;
  name: string;
  script: string;
  enabled: boolean;
}
