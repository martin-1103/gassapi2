import { TestResult, TestContext } from './types'

export class AssertionBuilder {
  private context: TestContext
  private actual: any
  private negated = false

  constructor(actual: any, context: TestContext) {
    this.context = context
    this.actual = actual
  }

  // Utility method untuk menambahkan assertion
  private addAssertion(assertion: string, data: any, customMessage?: string): AssertionBuilder {
    const passed = data.passed !== undefined ? data.passed : data.status === data.expected
    const message = customMessage || (passed ? 'Assertion passed' : 'Assertion failed')

    const result: TestResult = {
      name: assertion,
      status: passed ? 'pass' : 'fail',
      message,
      duration: 0,
      actual: this.actual,
      expected: data.expected || data.status
    }

    // Simpan hasil ke context
    if (this.context.results) {
      this.context.results.push(result)
    }
    if (this.context.assertions) {
      this.context.assertions.push(result)
    }

    return this
  }

  // Utility method untuk mendapatkan nilai nested object
  private getValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => {
      if (current === null || current === undefined || current[key] === undefined) {
        return undefined
      }
      return current[key]
    }, obj)
  }

  // Equality Assertions
  toEqual(expected: any, message?: string): AssertionBuilder {
    const passed = this.actual === expected
    const assertionMessage = message || (
      passed ? 'Assertion passed' :
      `Expected ${JSON.stringify(expected)}, but got ${JSON.stringify(this.actual)}`
    )

    return this.addAssertion('to equal', {
      expected,
      actual: this.actual,
      passed
    }, assertionMessage)
  }

  toBeNull(message?: string): AssertionBuilder {
    const passed = this.actual === null
    const assertionMessage = message || (passed ? 'Value is null' : 'Value is not null but expected null')

    return this.addAssertion('to be null', {
      expected: null,
      actual: this.actual,
      passed
    }, assertionMessage)
  }

  toBeUndefined(message?: string): AssertionBuilder {
    const passed = typeof this.actual === 'undefined'
    const assertionMessage = message || (passed ? 'Value is undefined' : 'Value is not undefined but expected undefined')

    return this.addAssertion('to be undefined', {
      expected: undefined,
      actual: this.actual,
      passed
    }, assertionMessage)
  }

  toBeTruthy(message?: string): AssertionBuilder {
    const passed = Boolean(this.actual)
    const assertionMessage = message || (passed ? 'Value is truthy' : 'Value is not truthy')

    return this.addAssertion('to be truthy', {
      expected: true,
      actual: this.actual,
      passed
    }, assertionMessage)
  }

  toBeFalsy(message?: string): AssertionBuilder {
    const passed = !Boolean(this.actual)
    const assertionMessage = message || (passed ? 'Value is falsy' : 'Value is not falsy')

    return this.addAssertion('to be falsy', {
      expected: false,
      actual: this.actual,
      passed
    }, assertionMessage)
  }

  // String Assertions
  toInclude(expected: string, message?: string): AssertionBuilder {
    let passed = false
    let assertionMessage = message

    if (typeof this.actual === 'string') {
      passed = this.actual.includes(expected)
      assertionMessage = assertionMessage ||
        (passed ? `String contains "${expected}"` : `String does not contain "${expected}"`)
    } else {
      passed = false
      assertionMessage = assertionMessage || 'Actual value is not a string'
    }

    return this.addAssertion('to include', {
      expected,
      actual: this.actual,
      passed
    }, assertionMessage)
  }

  toNotInclude(expected: string, message?: string): AssertionBuilder {
    let passed = false
    let assertionMessage = message

    if (typeof this.actual === 'string') {
      passed = !this.actual.includes(expected)
      assertionMessage = assertionMessage ||
        (passed ? `String does not contain "${expected}"` : `String contains "${expected}"`)
    } else {
      passed = false
      assertionMessage = assertionMessage || 'Actual value is not a string'
    }

    return this.addAssertion('to not include', {
      expected,
      actual: this.actual,
      passed
    }, assertionMessage)
  }

  toContain(expected: string, message?: string): AssertionBuilder {
    return this.toInclude(expected, message)
  }

  toMatch(pattern: string | RegExp, message?: string): AssertionBuilder {
    let regex: RegExp

    if (typeof pattern === 'string') {
      regex = new RegExp(pattern, 'gi')
    } else {
      regex = pattern
    }

    const passed = regex.test(String(this.actual))
    const assertionMessage = message ||
      (passed ? 'String matches pattern' : 'String does not match pattern')

    return this.addAssertion('to match', {
      expected: pattern,
      actual: this.actual,
      passed
    }, assertionMessage)
  }

  // Length and Size Assertions
  toHaveLength(expected: number, message?: string): AssertionBuilder {
    let actualLength = 0

    if (typeof this.actual === 'string') {
      actualLength = this.actual.length
    } else if (Array.isArray(this.actual)) {
      actualLength = this.actual.length
    }

    const passed = actualLength === expected
    const assertionMessage = message ||
      (passed ? 'Length matches' : `${actualLength}/${expected} items`)

    return this.addAssertion('to have length', {
      expected,
      actual: actualLength,
      passed
    }, assertionMessage)
  }

  toHaveSize(expected: number, message?: string): AssertionBuilder {
    return this.toHaveLength(expected, message)
  }

  // Object Property Assertions
  toHaveProperty(propertyPath: string, message?: string): AssertionBuilder {
    const hasProperty = this.getValue(this.actual, propertyPath) !== undefined
    const assertionMessage = message ||
      (hasProperty ? `Has property "${propertyPath}"` : `Missing property "${propertyPath}"`)

    return this.addAssertion('to have property', {
      expected: true,
      actual: hasProperty,
      passed: hasProperty
    }, assertionMessage)
  }

  toHavePropertyWithValue(propertyPath: string, expectedValue: any, message?: string): AssertionBuilder {
    const actualValue = this.getValue(this.actual, propertyPath)
    const passed = actualValue === expectedValue
    const assertionMessage = message ||
      (passed ? `Property "${propertyPath}" has expected value` :
        `Expected "${expectedValue}" but got "${actualValue}"`)

    return this.addAssertion('to have property with value', {
      expected: expectedValue,
      actual: actualValue,
      passed
    }, assertionMessage)
  }

  // Type Assertions
  toBeInstanceOf(expectedClass: any, message?: string): AssertionBuilder {
    const passed = this.actual instanceof expectedClass
    const assertionMessage = message ||
      (passed ?
        `Value is instanceof ${expectedClass.name}` :
        `Value is not instance of ${expectedClass.name}`
    )

    return this.addAssertion('to be instance', {
      expected: expectedClass.name,
      actual: this.actual?.constructor?.name,
      passed
    }, assertionMessage)
  }

  toBeArray(message?: string): AssertionBuilder {
    const passed = Array.isArray(this.actual)
    const assertionMessage = message || (passed ? 'Is array' : 'Value is not an array')

    return this.addAssertion('to be array', {
      expected: 'Array',
      actual: Array.isArray(this.actual) ? 'Array' : typeof this.actual,
      passed
    }, assertionMessage)
  }

  toBeObject(message?: string): AssertionBuilder {
    const passed = typeof this.actual === 'object' && this.actual !== null && !Array.isArray(this.actual)
    const assertionMessage = message || (passed ? 'Is object' : 'Value is not an object')

    return this.addAssertion('to be object', {
      expected: 'Object',
      actual: typeof this.actual,
      passed
    }, assertionMessage)
  }

  toMatchType(expectedType: string, message?: string): AssertionBuilder {
    const actualType = typeof this.actual
    const passed = actualType === expectedType
    const assertionMessage = message ||
      (passed ? `Type is ${expectedType}` : `Type is ${actualType} but expected ${expectedType}`)

    return this.addAssertion('to match type', {
      expected: expectedType,
      actual: actualType,
      passed
    }, assertionMessage)
  }

  // HTTP Specific Assertions
  toHaveStatus(expected: number, message?: string): AssertionBuilder {
    const status = this.actual?.status
    const passed = status === expected
    const assertionMessage = message ||
      (passed ? `Status is ${expected}` : `Status is ${status} but expected ${expected}`)

    return this.addAssertion('to have status', {
      expected,
      actual: status,
      passed
    }, assertionMessage)
  }

  toHaveStatusInRange(start: number, end: number, message?: string): AssertionBuilder {
    const status = this.actual?.status
    const passed = typeof status === 'number' && status >= start && status <= end
    const assertionMessage = message ||
      (passed ? `Status ${status} is in range ${start}-${end}` :
        `Status ${status} is not in range ${start}-${end}`)

    return this.addAssertion('to have status in range', {
      expected: `${start}-${end}`,
      actual: status,
      passed
    }, assertionMessage)
  }

  toHaveContentType(expected: string, message?: string): AssertionBuilder {
    const contentType = this.actual?.headers?.['content-type'] || this.actual?.headers?.['Content-Type']
    const passed = contentType && contentType.includes(expected)
    const assertionMessage = message ||
      (passed ? `Content type contains "${expected}"` :
        `Content type "${contentType}" does not contain "${expected}"`)

    return this.addAssertion('to have content type', {
      expected,
      actual: contentType,
      passed
    }, assertionMessage)
  }

  toHaveHeader(headerName: string, message?: string): AssertionBuilder {
    const headers = this.actual?.headers
    const passed = headers && headerName in headers
    const assertionMessage = message ||
      (passed ? `Header "${headerName}" exists` : `Header "${headerName}" is missing`)

    return this.addAssertion('to have header', {
      expected: `Header ${headerName}`,
      actual: headers?.[headerName],
      passed
    }, assertionMessage)
  }

  // Convenience Methods for Common Assertions
  success(message?: string): AssertionBuilder {
    return this.addAssertion('test passed', {
      passed: true
    }, message || 'Test passed')
  }

  failure(message?: string): AssertionBuilder {
    return this.addAssertion('test failed', {
      passed: false
    }, message || 'Test failed')
  }

  // Status shortcut methods
  expectStatus(status: number, message?: string): AssertionBuilder {
    return this.toHaveStatus(status, message)
  }

  expectOk(message?: string): AssertionBuilder {
    return this.toHaveStatus(200, message || 'Status should be OK (200)')
  }

  expectCreated(message?: string): AssertionBuilder {
    return this.toHaveStatus(201, message || 'Resource should be created (201)')
  }

  expectBadRequest(message?: string): AssertionBuilder {
    return this.toHaveStatus(400, message || 'Status should be bad request (400)')
  }

  expectUnauthorized(message?: string): AssertionBuilder {
    return this.toHaveStatus(401, message || 'Should be unauthorized (401)')
  }

  expectForbidden(message?: string): AssertionBuilder {
    return this.toHaveStatus(403, message || 'Should be forbidden (403)')
  }

  expectNotFound(message?: string): AssertionBuilder {
    return this.toHaveStatus(404, message || 'Should be not found (404)')
  }

  expectServerError(message?: string): AssertionBuilder {
    return this.toHaveStatusInRange(500, 599, message || 'Should be server error (500-599)')
  }

  // Response content assertions
  expectJSON(message?: string): AssertionBuilder {
    return this.toHaveProperty('data', message).toBeObject()
  }

  expectArray(message?: string): AssertionBuilder {
    return this.toHaveProperty('data', message).toBeArray()
  }

  expectEmpty(message?: string): AssertionBuilder {
    const isEmpty = !this.actual?.data ||
      (Array.isArray(this.actual.data) && this.actual.data.length === 0) ||
      (typeof this.actual.data === 'object' && Object.keys(this.actual.data).length === 0)

    return this.addAssertion('to be empty', {
      expected: 'empty',
      actual: this.actual?.data,
      passed: isEmpty
    }, message || (isEmpty ? 'Data is empty' : 'Data is not empty'))
  }

  expectKeyExists(key: string, message?: string): AssertionBuilder {
    return this.toHaveProperty(`data.${key}`, message)
  }

  expectKeyWithValue(key: string, value: any, message?: string): AssertionBuilder {
    return this.toHavePropertyWithValue(`data.${key}`, value, message)
  }
}

// Helper function untuk membuat assertion
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
  }

  return new AssertionBuilder(actual, context || defaultContext)
}

// Export types untuk penggunaan external
export type { TestResult, TestContext }