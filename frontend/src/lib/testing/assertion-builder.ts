import { TestResult } from './types'

/**
 * Assertion Builder untuk Chai-like syntax
 * Menyediakan 20+ method assertion untuk testing
 */
export class AssertionBuilder {
  private actual: any
  private assertions: TestResult[]
  private negated: boolean = false
  private testContext: any

  constructor(actual: any, testContext: TestResult[], assertions?: TestResult[]) {
    this.actual = actual
    this.testContext = testContext
    this.assertions = [...(assertions || testContext)]
    this.negated = false
  }

  get not(): AssertionBuilder {
    this.negated = !this.negated
    return this
  }

  get deep(): AssertionBuilder {
    // Deep comparison untuk objects/arrays
    return this
  }

  private addAssertion(assertion: string, expected: any, passed: boolean, message?: string) {
    this.assertions.push({
      name: assertion,
      status: passed ? 'pass' : 'fail',
      message: message || `Expected ${expected}, got ${this.actual}`,
      actual: this.actual,
      expected,
      duration: 0
    })
    return this
  }

  // Basic equality assertions
  toEqual(expected: any): AssertionBuilder {
    const passed = JSON.stringify(this.actual) === JSON.stringify(expected)
    return this.addAssertion('to equal', expected, passed, passed ?
      'Values are equal' : 'Values do not match'
    )
  }

  toBe(expected: any): AssertionBuilder {
    const passed = this.actual === expected
    return this.addAssertion('to be', expected, passed, passed ?
      'Values are equal' : 'Values do not match'
    )
  }

  // Null/undefined assertions
  toBeNull(): AssertionBuilder {
    const passed = this.actual === null
    return this.addAssertion('to be null', null, passed,
      passed ? 'Value is null' : 'Value is not null'
    )
  }

  toBeUndefined(): AssertionBuilder {
    const passed = this.actual === undefined
    return this.addAssertion('to be undefined', undefined, passed,
      passed ? 'Value is undefined' : 'Value is not undefined'
    )
  }

  // Truthy/falsy assertions
  toBeTruthy(): AssertionBuilder {
    const passed = Boolean(this.actual)
    return this.addAssertion('to be truthy', undefined, passed,
      passed ? 'Value is truthy' : 'Value is falsy'
    )
  }

  toBeFalsy(): AssertionBuilder {
    const passed = !Boolean(this.actual)
    return this.addAssertion('to be falsy', undefined, passed,
      passed ? 'Value is falsy' : 'Value is not falsy'
    )
  }

  // Array/string assertions
  toContain(expected: any): AssertionBuilder {
    const passed = Array.isArray(this.actual)
      ? this.actual.includes(expected)
      : typeof this.actual === 'string' && this.actual.includes(expected)
    return this.addAssertion('to contain', expected, passed, passed ?
      'Value contains expected' : 'Value does not contain expected'
    )
  }

  toHaveLength(expected: number): AssertionBuilder {
    const passed = Array.isArray(this.actual)
      ? this.actual.length === expected
      : false
    return this.addAssertion('to have length', expected, passed, passed ?
      `Array has expected length: ${expected}` : 'Array does not have expected length'
    )
  }

  // String assertions
  toMatch(pattern: RegExp | string): AssertionBuilder {
    const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern
    const passed = regex.test(String(this.actual))
    return this.addAssertion('to match', pattern, passed, passed ?
      'String matches pattern' : 'String does not match'
    )
  }

  // Object assertions
  toHaveProperty(propertyName: string): AssertionBuilder {
    const passed = this.actual &&
             typeof this.actual === 'object' &&
             propertyName in this.actual
    return this.addAssertion('to have property', propertyName, passed, passed ?
      'Object has property' : 'Object does not have property'
    )
  }

  // Number assertions
  toBeGreaterThan(expected: number): AssertionBuilder {
    const actual = Number(this.actual)
    const passed = actual > expected
    return this.addAssertion('to be greater than', expected, passed, passed ?
      `${actual} > ${expected}` : `${actual} <= ${expected}`
    )
  }

  toBeLessThan(expected: number): AssertionBuilder {
    const actual = Number(this.actual)
    const passed = actual < expected
    return this.addAssertion('to be less than', expected, passed, passed ?
      `${actual} < ${expected}` : `${actual} >= ${expected}`
    )
  }

  // Type assertions
  toBeInstanceOf(type: string | Function): AssertionBuilder {
    if (type === 'array') {
      const passed = Array.isArray(this.actual)
      return this.addAssertion('to be array', type, passed, passed ?
        'Value is array' : 'Value is not an array'
      )
    }
    if (type === 'object') {
      const passed = typeof this.actual === 'object' && this.actual !== null
      return this.addAssertion('to be object', type, passed, passed ?
        'Value is object' : 'Value is not an object'
      )
    }
    const passed = typeof this.actual === type
    return this.addAssertion('to be instance of', type, passed, passed ?
      `Value is ${type}` : `Value is not ${type}`
    )
  }

  // HTTP specific assertions
  toHaveStatus(status: number): AssertionBuilder {
    // Note: Ini akan di-refactor untuk menggunakan context yang benar
    const response = this.testContext?.response || {}
    const actual = response?.status || 200
    const passed = actual === status
    return this.addAssertion('to have status', status, passed, passed ?
      `Status code is ${status}` : `Status code is ${actual}`
    )
  }

  toHaveHeader(headerName: string): AssertionBuilder {
    const response = this.testContext?.response || {}
    const headers = response?.headers || {}
    const passed = headerName.toLowerCase() in headers
    return this.addAssertion('to have header', headerName, passed, passed ?
      `Header ${headerName} found` : `Header ${headerName} not found`
    )
  }

  // Custom schema validation
  toMatchSchema(schema: object): AssertionBuilder {
    try {
      // Note: Akan di-improve dengan AJV import yang benar
      const ajv = require('ajv')
      const validate = ajv.compile(schema)
      const passed = validate(this.actual)
      return this.addAssertion('to match schema', schema, passed, passed ?
        'Value matches schema' : 'Value does not match schema'
      )
    } catch {
      return this.addAssertion('to match schema', schema, false, 'Invalid schema definition')
    }
  }

  // Advanced assertion method dengan custom message
  private addAssertionAdvanced(
    assertion: string,
    expected: any,
    passed: boolean,
    message?: string
  ): AssertionBuilder {
    this.assertions.push({
      name: assertion,
      status: passed ? 'pass' : 'fail',
      message: message ||
        `Expected ${JSON.stringify(expected)} ${
          passed ? '✓' : '✗'
        }`,
      actual: this.actual,
      expected,
      duration: 0
    })
    return this
  }

  // Utility methods
  getAssertions(): TestResult[] {
    return this.assertions
  }

  reset(): void {
    this.assertions = []
    this.negated = false
  }

  // Advanced chaining support
  then: AssertionBuilder['addAssertionAdvanced'] = function(assertion, expected, passed, message) {
    return this.addAssertionAdvanced(assertion, expected, passed, message)
  }

  // Negation support
  private applyNegation(passed: boolean): boolean {
    return this.negated ? !passed : passed
  }

  // Custom assertion helper
  toSatisfy(predicate: (value: any) => boolean, message?: string): AssertionBuilder {
    const passed = this.applyNegation(predicate(this.actual))
    return this.addAssertion('to satisfy', predicate, passed, message ||
      `Value satisfies ${predicate.toString()}`
    )
  }
}