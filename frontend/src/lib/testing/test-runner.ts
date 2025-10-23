import { TestResult, TestContext, ConsoleEntry } from './types'
import { VariableInterpolator } from '@/lib/variables/variable-interpolator'
import { DirectApiClient } from '@/lib/api/direct-client'

export class TestRunner {
  private variableInterpolator: VariableInterpolator
  private console: ConsoleEntry[] = []

  constructor(variables: Record<string, string> = {}) {
    this.variableInterpolator = new VariableInterpolator(variables)
  }

  async runPreRequestScript(
    script: string, 
    context: Partial<TestContext>
  ): Promise<{
    console: ConsoleEntry[]
    variables: Map<string, any>
    globals: Map<string, any>
    tests: Map<string, boolean>
    assertions: TestResult[]
  }> {
    const testContext: TestContext = {
      request: context.request || { url: '', method: 'GET', headers: {}, body: undefined },
      response: {} as any,
      variables: new Map(Object.entries(this.variableInterpolator.getAll())),
      globals: new Map(),
      tests: new Map(),
      assertions: [],
      console: [],
      environment: context.environment || {}
    }

    try {
      await this.executeScript(script, testContext)
      return {
        console: testContext.console,
        variables: testContext.variables,
        globals: testContext.globals,
        tests: testContext.tests,
        assertions: testContext.assertions
      }
    } catch (error: Error) {
      return {
        console: [
          {
            level: 'error',
            message: `Pre-request script failed: ${error.message}`,
            timestamp: Date.now(),
            source: 'pre-request',
            error: error
          }
        ],
        variables: testContext.variables,
        globals: testContext.globals,
        tests: new Map([
          ['pre-request-script', false]
        ]),
        assertions: []
      }
    }
  }

  async runPostResponseTests(
    scripts: Array<{ id: string; name: string; script: string; enabled: boolean }>,
    request: any,
    response: any
  ): Promise<TestResult[]> {
    const results: TestResult[] = []
    
    for (const testScript of scripts) {
      if (!testScript.enabled) {
        results.push({
          id: testScript.id,
          name: testScript.name,
          status: 'skip',
          message: 'Test disabled',
          duration: 0
        })
        continue
      }

      const startTime = Date.now()
      
      try {
        const testContext: TestContext = {
          request,
          response,
          variables: new Map(Object.entries(this.variableInterpolator.getAll())),
          globals: new Map(),
          tests: new Map(),
          assertions: [],
          console: [],
          environment: {}
        }

        await this.executeScript(testScript.script, testContext)
        
        const endTime = Date.now()
        const duration = endTime - startTime
        
        // Extract test results from context
        const testResults = Array.from(testContext.tests.entries())
        
        if (testResults.length === 0) {
          // Check for assertions if no explicit tests
          const failedAssertions = testContext.assertions.filter(a => a.status === 'fail')
          
          if (failedAssertions.length > 0) {
            results.push({
              id: testScript.id,
              name: testScript.name,
              status: 'fail',
              message: `${failedAssertions.length} assertion(s) failed`,
              duration,
              error: new Error('Test failed due to failed assertions')
            })
          } else {
            results.push({
              id: testScript.id,
              name: testScript.name,
              status: 'pass',
              message: 'All checks passed',
              duration
            })
          }
        } else {
          testResults.forEach(([testName, passed]) => {
            results.push({
              id: testScript.id,
              name: testName,
              status: passed ? 'pass' : 'fail',
              message: passed ? 'Test passed' : 'Test failed',
              duration
            })
          }
        }
        
        results.push(...testContext.assertions)
        
        return {
          console: testContext.console,
          variables: testContext.variables,
          globals: testContext.globals,
          tests: testContext.tests,
          assertions: results
        }
      } catch (error: Error) {
        const endTime = Date.now()
        results.push({
          id: testScript.id,
          name: testScript.name,
          status: 'error',
          message: `Script execution failed: ${error.message}`,
          duration: endTime - startTime,
          error: error
        })
      }
    }

    return results
  }

  private async executeScript(script: string, context: TestContext): Promise<void> {
    // Create sandboxed environment
    const sandbox = this.createSandbox(context)
    
    // Wrap script in async function
    const wrappedScript = `
      (async function() {
        ${script}
      })()
    `

    try {
      // Execute script in sandbox
      await this.runInSandbox(wrappedScript, sandbox)
    } catch (error) {
      // Handle script errors
      context.console.push({
        level: 'error',
        message: `Script execution failed: ${error.message}`,
        timestamp: Date.now(),
        source: 'test-runner',
        error: error
      })
      throw error
    }
  }

  private createSandbox(context: TestContext): any {
    // Built-in API helpers
    const pm = {
      request: {
        url: context.request.url,
        method: context.request.method,
        headers: context.request.headers || {},
        body: context.request.body
      },
      response: {
        status: context.response.status || 200,
        statusText: context.response.statusText || 'OK',
        headers: context.response.headers || {},
        data: context.response.data
      },
      environment: context.environment,
      variables: {
        get: (key: string) => {
          const value = context.variables.get(key)
          return value !== undefined ? value : ''
        },
        set: (key: string, value: string) => {
          context.variables.set(key, value)
        },
        unset: (key: string) => {
          context.variables.delete(key)
        },
        clear: () => {
          context.variables.clear()
        }
      },
      globals: {
        get: (key: string) => {
          const value = context.globals.get(key)
          return value !== undefined ? value : ''
        },
        set: (key: string, value: string) => {
          context.globals.set(key, value)
        },
        clear: () => {
          context.globals.clear()
        }
      },
      tests: {
        test: (name: string, fn: () => void | Promise<void>) => {
          try {
            const result = fn()
            context.tests.set(name, true)
          } catch (error) {
            context.tests.set(name, false)
            console.log(`Test "${name}" failed: ${error.message}`)
          }
        }
      },
      expect: (actual: any) => new AssertionBuilder(actual, context.assertions),
      console: {
        log: (...args: any[]) => {
          const message = args.map(arg => 
            typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
          ).join(' ')
          context.console.push({
            level: 'log',
            message,
            timestamp: Date.now(),
            source: 'test-script'
          })
        },
        info: (...args: any[]) => {
          const message = args.map(arg => 
            typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
          ).join(' ')
          context.console.push({
            level: 'info',
            message,
            timestamp: Date.now(),
            source: 'test-script'
          })
        },
        warn: (...args: any[]) => {
          const message = args.map(arg => 
            typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
          ).join(' ')
          context.console.push({
            level: 'warn',
            message,
            timestamp: Date.now(),
            source: 'test-script'
          })
        },
        error: (...args: any[]) => {
          const message = args.map(arg => 
            typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
          ).join(' ')
          context.console.push({
            level: 'error',
            message,
            timestamp: Date.now(),
            source: 'test-script'
          })
        },
        debug: (...args: any[]) => {
          const message = args.map(arg => 
            typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
          ).join(' ')
          context.console.push({
            level: 'debug',
            message,
            timestamp: Date.now(),
            source: 'test-script'
          })
        }
      }
    }

    return sandbox
  }

  private async runInSandbox(script: string, sandbox: any): Promise<any> {
    // This would use vm2 or quickjs-emscriptencript in production
    try {
      // For now, use eval with caution (will be replaced with proper sandboxing)
      const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor
      const fn = new AsyncFunction(...sandbox)
      return await fn()
    } catch (error) {
      throw error
    }
  }
}

// Assertion Builder for Chai-like syntax
class AssertionBuilder {
  private actual: any
  private assertions: any[]
  private negated: boolean = false
  private testContext: any

  constructor(actual: any, testContext: any, assertions: any[]) {
    this.actual = actual
    this.testContext = testContext
    this.assertions = [...assertions]
    this.negated = false
  }

  get not(): AssertionBuilder {
    this.negated = !this.negated
    return this
  }

  get deep(): AssertionBuilder {
    this.negated = false
    return this
  }

  private addAssertion(assertion: string, expected: any, passed: boolean, message?: string) {
    this.assertions.push({
      assertion,
      status: passed ? 'pass' : 'fail',
      message: message || `Expected ${expected}, got ${this.actual}`,
      actual: this.actual,
      expected
    })
    return this
  }

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

  toBeNull(): AssertionBuilder {
    const passed = this.actual === null
    return this.addAssertion('to be null', null, passed ? 
      'Value is null' : 'Value is not null'
    )
  }

  toBeUndefined(): AssertionBuilder {
    const passed = this.actual === undefined
    return this.addAssertion('to be undefined', undefined, passed ? 
      'Value is undefined' : 'Value is not undefined'
    )
  }

  toBeTruthy(): AssertionBuilder {
    const passed = Boolean(this.actual)
    return this.addAssertion('to be truthy', undefined, passed ? 
      'Value is truthy' : 'Value is falsy'
    )
  }

  toBeFalsy(): AssertionBuilder {
    const passed = !Boolean(this.actual)
    return this.addAssertion('to be falsy', undefined, passed ? 
      'Value is falsy' : 'Value is not falsy'
    )
  }

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

  toMatch(pattern: RegExp | string): AssertionBuilder {
    const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern
    const passed = regex.test(String(this.actual))
    return this.addAssertion('to match', pattern, passed, passed ? 
      'String matches pattern' : 'String does not match'
    )
  }

  toHaveProperty(propertyName: string): AssertionBuilder {
    const passed = this.actual && 
             typeof this.actual === 'object' && 
             propertyName in this.actual
    return this.addAssertion('to have property', propertyName, passed, passed ? 
      'Object has property' : 'Object does not have property'
    )
  }

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
    const actual = response?.status || 200
    const passed = actual === status
    return this.addAssertion('to have status', status, passed, passed ? 
      `Status code is ${status}` : `Status code is ${actual}`
    )
  }

  toHaveHeader(headerName: string): AssertionBuilder {
    const headers = response?.headers || {}
    const passed = headerName.toLowerCase() in headers
    return this.addAssertion('to have header', headerName, passed, passed ? 
      'Header ${headerName} found' : `Header ${headerName} not found`
    )
  }

  // Custom assertion
  toMatchSchema(schema: object): AssertionBuilder {
    try {
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

  private addAssertion(
    assertion: string, 
    expected?: any, 
    passed: boolean, 
    message?: string
  ): AssertionBuilder {
    this.assertions.push({
      assertion,
      status: passed ? 'pass' : 'fail',
      message: message || 
        `Expected ${JSON.stringify(expected)} ${
          passed ? '✓' : '✗'
        }`
    })
    return this
  }

  getAssertions(): Array<{
    assertion: string
    status: 'pass' | 'fail'
    message?: string
    actual?: any
    expected?: any
  }> {
    return this.assertions
  }

  reset(): void {
    this.assertions = []
    this.negated = false
  }
}

export { TestRunner, AssertionBuilder }
